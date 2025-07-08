import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, Role } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse, createResponse } from 'src/utils/apiResponse';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    return createResponse(savedUser, 'User created successfully');
  }

  async findAll(userId?: string): Promise<ApiResponse<User[]>> {
    const baseRelations = [
      'doctorProfile',
      'patientProfile',
      'medicalRecord',
      'appointments',
      'doctorAppointments',
      'diagnoses',
      'prescriptions',
      'orders',
    ];

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
      relations: [
        'doctorProfile',
        'patientProfile',
        'medicalRecord',
        'appointments',
        'doctorAppointments',
        'diagnoses',
        'prescriptions',
        'orders',
      ],
    });

    if (!user) {
      return createResponse(null, 'User not found');
    }

    return createResponse(user, 'User retrieved successfully');
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
      relations: ['doctorProfile', 'doctorAppointments', 'diagnoses'],
    });

    if (doctors.length === 0) {
      return createResponse([], 'No doctors found');
    }

    return createResponse(doctors, 'Doctors retrieved successfully');
  }
}
