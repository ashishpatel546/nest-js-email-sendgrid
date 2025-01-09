import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { MailDataRequired, MailService } from '@sendgrid/mail';
import { SendgridModuleOptions } from './interfaces/sendgrid-options.interface';
import { checkValidEmailList } from './utils/email-validator.util';

@Injectable()
export class SendgridService implements OnModuleInit {
  private readonly logger = new Logger(SendgridService.name);
  private sgService: MailService;
  private fromEmail: string;

  constructor(private options: SendgridModuleOptions) {
    this.fromEmail = options.defaultFromEmail;
  }

  async sendEmailFromTemplate(params: EmailParams) {
    const msg: MailDataRequired = {
      to: params.to,
      from: params.from || this.fromEmail,
      subject: params.subject,
      templateId: params.template,
      dynamicTemplateData: params.data,
    };

    const toEmails = Array.isArray(msg.to) ? msg.to as string[] : [msg.to] as string[];
    
    if (!checkValidEmailList(toEmails)) {
      throw new BadRequestException('Invalid email address provided');
    }

    if (!checkValidEmailList([msg.from as string])) {
      throw new BadRequestException('Invalid sender email address');
    }

    try {
      await this.sgService.send(msg);
      return 'success';
    } catch (error) {
      this.logger.error(error.message);
      this.logger.error('Unable to send email via send grid.');
      throw error;
    }
  }

  async sendEmailCustomHtmlBody(params: EmailParams) {
    const msg: MailDataRequired = {
      to: params.to,
      from: params.from || this.fromEmail,
      subject: params.subject,
      html: params.html,
    };

    const toEmails = Array.isArray(msg.to) ? msg.to as string[] : [msg.to] as string[];
    
    if (!checkValidEmailList(toEmails)) {
      throw new BadRequestException('Invalid email address provided');
    }

    if (!checkValidEmailList([msg.from as string])) {
      throw new BadRequestException('Invalid sender email address');
    }

    try {
      await this.sgService.send(msg);
      return 'success';
    } catch (error) {
      this.logger.error(error.message);
      this.logger.error('Unable to send email via send grid.');
      throw error;
    }
  }

  async sendEmailCustomText(params: EmailParams) {
    const msg: MailDataRequired = {
      to: params.to,
      from: params.from || this.fromEmail,
      subject: params.subject,
      text: params.text,
    };

    const toEmails = Array.isArray(msg.to) ? msg.to as string[] : [msg.to] as string[];
    
    if (!checkValidEmailList(toEmails)) {
      throw new BadRequestException('Invalid email address provided');
    }

    if (!checkValidEmailList([msg.from as string])) {
      throw new BadRequestException('Invalid sender email address');
    }

    try {
      await this.sgService.send(msg);
      return 'success';
    } catch (error) {
      this.logger.error(error.message);
      this.logger.error('Unable to send email via send grid.');
      throw error;
    }
  }

  onModuleInit() {
    try {
      this.sgService = new MailService();
      this.sgService.setApiKey(this.options.apiKey);
    } catch (error) {
      this.logger.error(error.message);
      this.logger.error('Not able to initialize sendgrid service.');
      throw error;
    }
  }
}

export interface EmailParams {
  to: string | string[];
  from?: string;
  template?: string;
  data?: Record<string, any>;
  text?: string;
  fileName?: string;
  url?: string;
  html?: string;
  subject?: string;
}
