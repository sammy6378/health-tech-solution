import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AtGuard } from 'src/auth/guards/at.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/dto/create-user.dto';

@UseGuards(AtGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR)
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR)
  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
