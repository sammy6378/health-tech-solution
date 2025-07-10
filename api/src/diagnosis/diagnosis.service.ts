import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Diagnosis } from './entities/diagnosis.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Prescription } from 'src/prescriptions/entities/prescription.entity';
import { createResponse, ApiResponse } from 'src/utils/apiResponse';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Injectable()
export class DiagnosisService {
  constructor(
    @InjectRepository(Diagnosis)
    private readonly diagnosisRepository: Repository<Diagnosis>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(dto: CreateDiagnosisDto): Promise<ApiResponse<Diagnosis>> {
    const { doctor_id, patient_id } = dto;

    const [doctor, patient] = await Promise.all([
      this.userRepository.findOne({ where: { user_id: doctor_id } }),
      this.userRepository.findOne({ where: { user_id: patient_id } }),
    ]);

    if (!doctor) throw new NotFoundException('Doctor not found');
    if (!patient) throw new NotFoundException('Patient not found');

    const appointment = await this.appointmentRepository.findOne({
      where: { appointment_id: dto.appointment_id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const prescription = await this.prescriptionRepository.findOne({
      where: { prescription_id: dto.prescription_id },
    });

    if (dto.prescription_id && !prescription) {
      throw new NotFoundException('Prescription not found');
    }

    const diagnosis = this.diagnosisRepository.create({
      ...dto,
      patient,
      doctor,
      appointment,
    });

    const saved = await this.diagnosisRepository.save(diagnosis);
    return createResponse(saved, 'Diagnosis created successfully');
  }

  async findAll(): Promise<ApiResponse<Diagnosis[]>> {
    try {
      const diagnoses = await this.diagnosisRepository.find({
        relations: ['patient', 'doctor', 'prescriptions'],
        order: { created_at: 'DESC' },
      });

      return createResponse(diagnoses, 'Diagnoses retrieved successfully');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to retrieve diagnoses');
    }
  }

  async findOne(id: string): Promise<ApiResponse<Diagnosis | null>> {
    try {
      const diagnosis = await this.diagnosisRepository.findOne({
        where: { diagnosis_id: id },
        relations: [
          'patient',
          'doctor',
          'prescriptions',
          'prescriptions.medication',
        ],
      });

      if (!diagnosis) {
        throw new NotFoundException('Diagnosis not found');
      }

      return createResponse(diagnosis, 'Diagnosis retrieved successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve diagnosis');
    }
  }

  async findByPatient(patientId: string): Promise<ApiResponse<Diagnosis[]>> {
    try {
      const diagnoses = await this.diagnosisRepository.find({
        where: { patient: { user_id: patientId } },
        relations: ['patient', 'doctor', 'prescriptions'],
        order: { created_at: 'DESC' },
      });

      return createResponse(
        diagnoses,
        'Patient diagnoses retrieved successfully',
      );
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to retrieve patient diagnoses');
    }
  }

  async findByDoctor(doctorId: string): Promise<ApiResponse<Diagnosis[]>> {
    try {
      const diagnoses = await this.diagnosisRepository.find({
        where: { doctor: { user_id: doctorId } },
        relations: ['patient', 'doctor', 'prescriptions'],
        order: { created_at: 'DESC' },
      });

      return createResponse(
        diagnoses,
        'Doctor diagnoses retrieved successfully',
      );
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to retrieve doctor diagnoses');
    }
  }

  async update(
    id: string,
    updateDiagnosisDto: UpdateDiagnosisDto,
  ): Promise<ApiResponse<Diagnosis>> {
    try {
      const diagnosis = await this.diagnosisRepository.findOne({
        where: { diagnosis_id: id },
      });

      if (!diagnosis) {
        throw new NotFoundException('Diagnosis not found');
      }

      // If updating patient or doctor, verify they exist
      if (updateDiagnosisDto.patient_id) {
        const patient = await this.userRepository.findOne({
          where: { user_id: updateDiagnosisDto.patient_id },
        });
        if (!patient) {
          throw new NotFoundException('Patient not found');
        }
      }

      if (updateDiagnosisDto.doctor_id) {
        const doctor = await this.userRepository.findOne({
          where: { user_id: updateDiagnosisDto.doctor_id },
        });
        if (!doctor) {
          throw new NotFoundException('Doctor not found');
        }
      }

      // Update diagnosis
      await this.diagnosisRepository.update(id, updateDiagnosisDto);

      const updatedDiagnosis = await this.diagnosisRepository.findOne({
        where: { diagnosis_id: id },
        relations: ['patient', 'doctor', 'prescriptions'],
      });

      if (!updatedDiagnosis) {
        throw new NotFoundException('Diagnosis not found after update');
      }

      return createResponse(updatedDiagnosis, 'Diagnosis updated successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update diagnosis');
    }
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    try {
      const diagnosis = await this.diagnosisRepository.findOne({
        where: { diagnosis_id: id },
      });

      if (!diagnosis) {
        throw new NotFoundException('Diagnosis not found');
      }

      await this.diagnosisRepository.remove(diagnosis);

      return createResponse(null, 'Diagnosis deleted successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete diagnosis');
    }
  }

  async addPrescriptionToDiagnosis(
    diagnosisId: string,
    prescriptionId: string,
  ): Promise<ApiResponse<Diagnosis>> {
    try {
      const diagnosis = await this.diagnosisRepository.findOne({
        where: { diagnosis_id: diagnosisId },
        relations: ['prescriptions'],
      });

      if (!diagnosis) {
        throw new NotFoundException('Diagnosis not found');
      }

      const prescription = await this.prescriptionRepository.findOne({
        where: { prescription_id: prescriptionId },
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      // Update prescription to link with diagnosis
      prescription.diagnosis = diagnosis;
      await this.prescriptionRepository.save(prescription);

      const updatedDiagnosis = await this.diagnosisRepository.findOne({
        where: { diagnosis_id: diagnosisId },
        relations: [
          'patient',
          'doctor',
          'prescriptions',
          'prescriptions.medication',
        ],
      });

      if (!updatedDiagnosis) {
        throw new NotFoundException('Diagnosis not found after update');
      }

      return createResponse(
        updatedDiagnosis,
        'Prescription added to diagnosis successfully',
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to add prescription to diagnosis');
    }
  }
}
