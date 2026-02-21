import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { MailDataRequired, MailService } from '@sendgrid/mail';
import { SendgridModuleOptions } from './interfaces/sendgrid-options.interface';
import { checkValidEmailList } from './utils/email-validator.util';
import { SENDGRID_OPTIONS } from './sendgrid.constants';
import * as https from 'https';
import { createTransport, Transporter } from 'nodemailer';
import { maskEmailList } from './utils/email-masking.util';

@Injectable()
export class SendgridService implements OnModuleInit {
  private readonly logger = new Logger(SendgridService.name);
  private sgService: MailService;
  private nodemailerTransport: Transporter;
  private fromEmail: string;
  /** Flag to control email masking in logs for privacy */
  private readonly masking: boolean = this.options.masking === true;

  /**
   * Creates an instance of SendgridService
   * @param options - Configuration options for SendGrid service
   *                 Including apiKey, defaultFromEmail, and optional masking flag
   */
  constructor(
    @Inject(SENDGRID_OPTIONS) private readonly options: SendgridModuleOptions
  ) {
    this.fromEmail = options.defaultFromEmail;
    this.nodemailerTransport = createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: this.options.apiKey,
      },
    });
    this.logger.log('SendGrid service instance created');
  }

  /**
   * Fetches file content from URL with proper error handling and content type detection
   * @param url - URL to fetch the file from
   * @returns Promise resolving to {content: string, contentType: string}
   */
  private async fetchFileFromUrl(
    url: string
  ): Promise<{ content: string; contentType: string }> {
    return new Promise((resolve, reject) => {
      https
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to fetch file: ${response.statusCode}`));
            return;
          }

          const contentType =
            response.headers['content-type'] || 'application/octet-stream';
          const chunks: Buffer[] = [];

          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks);
              resolve({
                content: buffer.toString('base64'),
                contentType,
              });
            } catch (error) {
              reject(new Error(`Failed to process file: ${error.message}`));
            }
          });
          response.on('error', (error) =>
            reject(new Error(`Network error: ${error.message}`))
          );
        })
        .on('error', (error) =>
          reject(new Error(`Request failed: ${error.message}`))
        );
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
        const { content, contentType } = await this.fetchFileFromUrl(
          params.url
        );

        if (!content) {
          throw new Error('Failed to fetch attachment content');
        }

        attachments.push({
          content,
          filename: params.fileName || 'attachment',
          type: contentType,
          disposition: 'attachment',
        });
      }

      // Handle regular attachments
      if (params.attachments?.length) {
        const validAttachments = params.attachments.filter(
          (att) => att.content && att.filename
        );
        attachments.push(
          ...validAttachments.map((attachment) => ({
            content: Buffer.isBuffer(attachment.content)
              ? attachment.content.toString('base64')
              : attachment.content,
            filename: attachment.filename,
            type: attachment.type || 'application/octet-stream',
            disposition: attachment.disposition || 'attachment',
            contentId: attachment.contentId,
          }))
        );
      }

      return attachments.length > 0 ? attachments : undefined;
    } catch (error) {
      this.logger.error(`Error preparing attachments: ${error.message}`);
      throw new BadRequestException(
        `Failed to prepare attachments: ${error.message}`
      );
    }
  }

  /**
   * Sends an email using a SendGrid template
   * @param {EmailParams} params The email parameters object
   * @returns {Promise<string>} Promise resolving to 'success' when email is sent
   * @throws {BadRequestException} if email addresses are invalid
   */
  async sendEmailFromTemplate(params: EmailParams) {
    // Initial log uses masked emails when masking is enabled
    this.logger.log(
      `Sending template email to: ${maskEmailList(
        Array.isArray(params.to) ? params.to : [params.to],
        this.masking
      ).join(', ')}`
    );
    const msg: MailDataRequired = {
      to: params.to,
      from: params.from || this.fromEmail,
      subject: params.subject,
      templateId: params.template,
      dynamicTemplateData: params.data,
      attachments: await this.prepareAttachments(params),
    };

    const toEmails = Array.isArray(msg.to)
      ? (msg.to as string[])
      : ([msg.to] as string[]);

    if (!checkValidEmailList(toEmails)) {
      throw new BadRequestException('Invalid email address provided');
    }

    if (!checkValidEmailList([msg.from as string])) {
      throw new BadRequestException('Invalid sender email address');
    }

    try {
      this.logger.debug('Attempting to send email via SendGrid');
      await this.sgService.send(msg);
      this.logger.log(
        `Email sent successfully to: ${maskEmailList(
          params.to,
          this.masking
        ).join(', ')}`
      );
      return 'success';
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      this.logger.error('Unable to send email via send grid.');
      throw error;
    }
  }

  /**
   * Sends an email with one or more file attachments (Buffer or base64 string).
   *
   * Use this method when the backend has an in-memory file — for example a file
   * uploaded via Swagger/Multer — and needs to forward it as an email attachment.
   *
   * Supports both SendGrid template and custom HTML body:
   * - Provide `template` + `data` for a dynamic template email
   * - Provide `html` for a custom HTML body email
   * - Provide `text` for a plain text body email
   *
   * @example
   * // Multer file upload forwarded as attachment
   * await sendgridService.sendEmailUsingFileAttachment({
   *   to: 'user@example.com',
   *   subject: 'Your document',
   *   template: 'd-xxxx',
   *   data: { name: 'John' },
   *   attachments: [{
   *     content: file.buffer,        // Buffer — auto-converted internally
   *     filename: file.originalname,
   *     type: file.mimetype,
   *   }],
   * });
   *
   * @param {EmailParams} params The email parameters object — `attachments` is required
   * @returns {Promise<string>} Promise resolving to 'success' when email is sent
   * @throws {BadRequestException} if attachments are missing or email addresses are invalid
   */
  async sendEmailUsingFileAttachment(params: EmailParams) {
    if (!params.attachments?.length) {
      throw new BadRequestException(
        'At least one attachment is required for sendEmailUsingFileAttachment'
      );
    }

    this.logger.log(
      `Sending email with file attachment(s) to: ${maskEmailList(
        Array.isArray(params.to) ? params.to : [params.to],
        this.masking
      ).join(', ')}`
    );

    const msg: MailDataRequired = {
      to: params.to,
      from: params.from || this.fromEmail,
      subject: params.subject,
      attachments: await this.prepareAttachments(params),
      ...(params.template
        ? { templateId: params.template, dynamicTemplateData: params.data }
        : params.html
        ? { html: params.html }
        : { text: params.text }),
    };

    const toEmails = Array.isArray(msg.to)
      ? (msg.to as string[])
      : ([msg.to] as string[]);

    if (!checkValidEmailList(toEmails)) {
      throw new BadRequestException('Invalid email address provided');
    }

    if (!checkValidEmailList([msg.from as string])) {
      throw new BadRequestException('Invalid sender email address');
    }

    try {
      this.logger.debug(
        `Attempting to send email with ${params.attachments.length} attachment(s) via SendGrid`
      );
      await this.sgService.send(msg);
      this.logger.log(
        `Email with file attachment(s) sent successfully to: ${maskEmailList(
          params.to,
          this.masking
        ).join(', ')}`
      );
      return 'success';
    } catch (error) {
      this.logger.error(
        `Failed to send email with file attachment: ${error.message}`,
        error.stack
      );
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
    // Initial log uses masked emails when masking is enabled
    this.logger.log(
      `Sending HTML email to: ${maskEmailList(
        Array.isArray(params.to) ? params.to : [params.to],
        this.masking
      ).join(', ')}`
    );
    const msg: MailDataRequired = {
      to: params.to,
      from: params.from || this.fromEmail,
      subject: params.subject,
      html: params.html,
      attachments: await this.prepareAttachments(params),
    };

    const toEmails = Array.isArray(msg.to)
      ? (msg.to as string[])
      : ([msg.to] as string[]);

    if (!checkValidEmailList(toEmails)) {
      throw new BadRequestException('Invalid email address provided');
    }

    if (!checkValidEmailList([msg.from as string])) {
      throw new BadRequestException('Invalid sender email address');
    }

    try {
      this.logger.debug('Attempting to send HTML email via SendGrid');
      await this.sgService.send(msg);
      this.logger.log(
        `Email sent successfully to: ${maskEmailList(
          params.to,
          this.masking
        ).join(', ')}`
      );
      return 'success';
    } catch (error) {
      this.logger.error(
        `Failed to send HTML email: ${error.message}`,
        error.stack
      );
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
    // Initial log uses masked emails when masking is enabled
    this.logger.log(
      `Sending text email to: ${maskEmailList(
        Array.isArray(params.to) ? params.to : [params.to],
        this.masking
      ).join(', ')}`
    );
    const msg: MailDataRequired = {
      to: params.to,
      from: params.from || this.fromEmail,
      subject: params.subject,
      text: params.text,
      attachments: await this.prepareAttachments(params),
    };

    const toEmails = Array.isArray(msg.to)
      ? (msg.to as string[])
      : ([msg.to] as string[]);

    if (!checkValidEmailList(toEmails)) {
      throw new BadRequestException('Invalid email address provided');
    }

    if (!checkValidEmailList([msg.from as string])) {
      throw new BadRequestException('Invalid sender email address');
    }

    try {
      this.logger.debug('Attempting to send text email via SendGrid');
      await this.sgService.send(msg);
      this.logger.log(
        `Email sent successfully to: ${maskEmailList(
          params.to,
          this.masking
        ).join(', ')}`
      );
      return 'success';
    } catch (error) {
      this.logger.error(
        `Failed to send text email: ${error.message}`,
        error.stack
      );
      this.logger.error('Unable to send email via send grid.');
      throw error;
    }
  }

  /**
   * Sends an email with a URL-based attachment using Nodemailer.
   *
   * Works with any publicly accessible URL — AWS S3, Google Cloud Storage,
   * Azure Blob Storage, CDN links, or any direct HTTPS file link.
   * Nodemailer fetches the file from the URL and streams it as an attachment.
   *
   * > **⚠ Breaking Change:** This method was previously named `sendEmailWithS3Attachment`.
   * > It has been renamed to `sendEmailWithUrlAttachment` to better reflect that it
   * > supports any public URL, not just AWS S3 links. Please update all usages.
   *
   * @param params - The email parameters object
   * @returns Promise resolving to the Nodemailer sent message info
   */
  async sendEmailWithUrlAttachment(params: EmailParams) {
    // Initial log uses masked emails when masking is enabled
    this.logger.log(
      `Sending email with URL attachment to: ${maskEmailList(
        Array.isArray(params.to) ? params.to : [params.to],
        this.masking
      ).join(', ')}`
    );

    try {
      const mailOptions = {
        to: params.to,
        from: params.from || this.fromEmail,
        subject: params.subject,
        text: params.text,
        attachments: params.url
          ? [
              {
                path: params.url,
                filename: params.fileName || 'attachment',
              },
            ]
          : undefined,
      };

      const result = await this.nodemailerTransport.sendMail(mailOptions);
      this.logger.log(
        `Email with URL attachment sent successfully to: ${maskEmailList(
          Array.isArray(params.to) ? params.to : [params.to],
          this.masking
        ).join(', ')}`
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send email with URL attachment: ${error.message}`
      );
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
 * @property {Array<{ content: string | Buffer; filename: string; type: string; disposition?: string; contentId?: string; }>} [attachments] - Email attachments — content can be a base64 string or a raw Buffer (e.g. from Multer)
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
    /** Base64 string or raw Buffer — Buffer will be auto-converted to base64 */
    content: string | Buffer;
    filename: string;
    type: string;
    disposition?: string;
    contentId?: string;
  }>;
}
