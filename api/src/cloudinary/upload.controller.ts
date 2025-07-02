import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Express } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileAndValidate(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string,
    @Query('filename') filename?: string,
  ) {
    if (!file || !(file.buffer instanceof Buffer) || file.buffer.length === 0) {
      throw new BadRequestException('No file uploaded or file is empty');
    }

    const result = await this.uploadService.uploadFile(
      file.buffer,
      folder,
      filename,
    );
    return {
      message: 'Uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id,
    };
  }
}
