import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DbModule } from 'src/db/db.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';

@Module({
  imports: [DbModule, TypeOrmModule.forFeature([Payment, Order, User, Stock])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
