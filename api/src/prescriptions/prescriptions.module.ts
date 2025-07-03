import { Module } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { User } from 'src/users/entities/user.entity';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';
import { UniqueNumberGenerator } from 'src/utils/uniqueIds';

@Module({
  imports: [DbModule, TypeOrmModule.forFeature([Prescription, User, Stock])],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, UniqueNumberGenerator],
})
export class PrescriptionsModule {}
