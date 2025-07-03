import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { createResponse, ApiResponse } from 'src/utils/apiResponse';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
  ) {}

  async create(
    createMedicalRecordDto: CreateMedicalRecordDto,
  ): Promise<ApiResponse<MedicalRecord>> {
    try {
      // Check if patient exists
      const patient = await this.userRepository.findOne({
        where: { user_id: createMedicalRecordDto.patient_id },
      });

      if (!patient) {
        throw new NotFoundException(
          `Patient with ID ${createMedicalRecordDto.patient_id} not found`,
        );
      }

      const medicalRecord = this.medicalRecordRepository.create({
        ...createMedicalRecordDto,
        patient_id: createMedicalRecordDto.patient_id,
      });
      const savedRecord =
        await this.medicalRecordRepository.save(medicalRecord);

      return createResponse(savedRecord, 'Medical record created successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create medical record');
    }
  }

  async findAll(): Promise<ApiResponse<MedicalRecord[]>> {
    try {
      const medicalRecords = await this.medicalRecordRepository.find();

      if (!medicalRecords || medicalRecords.length === 0) {
        return createResponse([], 'No medical records found');
      }

      return createResponse(
        medicalRecords,
        'Medical records retrieved successfully',
      );
    } catch (error) {
      console.error('Error retrieving medical records:', error);
      throw new BadRequestException('Failed to retrieve medical records');
    }
  }

  async findOne(id: string): Promise<ApiResponse<MedicalRecord>> {
    try {
      const medicalRecord = await this.medicalRecordRepository.findOne({
        where: { record_id: id },
      });

      if (!medicalRecord) {
        throw new NotFoundException(`Medical record with ID ${id} not found`);
      }

      return createResponse(
        medicalRecord,
        'Medical record retrieved successfully',
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve medical record');
    }
  }

  async update(
    id: string,
    updateMedicalRecordDto: UpdateMedicalRecordDto,
  ): Promise<ApiResponse<MedicalRecord>> {
    try {
      const existingRecord = await this.medicalRecordRepository.findOne({
        where: { record_id: id },
      });

      if (!existingRecord) {
        throw new NotFoundException(`Medical record with ID ${id} not found`);
      }

      // Check if patient exists (if being updated)
      if (updateMedicalRecordDto.patient_id) {
        const patient = await this.userRepository.findOne({
          where: { user_id: updateMedicalRecordDto.patient_id },
        });

        if (!patient) {
          throw new NotFoundException(
            `Patient with ID ${updateMedicalRecordDto.patient_id} not found`,
          );
        }
      }

      await this.medicalRecordRepository.update(id, updateMedicalRecordDto);
      const updatedRecord = await this.medicalRecordRepository.findOne({
        where: { record_id: id },
      });

      if (!updatedRecord) {
        throw new NotFoundException(`Medical record with ID ${id} not found`);
      }

      return createResponse(
        updatedRecord,
        'Medical record updated successfully',
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update medical record');
    }
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    return this.medicalRecordRepository
      .delete(id)
      .then((result) => {
        if (result.affected && result.affected > 0) {
          return createResponse(null, 'Medical record deleted successfully');
        } else {
          return createResponse(null, `Medical record with ID ${id} not found`);
        }
      })
      .catch((error) => {
        console.error('Error deleting medical record:', error);
        throw new BadRequestException('Failed to delete medical record');
      });
  }

  async findByPatient(
    patientId: string,
  ): Promise<ApiResponse<MedicalRecord[]>> {
    try {
      const patient = await this.userRepository.findOne({
        where: { user_id: patientId },
      });

      if (!patient) {
        throw new NotFoundException(`Patient with ID ${patientId} not found`);
      }

      const medicalRecords = await this.medicalRecordRepository.find({
        where: { patient_id: patientId },
        order: { record_date: 'DESC' },
      });

      return createResponse(
        medicalRecords,
        'Patient medical records retrieved successfully',
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to retrieve patient medical records',
      );
    }
  }
}
