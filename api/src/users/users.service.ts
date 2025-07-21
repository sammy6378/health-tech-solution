import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, Role } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse, createResponse } from 'src/utils/apiResponse';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Diagnosis } from 'src/diagnosis/entities/diagnosis.entity';
import { Prescription } from 'src/prescriptions/entities/prescription.entity';
import { Order } from 'src/orders/entities/order.entity';
import { AppointmentStatus } from 'src/appointments/dto/create-appointment.dto';
import { PrescriptionStatus } from 'src/prescriptions/dto/create-prescription.dto';
import { PaymentStatus } from 'src/orders/dto/create-order.dto';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { MailService } from 'src/mails/mails.service';
import { Mailer } from 'src/mails/helperEmail';
import { MedicalRecord } from 'src/medical-records/entities/medical-record.entity';
import * as dayjs from 'dayjs';
// import { DoctorProfile } from 'src/doctor-profile/entities/doctor-profile.entity';
// import { PatientProfile } from 'src/user-profile/entities/user-profile.entity';

// ✅ NEW: Role-based data retrieval
interface DashboardStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  totalDiagnoses: number;
  totalPrescriptions: number;
  activePrescriptions: number;
  totalOrders?: number;
  pendingOrders?: number;
  totalMedications?: number;
  totalPatients?: number;
  totalPayments?: number;
  totalRevenue?: number;
  lowStockItems?: number;
  prescriptionsChangePercent?: number;
  paymentsChangePercent?: number;
  ordersChangePercent?: number;
}

