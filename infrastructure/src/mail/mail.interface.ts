export interface SendMailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context?: Record<string, any>;
  attachments?: any[];
}

export interface IMailService {
  sendMail(options: SendMailOptions): Promise<void>;
}
