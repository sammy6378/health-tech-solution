import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import {
  CreateAppointmentDto,
  AppointmentStatus,
} from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/dto/create-user.dto';
import { ApiResponse, createResponse } from 'src/utils/apiResponse';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<ApiResponse<Appointment>> {
    const patient = await this.userRepository.findOne({
      where: { user_id: dto.patient_id },
    });
    const doctor = await this.userRepository.findOne({
      where: { user_id: dto.doctor_id },
    });

    if (!patient || patient.role !== Role.USER) {
      throw new BadRequestException('patient not found');
    }

    if (!doctor || doctor.role !== Role.DOCTOR) {
      throw new BadRequestException('doctor not found');
    }

    const appointment = this.appointmentRepository.create({
      ...dto,
      patient,
      doctor,
    });

    const saved = await this.appointmentRepository.save(appointment);
    return createResponse(saved, 'Appointment created successfully');
  }

  async findAll() {
    const data = await this.appointmentRepository.find({
      relations: ['patient', 'doctor'],
    });
    if (data.length === 0) {
      return createResponse([], 'No appointments found');
    }
    return createResponse(data, 'All appointments fetched');
  }

  async findOne(id: string): Promise<ApiResponse<Appointment>> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointment_id: id },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    return createResponse(appointment, 'Appointment found');
  }

  async update(
    id: string,
    dto: UpdateAppointmentDto,
  ): Promise<ApiResponse<Appointment>> {
    const appointment = await this.findOne(id);
    Object.assign(appointment.data, dto);
    const updated = await this.appointmentRepository.save(appointment.data);
    return createResponse(updated, 'Appointment updated');
  }

  async remove(id: string): Promise<ApiResponse<boolean>> {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Appointment not found');
    }
    return createResponse(true, 'Appointment deleted successfully');
  }

  async appointmentsByStatus(
    @Query('status') status: AppointmentStatus,
  ): Promise<ApiResponse<Appointment[]>> {
    const appointments = await this.appointmentRepository.find({
      where: { status },
      relations: ['patient', 'doctor'],
    });

    if (appointments.length === 0) {
      return createResponse([], `No appointments found with status ${status}`);
    }

    return createResponse(
      appointments,
      `Appointments with status ${status} fetched`,
    );
  }
}
