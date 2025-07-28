import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatappService } from './chatapp.service';
import { ChatappController } from './chatapp.controller';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Diagnosis } from 'src/diagnosis/entities/diagnosis.entity';
import { Prescription } from 'src/prescriptions/entities/prescription.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { PatientProfile } from 'src/user-profile/entities/user-profile.entity';
import { MedicalRecord } from 'src/medical-records/entities/medical-record.entity';
import { MailService } from 'src/mails/mails.service';
import { AuthService } from 'src/auth/auth.service';
import { StocksService } from 'src/pharmacy-stock/stocks.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      Appointment,
      Diagnosis,
      Prescription,
      Order,
      Stock,
      Payment,
      PatientProfile,
      MedicalRecord,
    ]),
  ],
  controllers: [ChatappController],
  providers: [
    ChatappService,
    UsersService,
    StocksService,
    MailService,
    AuthService,
  ],
  exports: [ChatappService],
})
export class ChatappModule {}
