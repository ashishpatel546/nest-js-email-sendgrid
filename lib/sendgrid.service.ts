import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { MailDataRequired, MailService } from '@sendgrid/mail';
import { SendgridModuleOptions } from './interfaces/sendgrid-options.interface';
import { checkValidEmailList } from './utils/email-validator.util';

@Injectable()
export class SendgridService implements OnModuleInit {
  private readonly logger = new Logger(SendgridService.name);
  private sgService: MailService;
  private fromEmail: string;

  /**
   * Creates an instance of SendgridService
   * @param options - Configuration options for SendGrid service
   */
  constructor(private options: SendgridModuleOptions) {
    this.fromEmail = options.defaultFromEmail;
  }

  /**
   * Sends an email using a SendGrid template
   * @param {EmailParams} params The email parameters object
   * @returns {Promise<string>} Promise resolving to 'success' when email is sent
   * @throws {BadRequestException} if email addresses are invalid
   */
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

  /**
   * Sends an email with custom HTML body
   * @param {EmailParams} params The email parameters object
   * @returns {Promise<string>} Promise resolving to 'success' when email is sent
   * @throws {BadRequestException} if email addresses are invalid
   */
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

  /**
   * Sends an email with plain text content
   * @param {EmailParams} params The email parameters object
   * @returns {Promise<string>} Promise resolving to 'success' when email is sent
   * @throws {BadRequestException} if email addresses are invalid
   */
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

  /**
   * Initializes the SendGrid service with API key
   * @throws Error if initialization fails
   */
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

/**
 * Interface for email parameters
 * @interface EmailParams
 * @property {string | string[]} to - Recipient email address or array of addresses
 * @property {string} [from] - Sender email address
 * @property {string} [template] - SendGrid template ID
 * @property {Record<string, any>} [data] - Dynamic template data
 * @property {string} [text] - Plain text content
 * @property {string} [fileName] - Attachment file name
 * @property {string} [url] - Attachment URL
 * @property {string} [html] - HTML content
 * @property {string} [subject] - Email subject
 */
export interface EmailParams {
  /** Recipient email address or array of addresses */
  to: string | string[];
  /** Sender email address */
  from?: string;
  /** SendGrid template ID */
  template?: string;
  /** Dynamic template data */
  data?: Record<string, any>;
  /** Plain text content */
  text?: string;
  /** Attachment file name */
  fileName?: string;
  /** Attachment URL */
  url?: string;
  /** HTML content */
  html?: string;
  /** Email subject */
  subject?: string;
}
