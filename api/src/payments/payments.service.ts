import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { DataSource, Repository } from 'typeorm';
import { ApiResponse, createResponse } from 'src/utils/apiResponse';
import { CreatePaymentDto } from './dto/create-payment.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { DeliveryStatus, PaymentStatus } from 'src/orders/dto/create-order.dto';
import { Order } from 'src/orders/entities/order.entity';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    paid_at: string;
    [key: string]: any;
  };
}
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
  ): Promise<ApiResponse<Payment>> {
    try {
      const paystackSecretKey = this.configService.get<string>(
        'PAYSTACK_SECRET_KEY',
      );

      const order = await this.orderRepository.findOne({
        where: { order_number: createPaymentDto.order_number },
      });

      if (!order) {
        throw new NotFoundException(
          `Order with number ${createPaymentDto.order_number} not found`,
        );
      }

      // ✅ 1. Check if the order is already paid
      const existingPaid = await this.paymentRepository.findOne({
        where: {
          order_number: createPaymentDto.order_number,
          payment_status: PaymentStatus.PAID,
        },
      });

      if (existingPaid) {
        return createResponse(existingPaid, 'Payment already completed');
      }

      // ✅ 2. Delete any existing pending payment for a clean retry
      await this.paymentRepository.delete({
        order_number: createPaymentDto.order_number,
        payment_status: PaymentStatus.PENDING,
      });

      // ✅ 3. Proceed with fresh reference initialization
      const response = await axios.post<PaystackInitResponse>(
        'https://api.paystack.co/transaction/initialize',
        {
          email: createPaymentDto.email,
          amount: createPaymentDto.amount * 100,
          currency: 'KES',
          metadata: {
            full_name: createPaymentDto.full_name,
            order_number: createPaymentDto.order_number,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data.data;

      const payment = this.paymentRepository.create({
        ...createPaymentDto,
        payment_status: PaymentStatus.PENDING,
        paystack_reference: data.reference,
        paystack_checkout_url: data.authorization_url,
        paystack_access_code: data.access_code,
        payment_date: new Date(),
      });

      const savedPayment = await this.paymentRepository.save(payment);

      const paymentData = {
        ...savedPayment,
        email: createPaymentDto.email,
        amount: createPaymentDto.amount,
        currency: 'KES',
      };

      return createResponse(paymentData, 'Payment initialized successfully');
    } catch (error: any) {
      console.error('Paystack Init Error:', error);
      throw new InternalServerErrorException('Failed to initialize payment');
    }
  }

  async verify(reference: string): Promise<ApiResponse<Payment>> {
    try {
      const paystackSecretKey = this.configService.get<string>(
        'PAYSTACK_SECRET_KEY',
      );

      const response = await axios.get<PaystackVerifyResponse>(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data.data;

      console.log('data', data);

      if (data.status !== 'success') {
        throw new BadRequestException(
          `Payment not successful. Status: ${data.status}`,
        );
      }

      const payment = await this.paymentRepository.findOne({
        where: { paystack_reference: reference },
        relations: ['user'],
      });

      console.log('payment', payment);

      if (!payment) throw new NotFoundException('Payment record not found');

      if (payment.payment_status === PaymentStatus.PAID) {
        return createResponse(payment, 'Payment already verified');
      }

      await this.dataSource.transaction(async (manager) => {
        const order = await manager
          .getRepository(Order)
          .createQueryBuilder('order')
          .innerJoinAndSelect('order.patient', 'patient') // Required
          .innerJoinAndSelect('order.orderMedications', 'orderMedication') // Required
          .innerJoinAndSelect('orderMedication.medication', 'medication') // Required if you expect all medications to exist
          .where('order.order_number = :order_number', {
            order_number: payment.order_number,
          })
          .setLock('pessimistic_write')
          .getOne();

        if (!order) throw new NotFoundException('Order not found');

        if (order.delivery_status === DeliveryStatus.CANCELLED) {
          throw new BadRequestException(
            'Cannot confirm payment for cancelled order',
          );
        }

        if (order.delivery_status === DeliveryStatus.DELIVERED) {
          throw new BadRequestException('Order already completed');
        }

        const normalizeAmount = (value: string | number): number =>
          Number(parseFloat(value as string).toFixed(2));

        const expectedAmount = normalizeAmount(order.total_amount);
        const receivedAmount = normalizeAmount(payment.amount);

        if (expectedAmount !== receivedAmount) {
          throw new BadRequestException(
            `Payment amount mismatch. Expected: ${expectedAmount}, Received: ${receivedAmount}`,
          );
        }

        // Check stock
        for (const orderMedication of order.orderMedications) {
          const currentStock = await manager.findOne(Stock, {
            where: { medication_id: orderMedication.medication.medication_id },
            lock: { mode: 'pessimistic_write' },
          });

          if (
            !currentStock ||
            currentStock.stock_quantity < orderMedication.quantity
          ) {
            throw new BadRequestException(
              `Insufficient stock for ${orderMedication.medication.name}. Available: ${currentStock?.stock_quantity || 0}, Required: ${orderMedication.quantity}`,
            );
          }

          await manager.update(
            Stock,
            orderMedication.medication.medication_id,
            {
              stock_quantity:
                currentStock.stock_quantity - orderMedication.quantity,
              updated_at: new Date(),
            },
          );
        }

        // ✅ Now safely update payment and order status inside transaction
        payment.payment_status = PaymentStatus.PAID;
        payment.payment_date = new Date(data.paid_at);
        await manager.save(payment);

        await manager.update(Order, order.order_id, {
          delivery_status: DeliveryStatus.PROCESSING,
          payment_status: PaymentStatus.PAID,
          updated_at: new Date(),
        });
      });

      // const updated = await this.paymentRepository.findOne({
      //   where: { paystack_reference: reference },
      //   relations: ['user'],
      // });

      // if (!updated) {
      //   throw new NotFoundException('Updated payment record not found');
      // }

      return createResponse(payment, 'Payment verified and order updated');
    } catch (error) {
      console.error('Paystack Verification Error:', error);
      throw new InternalServerErrorException('Failed to verify payment');
    }
  }

  async findAll(): Promise<ApiResponse<Payment[]>> {
    return await this.paymentRepository.find().then((payments) => {
      return createResponse(payments, 'Payments retrieved successfully');
    });
  }

  // get by user
  async findByUser(userId: string): Promise<ApiResponse<Payment[]>> {
    return this.paymentRepository
      .find({ where: { user: { user_id: userId } } })
      .then((payments) => {
        return createResponse(payments, 'Payments retrieved successfully');
      });
  }

  async findOne(id: string): Promise<ApiResponse<Payment>> {
    return this.paymentRepository
      .findOne({ where: { payment_id: id } })
      .then((payment) => {
        if (!payment) {
          throw new NotFoundException(`Payment with ID ${id} not found`);
        }
        return createResponse(payment, 'Payment retrieved successfully');
      });
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    return this.paymentRepository.delete({ payment_id: id }).then((result) => {
      if (result.affected === 0) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }
      return createResponse(null, 'Payment deleted successfully');
    });
  }
}
