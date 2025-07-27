/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThan } from 'typeorm';

import { Order } from 'src/orders/entities/order.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Diagnosis } from 'src/diagnosis/entities/diagnosis.entity';
import { Prescription } from 'src/prescriptions/entities/prescription.entity';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';
import { User } from 'src/users/entities/user.entity';

import { Role } from 'src/users/dto/create-user.dto';
import { AppointmentStatus } from 'src/appointments/dto/create-appointment.dto';
import { PaymentStatus } from 'src/orders/dto/create-order.dto';
import { DeliveryStatus } from 'src/orders/dto/create-order.dto';
import { detectQueryFromPrompt } from '../intents/intent-engine';
import { StocksService } from 'src/pharmacy-stock/stocks.service';
import { DetectedQuery } from '../interfaces/query-kinds';

@Injectable()
export class AiQueryService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Diagnosis)
    private readonly diagnosisRepo: Repository<Diagnosis>,
    @InjectRepository(Stock)
    private readonly pharmacyStockRepo: Repository<Stock>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly stocksService: StocksService,
  ) {}

  // ----------------------------------------------------------------
  // DOCTORS
  // ----------------------------------------------------------------

  /** Get ALL doctors with their profiles */
  async getAllDoctors(): Promise<User[]> {
    return this.userRepo.find({
      where: {
        role: Role.DOCTOR,
      },
      relations: ['doctorProfile'],
      select: {
        user_id: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
        doctorProfile: {
          specialization: true,
          years_of_experience: true,
          consultation_fee: true,
          bio: true,
          availability: true,
          days: true,
        },
      },
      order: {
        first_name: 'ASC',
        last_name: 'ASC',
      },
      take: 50, // Reasonable limit
    });
  }

  /** Doctor by full name (first_name + last_name), case-insensitive */
  async getDoctorByName(name: string): Promise<User[]> {
    const [first, ...rest] = name.trim().split(/\s+/);
    const last = rest.join(' ');

    return this.userRepo.find({
      where: last
        ? {
            role: Role.DOCTOR,
            first_name: ILike(`%${first}%`),
            last_name: ILike(`%${last}%`),
          }
        : {
            role: Role.DOCTOR,
            first_name: ILike(`%${first}%`),
          },
      relations: ['doctorProfile'],
      select: {
        user_id: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
        doctorProfile: {
          specialization: true,
          years_of_experience: true,
          consultation_fee: true,
          bio: true,
          availability: true,
          days: true,
        },
      },
      take: 5,
    });
  }

  /** Doctor by specialization, case-insensitive */
  async getDoctorBySpecialization(spec: string): Promise<User[]> {
    return this.userRepo.find({
      where: {
        role: Role.DOCTOR,
        doctorProfile: {
          specialization: ILike(`%${spec}%`),
        },
      },
      relations: ['doctorProfile'],
      select: {
        user_id: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
        doctorProfile: {
          specialization: true,
          years_of_experience: true,
          consultation_fee: true,
          bio: true,
          availability: true,
          days: true,
        },
      },
      take: 10,
    });
  }

  async getDoctorsAvailableToday(): Promise<User[]> {
    const currentDay = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
    });

    return this.userRepo.find({
      where: {
        role: Role.DOCTOR,
        doctorProfile: {
          days: ILike(`%${currentDay}%`),
        },
      },
      relations: ['doctorProfile'],
      select: {
        user_id: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
        doctorProfile: {
          specialization: true,
          years_of_experience: true,
          consultation_fee: true,
          bio: true,
          availability: true,
          days: true,
        },
      },
      order: {
        first_name: 'ASC',
        last_name: 'ASC',
      },
      take: 50,
    });
  }

  private summarizeDoctors(
    docs: User[],
    searchName?: string,
    searchSpec?: string,
  ): string {
    if (!docs.length) {
      if (searchName) {
        return `No doctor named "${searchName}" found. You can ask about other doctors or search by specialization.`;
      }
      if (searchSpec) {
        return `No ${searchSpec} specialists found. Available specializations include general practice, cardiology, dermatology, and others.`;
      }
      return 'No matching doctors found.';
    }
    const currentDay = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
    });
    const doctorList = docs
      .slice(0, 5) // Show max 5 in summary
      .map((d) => {
        const name =
          `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() ||
          'Dr. [Name not available]';
        const spec = d.doctorProfile?.specialization || 'General Practice';
        const fee = d.doctorProfile?.consultation_fee
          ? ` - $${d.doctorProfile.consultation_fee}`
          : '';

        // Add availability information
        const availability = d.doctorProfile?.availability || 'Not specified';
        const days = Array.isArray(d.doctorProfile?.days)
          ? d.doctorProfile.days.join(', ')
          : d.doctorProfile?.days || 'Days not specified';

        // Check if available today
        const isAvailableToday =
          days.toLowerCase().includes(currentDay.toLowerCase()) ||
          days.toLowerCase().includes(currentDay.substring(0, 3).toLowerCase());
        const todayStatus = isAvailableToday ? ' (AVAILABLE TODAY)' : '';

        return `${name} (${spec}${fee}) - Available: ${availability}, Days: ${days}${todayStatus}`;
      })
      .join(', ');

    let summary = `Found ${docs.length} doctor${docs.length > 1 ? 's' : ''}`;

    if (searchName) {
      summary += ` matching "${searchName}"`;
    } else if (searchSpec) {
      summary += ` specializing in ${searchSpec}`;
    } else {
      summary += ` available on MediConnect`;
    }

    summary += `: ${doctorList}`;

    if (docs.length > 5) {
      summary += ` and ${docs.length - 5} more.`;
    }
    summary += ` Today is ${currentDay}. Doctors marked as "AVAILABLE TODAY" have schedules that include ${currentDay}.`;
    summary += ` For real-time availability and booking, please check the MediConnect appointment booking system.`;

    return summary;
  }

  // ----------------------------------------------------------------
  // ORDERS
  // ----------------------------------------------------------------

  async getOrdersByUserId(userId: string) {
    const orders = await this.orderRepo.find({
      where: { patient: { user_id: userId } },
      relations: [
        'orderMedications',
        'orderMedications.medication',
        'patient',
        'patient.patientProfile',
      ],
      order: { created_at: 'DESC' },
      take: 20,
    });

    return {
      summary: this.summarizeOrders(orders),
      data: orders,
    };
  }

  async getOrdersByUserIdAndDeliveryStatus(
    userId: string,
    status: DeliveryStatus,
  ) {
    const orders = await this.orderRepo.find({
      where: { patient: { user_id: userId }, delivery_status: status },
      relations: [
        'orderMedications',
        'orderMedications.medication',
        'patient',
        'patient.patientProfile',
      ],
      order: { created_at: 'DESC' },
      take: 20,
    });

    return {
      summary: this.summarizeOrders(orders, `delivery ${status}`),
      data: orders,
    };
  }

  async getOrdersByUserIdAndPaymentStatus(
    userId: string,
    status: PaymentStatus,
  ) {
    const orders = await this.orderRepo.find({
      where: { patient: { user_id: userId }, payment_status: status },
      relations: [
        'orderMedications',
        'orderMedications.medication',
        'patient',
        'patient.patientProfile',
      ],
      order: { created_at: 'DESC' },
      take: 20,
    });

    return {
      summary: this.summarizeOrders(orders, `payment ${status}`),
      data: orders,
    };
  }

  private summarizeOrders(orders: Order[], label?: string): string {
    if (!orders.length) return `No ${label ?? ''} orders found.`.trim();
    let summary = `You have ${orders.length} ${label ? label + ' ' : ''}order(s).`;
    orders.slice(0, 3).forEach((order) => {
      // List up to 3 for brevity
      summary += ` Order ${order.order_id} for ${order.total_amount} was placed on ${order.created_at.toLocaleDateString()} with status ${order.delivery_status}.`;
    });
    return summary;
  }

  // ----------------------------------------------------------------
  // APPOINTMENTS
  // ----------------------------------------------------------------

  async getAppointmentsByUserId(userId: string) {
    const appts = await this.appointmentRepo.find({
      where: { patient: { user_id: userId } },
      relations: [
        'patient',
        'patient.patientProfile',
        'doctor',
        'doctor.doctorProfile',
      ],
      order: { appointment_date: 'DESC' },
      take: 20,
    });

    return {
      summary: this.summarizeAppointments(appts, 'all'),
      data: appts,
    };
  }

  async getAppointmentsByUserIdAndStatus(
    userId: string,
    status: AppointmentStatus,
  ) {
    const appts = await this.appointmentRepo.find({
      where: { patient: { user_id: userId }, status },
      relations: [
        'patient',
        'patient.patientProfile',
        'doctor',
        'doctor.doctorProfile',
      ],
      order: { appointment_date: 'DESC' },
      take: 20,
    });

    return {
      summary: this.summarizeAppointments(appts, `status ${status}`),
      data: appts,
    };
  }

  async getAppointmentsByUserIdAndConsultationType(
    userId: string,
    consultationType: Appointment['consultation_type'],
  ) {
    const appts = await this.appointmentRepo.find({
      where: {
        patient: { user_id: userId },
        consultation_type: consultationType,
      },
      relations: [
        'patient',
        'patient.patientProfile',
        'doctor',
        'doctor.doctorProfile',
      ],
      order: { appointment_date: 'DESC' },
      take: 20,
    });

    return {
      summary: this.summarizeAppointments(
        appts,
        `consultation ${consultationType}`,
      ),
      data: appts,
    };
  }

  async getUpcomingAppointmentsByUserId(userId: string) {
    const now = new Date().toISOString();
    const appts = await this.appointmentRepo.find({
      where: {
        patient: { user_id: userId },
        appointment_date: MoreThan(now),
      },
      relations: [
        'patient',
        'patient.patientProfile',
        'doctor',
        'doctor.doctorProfile',
      ],
      order: { appointment_date: 'ASC' },
      take: 20,
    });

    return {
      summary: this.summarizeAppointments(appts, 'upcoming'),
      data: appts,
    };
  }

  private summarizeAppointments(appts: Appointment[], label: string): string {
    if (!appts.length) return `No ${label} appointments found.`;
    const first = appts[0];
    const doc = first.doctor?.doctorProfile
      ? `${first.doctor.first_name} ${first.doctor.last_name}`
      : 'Unknown doctor';
    return `Found ${appts.length} ${label} appointment(s). Next: ${first.appointment_date} with ${doc}.`;
  }

  // ----------------------------------------------------------------
  // PAYMENTS
  // ----------------------------------------------------------------

  async getPaymentsByUserId(userId: string) {
    const pays = await this.paymentRepo.find({
      where: { user: { user_id: userId } },
      order: { payment_date: 'DESC' },
      take: 20,
    });

    return {
      summary: this.summarizePayments(pays),
      data: pays,
    };
  }

  async getPaymentsByUserIdAndStatus(userId: string, status: PaymentStatus) {
    const pays = await this.paymentRepo.find({
      where: { user: { user_id: userId }, payment_status: status },
      order: { payment_date: 'DESC' },
      take: 20,
    });

    return {
      summary: this.summarizePayments(pays, status),
      data: pays,
    };
  }

  private summarizePayments(pays: Payment[], status?: PaymentStatus): string {
    if (!pays.length)
      return `No ${status ? status.toLowerCase() + ' ' : ''}payments found.`;
    const latest = pays[0];
    return `Found ${pays.length} ${status ? status.toLowerCase() + ' ' : ''}payment(s). Latest: ${latest.amount} on ${latest.payment_date.toISOString()}.`;
  }

  // ----------------------------------------------------------------
  // DIAGNOSES (+ prescriptions + prescriptionMedications)
  // ----------------------------------------------------------------

  async getDiagnosisByUserId(userId: string) {
    const dx = await this.diagnosisRepo.find({
      where: { patient: { user_id: userId } },
      relations: [
        'doctor',
        'doctor.doctorProfile',
        'prescriptions',
        'prescriptions.prescriptionMedications',
        'prescriptions.prescriptionMedications.medication',
        'patient',
        'patient.patientProfile',
      ],
      order: { created_at: 'DESC' },
      take: 20,
    });

    return {
      summary: this.summarizeDiagnoses(dx),
      data: dx,
    };
  }

  async getLatestDiagnosisWithPrescriptions(userId: string) {
    const latest = await this.diagnosisRepo.findOne({
      where: { patient: { user_id: userId } },
      relations: [
        'doctor',
        'doctor.doctorProfile',
        'prescriptions',
        'prescriptions.prescriptionMedications',
        'prescriptions.prescriptionMedications.medication',
        'patient',
        'patient.patientProfile',
      ],
      order: { created_at: 'DESC' },
    });

    return {
      summary: latest
        ? `Latest diagnosis: ${latest.diagnosis_name} at ${latest.created_at.toISOString()}, with ${latest.prescriptions.length} prescription(s).`
        : 'No diagnosis found.',
      data: latest,
    };
  }

  private summarizeDiagnoses(dx: Diagnosis[]): string {
    if (!dx.length) return 'No diagnoses found.';
    const latest = dx[0];
    return `Found ${dx.length} diagnosis(es). Latest: ${latest.diagnosis_name} on ${latest.created_at.toISOString()} with ${latest.prescriptions.length} prescription(s).`;
  }

  // ----------------------------------------------------------------
  // PHARMACY STOCK
  // ----------------------------------------------------------------

  async getStockByNameFuzzy(name: string) {
    const resp = await this.stocksService.searchByNameFuzzy(name);
    const meds = resp.data ?? [];
    return {
      summary: this.summarizeStock(meds, name),
      data: meds,
    };
  }

  async getAllStock() {
    const resp = await this.stocksService.findAll();
    const data = resp.data ?? [];
    return {
      summary: this.summarizeStock(data),
      data,
    };
  }

  async getStockByManufacturerFuzzy(manu: string) {
    const resp = await this.stocksService.searchByManufacturerFuzzy(manu);
    const meds = resp.data ?? [];
    const summary = meds.length
      ? `Found ${meds.length} medication(s) by manufacturer "${manu}".`
      : `No medication found by manufacturer "${manu}".`;
    return { summary, data: meds };
  }

  async getStockOneById(id: string) {
    const resp = await this.stocksService.findOne(id); // ApiResponse<Stock>
    const med = resp.data ?? null;
    const summary = med
      ? `Medication ${med.name} is available with quantity ${med.stock_quantity} at unit price ${med.unit_price}.`
      : 'Medication not found.';
    return { summary, data: med };
  }

  async getStockByName(
    name: string,
  ): Promise<{ summary: string; data: Stock[] }> {
    const stock = await this.pharmacyStockRepo.find({
      where: { name: ILike(`%${name}%`) },
      take: 20,
    });

    return {
      summary: this.summarizeStock(stock, `name "${name}"`),
      data: stock,
    };
  }

  async getStockByCategory(
    category: Stock['category'],
  ): Promise<{ summary: string; data: Stock[] }> {
    const stock = await this.pharmacyStockRepo.find({
      where: { category },
      take: 20,
    });

    return {
      summary: this.summarizeStock(stock, `category ${category}`),
      data: stock,
    };
  }

  async getStockByType(
    type: Stock['medication_type'],
  ): Promise<{ summary: string; data: Stock[] }> {
    const stock = await this.pharmacyStockRepo.find({
      where: { medication_type: type },
      take: 20,
    });

    return {
      summary: this.summarizeStock(stock, `type ${type}`),
      data: stock,
    };
  }

  async getStockByManufacturer(
    manufacturer: string,
  ): Promise<{ summary: string; data: Stock[] }> {
    const stock = await this.pharmacyStockRepo.find({
      where: { manufacturer: ILike(`%${manufacturer}%`) },
      take: 20,
    });

    return {
      summary: this.summarizeStock(stock, `manufacturer "${manufacturer}"`),
      data: stock,
    };
  }

  private summarizeStock(stock: Stock[], searchTerm?: string): string {
    if (!stock.length) {
      if (searchTerm) {
        return `No medication matching "${searchTerm}" found in stock. You can browse all available medications or try a different search term.`;
      }
      return 'No medications found in stock.';
    }

    const firstItem = stock[0];
    let summary = `Found ${stock.length} medication${stock.length > 1 ? 's' : ''}`;

    if (searchTerm) {
      summary += ` matching "${searchTerm}"`;
    }

    summary += `. ${firstItem.name} is available with ${firstItem.stock_quantity} units in stock at ${firstItem.unit_price} per unit.`;

    if (stock.length > 1) {
      summary += ` Other available medications include ${stock
        .slice(1, 3)
        .map((s) => s.name)
        .join(', ')}`;
      if (stock.length > 3) {
        summary += ` and ${stock.length - 3} more.`;
      }
    }

    return summary;
  }

  // ----------------------------------------------------------------
  // ONE ENTRYPOINT you can call from chat flow
  // ----------------------------------------------------------------
  async handleQuery(userId: string, role: Role, prompt: string) {
    console.log('Processing query:', prompt);

    const detected = detectQueryFromPrompt(prompt);
    console.log('Detected intent:', detected);

    // Determine if this requires user-specific data
    const requiresPersonalData = [
      'orders:all',
      'orders:paymentStatus',
      'orders:deliveryStatus',
      'appointments:all',
      'appointments:upcoming',
      'appointments:status',
      'appointments:consultationType',
      'payments:all',
      'payments:status',
      'diagnoses:all',
      'diagnoses:latest',
    ].includes(detected.kind);

    // For platform queries, don't require valid userId
    const effectiveUserId = requiresPersonalData ? userId : null;

    // Try primary intent
    let result = await this.executeQuery(effectiveUserId, detected);

    // If primary fails and confidence is low, try fallbacks
    if (
      (!result.data ||
        (Array.isArray(result.data) && result.data.length === 0)) &&
      detected.confidence < 0.6 &&
      detected.fallbackQueries
    ) {
      console.log('Primary query failed, trying fallbacks...');

      for (const fallbackKind of detected.fallbackQueries) {
        const fallbackResult = await this.executeQuery(effectiveUserId, {
          kind: fallbackKind,
          args: detected.args,
          confidence: 0.3,
        });

        if (
          fallbackResult.data &&
          (!Array.isArray(fallbackResult.data) ||
            fallbackResult.data.length > 0)
        ) {
          result = {
            ...fallbackResult,
            summary: `I found this related information: ${fallbackResult.summary}`,
          };
          break;
        }
      }
    }

    // If still no results, try intelligent suggestions
    if (
      !result.data ||
      (Array.isArray(result.data) && result.data.length === 0)
    ) {
      result = await this.provideSuggestions(
        effectiveUserId ?? '',
        prompt,
        detected,
      );
    }

    return result;
  }

  private async executeQuery(userId: string | null, detected: DetectedQuery) {
    try {
      switch (detected.kind) {
        // Personal data queries - require userId
        case 'orders:paymentStatus':
          if (!userId)
            return {
              summary: 'Please log in to view your orders.',
              data: null,
            };
          return this.getOrdersByUserIdAndPaymentStatus(
            userId,
            detected.args.status,
          );

        case 'orders:deliveryStatus':
          if (!userId)
            return {
              summary: 'Please log in to view your orders.',
              data: null,
            };
          return this.getOrdersByUserIdAndDeliveryStatus(
            userId,
            detected.args.status,
          );

        case 'orders:all':
          if (!userId)
            return {
              summary: 'Please log in to view your orders.',
              data: null,
            };
          return this.getOrdersByUserId(userId);

        case 'appointments:upcoming':
          if (!userId)
            return {
              summary: 'Please log in to view your appointments.',
              data: null,
            };
          return this.getUpcomingAppointmentsByUserId(userId);

        case 'appointments:status':
          if (!userId)
            return {
              summary: 'Please log in to view your appointments.',
              data: null,
            };
          return this.getAppointmentsByUserIdAndStatus(
            userId,
            detected.args.status,
          );

        case 'appointments:all':
          if (!userId)
            return {
              summary: 'Please log in to view your appointments.',
              data: null,
            };
          return this.getAppointmentsByUserId(userId);

        case 'payments:status':
          if (!userId)
            return {
              summary: 'Please log in to view your payments.',
              data: null,
            };
          return this.getPaymentsByUserIdAndStatus(
            userId,
            detected.args.status,
          );

        case 'payments:all':
          if (!userId)
            return {
              summary: 'Please log in to view your payments.',
              data: null,
            };
          return this.getPaymentsByUserId(userId);

        case 'diagnoses:all':
          if (!userId)
            return {
              summary: 'Please log in to view your medical records.',
              data: null,
            };
          return this.getDiagnosisByUserId(userId);

        case 'diagnoses:latest':
          if (!userId)
            return {
              summary: 'Please log in to view your medical records.',
              data: null,
            };
          return this.getLatestDiagnosisWithPrescriptions(userId);

        // Platform data queries - don't require userId
        case 'doctor:all': {
          const docs = await this.getAllDoctors();
          return {
            summary: this.summarizeDoctors(docs),
            data: docs,
          };
        }
        case 'doctor:byName': {
          const docs = await this.getDoctorByName(detected.args.name);
          return {
            summary: this.summarizeDoctors(docs, detected.args.name),
            data: docs,
          };
        }

        case 'doctor:bySpecialization': {
          const docs = await this.getDoctorBySpecialization(
            detected.args.specialization,
          );
          return {
            summary: this.summarizeDoctors(
              docs,
              undefined,
              detected.args.specialization,
            ),
            data: docs,
          };
        }
        case 'doctor:availableToday': {
          const docs = await this.getDoctorsAvailableToday();
          return {
            summary:
              this.summarizeDoctors(docs) +
              ` These doctors are available today.`,
            data: docs,
          };
        }

        case 'stock:all':
          return this.getAllStock();

        case 'stock:oneById':
          return this.getStockOneById(detected.args.id);

        case 'stock:byName':
          return this.getStockByNameFuzzy(detected.args.name);

        case 'stock:byManufacturer':
          return this.getStockByManufacturerFuzzy(detected.args.manufacturer);

        case 'stock:byCategory':
          return this.getStockByCategory(detected.args.category);

        case 'stock:byType':
          return this.getStockByType(detected.args.type);

        default:
          return {
            summary: 'I need more information to help you with that.',
            data: null,
          };
      }
    } catch (error) {
      console.error('Error executing query:', error);
      return {
        summary:
          'I encountered an issue while processing your request. Please try rephrasing your question.',
        data: null,
      };
    }
  }

  private async provideSuggestions(
    userId: string,
    prompt: string,
    detected: DetectedQuery,
  ) {
    const suggestions: string[] = [];

    // Based on the failed query type, suggest alternatives
    if (detected.kind.includes('doctor')) {
      const allDocs = await this.getDoctorBySpecialization('');
      if (allDocs.length > 0) {
        suggestions.push(
          `We have ${allDocs.length} doctors available. You can ask about specific specializations like cardiology, dermatology, or general practice.`,
        );
      }
    }

    if (detected.kind.includes('stock')) {
      const allStock = await this.getAllStock();
      if (allStock.data && allStock.data.length > 0) {
        suggestions.push(
          `We have ${allStock.data.length} medications in stock. You can ask about specific medication names or browse by category.`,
        );
      }
    }

    if (detected.kind.includes('appointments')) {
      const upcomingAppts = await this.getUpcomingAppointmentsByUserId(userId);
      if (upcomingAppts.data && upcomingAppts.data.length > 0) {
        suggestions.push(upcomingAppts.summary);
      } else {
        suggestions.push(
          'You currently have no upcoming appointments. Would you like to schedule one?',
        );
      }
    }

    if (detected.kind.includes('orders')) {
      const recentOrders = await this.getOrdersByUserId(userId);
      if (recentOrders.data && recentOrders.data.length > 0) {
        suggestions.push(
          `You have ${recentOrders.data.length} orders. Would you like to see details about payment status or delivery status?`,
        );
      }
    }

    const finalSummary =
      suggestions.length > 0
        ? `I couldn't find exactly what you were looking for, but here's what I can help with: ${suggestions.join(' ')}`
        : "I couldn't understand your request. You can ask me about your appointments, orders, medications, or find doctors by name or specialization.";

    return {
      summary: finalSummary,
      data: null,
    };
  }
}
