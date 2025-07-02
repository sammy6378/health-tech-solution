import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ApiResponse, createResponse } from 'src/utils/apiResponse';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository
      .save(user)
      .then((savedUser) => {
        return createResponse(savedUser, 'User created successfully');
      })
      .catch((error) => {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user');
      });
  }

  async findAll() {
    return this.userRepository
      .find()
      .then((users) => {
        if (users.length === 0) {
          return createResponse([], 'No users found');
        }
        return createResponse(users, 'Users retrieved successfully');
      })
      .catch((error) => {
        console.error('Error retrieving users:', error);
        throw new Error('Failed to retrieve users');
      });
  }

  async findOne(id: string): Promise<ApiResponse<User | null>> {
    return this.userRepository
      .findOneBy({ user_id: id })
      .then((user) => {
        if (!user) {
          return createResponse(null, 'User not found');
        }
        return createResponse(user, 'User retrieved successfully');
      })
      .catch((error) => {
        console.error('Error retrieving user:', error);
        throw new Error('Failed to retrieve user');
      });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User | null>> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id)
      .then((response) => {
        if (response.data) {
          return createResponse(response.data, 'User updated successfully');
        } else {
          return createResponse(null, 'User not found');
        }
      })
      .catch((error) => {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user');
      });
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    return this.userRepository
      .delete(id)
      .then((result) => {
        if (result.affected === 0) {
          return createResponse(null, 'User deleted successfully');
        } else {
          return createResponse(null, 'User not found');
        }
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
        throw new Error('Failed to delete user');
      });
  }
}
