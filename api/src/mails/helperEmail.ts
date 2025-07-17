import { sendEmailDto } from 'src/types/mailer';
import { MailService } from './mails.service';

export const Mailer = (mailService: MailService) => {
  // onboardng emails
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

  // password reset email
  const passwordResetEmail = async (data: {
    name: string;
    email: string;
    resetLink: string;
  }) => {
    const payload: sendEmailDto = {
      recipients: data.email,
      subject: 'Reset Your Password',
      template: 'reset-password.ejs',
      context: {
        name: data.name,
        link: data.resetLink,
      },
    };

    await mailService.sendEmail(payload);
  };

  // appointmnets
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

  // orders
  const orderConfirmationEmail = async (data: {
    order_number: string;
    email: string;
    total_amount: number;
    delivery_method: string;
    payment_method: string;
    payment_status?: string;
    order_date: Date;
    orderMedications: Array<{
      medication: string;
      quantity: number;
      unit_price: number;
      total_amount: number;
    }>;
  }) => {
    const payload: sendEmailDto = {
      recipients: data.email,
      subject: 'Order Confirmation',
      template: 'order-confirmation.ejs',
      context: {
        order_number: data.order_number,
        order_date: data.order_date,
        payment_status: data.payment_status || 'Pending',
        total_amount: data.total_amount,
        delivery_method: data.delivery_method,
        payment_method: data.payment_method,
        orderMedications: data.orderMedications,
      },
    };

    await mailService.sendEmail(payload);
  };

  // prescriptions
  const prescriptionEmail = async (data: {
    patientName: string;
    email: string;
    prescriptionDetails: Array<{
      medication: string;
      dosage: string;
      frequency: number | undefined;
      quantity?: number;
      duration_days?: number;
      dosage_instructions?: string[];
    }>;
  }) => {
    const payload: sendEmailDto = {
      recipients: data.email,
      subject: 'Your Prescription Details',
      template: 'prescription.ejs',
      context: {
        patientName: data.patientName,
        prescriptionDetails: data.prescriptionDetails,
      },
    };

    await mailService.sendEmail(payload);
  };

  return {
    welcomeEmail,
    passwordResetEmail,
    meetingLinkEmail,
    orderConfirmationEmail,
    prescriptionEmail,
    // Add more functions as needed
  };
};
