import { sendEmailDto } from 'src/types/mailer';

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendEmail({ recipients, subject, template, context }: sendEmailDto) {
    await this.mailer.sendMail({
      to: recipients,
      subject: subject,
      template: template,
      context: context,
    });
  }
}
