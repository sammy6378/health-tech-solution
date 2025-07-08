import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
// import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
// import { CacheableMemory } from 'cacheable';
// import { createKeyv, Keyv } from '@keyv/redis';
import { DbModule } from './db/db.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { DoctorProfileModule } from './doctor-profile/doctor-profile.module';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicationsModule } from './pharmacy-stock/stocks.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { OrdersModule } from './orders/orders.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mails/mails.module';
import { LogsModule } from './logs/logs.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';
import { AtGuard } from './auth/guards/at.guard';
import { DiagnosisModule } from './diagnosis/diagnosis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // global cache
    // CacheModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   isGlobal: true,
    //   useFactory: (configService: ConfigService) => {
    //     return {
    //       ttl: 30000, // 30 seconds
    //       stores: [
    //         new Keyv({
    //           store: new CacheableMemory({ ttl: 30000, lruSize: 5000 }),
    //         }),
    //         createKeyv(configService.getOrThrow<string>('REDIS_URL')),
    //       ],
    //       Logger: true,
    //     };
    //   },
    // }),
    UsersModule,
    DbModule,
    UserProfileModule,
    DoctorProfileModule,
    AuthModule,
    AppointmentsModule,
    MedicationsModule,
    PharmacyModule,
    PrescriptionsModule,
    OrdersModule,
    MedicalRecordsModule,
    PaymentsModule,
    NotificationsModule,
    MailModule,
    LogsModule,
    DiagnosisModule,
  ],
  controllers: [],
  providers: [
    AppService,
    // {
    //   provide: 'APP_INTERCEPTOR',
    //   useClass: CacheInterceptor, // global cache interceptor
    // },
    {
      provide: APP_GUARD,
      useClass: AtGuard, // protected routes
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // roles guard for role-based access control
    },
  ],
})
export class AppModule {}
