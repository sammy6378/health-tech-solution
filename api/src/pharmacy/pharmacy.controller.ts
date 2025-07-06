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
import { PharmacyService } from './pharmacy.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AtGuard } from 'src/auth/guards/at.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/dto/create-user.dto';

@UseGuards(AtGuard, RolesGuard)
@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Roles(Role.PHARMACY, Role.ADMIN)
  @Post()
  create(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmacyService.create(createPharmacyDto);
  }

  @Roles(Role.PHARMACY, Role.ADMIN)
  @Get()
  findAll() {
    return this.pharmacyService.findAll();
  }

  @Roles(Role.PHARMACY, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pharmacyService.findOne(id);
  }

  @Roles(Role.PHARMACY, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePharmacyDto: UpdatePharmacyDto,
  ) {
    return this.pharmacyService.update(id, updatePharmacyDto);
  }

  @Roles(Role.PHARMACY, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pharmacyService.remove(id);
  }
}
