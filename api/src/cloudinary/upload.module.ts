import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryProvider } from './cloudinary.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [UploadService, CloudinaryProvider],
  exports: [UploadService],
})
export class UploadModule {}
