// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, FindOptionsWhere } from 'typeorm';
// import { User } from './entities/user.entity';
// import { CreateUserDto, Role } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { ApiResponse, createResponse } from 'src/utils/apiResponse';

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//   ) {}

//   async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
//     const user = this.userRepository.create(createUserDto);
//     const savedUser = await this.userRepository.save(user);
//     return createResponse(savedUser, 'User created successfully');
//   }

//   async findAll(userId?: string): Promise<ApiResponse<User[]>> {
//     const baseRelations = [
//       'doctorProfile',
//       'patientProfile',
//       'medicalRecord',
//       'appointments',
//       'appointments.patient',
//       'appointments.doctor',
//       'doctorAppointments',
//       'patientDiagnoses',
//       'patientDiagnoses.prescriptions',
//       'patientDiagnoses.prescriptions.medications',
//       'doctorDiagnoses',
//       'doctorDiagnoses.prescriptions',
//       'doctorDiagnoses.prescriptions.medications',
//       'orders',
//     ];

//     const where: FindOptionsWhere<User> | undefined = userId
//       ? { user_id: userId }
//       : undefined;

//     const users = await this.userRepository.find({
//       where,
//       relations: baseRelations,
//       order: { created_at: 'DESC' },
//     });

//     if (users.length === 0) {
//       return createResponse([], userId ? 'User not found' : 'No users found');
//     }

//     return createResponse(users, userId ? 'User fetched' : 'Users fetched');
//   }

//   async findOne(id: string): Promise<ApiResponse<User | null>> {
//     const user = await this.userRepository.findOne({
//       where: { user_id: id },
//       relations: [
//         'doctorProfile',
//         'patientProfile',
//         'medicalRecord',
//         'appointments',
//         'doctorAppointments',
//         'patientDiagnoses',
//         'patientDiagnoses.prescriptions',
//         'patientDiagnoses.prescriptions.medications',
//         'doctorDiagnoses',
//         'doctorDiagnoses.prescriptions',
//         'doctorDiagnoses.prescriptions.medications',
//         'orders',
//       ],
//     });

//     if (!user) {
//       return createResponse(null, 'User not found');
//     }

//     return createResponse(user, 'User retrieved successfully');
//   }

//   async update(
//     id: string,
//     updateUserDto: UpdateUserDto,
//   ): Promise<ApiResponse<User | null>> {
//     await this.userRepository.update(id, updateUserDto);
//     return this.findOne(id).then((response) => {
//       if (response.data) {
//         return createResponse(response.data, 'User updated successfully');
//       }
//       return createResponse(null, 'User not found');
//     });
//   }

//   async remove(id: string): Promise<ApiResponse<null>> {
//     const result = await this.userRepository.delete(id);
//     if (result.affected === 0) {
//       return createResponse(null, 'User not found');
//     }
//     return createResponse(null, 'User deleted successfully');
//   }

//   async findAllDoctors(): Promise<ApiResponse<User[]>> {
//     const doctors = await this.userRepository.find({
//       where: { role: Role.DOCTOR },
//       relations: [
//         'doctorProfile',
//         'doctorAppointments',
//         'doctorDiagnoses',
//         'doctorDiagnoses.prescriptions',
//         'doctorDiagnoses.prescriptions.medications',
//       ],
//     });

//     if (doctors.length === 0) {
//       return createResponse([], 'No doctors found');
//     }

//     return createResponse(doctors, 'Doctors retrieved successfully');
//   }
// }

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

// ✅ NEW: Role-based data retrieval
interface DashboardStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  totalDiagnoses: number;
  totalPrescriptions: number;
  activePrescriptions: number;
  totalOrders: number;
  pendingOrders: number;
  totalMedications?: number;
}

export interface DashboardData {
  user: User;
  profileData: User;
  appointments: Appointment[];
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  orders: Order[];
  patients?: User[];
  medications?: Stock[];
  stats: DashboardStats;
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
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
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
      case Role.PHARMACY:
        dashboardData = await this.getPharmacyDashboardData(dashboardData);
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
        'prescriptions.medications',
        'prescriptions.diagnosis',
        'prescriptions.diagnosis.patient',
        'prescriptions.diagnosis.doctor',
      ],
      order: { created_at: 'DESC' },
    });

    console.log('Diagnoses:', diagnoses);

    // 3. Get patient prescriptions (flattened from diagnoses)
    const prescriptions = diagnoses.flatMap(
      (diagnosis) => diagnosis.prescriptions,
    );

    console.log('Prescriptions:', prescriptions);

    // 4. Get patient orders
    const orders = await this.orderRepository.find({
      where: { patient: { user_id: userId } },
      relations: ['prescription', 'prescription.medications'],
      order: { created_at: 'DESC' },
    });

    // Filter appointments to only include those from today and onward
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointmentsList = appointments.filter(
      (a) => new Date(a.appointment_date) >= today,
    );

    return {
      ...baseData,
      // Only show upcoming appointments (today and onward)
      appointments: upcomingAppointmentsList,
      diagnoses,
      prescriptions,
      orders,
      // Aggregated stats (based on all appointments)
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
        'prescriptions.medications',
        'prescriptions.diagnosis',
        'prescriptions.diagnosis.patient',
        'prescriptions.diagnosis.doctor',
      ],
      order: { created_at: 'DESC' },
    });

    // 3. Get doctor prescriptions (flattened from diagnoses)
    const prescriptions = diagnoses.flatMap(
      (diagnosis) => diagnosis.prescriptions,
    );

    // 4. Get unique patients treated by this doctor
    const patientIds = new Set([
      ...appointments.map((a) => a.patient.user_id),
      ...diagnoses.map((d) => d.patient.user_id),
    ]);

    const patients = await this.userRepository.find({
      where: { user_id: In(Array.from(patientIds)) },
      relations: ['patientProfile'],
    });

    // 5. Get orders for prescriptions created by this doctor
    const prescriptionIds = prescriptions.map((p) => p.prescription_id);
    const orders =
      prescriptionIds.length > 0
        ? await this.orderRepository.find({
            where: {
              prescription: { prescription_id: In(prescriptionIds) },
            },
            relations: [
              'patient',
              'patient.patientProfile',
              'prescription',
              'prescription.medications',
            ],
            order: { created_at: 'DESC' },
          })
        : [];

    return {
      ...baseData,
      appointments,
      diagnoses,
      prescriptions,
      orders,
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
        totalOrders: orders.length,
        pendingOrders: orders.filter(
          (o) => o.payment_status === PaymentStatus.PENDING,
        ).length,
      },
    };
  }

  private async getPharmacyDashboardData(
    baseData: DashboardData,
  ): Promise<DashboardData> {
    const orders = await this.orderRepository.find({
      relations: [
        'prescription',
        'prescription.diagnosis',
        'prescription.medications',
      ],
      order: { created_at: 'DESC' },
    });

    const medications = await this.medicationRepository.find({
      order: { created_at: 'DESC' },
    });

    return {
      ...baseData,
      orders,
      medications,
      stats: {
        ...baseData.stats,
        totalOrders: orders.length,
        pendingOrders: orders.filter(
          (order) => order.payment_status === PaymentStatus.PENDING,
        ).length,
        totalMedications: medications.length,
      },
    };
  }

  private getBasicDashboardData(
    userId: string,
    baseData: DashboardData,
  ): DashboardData {
    // For admin/pharmacy users, return basic data
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
