import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    buffer: Buffer,
    folder = 'uploads',
    options?: UploadApiOptions,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto', // ✅ Auto-detect file type
          ...options,
        },
        (error, result) => {
          if (error) {
            const errorMsg =
              error instanceof Error
                ? error.message
                : typeof error === 'object'
                  ? JSON.stringify(error)
                  : String(error);
            return reject(new Error(errorMsg));
          }
          if (result && result.secure_url) {
            resolve(result.secure_url);
          } else {
            reject(
              new Error('Upload failed: No result or secure_url returned.'),
            );
          }
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }
}
