import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { UploadService } from './cloudinary/upload.service';
import { UploadController } from './cloudinary/upload.controller';
import { UploadModule } from './cloudinary/upload.module';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { DbModule } from './db/db.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { DoctorProfileModule } from './doctor-profile/doctor-profile.module';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    UploadModule,
    EventsModule,
    DbModule,
    UserProfileModule,
    DoctorProfileModule,
    AuthModule,
    AppointmentsModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, CloudinaryProvider, UploadService],
})
export class AppModule {}
