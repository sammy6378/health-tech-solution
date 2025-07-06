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

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.USER)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.USER)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.USER)
  @Post()
  async createOrderFromPrescription(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.USER)
  @Get('/status/:status')
  async findByStatus(@Param('status') status: DeliveryStatus) {
    return this.ordersService.findByStatus(status);
  }

  @Roles(Role.PHARMACY, Role.ADMIN)
  @Patch(':id/update-status')
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body('status') status: DeliveryStatus,
  ) {
    return this.ordersService.updateDeliveryStatus(id, status);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.USER)
  @Patch(':id/confirm-payment')
  async confirmPayment(@Param('id') id: string) {
    return this.ordersService.confirmPayment(id);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.USER)
  @Patch(':id/cancel')
  async cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.USER)
  @Get('prescription/:prescriptionId')
  async findByPrescription(@Param('prescriptionId') prescriptionId: string) {
    return this.ordersService.findByPrescription(prescriptionId);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.USER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
