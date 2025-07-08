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
import { DiagnosisService } from './diagnosis.service';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AtGuard } from 'src/auth/guards/at.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/dto/create-user.dto';

@UseGuards(AtGuard, RolesGuard)
@Controller('diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Roles(Role.DOCTOR)
  @Post()
  create(@Body() createDiagnosisDto: CreateDiagnosisDto) {
    return this.diagnosisService.create(createDiagnosisDto);
  }

  @Roles(Role.DOCTOR, Role.ADMIN, Role.PATIENT)
  @Get()
  findAll() {
    return this.diagnosisService.findAll();
  }

  @Roles(Role.DOCTOR, Role.PATIENT, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diagnosisService.findOne(id);
  }

  @Roles(Role.DOCTOR, Role.PATIENT)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDiagnosisDto: UpdateDiagnosisDto,
  ) {
    return this.diagnosisService.update(id, updateDiagnosisDto);
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diagnosisService.remove(id);
  }
}
