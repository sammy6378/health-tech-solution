import { sendEmailDto } from 'src/types/mailer';
import { MailService } from './mails.service';

export const Mailer = (mailService: MailService) => {
  const welcomeEmail = async (data: { name: string; email: string }) => {
    const payload: sendEmailDto = {
      recipients: data.email,
      subject: 'Welcome to Our Platform!',
      template: 'welcome.ejs',
      context: {
        name: data.name,
        email: data.email,
        link: '',
      },
    };

    await mailService.sendEmail(payload);
  };

  const passwordResetEmail = async (data: {
    name: string;
    email: string;
    resetLink: string;
  }) => {
    const payload: sendEmailDto = {
      recipients: data.email,
      subject: 'Reset Your Password',
      template: 'reset-password',
      context: {
        name: data.name,
        link: data.resetLink,
      },
    };

    await mailService.sendEmail(payload);
  };

  // meeting links
  const meetingLinkEmail = async (data: {
    name: string;
    email: string;
    meetingLink: string;
    meetingId: string;
  }) => {
    const payload: sendEmailDto = {
      recipients: data.email,
      subject: 'Your Meeting Link',
      template: 'meeting-link.ejs',
      context: {
        name: data.name,
        meetingLink: data.meetingLink,
        meetingId: data.meetingId,
      },
    };
    await mailService.sendEmail(payload);
  };

  return {
    welcomeEmail,
    passwordResetEmail,
    meetingLinkEmail,
    // Add more functions as needed
  };
};
