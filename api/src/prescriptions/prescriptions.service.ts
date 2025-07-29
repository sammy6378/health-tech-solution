import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { Repository, In } from 'typeorm';
import { createResponse, ApiResponse } from 'src/utils/apiResponse';
import { UniqueNumberGenerator } from 'src/utils/uniqueIds';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';
import { Diagnosis } from 'src/diagnosis/entities/diagnosis.entity';
import { PrescriptionMedication } from './entities/prescription_medications.entity';
import { MailService } from 'src/mails/mails.service';
import { Mailer } from 'src/mails/helperEmail';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(PrescriptionMedication)
    private readonly prescriptionMedicationRepository: Repository<PrescriptionMedication>,
    @InjectRepository(Stock)
    private readonly pharmacyStockRepository: Repository<Stock>,
    @InjectRepository(Diagnosis)
    private readonly diagnosisRepository: Repository<Diagnosis>,
    private readonly uniqueNumberGenerator: UniqueNumberGenerator,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreatePrescriptionDto): Promise<ApiResponse<Prescription>> {
    try {
      const { diagnosis_id, items } = dto;

      // Validate diagnosis
      const diagnosis = await this.diagnosisRepository.findOne({
        where: { diagnosis_id },
        relations: ['patient', 'doctor'],
      });

      if (!diagnosis) {
        throw new NotFoundException('Diagnosis not found');
      }

      const medicationIds = items.map((item) => item.medication_id);

      // Fetch all medications
      const medications = await this.pharmacyStockRepository.find({
        where: { medication_id: In(medicationIds) },
      });

      if (medications.length !== medicationIds.length) {
        throw new NotFoundException('One or more medications not found');
      }

      // Validate stock for each item
      for (const item of items) {
        const med = medications.find(
          (m) => m.medication_id === item.medication_id,
        );
        if (!med) continue;

        if (med.stock_quantity < item.quantity_prescribed) {
          throw new BadRequestException(
            `Insufficient stock for ${med.name}: Available ${med.stock_quantity}, Requested ${item.quantity_prescribed}`,
          );
        }
      }

      // Calculate total price
      const totalPrice = items.reduce((sum, item) => {
        const med = medications.find(
          (m) => m.medication_id === item.medication_id,
        );
        return sum + (med?.unit_price ?? 0) * item.quantity_prescribed;
      }, 0);

      // Generate prescription
      const prescription = this.prescriptionRepository.create({
        diagnosis_id,
        prescription_number:
          this.uniqueNumberGenerator.generatePrescriptionNumber(),
        prescription_date: new Date(),
        total_price: totalPrice,
        status: dto.status,
      });

      const savedPrescription =
        await this.prescriptionRepository.save(prescription);

      // Create prescription-medication entries
      const prescriptionMedications = items.map((item) => {
        const med = medications.find(
          (m) => m.medication_id === item.medication_id,
        );
        return this.prescriptionMedicationRepository.create({
          prescription: savedPrescription,
          medication: med,
          medication_name: med?.name,
          quantity_prescribed: item.quantity_prescribed,
          duration_days: item.duration_days,
          frequency_per_day: item.frequency_per_day,
          dosage_instructions: item.dosage_instructions || [],
        });
      });

      await this.prescriptionMedicationRepository.save(prescriptionMedications);

      const prescriptionWithRelations =
        await this.prescriptionRepository.findOne({
          where: { prescription_id: savedPrescription.prescription_id },
          relations: [
            'diagnosis',
            'diagnosis.patient',
            'diagnosis.doctor',
            'prescriptionMedications',
            'prescriptionMedications.medication',
          ],
        });

      if (!prescriptionWithRelations) {
        throw new NotFoundException('Prescription not found after creation');
      }

      const prescriptionMedications_safe =
        prescriptionWithRelations.prescriptionMedications || [];

      // send email notification
      const emailData = {
        patientName:
          prescriptionWithRelations.diagnosis.patient.first_name +
          ' ' +
          prescriptionWithRelations.diagnosis.patient.last_name,
        email: prescriptionWithRelations.diagnosis.patient.email,
        prescriptionDetails: prescriptionMedications_safe.map((med) => ({
          medication: med.medication.name,
          dosage: med.dosage_instructions.join(', '),
          frequency: med.frequency_per_day,
          quantity: med.quantity_prescribed,
          duration_days: med.duration_days,
          dosage_instructions: med.dosage_instructions,
        })),
      };

      const mail = Mailer(this.mailService);
      await mail.prescriptionEmail(emailData);

      return createResponse(
        prescriptionWithRelations,
        'Prescription created successfully',
      );
    } catch (error) {
      console.error('Error creating prescription:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to create prescription');
    }
  }

  async findAll(): Promise<ApiResponse<Prescription[]>> {
    try {
      const prescriptions = await this.prescriptionRepository.find({
        relations: [
          'diagnosis',
          'diagnosis.patient',
          'diagnosis.doctor',
          'medications',
        ],
        order: { created_at: 'DESC' },
      });

      return createResponse(
        prescriptions,
        'Prescriptions retrieved successfully',
      );
    } catch (error) {
      console.error('Error retrieving prescriptions:', error);
      throw new BadRequestException('Failed to retrieve prescriptions');
    }
  }

  async findOne(id: string): Promise<ApiResponse<Prescription | null>> {
    try {
      const prescription = await this.prescriptionRepository.findOne({
        where: { prescription_id: id },
        relations: [
          'diagnosis',
          'diagnosis.patient',
          'diagnosis.doctor',
          'medications',
        ],
      });

      if (!prescription) {
        return createResponse(null, 'Prescription not found');
      }

      return createResponse(
        prescription,
        'Prescription retrieved successfully',
      );
    } catch (error) {
      console.error('Error retrieving prescription:', error);
      throw new BadRequestException('Failed to retrieve prescription');
    }
  }

  async findByDiagnosis(
    diagnosisId: string,
  ): Promise<ApiResponse<Prescription[]>> {
    try {
      const prescriptions = await this.prescriptionRepository.find({
        where: { diagnosis_id: diagnosisId },
        relations: [
          'diagnosis',
          'diagnosis.patient',
          'diagnosis.doctor',
          'medications',
        ],
        order: { created_at: 'DESC' },
      });

      return createResponse(
        prescriptions,
        'Prescriptions for diagnosis retrieved successfully',
      );
    } catch (error) {
      console.error('Error retrieving prescriptions by diagnosis:', error);
      throw new BadRequestException(
        'Failed to retrieve prescriptions by diagnosis',
      );
    }
  }
}
