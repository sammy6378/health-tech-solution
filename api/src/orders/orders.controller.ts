import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, DeliveryStatus } from './dto/create-order.dto';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/dto/create-user.dto';

@UseGuards(AtGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.PATIENT)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Post()
  async createOrderFromPrescription(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  // @Get('/status/:status')
  // async findByStatus(@Param('status') status: DeliveryStatus) {
  //   return await this.ordersService.findByStatus(status);
  // }

  @Roles(Role.PHARMACY, Role.ADMIN)
  @Patch(':id/update-status')
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body('status') status: DeliveryStatus,
  ) {
    return this.ordersService.updateDeliveryStatus(id, status);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Patch(':id/confirm-payment')
  async confirmPayment(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('transcation_id') transcationId: string,
  ) {
    return this.ordersService.confirmPayment(id, amount, transcationId);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
