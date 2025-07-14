import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pharmacy } from 'src/pharmacy/entities/pharmacy.entity';
import { Stock } from './entities/stocks.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderMedication } from 'src/orders/entities/order-medications.entity';

@Module({
  imports: [
    DbModule,
    TypeOrmModule.forFeature([Pharmacy, Stock, Order, OrderMedication]),
  ],
  controllers: [StocksController],
  providers: [StocksService],
})
export class MedicationsModule {}
