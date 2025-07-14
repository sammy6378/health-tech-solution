import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { ApiResponse, createResponse } from 'src/utils/apiResponse';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async findAll(): Promise<ApiResponse<Payment[]>> {
    return await this.paymentRepository.find().then((payments) => {
      return createResponse(payments, 'Payments retrieved successfully');
    });
  }

  // get by user
  async findByUser(userId: string): Promise<ApiResponse<Payment[]>> {
    return this.paymentRepository
      .find({ where: { patient_id: userId } })
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
