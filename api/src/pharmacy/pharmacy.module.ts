import { Module } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pharmacy } from './entities/pharmacy.entity';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';

@Module({
  imports: [DbModule, TypeOrmModule.forFeature([Pharmacy, User, Stock, Order])],
  controllers: [PharmacyController],
  providers: [PharmacyService],
})
export class PharmacyModule {}
