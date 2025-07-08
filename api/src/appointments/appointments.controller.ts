import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import {
  AppointmentStatus,
  CreateAppointmentDto,
} from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AtGuard } from 'src/auth/guards/at.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/dto/create-user.dto';

@UseGuards(AtGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Roles(Role.DOCTOR, Role.PATIENT)
  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.PATIENT)
  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.PATIENT)
  @Get(':status')
  findByStatus(@Param('status') status: AppointmentStatus) {
    return this.appointmentsService.appointmentsByStatus(status);
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Get('user')
  findAppointmentsByDoctor(@Query('doctorId') doctorId: string) {
    return this.appointmentsService.findAppointmentsByDoctor(doctorId);
  }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.PATIENT)
  @Get('patient')
  findAppointmentsByPatient(@Query('patientId') patientId: string) {
    return this.appointmentsService.findAppointmentsByPatient(patientId);
  }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.PATIENT)
  @Get(':userId')
  getAppointments(@Query('userId') userId: string) {
    return this.appointmentsService.findByUser(userId);
  }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.PATIENT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
