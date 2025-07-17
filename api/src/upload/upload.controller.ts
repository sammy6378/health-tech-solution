import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/dto/create-user.dto';
import { AtGuard } from 'src/auth/guards/at.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(AtGuard, RolesGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: UploadService) {}

  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.PHARMACY)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 50, // 50MB limit (adjust as needed)
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.cloudinaryService.uploadFile(file.buffer);
    return { imageUrl };
  }
}
