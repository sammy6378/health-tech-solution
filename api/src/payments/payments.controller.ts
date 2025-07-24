import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AtGuard } from 'src/auth/guards/at.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/dto/create-user.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@UseGuards(AtGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles(Role.PATIENT, Role.PHARMACY, Role.ADMIN, Role.DOCTOR)
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR)
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.paymentsService.findByUser(userId);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Get('appointment/:appointmentId')
  findByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.paymentsService.findByAppointment(appointmentId);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Get('verify/:reference')
  verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.verify(reference);
  }

  // appointment payments
  @Roles(Role.PATIENT)
  @Post('appointments')
  createAppointmentPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createAppointmentPayment(createPaymentDto);
  }

  // verify appointment payment
  @Roles(Role.PATIENT)
  @Get('appointments/verify/:reference')
  verifyAppointmentPayment(@Param('reference') reference: string) {
    return this.paymentsService.verifyAppointmentPayment(reference); // ✅ Now calls correct method
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
