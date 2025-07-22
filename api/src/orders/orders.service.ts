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
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';
import { OrderMedication } from './entities/order-medications.entity';
import { createResponse, ApiResponse } from 'src/utils/apiResponse';
import { UniqueNumberGenerator } from 'src/utils/uniqueIds';
import { DeliveryMethod, PaymentStatus } from './dto/create-order.dto';
import { Payment } from 'src/payments/entities/payment.entity';
import { DataSource } from 'typeorm';
import { MailService } from 'src/mails/mails.service';
import { Mailer } from 'src/mails/helperEmail';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(OrderMedication)
    private readonly orderMedicationRepository: Repository<OrderMedication>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly uniqueNumberGenerator: UniqueNumberGenerator,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<ApiResponse<Order>> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        console.log('order received', createOrderDto);
        // Get patient
        const patient = await manager.findOne(User, {
          where: { user_id: createOrderDto.patient_id },
          relations: ['patientProfile'],
        });

        if (!patient) {
          throw new NotFoundException('Patient not found');
        }

        const medications = Array.isArray(createOrderDto.medications)
          ? createOrderDto.medications
          : [createOrderDto.medications];

        console.log('medications', medications);

        if (!medications || medications.length === 0) {
          throw new BadRequestException('At least one medication is required');
        }

        let totalAmount = 0;
        const medicationDetails: {
          stock: Stock;
          quantity: number;
          unitPrice: number;
          medicationTotal: number;
        }[] = [];

        for (const orderMed of medications) {
          console.log('processing medication', orderMed);

          if (!orderMed.medication_id) {
            throw new BadRequestException(
              'Invalid medication format: Missing medication_id',
            );
          }

          const medicationId = orderMed.medication_id;

          if (!medicationId) {
            throw new BadRequestException(
              'Invalid medication format: Missing medication_id',
            );
          }

          const stock = await manager.findOne(Stock, {
            where: { medication_id: medicationId },
          });

          if (!stock) {
            throw new NotFoundException(
              `Stock not found for medication ID: ${orderMed.medication_id}`,
            );
          }

          if (stock.stock_quantity < orderMed.quantity) {
            throw new BadRequestException(
              `Insufficient stock for ${stock.name}. Available: ${stock.stock_quantity}, Required: ${orderMed.quantity}`,
            );
          }

          if (orderMed.quantity <= 0) {
            throw new BadRequestException(
              `Invalid quantity for ${stock.name}. Quantity must be greater than 0`,
            );
          }

          const unitPrice = Number(stock.unit_price);
          const quantity = orderMed.quantity;
          const medicationTotal = unitPrice * quantity;
          totalAmount += medicationTotal;

          medicationDetails.push({
            stock,
            quantity,
            unitPrice,
            medicationTotal,
          });
        }

        const orderNumber = this.uniqueNumberGenerator.generateOrderNumber();

        // Create order
        const order = manager.create(Order, {
          order_number: orderNumber,
          patient: patient,
          total_amount: totalAmount,
          delivery_method: createOrderDto.delivery_method,
          delivery_time: createOrderDto.delivery_time,
          payment_method: createOrderDto.payment_method,
          payment_status: PaymentStatus.PENDING,
          delivery_status: DeliveryStatus.PENDING,
          estimated_delivery: this.calculateEstimatedDelivery(
            createOrderDto.delivery_method,
          ),
          notes: createOrderDto.notes,
        });

        const savedOrder = await manager.save(Order, order);

        // Create order medications
        const orderMedications = medicationDetails.map((detail) =>
          manager.create(OrderMedication, {
            order: savedOrder,
            medication: detail.stock,
            quantity: detail.quantity,
            unit_price: detail.unitPrice,
            total_amount: detail.medicationTotal,
          }),
        );

        await manager.save(OrderMedication, orderMedications);

        // Load full order with all relations
        const fullOrder = await manager.findOne(Order, {
          where: { order_id: savedOrder.order_id },
          relations: [
            'patient',
            'patient.patientProfile',
            'orderMedications',
            'orderMedications.medication',
          ],
        });

        if (!fullOrder) {
          throw new NotFoundException('Failed to retrieve saved order');
        }

        // send email
        const mailer = Mailer(this.mailService);
        await mailer.orderConfirmationEmail({
          order_number: fullOrder.order_number,
          email: fullOrder.patient.email,
          total_amount: fullOrder.total_amount,
          delivery_method: fullOrder.delivery_method,
          payment_method: fullOrder.payment_method,
          order_date: fullOrder.order_date,
          payment_status: fullOrder.payment_status,
          orderMedications: fullOrder.orderMedications.map((med) => ({
            medication: med.medication.name,
            quantity: med.quantity,
            unit_price: med.unit_price,
            total_amount: med.total_amount,
          })),
        });

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
    });
  }

  // Update other methods to remove prescription relations
  async findAll(): Promise<ApiResponse<Order[]>> {
    try {
      const orders = await this.orderRepository.find({
        relations: [
          'patient',
          'patient.patientProfile',
          'orderMedications',
          'orderMedications.medication',
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
          'patient',
          'patient.patientProfile',
          'orderMedications',
          'orderMedications.medication',
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
          'patient',
          'patient.patientProfile',
          'orderMedications',
          'orderMedications.medication',
        ],
        order: { created_at: 'DESC' },
      });

      return createResponse(orders, 'Patient orders retrieved successfully');
    } catch (error) {
      console.error('Error retrieving patient orders:', error);
      throw new BadRequestException('Failed to retrieve patient orders');
    }
  }

  async updateDeliveryStatus(id: string, status: DeliveryStatus) {
    try {
      const order = await this.orderRepository.findOne({
        where: { order_id: id },
        relations: [
          'patient',
          'patient.patientProfile',
          'orderMedications',
          'orderMedications.medication',
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
          'patient',
          'patient.patientProfile',
          'orderMedications',
          'orderMedications.medication',
        ],
      });

      if (!updatedOrder) {
        throw new NotFoundException('Updated order not found');
      }

      // send email
      const mail = Mailer(this.mailService);
      await mail.updateStatus({
        order_number: updatedOrder.order_number,
        email: updatedOrder.patient.email,
        delivery_method: updatedOrder.delivery_method,
        delivery_status: updatedOrder.delivery_status,
      });

      return createResponse(updatedOrder, `Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw new BadRequestException('Failed to update delivery status');
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
