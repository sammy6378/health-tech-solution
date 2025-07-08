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
      relations: ['doctorProfile'],
    });

    if (!patient || patient.role !== Role.PATIENT) {
      throw new BadRequestException('Patient not found');
    }

    if (!doctor || doctor.role !== Role.DOCTOR) {
      throw new BadRequestException('Doctor not found');
    }

    const profile = doctor.doctorProfile;
    if (!profile) {
      throw new BadRequestException('Doctor profile not found');
    }

    // ✅ Prevent appointments in the past
    const today = new Date();
    const selectedDate = new Date(dto.appointment_date);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      throw new BadRequestException('Appointment date cannot be in the past');
    }

    const appointmentDay = selectedDate.toLocaleString('en-US', {
      weekday: 'long',
    });

    const appointmentTime = dto.appointment_time;

    const isDayAvailable = profile.days.includes(appointmentDay);
    const isTimeInRange =
      appointmentTime >= profile.start_time &&
      appointmentTime <= profile.end_time;

    if (!isDayAvailable || !isTimeInRange) {
      throw new BadRequestException(
        'Doctor is not available at the selected time',
      );
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

  async findByUser(userId: string): Promise<ApiResponse<Appointment[]>> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const appointments = await this.appointmentRepository.find({
      where: { patient: { user_id: userId } },
      relations: ['patient', 'doctor'],
    });

    if (appointments.length === 0) {
      return createResponse([], 'No appointments found for this user');
    }

    return createResponse(appointments, 'Appointments fetched successfully');
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

  async findAppointmentsByDoctor(
    doctorId: string,
  ): Promise<ApiResponse<Appointment[]>> {
    const doctor = await this.userRepository.findOne({
      where: { user_id: doctorId },
      relations: ['doctorProfile'],
    });

    if (!doctor || doctor.role !== Role.DOCTOR) {
      throw new NotFoundException('Doctor not found');
    }

    const appointments = await this.appointmentRepository.find({
      where: { doctor: { user_id: doctorId } },
      relations: ['patient', 'doctor'],
      order: { appointment_date: 'ASC' },
    });

    return createResponse(appointments, 'Doctor appointments fetched');
  }

  async findAppointmentsByPatient(
    patientId: string,
  ): Promise<ApiResponse<Appointment[]>> {
    const patient = await this.userRepository.findOne({
      where: { user_id: patientId },
      relations: ['patientProfile'],
    });

    if (!patient || patient.role !== Role.PATIENT) {
      throw new NotFoundException('Patient not found');
    }

    const appointments = await this.appointmentRepository.find({
      where: { patient: { user_id: patientId } },
      relations: ['patient', 'doctor'],
      order: { appointment_date: 'ASC' },
    });

    return createResponse(appointments, 'Patient appointments fetched');
  }
}
