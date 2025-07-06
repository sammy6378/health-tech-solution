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
      // Validate prescription exists and is not already ordered
      const prescription = await this.prescriptionRepository.findOne({
        where: { prescription_id: createOrderDto.prescription_id },
        relations: ['medication', 'doctor'],
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      // Check if prescription is already converted to an order
      const existingOrder = await this.orderRepository.findOne({
        where: { prescription_id: createOrderDto.prescription_id },
      });

      if (existingOrder) {
        throw new BadRequestException('Prescription already has an order');
      }

      // Check prescription status
      if (prescription.status === PrescriptionStatus.CANCELLED) {
        throw new BadRequestException(
          'Cannot create order for cancelled prescription',
        );
      }

      // Generate unique order number from prescription
      const orderNumber =
        this.uniqueNumberGenerator.generateOrderNumberFromPrescription(
          prescription.prescription_number,
        );

      // Create order
      const order = this.orderRepository.create({
        ...createOrderDto,
        order_number: orderNumber,
        prescription,
        patient: prescription.patient,
        patient_id: prescription.patient_id,
        amount: prescription.total_price,
        estimated_delivery: this.calculateEstimatedDelivery(
          createOrderDto.delivery_method,
        ),
      });

      const savedOrder = await this.orderRepository.save(order);

      // Update prescription status to indicate it has an order
      await this.prescriptionRepository.update(prescription.prescription_id, {
        status: PrescriptionStatus.FILLED,
      });

      // Return order with all relations
      const result = await this.orderRepository.findOne({
        where: { order_id: savedOrder.order_id },
        relations: [
          'prescription',
          'prescription.medication',
          'prescription.doctor',
        ],
      });

      if (!result) {
        throw new NotFoundException('Failed to create order');
      }

      return createResponse(
        result,
        'Order created successfully from prescription',
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error creating order:', error);
      throw new BadRequestException('Failed to create order');
    }
  }

  async confirmPayment(orderId: string): Promise<ApiResponse<Order>> {
    // Use database transaction for atomicity
    return await this.dataSource.transaction(async (manager) => {
      try {
        // 1. Get order with lock to prevent concurrent updates
        const order = await manager.findOne(Order, {
          where: { order_id: orderId },
          relations: ['prescription', 'prescription.medication'],
          lock: { mode: 'pessimistic_write' },
        });

        if (!order) {
          throw new NotFoundException('Order not found');
        }

        // 2. Check if payment already confirmed (prevent repetition)
        const existingPayment = await manager.findOne(Payment, {
          where: { order_number: order.order_number },
        });

        if (existingPayment) {
          throw new BadRequestException(
            'Payment already confirmed for this order',
          );
        }

        // 3. Check if order is in valid state for payment
        if (order.delivery_status === DeliveryStatus.CANCELLED) {
          throw new BadRequestException(
            'Cannot confirm payment for cancelled order',
          );
        }

        if (order.delivery_status === DeliveryStatus.DELIVERED) {
          throw new BadRequestException('Order already completed');
        }

        // 4. Check and update stock atomically
        const medication = order.prescription.medication;
        const quantityPrescribed = order.prescription.quantity_prescribed;

        // Get current stock with lock
        const currentStock = await manager.findOne(Stock, {
          where: { medication_id: medication.medication_id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!currentStock || currentStock.stock_quantity < quantityPrescribed) {
          throw new BadRequestException(
            `Insufficient stock for ${medication.name}. Available: ${currentStock?.stock_quantity || 0}, Required: ${quantityPrescribed}`,
          );
        }

        // 5. Update stock quantity
        await manager.update(Stock, medication.medication_id, {
          stock_quantity: currentStock.stock_quantity - quantityPrescribed,
          updated_at: new Date(),
        });

        // 6. Update order status
        await manager.update(Order, orderId, {
          delivery_status: DeliveryStatus.PROCESSING,
          updated_at: new Date(),
        });

        // 7. Create payment record
        const payment = manager.create(Payment, {
          order_number: order.order_number,
          amount: order.amount,
          payment_status: PaymentStatus.PAID,
          payment_method: order.payment_method,
          order_id: orderId,
          patient_id: order.patient_id,
          payment_date: new Date(),
        });

        await manager.save(Payment, payment);

        // 8. Get updated order with all relations
        const updatedOrder = await manager.findOne(Order, {
          where: { order_id: orderId },
          relations: [
            'prescription',
            'prescription.medication',
            'prescription.doctor',
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
        // Transaction will auto-rollback on error
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

  async findAll(): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.orderRepository.find({
        relations: [
          'prescription',
          'prescription.medication',
          'prescription.doctor',
        ],
        order: { created_at: 'DESC' },
      });

      return createResponse(orders, 'Orders retrieved successfully');
    } catch (error) {
      console.error('Error retrieving orders:', error);
      throw new BadRequestException('Failed to retrieve orders');
    }
  }

  // update order delivery status
  async updateDeliveryStatus(id: string, status: DeliveryStatus) {
    try {
      const orders = await this.orderRepository.find({
        where: { order_id: id },
        relations: [
          'prescription',
          'prescription.medication',
          'prescription.doctor',
        ],
        order: { created_at: 'DESC' },
      });

      if (orders.length === 0) {
        return createResponse([], `No orders found with status ${status}`);
      }

      if (orders[0].delivery_status === status) {
        throw new BadRequestException(
          `Order already has status ${status}. No update needed.`,
        );
      }

      return createResponse(orders, `Orders with status ${status} retrieved`);
    } catch (error) {
      console.error('Error retrieving orders by delivery status:', error);
      throw new BadRequestException(
        'Failed to retrieve orders by delivery status',
      );
    }
  }

  // find by status
  async findByStatus(status: DeliveryStatus): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.orderRepository.find({
        where: { delivery_status: status },
        relations: [
          'prescription',
          'prescription.medication',
          'prescription.doctor',
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

  async findOne(id: string): Promise<ApiResponse<Order | null>> {
    try {
      const order = await this.orderRepository.findOne({
        where: { order_id: id },
        relations: [
          'prescription',
          'prescription.medication',
          'prescription.doctor',
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
          'prescription.medication',
          'prescription.doctor',
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
          'prescription.medication',
          'prescription.doctor',
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
      });

      // Reset prescription status
      await this.prescriptionRepository.update(order.prescription_id, {
        status: PrescriptionStatus.PENDING, // Reset to pending
      });

      const updatedOrder = await this.orderRepository.findOne({
        where: { order_id: orderId },
        relations: [
          'prescription',
          'prescription.medication',
          'prescription.doctor',
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
