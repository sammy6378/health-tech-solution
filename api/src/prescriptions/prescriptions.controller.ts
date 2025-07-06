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
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/users/dto/create-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(AtGuard, RolesGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Roles(Role.DOCTOR, Role.PHARMACY)
  @Post()
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(createPrescriptionDto);
  }

  @Roles(Role.DOCTOR, Role.PHARMACY, Role.USER)
  @Get()
  findAll() {
    return this.prescriptionsService.findAll();
  }

  // find by patient
  @Roles(Role.DOCTOR, Role.PHARMACY)
  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.prescriptionsService.findByPatient(patientId);
  }

  @Roles(Role.DOCTOR, Role.PHARMACY)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Roles(Role.DOCTOR, Role.PHARMACY)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionsService.update(id, updatePrescriptionDto);
  }

  @Roles(Role.DOCTOR, Role.PHARMACY)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }
}
