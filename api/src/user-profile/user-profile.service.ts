import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { PatientProfile } from './entities/user-profile.entity';
import { ApiResponse, createResponse } from 'src/utils/apiResponse';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(PatientProfile)
    private readonly userProfileRepository: Repository<PatientProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createUserProfileDto: CreateUserProfileDto,
  ): Promise<ApiResponse<PatientProfile>> {
    const user = await this.userRepository.findOneBy({
      user_id: createUserProfileDto.user_id,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingProfile = await this.userProfileRepository.findOneBy({
      patient: { user_id: createUserProfileDto.user_id },
    });

    if (existingProfile) {
      throw new NotFoundException('User profile already exists');
    }
    const profile = this.userProfileRepository.create({
      ...createUserProfileDto,
      patient: user,
    });
    return this.userProfileRepository
      .save(profile)
      .then((savedProfile) => {
        return createResponse(
          savedProfile,
          'User profile created successfully',
        );
      })
      .catch((error) => {
        console.error('Error creating user profile:', error);
        throw new Error('Failed to create user profile');
      });
  }

  async findAll(): Promise<ApiResponse<PatientProfile[]>> {
    return this.userProfileRepository
      .find()
      .then((profiles) => {
        if (profiles.length === 0) {
          return createResponse([], 'No user profiles found');
        }
        return createResponse(profiles, 'User profiles retrieved successfully');
      })
      .catch((error) => {
        console.error('Error retrieving user profiles:', error);
        throw new Error('Failed to retrieve user profiles');
      });
  }

  async findOne(id: string): Promise<ApiResponse<PatientProfile | null>> {
    return this.userProfileRepository
      .findOneBy({ profile_id: id })
      .then((profile) => {
        if (!profile) {
          return createResponse(null, 'User profile not found');
        }
        return createResponse(profile, 'User profile retrieved successfully');
      })
      .catch((error) => {
        console.error('Error retrieving user profile:', error);
        throw new Error('Failed to retrieve user profile');
      });
  }

  async update(
    id: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<ApiResponse<PatientProfile | null>> {
    await this.userProfileRepository.update(id, updateUserProfileDto);
    return this.findOne(id)
      .then((response) => {
        if (response.data) {
          return createResponse(
            response.data,
            'User profile updated successfully',
          );
        } else {
          return createResponse(null, 'User profile not found');
        }
      })
      .catch((error) => {
        console.error('Error updating user profile:', error);
        throw new Error('Failed to update user profile');
      });
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    return this.userProfileRepository
      .delete(id)
      .then((result) => {
        if (result.affected === 0) {
          return createResponse(null, 'User profile not found');
        } else {
          return createResponse(null, 'User profile deleted successfully');
        }
      })
      .catch((error) => {
        console.error('Error deleting user profile:', error);
        throw new Error('Failed to delete user profile');
      });
  }
}
