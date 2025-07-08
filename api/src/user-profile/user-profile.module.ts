import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientProfile } from './entities/user-profile.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [DbModule, TypeOrmModule.forFeature([User, PatientProfile])],
  controllers: [UserProfileController],
  providers: [UserProfileService],
})
export class UserProfileModule {}
