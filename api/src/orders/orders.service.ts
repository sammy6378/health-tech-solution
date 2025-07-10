import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto, DeliveryStatus } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Prescription } from 'src/prescriptions/entities/prescription.entity';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';
import { createResponse, ApiResponse } from 'src/utils/apiResponse';
import { UniqueNumberGenerator } from 'src/utils/uniqueIds';
import { DeliveryMethod, PaymentStatus } from './dto/create-order.dto';
import { PrescriptionStatus } from 'src/prescriptions/dto/create-prescription.dto';
import { Payment } from 'src/payments/entities/payment.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly uniqueNumberGenerator: UniqueNumberGenerator,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<ApiResponse<Order>> {
    try {
      // Load prescription with diagnosis (which has patient/doctor) and medications
      const prescription = await this.prescriptionRepository.findOne({
        where: { prescription_id: createOrderDto.prescription_id },
        relations: [
          'diagnosis',
          'diagnosis.patient',
          'diagnosis.doctor',
          'medications',
          'order',
        ],
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      if (prescription.order) {
        throw new BadRequestException('This prescription already has an order');
      }

      if (prescription.status === PrescriptionStatus.CANCELLED) {
        throw new BadRequestException('Cannot order a cancelled prescription');
      }

      // Check if prescription has medications
      if (!prescription.medications || prescription.medications.length === 0) {
        throw new NotFoundException('Prescription has no medications');
      }

      // Check stock availability for all medications
      const stockValidation = await Promise.all(
        prescription.medications.map(async (medication) => {
          const currentStock = await this.stockRepository.findOne({
            where: { medication_id: medication.medication_id },
          });

          if (
            !currentStock ||
            currentStock.stock_quantity < prescription.quantity_prescribed
          ) {
            return {
              valid: false,
              medication: medication.name,
              required: prescription.quantity_prescribed,
              available: currentStock?.stock_quantity || 0,
            };
          }

          return { valid: true, medication: medication.name };
        }),
      );

      // Check if any medication has insufficient stock
      const insufficientStock = stockValidation.filter((item) => !item.valid);
      if (insufficientStock.length > 0) {
        const stockMessages = insufficientStock.map(
          (item) =>
            `${item.medication}: Required ${item.required}, Available ${item.available}`,
        );
        throw new BadRequestException(
          `Insufficient stock for: ${stockMessages.join(', ')}`,
        );
      }

      const orderNumber = this.uniqueNumberGenerator.generateOrderNumber();

      // Create order with patient from diagnosis
      const order = this.orderRepository.create({
        order_number: orderNumber,
        prescription,
        patient: prescription.diagnosis.patient, // Get patient from diagnosis
        amount: Number(prescription.total_price || 0),
        delivery_method: createOrderDto.delivery_method,
        delivery_address: createOrderDto.delivery_address,
        delivery_time: createOrderDto.delivery_time,
        payment_method: createOrderDto.payment_method,
        payment_status: PaymentStatus.PENDING,
        delivery_status: DeliveryStatus.PENDING,
        estimated_delivery: this.calculateEstimatedDelivery(
          createOrderDto.delivery_method,
        ),
        notes: createOrderDto.notes,
      });

      const savedOrder = await this.orderRepository.save(order);

      // Update prescription status to FILLED
      prescription.status = PrescriptionStatus.FILLED;
      await this.prescriptionRepository.save(prescription);

      // Load full order with all relations
      const fullOrder = await this.orderRepository.findOne({
        where: { order_id: savedOrder.order_id },
        relations: [
          'prescription',
          'prescription.diagnosis',
          'prescription.diagnosis.patient',
          'prescription.diagnosis.doctor',
          'prescription.medications',
          'patient',
        ],
      });

      if (!fullOrder) {
        throw new NotFoundException('Failed to retrieve saved order');
      }

      return createResponse(fullOrder, 'Order created successfully');
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Order creation failed:', error);
      throw new BadRequestException('Failed to create order');
    }
  }

  async confirmPayment(
    orderId: string,
    amount: number,
    transcationId: string,
  ): Promise<ApiResponse<Order>> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        // 1. Lock the order row ONLY
        const order = await manager.findOne(Order, {
          where: { order_id: orderId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!order) {
          throw new NotFoundException('Order not found');
        }

        // 2. Load related data separately (without lock)
        const fullOrder = await manager.findOne(Order, {
          where: { order_id: orderId },
          relations: [
            'prescription',
            'prescription.diagnosis',
            'prescription.diagnosis.patient',
            'prescription.diagnosis.doctor',
            'prescription.medications',
            'patient',
          ],
        });

        if (!fullOrder) {
          throw new NotFoundException('Failed to load full order data');
        }

        const prescription = fullOrder.prescription;

        // 3. Check for existing payment
        const existingPayment = await manager.findOne(Payment, {
          where: { order_number: fullOrder.order_number },
        });

        if (existingPayment) {
          throw new BadRequestException(
            'Payment already confirmed for this order',
          );
        }

        // 4. Validate order state
        if (fullOrder.delivery_status === DeliveryStatus.CANCELLED) {
          throw new BadRequestException(
            'Cannot confirm payment for cancelled order',
          );
        }

        if (fullOrder.delivery_status === DeliveryStatus.DELIVERED) {
          throw new BadRequestException('Order already completed');
        }

        if (fullOrder.amount <= 0 || isNaN(fullOrder.amount)) {
          throw new BadRequestException('Invalid order amount');
        }

        const expectedAmount = parseFloat(fullOrder.amount.toString());
        const receivedAmount = parseFloat(amount.toString());

        if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
          throw new BadRequestException(
            `Payment amount mismatch. Expected: ${expectedAmount.toFixed(
              2,
            )}, Received: ${receivedAmount.toFixed(2)}`,
          );
        }

        if (!prescription) {
          throw new NotFoundException(
            'Prescription data not found for this order',
          );
        }

        // 5. Check if prescription is filled
        if (prescription.status !== PrescriptionStatus.FILLED) {
          throw new BadRequestException(
            'Cannot confirm payment for an unfilled prescription',
          );
        }

        // 6. Check if prescription has medications
        if (
          !prescription.medications ||
          prescription.medications.length === 0
        ) {
          throw new BadRequestException('Prescription has no medications');
        }

        // 7. Check and update stock for each medication
        const stockUpdates = await Promise.all(
          prescription.medications.map(async (medication) => {
            const currentStock = await manager.findOne(Stock, {
              where: { medication_id: medication.medication_id },
              lock: { mode: 'pessimistic_write' },
            });

            if (
              !currentStock ||
              currentStock.stock_quantity < prescription.quantity_prescribed
            ) {
              throw new BadRequestException(
                `Insufficient stock for ${medication.name}. Available: ${currentStock?.stock_quantity || 0}, Required: ${prescription.quantity_prescribed}`,
              );
            }

            return {
              medication_id: medication.medication_id,
              current_stock: currentStock.stock_quantity,
              new_stock:
                currentStock.stock_quantity - prescription.quantity_prescribed,
            };
          }),
        );

        // 8. Update stock for all medications
        await Promise.all(
          stockUpdates.map(async (update) => {
            await manager.update(Stock, update.medication_id, {
              stock_quantity: update.new_stock,
              updated_at: new Date(),
            });
          }),
        );

        // 9. Update order status
        await manager.update(Order, fullOrder.order_id, {
          delivery_status: DeliveryStatus.PROCESSING,
          updated_at: new Date(),
        });

        // 10. Create payment record
        const payment = manager.create(Payment, {
          order_number: fullOrder.order_number,
          amount: fullOrder.amount,
          transcation_id: transcationId,
          payment_status: PaymentStatus.PAID,
          payment_method: fullOrder.payment_method,
          order_id: fullOrder.order_id,
          patient_id: fullOrder.prescription.diagnosis.patient.user_id, // Get patient ID from diagnosis
          payment_date: new Date(),
        });

        await manager.save(Payment, payment);

        // 9.5 update payment status
        await manager.update(Order, fullOrder.order_id, {
          payment_status: PaymentStatus.PAID,
          updated_at: new Date(),
        });

        // 11. Return updated order with all relations
        const updatedOrder = await manager.findOne(Order, {
          where: { order_id: fullOrder.order_id },
          relations: [
            'prescription',
            'prescription.diagnosis',
            'prescription.diagnosis.patient',
            'prescription.diagnosis.doctor',
            'prescription.medications',
            'patient',
          ],
        });

        if (!updatedOrder) {
          throw new NotFoundException('Failed to retrieve updated order');
        }

        return createResponse(
          updatedOrder,
          'Payment confirmed and stock updated successfully',
        );
      } catch (error) {
        if (
          error instanceof NotFoundException ||
          error instanceof BadRequestException
        ) {
          throw error;
        }
        console.error('Error confirming payment:', error);
        throw new BadRequestException('Failed to confirm payment');
      }
    });
  }

  // Update other methods to use the new prescription structure
  async findAll(): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.orderRepository.find({
        relations: [
          'prescription',
          'prescription.diagnosis',
          'prescription.diagnosis.patient',
          'prescription.diagnosis.doctor',
          'prescription.medications',
          'patient',
        ],
        order: { created_at: 'DESC' },
      });

      return createResponse(orders, 'Orders retrieved successfully');
    } catch (error) {
      console.error('Error retrieving orders:', error);
      throw new BadRequestException('Failed to retrieve orders');
    }
  }

  async findOne(id: string): Promise<ApiResponse<Order | null>> {
    try {
      const order = await this.orderRepository.findOne({
        where: { order_id: id },
        relations: [
          'prescription',
          'prescription.diagnosis',
          'prescription.diagnosis.patient',
          'prescription.diagnosis.doctor',
          'prescription.medications',
          'patient',
        ],
      });

      if (!order) {
        return createResponse(null, 'Order not found');
      }

      return createResponse(order, 'Order retrieved successfully');
    } catch (error) {
      console.error('Error retrieving order:', error);
      throw new BadRequestException('Failed to retrieve order');
    }
  }

  async findByPatient(patientId: string): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.orderRepository.find({
        where: { patient: { user_id: patientId } },
        relations: [
          'prescription',
          'prescription.diagnosis',
          'prescription.diagnosis.patient',
          'prescription.diagnosis.doctor',
          'prescription.medications',
          'patient',
        ],
        order: { created_at: 'DESC' },
      });

      return createResponse(orders, 'Patient orders retrieved successfully');
    } catch (error) {
      console.error('Error retrieving patient orders:', error);
      throw new BadRequestException('Failed to retrieve patient orders');
    }
  }

  async findByPrescription(
    prescriptionId: string,
  ): Promise<ApiResponse<Order | null>> {
    try {
      const order = await this.orderRepository.findOne({
        where: { prescription: { prescription_id: prescriptionId } },
        relations: [
          'prescription',
          'prescription.diagnosis',
          'prescription.diagnosis.patient',
          'prescription.diagnosis.doctor',
          'prescription.medications',
          'patient',
        ],
      });

      if (!order) {
        return createResponse(null, 'No order found for this prescription');
      }

      return createResponse(order, 'Order retrieved successfully');
    } catch (error) {
      console.error('Error retrieving order by prescription:', error);
      throw new BadRequestException('Failed to retrieve order');
    }
  }

  async updateDeliveryStatus(id: string, status: DeliveryStatus) {
    try {
      const order = await this.orderRepository.findOne({
        where: { order_id: id },
        relations: [
          'prescription',
          'prescription.diagnosis',
          'prescription.diagnosis.patient',
          'prescription.diagnosis.doctor',
          'prescription.medications',
          'patient',
        ],
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.delivery_status === status) {
        throw new BadRequestException(
          `Order already has status ${status}. No update needed.`,
        );
      }

      await this.orderRepository.update(id, {
        delivery_status: status,
        updated_at: new Date(),
      });

      const updatedOrder = await this.orderRepository.findOne({
        where: { order_id: id },
        relations: [
          'prescription',
          'prescription.diagnosis',
          'prescription.diagnosis.patient',
          'prescription.diagnosis.doctor',
          'prescription.medications',
          'patient',
        ],
      });

      return createResponse(updatedOrder, `Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw new BadRequestException('Failed to update delivery status');
    }
  }

  async findByStatus(status: DeliveryStatus): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.orderRepository.find({
        where: { delivery_status: status },
        relations: [
          'prescription',
          'prescription.diagnosis',
          'prescription.diagnosis.patient',
          'prescription.diagnosis.doctor',
          'prescription.medications',
          'patient',
        ],
        order: { created_at: 'DESC' },
      });

      if (orders.length === 0) {
        return createResponse([], `No orders found with status ${status}`);
      }

      return createResponse(orders, `Orders with status ${status} retrieved`);
    } catch (error) {
      console.error('Error retrieving orders by status:', error);
      throw new BadRequestException('Failed to retrieve orders by status');
    }
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<Order | null>> {
    try {
      const order = await this.orderRepository.findOne({
        where: { order_id: orderId },
        relations: ['prescription'],
      });

      if (!order) {
        return createResponse(null, 'Order not found');
      }

      // Update order status
      await this.orderRepository.update(orderId, {
        delivery_status: DeliveryStatus.CANCELLED,
        updated_at: new Date(),
      });

      // Reset prescription status
      await this.prescriptionRepository.update(
        order.prescription.prescription_id,
        {
          status: PrescriptionStatus.PENDING, // Reset to pending
        },
      );

      const updatedOrder = await this.orderRepository.findOne({
        where: { order_id: orderId },
        relations: [
          'prescription',
          'prescription.diagnosis',
          'prescription.diagnosis.patient',
          'prescription.diagnosis.doctor',
          'prescription.medications',
          'patient',
        ],
      });

      return createResponse(updatedOrder, 'Order cancelled successfully');
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error cancelling order:', error);
      throw new BadRequestException('Failed to cancel order');
    }
  }

  private calculateEstimatedDelivery(deliveryMethod: DeliveryMethod): string {
    const now = new Date();
    const deliveryDate = new Date(now);

    switch (deliveryMethod) {
      case DeliveryMethod.PICKUP:
        deliveryDate.setHours(now.getHours() + 2); // 2 hours for pickup
        return deliveryDate.toISOString();
      case DeliveryMethod.HOME_DELIVERY:
        deliveryDate.setDate(now.getDate() + 1); // Next day for delivery
        return deliveryDate.toISOString();
      default:
        deliveryDate.setDate(now.getDate() + 1);
        return deliveryDate.toISOString();
    }
  }
}
