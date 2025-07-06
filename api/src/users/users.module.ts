import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from 'src/user-profile/entities/user-profile.entity';
import { DoctorProfile } from 'src/doctor-profile/entities/doctor-profile.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Pharmacy } from 'src/pharmacy/entities/pharmacy.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';
import { MedicalRecord } from 'src/medical-records/entities/medical-record.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Diagnosis } from 'src/diagnosis/entities/diagnosis.entity';

@Module({
  imports: [
    DbModule,
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      DoctorProfile,
      Appointment,
      Pharmacy,
      Order,
      Stock,
      MedicalRecord,
      Notification,
      Diagnosis,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
