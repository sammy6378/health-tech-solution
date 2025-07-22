import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { User } from 'src/users/entities/user.entity';
import { ApiResponse, createResponse } from 'src/utils/apiResponse';
import { Role } from 'src/users/dto/create-user.dto';

@Injectable()
export class DoctorProfileService {
  constructor(
    @InjectRepository(DoctorProfile)
    private readonly doctorProfileRepository: Repository<DoctorProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createDoctorProfileDto: CreateDoctorProfileDto,
  ): Promise<ApiResponse<DoctorProfile>> {
    const user = await this.userRepository.findOneBy({
      user_id: createDoctorProfileDto.user_id,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.DOCTOR && user.role !== Role.ADMIN) {
      throw new BadRequestException(
        'User must have doctor or admin role to create a doctor profile',
      );
    }

    const existingProfile = await this.doctorProfileRepository.findOne({
      where: { user: { user_id: createDoctorProfileDto.user_id } },
      relations: ['user'],
    });

    console.log('existingprofile', existingProfile);

    if (existingProfile) {
      throw new BadRequestException(
        'Doctor profile already exists for this user',
      );
    }

    const doctorProfile = this.doctorProfileRepository.create({
      ...createDoctorProfileDto,
      user,
    });

    return this.doctorProfileRepository
      .save(doctorProfile)
      .then((savedProfile) =>
        createResponse(savedProfile, 'Doctor profile created successfully'),
      )
      .catch((error) => {
        console.error('Error creating doctor profile:', error);
        throw new Error('Failed to create doctor profile');
      });
  }

  async findAll(): Promise<ApiResponse<DoctorProfile[]>> {
    return this.doctorProfileRepository
      .find()
      .then((profiles) => {
        if (profiles.length === 0) {
          return createResponse([], 'No doctor profiles found');
        }
        return createResponse(
          profiles,
          'Doctor profiles retrieved successfully',
        );
      })
      .catch((error) => {
        console.error('Error retrieving doctor profiles:', error);
        throw new Error('Failed to retrieve doctor profiles');
      });
  }

  async findOne(id: string): Promise<ApiResponse<DoctorProfile | null>> {
    return this.doctorProfileRepository
      .findOne({
        where: { profile_id: id },
        relations: ['user'],
      })
      .then((profile) => {
        if (!profile) {
          return createResponse(null, 'Doctor profile not found');
        }
        return createResponse(profile, 'Doctor profile retrieved successfully');
      })
      .catch((error) => {
        console.error('Error retrieving doctor profile:', error);
        throw new Error('Failed to retrieve doctor profile');
      });
  }

  async update(
    id: string,
    updateDoctorProfileDto: UpdateDoctorProfileDto,
  ): Promise<ApiResponse<DoctorProfile | null>> {
    await this.doctorProfileRepository.update(id, updateDoctorProfileDto);
    return this.findOne(id)
      .then((response) => {
        if (response.data) {
          return createResponse(
            response.data,
            'Doctor profile updated successfully',
          );
        } else {
          return createResponse(null, 'Doctor profile not found');
        }
      })
      .catch((error) => {
        console.error('Error updating doctor profile:', error);
        throw new Error('Failed to update doctor profile');
      });
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    return this.doctorProfileRepository
      .delete(id)
      .then((result) => {
        if (result.affected === 0) {
          return createResponse(null, 'Doctor profile not found');
        }
        return createResponse(null, 'Doctor profile deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting doctor profile:', error);
        throw new Error('Failed to delete doctor profile');
      });
  }
}
