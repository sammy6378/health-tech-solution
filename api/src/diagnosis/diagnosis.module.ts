import { Module } from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { DiagnosisController } from './diagnosis.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diagnosis } from './entities/diagnosis.entity';
import { User } from 'src/users/entities/user.entity';
import { Prescription } from 'src/prescriptions/entities/prescription.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Module({
  imports: [
    DbModule,
    TypeOrmModule.forFeature([Diagnosis, User, Prescription, Appointment]),
  ],
  controllers: [DiagnosisController],
  providers: [DiagnosisService],
})
export class DiagnosisModule {}
