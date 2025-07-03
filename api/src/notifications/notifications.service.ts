import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { createResponse, ApiResponse } from 'src/utils/apiResponse';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    const user = await this.userRepository.findOne({
      where: { user_id: createNotificationDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createNotificationDto.user_id} not found`,
      );
    }

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      user,
    });

    const res = await this.notificationRepository.save(notification);

    return createResponse(res, 'Notification created successfully');
  }

  async findAll(): Promise<ApiResponse<Notification[]>> {
    return await this.notificationRepository.find().then((notifications) => {
      if (notifications.length === 0) {
        throw new NotFoundException('No notifications found');
      }
      return createResponse(
        notifications,
        'Notifications retrieved successfully',
      );
    });
  }

  async findOne(id: string): Promise<ApiResponse<Notification>> {
    return await this.notificationRepository
      .findOne({
        where: { notification_id: id },
        relations: ['user'],
      })
      .then((notification) => {
        if (!notification) {
          throw new NotFoundException(`Notification with ID ${id} not found`);
        }
        return createResponse(
          notification,
          'Notification retrieved successfully',
        );
      });
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<ApiResponse<Notification>> {
    return await this.notificationRepository
      .findOne({
        where: { notification_id: id },
        relations: ['user'],
      })
      .then((notification) => {
        if (!notification) {
          throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        const updatedNotification = Object.assign(
          notification,
          updateNotificationDto,
        );
        return this.notificationRepository
          .save(updatedNotification)
          .then((res) => {
            return createResponse(res, 'Notification updated successfully');
          });
      });
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    return await this.notificationRepository
      .findOne({
        where: { notification_id: id },
      })
      .then((notification) => {
        if (!notification) {
          throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return this.notificationRepository.remove(notification).then(() => {
          return createResponse(null, 'Notification deleted successfully');
        });
      });
  }
}
