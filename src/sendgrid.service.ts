import { Injectable, Logger, OnModuleInit, BadRequestException, Inject } from '@nestjs/common';
import { MailDataRequired, MailService } from '@sendgrid/mail';
import { SendgridModuleOptions } from './interfaces/sendgrid-options.interface';
import { checkValidEmailList } from './utils/email-validator.util';
import { SENDGRID_OPTIONS } from './sendgrid.constants';

@Injectable()
export class SendgridService implements OnModuleInit {
  private readonly logger = new Logger(SendgridService.name);
  private sgService: MailService;
  private fromEmail: string;

  /**
   * Creates an instance of SendgridService
   * @param options - Configuration options for SendGrid service
   */
  constructor(@Inject(SENDGRID_OPTIONS) private readonly options: SendgridModuleOptions) {
    this.fromEmail = options.defaultFromEmail;
    this.logger.log('SendGrid service instance created');
  }

  /**
   * Prepares attachments for the email
   * @param params - Email parameters containing attachment info
   * @returns Array of attachment objects
   */
  private async prepareAttachments(params: EmailParams) {
    if (!params.attachments?.length) return undefined;

    return params.attachments.map(attachment => ({
      content: attachment.content,
      filename: attachment.filename,
      type: attachment.type,
      disposition: attachment.disposition || 'attachment',
      contentId: attachment.contentId
    }));
  }

  /**
   * Sends an email using a SendGrid template
   * @param {EmailParams} params The email parameters object
   * @returns {Promise<string>} Promise resolving to 'success' when email is sent
   * @throws {BadRequestException} if email addresses are invalid
   */
  async sendEmailFromTemplate(params: EmailParams) {
    this.logger.log(`Sending template email to: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
    const msg: MailDataRequired = {
      to: params.to,
      from: params.from || this.fromEmail,
      subject: params.subject,
      templateId: params.template,
      dynamicTemplateData: params.data,
      attachments: await this.prepareAttachments(params)
    };

    const toEmails = Array.isArray(msg.to) ? msg.to as string[] : [msg.to] as string[];
    
    if (!checkValidEmailList(toEmails)) {
      throw new BadRequestException('Invalid email address provided');
    }

    if (!checkValidEmailList([msg.from as string])) {
      throw new BadRequestException('Invalid sender email address');
    }

    try {
      this.logger.debug('Attempting to send email via SendGrid');
      await this.sgService.send(msg);
      this.logger.log(`Email sent successfully to: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
      return 'success';
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
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
    this.logger.log(`Sending HTML email to: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
    const msg: MailDataRequired = {
      to: params.to,
      from: params.from || this.fromEmail,
      subject: params.subject,
      html: params.html,
      attachments: await this.prepareAttachments(params)
    };

    const toEmails = Array.isArray(msg.to) ? msg.to as string[] : [msg.to] as string[];
    
    if (!checkValidEmailList(toEmails)) {
      throw new BadRequestException('Invalid email address provided');
    }

    if (!checkValidEmailList([msg.from as string])) {
      throw new BadRequestException('Invalid sender email address');
    }

    try {
      this.logger.debug('Attempting to send HTML email via SendGrid');
      await this.sgService.send(msg);
      this.logger.log(`HTML email sent successfully to: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
      return 'success';
    } catch (error) {
      this.logger.error(`Failed to send HTML email: ${error.message}`, error.stack);
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
    this.logger.log(`Sending text email to: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
    const msg: MailDataRequired = {
      to: params.to,
      from: params.from || this.fromEmail,
      subject: params.subject,
      text: params.text,
      attachments: await this.prepareAttachments(params)
    };

    const toEmails = Array.isArray(msg.to) ? msg.to as string[] : [msg.to] as string[];
    
    if (!checkValidEmailList(toEmails)) {
      throw new BadRequestException('Invalid email address provided');
    }

    if (!checkValidEmailList([msg.from as string])) {
      throw new BadRequestException('Invalid sender email address');
    }

    try {
      this.logger.debug('Attempting to send text email via SendGrid');
      await this.sgService.send(msg);
      this.logger.log(`Text email sent successfully to: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
      return 'success';
    } catch (error) {
      this.logger.error(`Failed to send text email: ${error.message}`, error.stack);
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
      this.logger.log('Initializing SendGrid service...');
      this.sgService = new MailService();
      this.sgService.setApiKey(this.options.apiKey);
      this.logger.log('SendGrid service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize SendGrid service:', error.stack);
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
 * @property {Array<{ content: string; filename: string; type: string; disposition?: string; contentId?: string; }>} [attachments] - Email attachments
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
  /** Email attachments */
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition?: string;
    contentId?: string;
  }>;
}
