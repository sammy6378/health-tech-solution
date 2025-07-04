import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Pharmacy } from 'src/pharmacy/entities/pharmacy.entity';
import { User } from 'src/users/entities/user.entity';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';
import { Prescription } from 'src/prescriptions/entities/prescription.entity';
import { UniqueNumberGenerator } from 'src/utils/uniqueIds';
import { Payment } from 'src/payments/entities/payment.entity';

@Module({
  imports: [
    DbModule,
    TypeOrmModule.forFeature([
      Order,
      Pharmacy,
      User,
      Stock,
      Prescription,
      Payment,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, UniqueNumberGenerator],
})
export class OrdersModule {}