export interface DashboardData {
  user: User;
  profileData: User;
  appointments: Appointment[];
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  orders: Order[];
  patients?: User[];
  doctors?: User[];
  medications?: Stock[];
  payments?: Payment[];
  medicalRecord?: MedicalRecord;
  stats: DashboardStats;
  myDoctorsList?: User[];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Diagnosis)
    private readonly diagnosisRepository: Repository<Diagnosis>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Stock)
    private readonly medicationRepository: Repository<Stock>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(MedicalRecord)
    // @InjectRepository(DoctorProfile)
    // private readonly DoctorProfileRepository: Repository<DoctorProfile>,
    // @InjectRepository(PatientProfile)
    // private readonly patientProfileRepository: Repository<PatientProfile>,
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);

    // create profile with user id if role is doctor or patient
    // if (savedUser.role === Role.DOCTOR) {
    //   const doctorProfile = this.DoctorProfileRepository.create({
    //     user: { user_id: savedUser.user_id },
    //   });
    //   await this.DoctorProfileRepository.save(doctorProfile);
    // } else if (savedUser.role === Role.PATIENT) {
    //   const patientProfile = this.patientProfileRepository.create({
    //     patient: { user_id: savedUser.user_id },
    //   });
    //   await this.patientProfileRepository.save(patientProfile);
    // }

    // send welcome email
    const mailer = Mailer(this.mailService);
    await mailer.welcomeEmail({
      name: savedUser.first_name,
      email: savedUser.email,
    });

    return createResponse(savedUser, 'User created successfully');
  }

  async findAll(userId?: string): Promise<ApiResponse<User[]>> {
    const baseRelations = ['doctorProfile', 'patientProfile', 'medicalRecord'];

    const where: FindOptionsWhere<User> | undefined = userId
      ? { user_id: userId }
      : undefined;

    const users = await this.userRepository.find({
      where,
      relations: baseRelations,
      order: { created_at: 'DESC' },
    });

    if (users.length === 0) {
      return createResponse([], userId ? 'User not found' : 'No users found');
    }

    return createResponse(users, userId ? 'User fetched' : 'Users fetched');
  }

  async findOne(id: string): Promise<ApiResponse<User | null>> {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
      relations: ['doctorProfile', 'patientProfile', 'medicalRecord'],
    });

    if (!user) {
      return createResponse(null, 'User not found');
    }

    return createResponse(user, 'User retrieved successfully');
  }

  async getUserDashboardData(
    userId: string,
  ): Promise<ApiResponse<DashboardData | null>> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['doctorProfile', 'patientProfile', 'medicalRecord'],
    });

    if (!user) {
      return createResponse(null, 'User not found');
    }

    let dashboardData: DashboardData | null = {
      user,
      profileData: user,
      appointments: [],
      diagnoses: [],
      prescriptions: [],
      orders: [],
      stats: {
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        totalDiagnoses: 0,
        totalPrescriptions: 0,
        activePrescriptions: 0,
        totalOrders: 0,
        pendingOrders: 0,
      },
    };

    switch (user.role) {
      case Role.PATIENT:
        dashboardData = await this.getPatientDashboardData(
          userId,
          dashboardData,
        );
        break;
      case Role.DOCTOR:
        dashboardData = await this.getDoctorDashboardData(
          userId,
          dashboardData,
        );
        break;
      case Role.ADMIN:
        dashboardData = await this.getAdminDashboardData(dashboardData);
        break;
      default:
        dashboardData = this.getBasicDashboardData(userId, dashboardData);
    }

    return createResponse(
      dashboardData,
      'Dashboard data retrieved successfully',
    );
  }

  private async getPatientDashboardData(
    userId: string,
    baseData: DashboardData,
  ): Promise<DashboardData> {
    // patient profile
    const patientProfile = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['patientProfile'],
    });
    // 1. Get patient appointments
    const appointments = await this.appointmentRepository.find({
      where: { patient: { user_id: userId } },
      relations: ['doctor', 'doctor.doctorProfile'],
      order: { appointment_date: 'DESC' },
    });

    // 2. Get patient diagnoses with prescriptions
    const diagnoses = await this.diagnosisRepository.find({
      where: { patient: { user_id: userId } },
      relations: [
        'doctor',
        'doctor.doctorProfile',
        'prescriptions',
        'prescriptions.prescriptionMedications', // ✅ Correct relation name
        'prescriptions.prescriptionMedications.medication',
      ],
      order: { created_at: 'DESC' },
    });

    console.log('Diagnoses:', diagnoses);

    // 3. Get patient prescriptions (flattened from diagnoses)
    const prescriptions = await this.prescriptionRepository.find({
      where: {
        diagnosis: {
          patient: { user_id: userId },
        },
      },
      relations: [
        'prescriptionMedications',
        'prescriptionMedications.medication',
        'diagnosis',
        'diagnosis.patient',
        'diagnosis.patient.patientProfile',
        'diagnosis.doctor',
        'diagnosis.doctor.doctorProfile',
      ],
      order: { created_at: 'DESC' },
    });

    console.log('Prescriptions:', prescriptions);

    // my doctors [interacted with in appintments, prescrption or diagnoses]
    const myDoctors = new Set([
      ...appointments.map((a) => a.doctor),
      ...diagnoses.map((d) => d.doctor),
      ...prescriptions.map((p) => p.diagnosis.doctor),
    ]);

    const myDoctorsList = await this.userRepository.find({
      where: { user_id: In(Array.from(myDoctors).map((d) => d.user_id)) },
      relations: ['doctorProfile'],
    });

    console.log('My Doctors:', myDoctorsList);

    // medical records
    const medicalRecord = await this.medicalRecordRepository.findOne({
      where: { patient: { user_id: userId } },
      relations: ['patient'],
    });

    console.log('medical records', medicalRecord);

    // 4. Get patient orders
    const orders = await this.orderRepository.find({
      where: { patient: { user_id: userId } },
      order: { created_at: 'DESC' },
      relations: [
        'orderMedications',
        'orderMedications.medication',
        'patient',
        'patient.patientProfile',
      ],
    });

    // patient payments
    const payments = await this.paymentRepository.find({
      where: { user: { user_id: userId } },
      order: { payment_date: 'DESC' },
    });

    // Filter appointments to only include those from today and onward
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointmentsList = appointments.filter(
      (a) => new Date(a.appointment_date) >= today,
    );

    return {
      ...baseData,
      appointments: upcomingAppointmentsList,
      diagnoses,
      prescriptions,
      orders,
      medicalRecord: medicalRecord ?? undefined,
      profileData: patientProfile ?? baseData.user,
      myDoctorsList,
      payments,
      stats: {
        totalAppointments: appointments.length,
        upcomingAppointments: upcomingAppointmentsList.filter(
          (a) => a.status === AppointmentStatus.SCHEDULED,
        ).length,
        completedAppointments: appointments.filter(
          (a) => a.status === AppointmentStatus.COMPLETED,
        ).length,
        totalDiagnoses: diagnoses.length,
        totalPrescriptions: prescriptions.length,
        activePrescriptions: prescriptions.filter(
          (p) => p.status === PrescriptionStatus.ACTIVE,
        ).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(
          (o) => o.payment_status === PaymentStatus.PENDING,
        ).length,
      },
    };
  }

  private async getDoctorDashboardData(
    userId: string,
    baseData: DashboardData,
  ): Promise<DashboardData> {
    // 1. Get doctor appointments
    const appointments = await this.appointmentRepository.find({
      where: { doctor: { user_id: userId } },
      relations: ['patient', 'patient.patientProfile'],
      order: { appointment_date: 'DESC' },
    });

    // 2. Get doctor diagnoses with prescriptions
    const diagnoses = await this.diagnosisRepository.find({
      where: { doctor: { user_id: userId } },
      relations: [
        'patient',
        'patient.patientProfile',
        'prescriptions',
        'prescriptions.prescriptionMedications', // ✅ Correct relation name
        'prescriptions.prescriptionMedications.medication',
      ],
      order: { created_at: 'DESC' },
    });

    // 3. Get doctor prescriptions (flattened from diagnoses)
    const prescriptions = await this.prescriptionRepository.find({
      where: {
        diagnosis: {
          doctor: { user_id: userId },
        },
      },
      relations: [
        'prescriptionMedications',
        'prescriptionMedications.medication',
        'diagnosis',
        'diagnosis.patient',
        'diagnosis.patient.patientProfile',
        'diagnosis.doctor',
        'diagnosis.doctor.doctorProfile',
      ],
      order: { created_at: 'DESC' },
    });

    // 4. Get unique patients treated by this doctor
    const patientIds = new Set([
      ...appointments.map((a) => a.patient.user_id),
      ...diagnoses.map((d) => d.patient.user_id),
    ]);

    const patients = await this.userRepository.find({
      where: { user_id: In(Array.from(patientIds)) },
      relations: ['patientProfile', 'medicalRecord'],
    });

    return {
      ...baseData,
      appointments,
      diagnoses,
      prescriptions,
      patients,
      // Aggregated stats
      stats: {
        totalAppointments: appointments.length,
        upcomingAppointments: appointments.filter(
          (a) => a.status === AppointmentStatus.SCHEDULED,
        ).length,
        completedAppointments: appointments.filter(
          (a) => a.status === AppointmentStatus.COMPLETED,
        ).length,
        totalDiagnoses: diagnoses.length,
        totalPrescriptions: prescriptions.length,
        activePrescriptions: prescriptions.filter(
          (p) => p.status === PrescriptionStatus.ACTIVE,
        ).length,
      },
    };
  }

  private async getAdminDashboardData(
    baseData: DashboardData,
  ): Promise<DashboardData> {
    // 1. Get all orders with full relations
    const orders = await this.orderRepository.find({
      relations: [
        'orderMedications',
        'orderMedications.medication',
        'patient',
        'patient.patientProfile',
      ],
      order: { created_at: 'DESC' },
    });

    // 2. Get all medications/stock
    const medications = await this.medicationRepository.find({
      order: { created_at: 'DESC' },
    });

    // 3. Get all patients for medicine recommendations
    const patients = await this.userRepository.find({
      where: { role: Role.PATIENT },
      relations: ['patientProfile'],
      order: { created_at: 'DESC' },
    });

    // all doctors for recommendations
    const doctors = await this.userRepository.find({
      where: { role: Role.DOCTOR },
      relations: ['doctorProfile'],
      order: { created_at: 'DESC' },
    });

    // 4. Get all diagnoses to understand patient conditions and recommend stock
    const diagnoses = await this.diagnosisRepository.find({
      relations: [
        'patient',
        'patient.patientProfile',
        'doctor',
        'doctor.doctorProfile',
        'prescriptions',
        'prescriptions.prescriptionMedications', // ✅ Correct relation name
        'prescriptions.prescriptionMedications.medication',
      ],
      order: { created_at: 'DESC' },
    });

    // 5. Get all prescriptions for medicine demand analysis
    const prescriptions = await this.prescriptionRepository.find({
      relations: [
        'prescriptionMedications', // ✅ Correct relation name
        'prescriptionMedications.medication',
        'diagnosis',
        'diagnosis.patient',
        'diagnosis.patient.patientProfile',
        'diagnosis.doctor',
        'diagnosis.doctor.doctorProfile',
      ],
      order: { created_at: 'DESC' },
    });

    // 6. Get all payments for financial tracking
    const payments = await this.paymentRepository.find({
      order: { payment_date: 'DESC' },
    });

    // 7. Calculate financial metrics
    const totalRevenue = payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount.toString()),
      0,
    );

    // 8. Calculate low stock items (threshold: 10 or less)
    const lowStockItems = medications.filter(
      (med) => med.stock_quantity <= 10,
    ).length;

    // 9. Get pending orders count
    const pendingOrders = orders.filter(
      (order) => order.payment_status === PaymentStatus.PENDING,
    ).length;

    // 11
    const now = dayjs();
    const currentMonth = now.month();
    const currentYear = now.year();
    const lastMonth = now.subtract(1, 'month').month();
    const lastMonthYear = now.subtract(1, 'month').year();

    // Helper to check month and year
    const isInMonth = (date: Date, month: number, year: number) =>
      dayjs(date).month() === month && dayjs(date).year() === year;

    const prescriptionsThisMonth = prescriptions.filter((p) =>
      isInMonth(p.prescription_date, currentMonth, currentYear),
    ).length;

    const prescriptionsLastMonth = prescriptions.filter((p) =>
      isInMonth(p.prescription_date, lastMonth, lastMonthYear),
    ).length;

    const ordersThisMonth = orders.filter((o) =>
      isInMonth(o.created_at, currentMonth, currentYear),
    ).length;

    const ordersLastMonth = orders.filter((o) =>
      isInMonth(o.created_at, lastMonth, lastMonthYear),
    ).length;

    const paymentsThisMonth = payments.filter((p) =>
      isInMonth(p.payment_date, currentMonth, currentYear),
    ).length;

    const paymentsLastMonth = payments.filter((p) =>
      isInMonth(p.payment_date, lastMonth, lastMonthYear),
    ).length;

    // Safe percent change calculation
    const getPercentChange = (current: number, previous: number) => {
      if (previous === 0) return current === 0 ? 0 : 100;
      return ((current - previous) / previous) * 100;
    };

    return {
      ...baseData,
      orders,
      medications,
      patients,
      doctors,
      diagnoses,
      prescriptions,
      payments,
      stats: {
        ...baseData.stats,
        totalOrders: orders.length,
        pendingOrders,
        totalMedications: medications.length,
        totalPatients: patients.length,
        totalDiagnoses: diagnoses.length,
        totalPrescriptions: prescriptions.length,
        activePrescriptions: prescriptions.filter(
          (p) => p.status === PrescriptionStatus.ACTIVE,
        ).length,
        totalPayments: payments.length,
        totalRevenue,
        lowStockItems,
        prescriptionsChangePercent: getPercentChange(
          prescriptionsThisMonth,
          prescriptionsLastMonth,
        ),
        ordersChangePercent: getPercentChange(ordersThisMonth, ordersLastMonth),
        paymentsChangePercent: getPercentChange(
          paymentsThisMonth,
          paymentsLastMonth,
        ),
      },
    };
  }

  private getBasicDashboardData(
    userId: string,
    baseData: DashboardData,
  ): DashboardData {
    return {
      ...baseData,
      appointments: [],
      diagnoses: [],
      prescriptions: [],
      orders: [],
      patients: [],
      stats: {
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        totalDiagnoses: 0,
        totalPrescriptions: 0,
        activePrescriptions: 0,
        totalOrders: 0,
        pendingOrders: 0,
      },
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User | null>> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id).then((response) => {
      if (response.data) {
        return createResponse(response.data, 'User updated successfully');
      }
      return createResponse(null, 'User not found');
    });
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      return createResponse(null, 'User not found');
    }
    return createResponse(null, 'User deleted successfully');
  }

  async findAllDoctors(): Promise<ApiResponse<User[]>> {
    const doctors = await this.userRepository.find({
      where: { role: Role.DOCTOR },
      relations: ['doctorProfile'],
    });

    if (doctors.length === 0) {
      return createResponse([], 'No doctors found');
    }

    return createResponse(doctors, 'Doctors retrieved successfully');
  }
}
