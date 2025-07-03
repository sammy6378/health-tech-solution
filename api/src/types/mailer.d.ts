export type sendEmailDto = {
  subject: string;
  recipients: string | string[];
  template: string;
  context: Record<string, any>;
};
