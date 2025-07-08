import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { createResponse, ApiResponse } from 'src/utils/apiResponse';
import { Role } from 'src/users/dto/create-user.dto';
import { UniqueNumberGenerator } from 'src/utils/uniqueIds';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';
import { Diagnosis } from 'src/diagnosis/entities/diagnosis.entity';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      // Validate doctor and patient exist with proper roles
      const [doctor, patient] = await Promise.all([
        this.userRepository.findOne({
          where: {
            user_id: createPrescriptionDto.doctor_id,
            role: Role.DOCTOR,
          },
        }),
        this.userRepository.findOne({
          where: {
            user_id: createPrescriptionDto.patient_id,
            role: Role.PATIENT,
          },
        }),
      ]);

      if (!doctor) {
        throw new NotFoundException('Doctor not found or user is not a doctor');
      }

      if (!patient) {
        throw new NotFoundException(
          'Patient not found or user is not a patient',
        );
      }

      // validate if a diagnosis exists
      const diagnosis = await this.diagnosisRepository.findOne({
        where: { diagnosis_id: createPrescriptionDto.diagnosis_id },
      });

      if (!diagnosis) {
        throw new NotFoundException('Diagnosis not found');
      }

      // Validate pharmacy stock exists and has sufficient quantity
      const medication = await this.pharmacyStockRepository.findOne({
        where: { medication_id: createPrescriptionDto.medication_id },
      });

      if (!medication) {
        throw new NotFoundException('Pharmacy stock not found');
      }

      if (
        medication.stock_quantity < createPrescriptionDto.quantity_prescribed
      ) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${medication.stock_quantity}, Requested: ${createPrescriptionDto.quantity_prescribed}`,
        );
      }

      // Calculate pricing
      const unitPrice = medication.unit_price;
      const totalPrice = unitPrice * createPrescriptionDto.quantity_prescribed;

      // prescription unique number
      const prescriptionNumber =
        this.uniqueNumberGenerator.generateOrderNumber();

      // Create prescription
      const prescription = this.prescriptionRepository.create({
        ...createPrescriptionDto,
        doctor,
        patient,
        medication,
        diagnosis,
        prescription_number: prescriptionNumber,
        unit_price: unitPrice,
        total_price: totalPrice,
        quantity_dispensed: createPrescriptionDto.quantity_prescribed, // Initially set to prescribed amount
      });

      const savedPrescription =
        await this.prescriptionRepository.save(prescription);

      return createResponse(
        savedPrescription,
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
        relations: ['doctor', 'patient', 'order', 'medication'],
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
        relations: ['doctor', 'patient', 'order', 'medication'],
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

  async findByPatient(patientId: string): Promise<ApiResponse<Prescription[]>> {
    try {
      const prescriptions = await this.prescriptionRepository.find({
        where: { patient: { user_id: patientId } },
        relations: ['doctor'],
        order: { created_at: 'DESC' },
      });

      return createResponse(
        prescriptions,
        'Patient prescriptions retrieved successfully',
      );
    } catch (error) {
      console.error('Error retrieving patient prescriptions:', error);
      throw new BadRequestException('Failed to retrieve patient prescriptions');
    }
  }

  // update
  async update(
    id: string,
    updatePrescriptionDto: Partial<CreatePrescriptionDto>,
  ): Promise<ApiResponse<Prescription>> {
    try {
      const prescription = await this.prescriptionRepository.findOne({
        where: { prescription_id: id },
        relations: ['doctor', 'patient', 'order', 'medication'],
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      // Update only the fields provided in the DTO
      Object.assign(prescription, updatePrescriptionDto);

      // If quantity is updated, validate stock
      if (
        updatePrescriptionDto.quantity_prescribed &&
        prescription.medication
      ) {
        const stock = await this.pharmacyStockRepository.findOne({
          where: { medication_id: prescription.medication.medication_id },
        });

        if (!stock) {
          throw new NotFoundException('Pharmacy stock not found');
        }

        if (
          stock.stock_quantity <
          updatePrescriptionDto.quantity_prescribed -
            (prescription.quantity_dispensed || 0)
        ) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${stock.stock_quantity}, Requested: ${updatePrescriptionDto.quantity_prescribed}`,
          );
        }
      }

      const updatedPrescription =
        await this.prescriptionRepository.save(prescription);

      return createResponse(
        updatedPrescription,
        'Prescription updated successfully',
      );
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw new BadRequestException('Failed to update prescription');
    }
  }

  // remove
  async remove(id: string): Promise<ApiResponse<null>> {
    try {
      const prescription = await this.prescriptionRepository.findOne({
        where: { prescription_id: id },
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      await this.prescriptionRepository.remove(prescription);

      return createResponse(null, 'Prescription removed successfully');
    } catch (error) {
      console.error('Error removing prescription:', error);
      throw new BadRequestException('Failed to remove prescription');
    }
  }
}
