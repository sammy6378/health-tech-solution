import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from 'src/user-profile/entities/user-profile.entity';
import { DoctorProfile } from 'src/doctor-profile/entities/doctor-profile.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Module({
  imports: [
    DbModule,
    TypeOrmModule.forFeature([User, UserProfile, DoctorProfile, Appointment]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
