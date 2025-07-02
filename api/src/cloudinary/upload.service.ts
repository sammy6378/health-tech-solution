import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(
    @Inject('CLOUDINARY') private cloudinaryClient: typeof cloudinary,
  ) {}

  async uploadFile(
    buffer: Buffer,
    folder: string,
    filename?: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinaryClient.uploader.upload_stream(
        {
          folder,
          public_id: filename,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : typeof error === 'object'
                  ? JSON.stringify(error)
                  : String(error);
            return reject(new Error(errorMessage));
          }
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed: result is undefined.'));
          }
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }
}
