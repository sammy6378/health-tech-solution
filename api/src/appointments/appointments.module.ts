import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from 'src/users/entities/user.entity';
import { Diagnosis } from 'src/diagnosis/entities/diagnosis.entity';
import { ZoomService } from 'src/zoom/zoom.service';
import { MailService } from 'src/mails/mails.service';

@Module({
  imports: [DbModule, TypeOrmModule.forFeature([Appointment, User, Diagnosis])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, ZoomService, MailService],
})
export class AppointmentsModule {}
