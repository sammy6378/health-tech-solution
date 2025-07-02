import { Module } from '@nestjs/common';
import { DoctorProfileService } from './doctor-profile.service';
import { DoctorProfileController } from './doctor-profile.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [DbModule, TypeOrmModule.forFeature([DoctorProfile, User])],
  controllers: [DoctorProfileController],
  providers: [DoctorProfileService],
})
export class DoctorProfileModule {}
