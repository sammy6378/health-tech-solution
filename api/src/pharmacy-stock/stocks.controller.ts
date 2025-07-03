import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateMedicationDto } from './dto/update-stock.dto';

@Controller('stocks')
export class StocksController {
  constructor(private readonly StocksService: StocksService) {}

  @Post()
  create(@Body() createMedicationDto: CreateStockDto) {
    return this.StocksService.create(createMedicationDto);
  }

  @Get()
  findAll() {
    return this.StocksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.StocksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
  ) {
    return this.StocksService.update(id, updateMedicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.StocksService.remove(id);
  }
}
