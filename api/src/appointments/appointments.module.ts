import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [DbModule, TypeOrmModule.forFeature([Appointment, User])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
