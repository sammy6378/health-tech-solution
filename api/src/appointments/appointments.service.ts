import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import {
  CreateAppointmentDto,
  AppointmentStatus,
  ConsultationType,
} from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/dto/create-user.dto';
import { ApiResponse, createResponse } from 'src/utils/apiResponse';
import { ZoomService } from 'src/zoom/zoom.service';
import { MailService } from 'src/mails/mails.service';
import { Mailer } from 'src/mails/helperEmail';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly zoomService: ZoomService,
    private readonly mailService: MailService,
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

    console.log('Creating appointment with data:', dto);

    // ✅ Prevent past appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Parse "YYYY-MM-DD" string safely
    const [year, month, day] = dto.appointment_date.split('-').map(Number);
    if (!year || !month || !day) {
      throw new BadRequestException('Invalid appointment date format');
    }

    const selectedDate = new Date(year, month - 1, day);

    // Defensive check
    if (isNaN(selectedDate.getTime())) {
      throw new BadRequestException('Invalid appointment date format');
    }

    if (selectedDate < today) {
      throw new BadRequestException('Appointment date cannot be in the past');
    }

    // ✅ Compute end_time if missing
    const startTime = dto.start_time;
    const duration = dto.duration_minutes ?? 60;
    if (!dto.end_time) {
      const [h, m] = startTime.split(':').map(Number);
      const startMinutes = h * 60 + m;
      const endMinutes = startMinutes + duration;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      dto.end_time = `${endHour.toString().padStart(2, '0')}:${endMin
        .toString()
        .padStart(2, '0')}`;
    }

    // ✅ Validate day and time range
    const appointmentDay = selectedDate.toLocaleString('en-US', {
      weekday: 'long',
    });

    const isDayAvailable = profile.days
      .map((d) => d.toLowerCase())
      .includes(appointmentDay.toLowerCase());

    const parseTime = (time: string) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    };

    const startMinutes = parseTime(dto.start_time);
    const endMinutes = parseTime(dto.end_time);
    const profileStart = parseTime(profile.start_time);
    const profileEnd = parseTime(profile.end_time);

    const isTimeInRange =
      startMinutes >= profileStart && endMinutes <= profileEnd;

    if (!isDayAvailable || !isTimeInRange) {
      throw new BadRequestException(
        'Doctor is not available at the selected time/day',
      );
    }

    const newStart = parseTime(dto.start_time);
    const newEnd = parseTime(dto.end_time);

    // ✅ Fetch existing appointments for that doctor on the same date
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        doctor: { user_id: dto.doctor_id },
        appointment_date: dto.appointment_date,
        status: Not(AppointmentStatus.CANCELLED),
      },
    });

    const isConflict = existingAppointments.some((appt) => {
      const existingStart = parseTime(appt.start_time);
      const existingEnd = parseTime(appt.end_time);
      return (
        (newStart >= existingStart && newStart < existingEnd) || // starts in middle of existing
        (newEnd > existingStart && newEnd <= existingEnd) || // ends in middle of existing
        (newStart <= existingStart && newEnd >= existingEnd) // fully overlaps
      );
    });

    if (isConflict) {
      throw new BadRequestException(
        'Selected time slot is already booked for this doctor',
      );
    }

    // generate meeting link if type is virtual
    if (dto.consultation_type === ConsultationType.VIRTUAL) {
      dto.meeting_link = '';
      dto.zoom_meeting_id = '';
      dto.start_url = '';
      dto.needs_meeting_link = true;
    } else {
      dto.meeting_link = '';
      dto.zoom_meeting_id = '';
      dto.start_url = '';
      dto.needs_meeting_link = false;
    }

    // ✅ Create and save appointment
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

  async createMeetingLink(
    appointmentId: string,
  ): Promise<ApiResponse<Appointment>> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointment_id: appointmentId },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.consultation_type !== ConsultationType.VIRTUAL) {
      throw new BadRequestException('Appointment is not virtual');
    }

    if (appointment.meeting_link) {
      throw new BadRequestException('Meeting link already exists');
    }

    try {
      const zoomMeeting = await this.zoomService.createMeeting(
        `Appointment with Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`,
        `${appointment.appointment_date}T${appointment.start_time}:00`,
        appointment.duration_minutes ?? 60,
      );

      appointment.meeting_link = zoomMeeting.join_url;
      appointment.zoom_meeting_id = zoomMeeting.meeting_id;
      appointment.start_url = zoomMeeting.start_url;
      appointment.needs_meeting_link = false;

      const saved = await this.appointmentRepository.save(appointment);

      // Send email with meeting link
      const mailer = Mailer(this.mailService);
      await mailer.meetingLinkEmail({
        name: appointment.patient.first_name,
        email: appointment.patient.email,
        meetingLink: appointment.meeting_link,
        meetingId: String(appointment.zoom_meeting_id),
      });

      return createResponse(saved, 'Meeting link created successfully');
    } catch (error: any) {
      console.error('Zoom meeting creation failed:', error);
      throw new BadRequestException('Failed to create Zoom meeting');
    }
  }

  async getAppointmentsNeedingMeetingLinks(): Promise<
    ApiResponse<Appointment[]>
  > {
    const appointments = await this.appointmentRepository.find({
      where: {
        consultation_type: ConsultationType.VIRTUAL,
        needs_meeting_link: true,
      },
      relations: ['patient', 'doctor'],
      order: { appointment_date: 'ASC' },
    });

    return createResponse(
      appointments,
      'Appointments needing meeting links fetched',
    );
  }

  async getAvailableSlots(
    doctorId: string,
    appointmentDate: string,
  ): Promise<string[]> {
    const doctor = await this.userRepository.findOne({
      where: { user_id: doctorId },
      relations: ['doctorProfile'],
    });

    if (!doctor || doctor.role !== Role.DOCTOR) {
      throw new BadRequestException('Doctor not found or not valid');
    }

    const profile = doctor.doctorProfile;
    if (!profile) {
      throw new BadRequestException('Doctor profile not found');
    }

    // ✅ Convert to Date & Check Day Availability
    const date = new Date(appointmentDate);
    const weekday = date.toLocaleString('en-US', { weekday: 'long' });
    if (!profile.days.includes(weekday)) {
      return []; // Doctor not working this day
    }

    // ✅ Generate All 1-Hour Slots Based on Doctor's Working Hours
    const parseTime = (time: string) => {
      const [hour, min] = time.split(':').map(Number);
      return hour * 60 + min;
    };

    const formatTime = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const startMinutes = parseTime(profile.start_time); // e.g. 480
    const endMinutes = parseTime(profile.end_time); // e.g. 1020
    const duration = 60;

    const allSlots: { start: string; end: string }[] = [];
    for (
      let time = startMinutes;
      time + duration <= endMinutes;
      time += duration
    ) {
      allSlots.push({
        start: formatTime(time),
        end: formatTime(time + duration),
      });
    }

    // ✅ Fetch Existing Appointments on This Date
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        doctor: { user_id: doctorId },
        appointment_date: appointmentDate,
        status: Not(AppointmentStatus.CANCELLED),
      },
    });

    // ✅ Filter out conflicting slots
    const isConflict = (
      slotStart: number,
      slotEnd: number,
      apptStart: number,
      apptEnd: number,
    ) =>
      (slotStart >= apptStart && slotStart < apptEnd) ||
      (slotEnd > apptStart && slotEnd <= apptEnd) ||
      (slotStart <= apptStart && slotEnd >= apptEnd);

    const availableSlots = allSlots.filter((slot) => {
      const slotStart = parseTime(slot.start);
      const slotEnd = parseTime(slot.end);

      const conflicts = existingAppointments.some((appt) => {
        const apptStart = parseTime(appt.start_time);
        const apptEnd = parseTime(appt.end_time);
        return isConflict(slotStart, slotEnd, apptStart, apptEnd);
      });

      return !conflicts;
    });

    return availableSlots.map((slot) => slot.start);
  }

  async findOne(id: string): Promise<ApiResponse<Appointment>> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointment_id: id },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    return createResponse(appointment, 'Appointment found');
  }

  // cancel appointmnet and delete
  async cancel(id: string): Promise<ApiResponse<Appointment>> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointment_id: id },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    const updated = await this.appointmentRepository.save(appointment);
    return createResponse(updated, 'Appointment cancelled successfully');
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
      relations: ['patient', 'doctor', 'doctor.doctorProfile'],
      order: { appointment_date: 'ASC' },
    });

    return createResponse(appointments, 'Patient appointments fetched');
  }

  // update appointment status
  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<ApiResponse<Appointment>> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointment_id: id },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Only allow certain status transitions
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.SCHEDULED]: [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
      ],
      [AppointmentStatus.COMPLETED]: [],
      [AppointmentStatus.CANCELLED]: [],
      [AppointmentStatus.PENDING]: [AppointmentStatus.SCHEDULED],
    };

    if (
      !validTransitions[appointment.status].includes(status) &&
      status !== AppointmentStatus.PENDING
    ) {
      throw new BadRequestException(
        `Cannot change status from ${appointment.status} to ${status}`,
      );
    }

    appointment.status = status;
    const updated = await this.appointmentRepository.save(appointment);
    return createResponse(updated, 'Appointment status updated');
  }
}
