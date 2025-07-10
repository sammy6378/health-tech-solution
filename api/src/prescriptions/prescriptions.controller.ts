import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
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

  @Roles(Role.DOCTOR, Role.PHARMACY, Role.PATIENT)
  @Get()
  findAll() {
    return this.prescriptionsService.findAll();
  }

  // find by patient
  @Roles(Role.DOCTOR, Role.PHARMACY, Role.PATIENT)
  @Get('diagnosis/:diagnosisId')
  findByDiagnosis(@Param('diagnosisId') diagnosisId: string) {
    return this.prescriptionsService.findByDiagnosis(diagnosisId);
  }

  @Roles(Role.DOCTOR, Role.PHARMACY)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  // @Roles(Role.DOCTOR, Role.PHARMACY)
  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  // ) {
  //   return this.prescriptionsService.update(id, updatePrescriptionDto);
  // }

  // @Roles(Role.DOCTOR, Role.PHARMACY)
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.prescriptionsService.remove(id);
  // }
}
