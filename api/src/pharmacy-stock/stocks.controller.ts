import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateMedicationDto } from './dto/update-stock.dto';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/dto/create-user.dto';

@UseGuards(AtGuard, RolesGuard)
@Controller('stocks')
export class StocksController {
  constructor(private readonly StocksService: StocksService) {}

  @Roles(Role.PHARMACY)
  @Post()
  create(@Body() createMedicationDto: CreateStockDto) {
    return this.StocksService.create(createMedicationDto);
  }

  @Roles(Role.PHARMACY, Role.ADMIN, Role.DOCTOR, Role.USER)
  @Get()
  findAll() {
    return this.StocksService.findAll();
  }

  @Roles(Role.PHARMACY)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.StocksService.findOne(id);
  }

  @Roles(Role.PHARMACY)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
  ) {
    return this.StocksService.update(id, updateMedicationDto);
  }

  @Roles(Role.PHARMACY)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.StocksService.remove(id);
  }
}
