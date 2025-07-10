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

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Stock)
    private readonly pharmacyStockRepository: Repository<Stock>,
    @InjectRepository(Diagnosis)
    private readonly diagnosisRepository: Repository<Diagnosis>,
    private readonly uniqueNumberGenerator: UniqueNumberGenerator,
  ) {}

  async create(
    createPrescriptionDto: CreatePrescriptionDto,
  ): Promise<ApiResponse<Prescription>> {
    try {
      // Validate if diagnosis exists (contains patient and doctor info)
      const diagnosis = await this.diagnosisRepository.findOne({
        where: { diagnosis_id: createPrescriptionDto.diagnosis_id },
        relations: ['patient', 'doctor'], // Load patient and doctor for validation
      });

      if (!diagnosis) {
        throw new NotFoundException('Diagnosis not found');
      }

      // Validate all medications exist and have sufficient stock
      const medications = await this.pharmacyStockRepository.find({
        where: { medication_id: In(createPrescriptionDto.medication_ids) },
      });

      if (medications.length !== createPrescriptionDto.medication_ids.length) {
        throw new NotFoundException('One or more medications not found');
      }

      // Check stock availability for each medication
      const insufficientStock = medications.filter(
        (medication) =>
          medication.stock_quantity < createPrescriptionDto.quantity_prescribed,
      );

      if (insufficientStock.length > 0) {
        const stockMessages = insufficientStock.map(
          (med) =>
            `${med.name}: Available ${med.stock_quantity}, Requested ${createPrescriptionDto.quantity_prescribed}`,
        );
        throw new BadRequestException(
          `Insufficient stock for: ${stockMessages.join(', ')}`,
        );
      }

      // Calculate total pricing (sum of all medications)
      const totalPrice = medications.reduce(
        (sum, medication) =>
          sum +
          medication.unit_price * createPrescriptionDto.quantity_prescribed,
        0,
      );

      // Generate unique prescription number
      const prescriptionNumber =
        this.uniqueNumberGenerator.generatePrescriptionNumber();

      // Create prescription with only diagnosis_id
      const prescription = this.prescriptionRepository.create({
        diagnosis_id: createPrescriptionDto.diagnosis_id,
        prescription_number: prescriptionNumber,
        prescription_date: new Date(),
        duration_days: createPrescriptionDto.duration_days,
        frequency_per_day: createPrescriptionDto.frequency_per_day,
        quantity_prescribed: createPrescriptionDto.quantity_prescribed,
        dosage_instructions: createPrescriptionDto.dosage_instructions,
        notes: createPrescriptionDto.notes,
        status: createPrescriptionDto.status,
        unit_price: totalPrice / createPrescriptionDto.quantity_prescribed,
        total_price: totalPrice,
        quantity_dispensed: 0,
      });

      // Save prescription first
      const savedPrescription =
        await this.prescriptionRepository.save(prescription);

      // Add medications to the prescription using the relationship
      savedPrescription.medications = medications;
      await this.prescriptionRepository.save(savedPrescription);

      // Load the complete prescription with all relations
      const prescriptionWithRelations =
        await this.prescriptionRepository.findOne({
          where: { prescription_id: savedPrescription.prescription_id },
          relations: [
            'diagnosis',
            'diagnosis.patient',
            'diagnosis.doctor',
            'medications',
          ],
        });

      if (!prescriptionWithRelations) {
        throw new NotFoundException('Prescription not found after creation');
      }

      return createResponse(
        prescriptionWithRelations,
        'Prescription created successfully',
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error creating prescription:', error);
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
          'order',
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
          'order',
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
          'order',
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
