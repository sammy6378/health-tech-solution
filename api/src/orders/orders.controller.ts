import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, DeliveryStatus } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Post()
  async createOrderFromPrescription(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get('/status/:status')
  async findByStatus(@Param('status') status: DeliveryStatus) {
    return this.ordersService.findByStatus(status);
  }

  @Patch(':id/update-status')
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body('status') status: DeliveryStatus,
  ) {
    return this.ordersService.updateDeliveryStatus(id, status);
  }

  @Patch(':id/confirm-payment')
  async confirmPayment(@Param('id') id: string) {
    return this.ordersService.confirmPayment(id);
  }

  @Patch(':id/cancel')
  async cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }

  @Get('prescription/:prescriptionId')
  async findByPrescription(@Param('prescriptionId') prescriptionId: string) {
    return this.ordersService.findByPrescription(prescriptionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
