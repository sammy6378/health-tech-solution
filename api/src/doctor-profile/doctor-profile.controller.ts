import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DoctorProfileService } from './doctor-profile.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

@Controller('doctor-profile')
export class DoctorProfileController {
  constructor(private readonly doctorProfileService: DoctorProfileService) {}

  @Post()
  create(@Body() createDoctorProfileDto: CreateDoctorProfileDto) {
    return this.doctorProfileService.create(createDoctorProfileDto);
  }

  @Get()
  findAll() {
    return this.doctorProfileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorProfileService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDoctorProfileDto: UpdateDoctorProfileDto,
  ) {
    return this.doctorProfileService.update(id, updateDoctorProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorProfileService.remove(id);
  }
}
