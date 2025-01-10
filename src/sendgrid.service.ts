import { Injectable, Logger, OnModuleInit, BadRequestException, Inject } from '@nestjs/common';
import { MailDataRequired, MailService } from '@sendgrid/mail';
import { SendgridModuleOptions } from './interfaces/sendgrid-options.interface';
import { checkValidEmailList } from './utils/email-validator.util';
import { SENDGRID_OPTIONS } from './sendgrid.constants';
import * as https from 'https';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class SendgridService implements OnModuleInit {
  private readonly logger = new Logger(SendgridService.name);
  private sgService: MailService;
  private nodemailerTransport: Transporter;
  private fromEmail: string;

  /**
   * Creates an instance of SendgridService
   * @param options - Configuration options for SendGrid service
   */
  constructor(@Inject(SENDGRID_OPTIONS) private readonly options: SendgridModuleOptions) {
    this.fromEmail = options.defaultFromEmail;
    this.nodemailerTransport = createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: this.options.apiKey
      }
    });
    this.logger.log('SendGrid service instance created');
  }

  /**
   * Fetches file content from URL with proper error handling and content type detection
   * @param url - URL to fetch the file from
   * @returns Promise resolving to {content: string, contentType: string}
   */
  private async fetchFileFromUrl(url: string): Promise<{ content: string; contentType: string }> {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch file: ${response.statusCode}`));
          return;
        }

        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const chunks: Buffer[] = [];

        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks);
            resolve({
              content: buffer.toString('base64'),
              contentType
            });
          } catch (error) {
            reject(new Error(`Failed to process file: ${error.message}`));
          }
        });
        response.on('error', (error) => reject(new Error(`Network error: ${error.message}`)));
      }).on('error', (error) => reject(new Error(`Request failed: ${error.message}`)));
    });
  }

  /**
   * Prepares attachments for the email
   * @param params - Email parameters containing attachment info
   * @returns Array of attachment objects
   */
  private async prepareAttachments(params: EmailParams) {
    try {
      if (!params.attachments?.length && !params.url) return undefined;

      const attachments = [];

      // Handle URL-based attachment if provided
      if (params.url) {
        this.logger.debug(`Fetching attachment from URL: ${params.url}`);
        const { content, contentType } = await this.fetchFileFromUrl(params.url);
        
        if (!content) {
          throw new Error('Failed to fetch attachment content');
        }

        attachments.push({
          content,
          filename: params.fileName || 'attachment',
          type: contentType,
          disposition: 'attachment'
        });
      }

      // Handle regular attachments
      if (params.attachments?.length) {
        const validAttachments = params.attachments.filter(att => att.content && att.filename);
        attachments.push(...validAttachments.map(attachment => ({
          content: attachment.content,
          filename: attachment.filename,
          type: attachment.type || 'application/octet-stream',
          disposition: attachment.disposition || 'attachment',
          contentId: attachment.contentId
        })));
      }

      return attachments.length > 0 ? attachments : undefined;
      
    } catch (error) {
      this.logger.error(`Error preparing attachments: ${error.message}`);
      throw new BadRequestException(`Failed to prepare attachments: ${error.message}`);
    }
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
   * Sends an email with S3 attachment using Nodemailer
   * @param params - The email parameters object
   * @returns Promise resolving to the sent message info
   */
  async sendEmailWithS3Attachment(params: EmailParams) {
    this.logger.log(`Sending email with S3 attachment to: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
    
    try {
      const mailOptions = {
        to: params.to,
        from: params.from || this.fromEmail,
        subject: params.subject,
        text: params.text,
        attachments: params.url ? [{
          path: params.url,
          filename: params.fileName || 'attachment'
        }] : undefined
      };

      const result = await this.nodemailerTransport.sendMail(mailOptions);
      this.logger.log(`Email with S3 attachment sent successfully to: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email with S3 attachment: ${error.message}`);
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
