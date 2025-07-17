import { Module } from '@nestjs/common';
import { MailService } from './mails.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';

@Module({
  providers: [MailService],
  exports: [MailService],
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.getOrThrow<string>('SMTP_HOST'),
          port: configService.getOrThrow<number>('SMTP_PORT'),
          secure: configService.getOrThrow<boolean>('SMTP_SECURE'),
          auth: {
            user: configService.getOrThrow<string>('SMTP_USER'),
            pass: configService.getOrThrow<string>('SMTP_PASS'),
          },
          requireTLS: false, // Set to true if your SMTP requires TLS
          tls: {
            rejectUnauthorized: false, // For development with self-signed certificates
          },
        },
        defaults: {
          from: `MediConnect`,
        },
        template: {
          dir: join(__dirname, 'templates'), // mail/templates/…
          adapter: new EjsAdapter({
            inlineCssEnabled: true, // Enable inline CSS for email templates
          }),
          options: { strict: false },
        },
      }),
    }),
  ],
})
export class MailModule {}
