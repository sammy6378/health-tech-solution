import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';
import { UploadService } from './upload.service';

@Module({
  controllers: [UploadController],
  imports: [ConfigModule],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
