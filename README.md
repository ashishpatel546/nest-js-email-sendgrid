# NestJS SendGrid Integration

A robust NestJS module for seamless SendGrid email integration, providing an easy-to-use interface for sending emails using SendGrid's API.

## Features

- 🚀 Easy integration with NestJS applications
- 📧 Support for template-based emails
- 🎨 Custom HTML and plain text emails
- ⚡ Type-safe email parameters
- 🔒 Secure API key configuration

## Installation

```bash
npm install @sologence/nest-js-email-sendgrid
```

## Quick Start

1. Import the module in your `app.module.ts`:

```typescript
import { SendgridModule } from '@sologence/nest-js-email-sendgrid';

@Module({
  imports: [
    SendgridModule.forRoot({
      apiKey: 'YOUR_SENDGRID_API_KEY',
    }),
  ],
})
export class AppModule {}
```

2. Inject and use the service in your components:

```typescript
import { SendgridService } from '@sologence/nest-js-email-sendgrid';

@Injectable()
export class YourService {
  constructor(private readonly sendgridService: SendgridService) {}

  async sendWelcomeEmail(to: string) {
    await this.sendgridService.sendEmailFromTemplate({
      to,
      from: 'your@email.com',
      templateId: 'your-template-id',
      dynamicTemplateData: {
        name: 'John Doe',
      },
    });
  }
}
```

## API Reference

### SendgridService Methods

#### `sendEmailFromTemplate(params: EmailParams)`

Send emails using SendGrid templates.

```typescript
await sendgridService.sendEmailFromTemplate({
  to: 'recipient@example.com',
  from: 'sender@example.com',
  templateId: 'template-id',
  dynamicTemplateData: {
    // Your template variables
  },
});
```

#### `sendEmailCustomHtmlBody(params: EmailParams)`

Send emails with custom HTML content.

```typescript
await sendgridService.sendEmailCustomHtmlBody({
  to: 'recipient@example.com',
  from: 'sender@example.com',
  subject: 'Hello',
  html: '<h1>Hello World!</h1>',
});
```

#### `sendEmailCustomText(params: EmailParams)`

Send plain text emails.

```typescript
await sendgridService.sendEmailCustomText({
  to: 'recipient@example.com',
  from: 'sender@example.com',
  subject: 'Hello',
  text: 'Hello World!',
});
```

### Sending Emails with S3 Attachments

The module now supports sending emails with attachments directly from S3 URLs using Nodemailer transport:

```typescript
// Inject the service
constructor(private readonly sendgridService: SendgridService) {}

// Send email with S3 attachment
await this.sendgridService.sendEmailWithS3Attachment({
  to: 'recipient@example.com',
  from: 'sender@example.com', // optional if defaultFromEmail is set
  subject: 'Document Attached',
  text: 'Please find the attached document',
  url: 'https://your-bucket.s3.amazonaws.com/path/to/file',
  fileName: 'document.pdf' // optional, defaults to 'attachment'
});
```

#### S3 Attachment Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| to | string \| string[] | Yes | Recipient email address(es) |
| from | string | No | Sender email address (falls back to defaultFromEmail) |
| subject | string | Yes | Email subject |
| text | string | Yes | Email body text |
| url | string | Yes | Full URL to the S3 file |
| fileName | string | No | Custom filename for the attachment |

#### Response

The method returns a Promise that resolves to the Nodemailer send result object.

## Configuration Options

| Option      | Type     | Description                  |
| ----------- | -------- | ---------------------------- |
| apiKey      | string   | Your SendGrid API key        |
| defaultFrom | string?  | Default sender email address |
| sandboxMode | boolean? | Enable SendGrid sandbox mode |

## Error Handling

The service throws typed errors that you can catch and handle:

```typescript
try {
  await sendgridService.sendEmailFromTemplate(params);
} catch (error) {
  if (error instanceof SendGridError) {
    // Handle SendGrid specific errors
  }
  // Handle other errors
}
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please create an issue in the GitHub repository or contact our support team.
