import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { User } from 'src/users/entities/user.entity';
import { SocketsService } from 'src/sockets/sockets.service';
import { SocketGateway } from 'src/sockets/socket.gateway';

@Module({
  imports: [
    DbModule,
    SocketGateway,
    TypeOrmModule.forFeature([Notification, User]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, SocketsService, SocketGateway],
})
export class NotificationsModule {}
