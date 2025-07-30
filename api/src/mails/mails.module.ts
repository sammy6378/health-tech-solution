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
      useFactory: (configService: ConfigService) => {
        const smtpPort = configService.get<number>('SMTP_PORT');
        const isSecure = smtpPort === 465;
        const requireTLS = smtpPort === 587;

        return {
          transport: {
            host: configService.getOrThrow<string>('SMTP_HOST'),
            port: smtpPort,
            secure: isSecure, // true for 465, false for 587
            requireTLS: requireTLS, // true for 587, false for 465
            auth: {
              user: configService.getOrThrow<string>('SMTP_USER'),
              pass: configService.getOrThrow<string>('SMTP_PASS'),
            },
            tls: {
              rejectUnauthorized: false, // optional: for dev, remove for prod if possible
            },
          },
          defaults: {
            from: `MediConnect <${configService.get<string>('SMTP_USER')}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new EjsAdapter({ inlineCssEnabled: true }),
            options: { strict: false },
          },
        };
      },
    }),
  ],
})
export class MailModule {}
