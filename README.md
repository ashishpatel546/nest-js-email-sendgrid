# NestJS SendGrid Integration

A robust NestJS module for seamless SendGrid email integration, providing an easy-to-use interface for sending emails using SendGrid's API.

## Features

- 🚀 Easy integration with NestJS applications
- 📧 Support for template-based emails
- 🎨 Custom HTML and plain text emails
- ⚡ Type-safe email parameters
- 🔒 Secure API key configuration
- 🎭 Email masking support for secure logging
- 📎 URL-based attachments from any public cloud storage (AWS S3, Google Cloud Storage, Azure Blob, CDN links)
- 📂 File buffer attachments — send in-memory files (e.g. Multer uploads) directly as email attachments without writing to disk

## Installation

```bash
npm install @sologence/nest-js-email-sendgrid
```

## Quick Start

1. Import the module in your `app.module.ts`. You can use either synchronous registration or async registration:

### Synchronous Registration

```typescript
import { SendgridModule } from '@sologence/nest-js-email-sendgrid';

@Module({
  imports: [
    SendgridModule.register({
      apiKey: 'YOUR_SENDGRID_API_KEY',
      defaultFromEmail: 'your@email.com',
      isGlobal: true, // optional, defaults to false
      masking: true, //to enable masking while logging the email default false
    }),
  ],
})
export class AppModule {}
```

### Asynchronous Registration

```typescript
import { SendgridModule } from '@sologence/nest-js-email-sendgrid';

@Module({
  imports: [
    SendgridModule.registerAsync({
      imports: [ConfigModule], // optional: import modules that are needed for config
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.get('SENDGRID_API_KEY'),
        defaultFromEmail: configService.get('SENDGRID_FROM_EMAIL'),
        isGlobal: true, // optional, defaults to false
        masking: true, //to enable masking while logging the email default false
      }),
      inject: [ConfigService], // optional: services to inject into useFactory
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

Send emails using a SendGrid dynamic template. Attachments are **optional** — you can include them via the `attachments` array (base64 string or Buffer) or a public `url`, but they are not required.

```typescript
// Without attachments
await sendgridService.sendEmailFromTemplate({
  to: 'recipient@example.com',
  from: 'sender@example.com', // optional if defaultFromEmail is set
  subject: 'Welcome!',
  template: 'd-your-template-id',
  data: {
    name: 'John Doe',
  },
});

// With optional file attachment (base64 string or Buffer both accepted)
await sendgridService.sendEmailFromTemplate({
  to: 'recipient@example.com',
  subject: 'Welcome with attachment',
  template: 'd-your-template-id',
  data: { name: 'John Doe' },
  attachments: [
    {
      content: file.buffer, // Buffer or base64 string
      filename: file.originalname,
      type: file.mimetype,
    },
  ],
});
```

#### `sendEmailUsingFileAttachment(params: EmailParams)`

Dedicated method for sending emails where **one or more file attachments are required**. Throws a `BadRequestException` immediately if no attachments are provided.

This is the recommended method when your backend receives a file upload (e.g. via Multer/Swagger) and needs to forward it as an email attachment, because:

- It makes the attachment intent explicit in your code
- It validates attachment presence upfront
- It accepts `Buffer` directly — no manual base64 conversion needed

**Supported attachment content formats:**

| Format          | Example                                    | Notes                               |
| --------------- | ------------------------------------------ | ----------------------------------- |
| `Buffer`        | `file.buffer` (Multer)                     | Auto-converted to base64 internally |
| `base64 string` | `fs.readFileSync(path).toString('base64')` | Used as-is                          |

**Supported email body types** (provide one):

| Body type         | Param               | Notes                           |
| ----------------- | ------------------- | ------------------------------- |
| SendGrid template | `template` + `data` | Dynamic template with variables |
| Custom HTML       | `html`              | Raw HTML string                 |
| Plain text        | `text`              | Plain text string               |

```typescript
// From a Multer file upload (e.g. via Swagger @ApiConsumes('multipart/form-data'))
@Post('send-with-file')
@UseInterceptors(FileInterceptor('file'))
async sendWithFile(@UploadedFile() file: Express.Multer.File) {
  await this.sendgridService.sendEmailUsingFileAttachment({
    to: 'recipient@example.com',
    subject: 'Your uploaded document',
    template: 'd-your-template-id',     // SendGrid template
    data: { name: 'John' },
    attachments: [{
      content: file.buffer,             // Buffer — auto-converted to base64 internally
      filename: file.originalname,
      type: file.mimetype,
    }],
  });
}

// With custom HTML body instead of a template
await sendgridService.sendEmailUsingFileAttachment({
  to: 'recipient@example.com',
  subject: 'Invoice attached',
  html: '<h1>Please find your invoice attached.</h1>',
  attachments: [{
    content: file.buffer,
    filename: 'invoice.pdf',
    type: 'application/pdf',
  }],
});

// Multiple attachments
await sendgridService.sendEmailUsingFileAttachment({
  to: ['user1@example.com', 'user2@example.com'],
  subject: 'Reports',
  text: 'Monthly reports attached.',
  attachments: [
    { content: report1Buffer, filename: 'report1.pdf', type: 'application/pdf' },
    { content: report2Buffer, filename: 'report2.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  ],
});
```

##### Parameters

| Parameter     | Type                  | Required | Description                                       |
| ------------- | --------------------- | -------- | ------------------------------------------------- |
| `to`          | `string \| string[]`  | Yes      | Recipient email address(es)                       |
| `from`        | `string`              | No       | Sender address (falls back to `defaultFromEmail`) |
| `subject`     | `string`              | Yes      | Email subject                                     |
| `attachments` | `Attachment[]`        | **Yes**  | At least one attachment required                  |
| `template`    | `string`              | No\*     | SendGrid template ID                              |
| `data`        | `Record<string, any>` | No       | Dynamic template variables                        |
| `html`        | `string`              | No\*     | Custom HTML body                                  |
| `text`        | `string`              | No\*     | Plain text body                                   |

\* Provide one of `template`, `html`, or `text` as the email body.

##### Attachment Object

| Property      | Type               | Required | Description                                           |
| ------------- | ------------------ | -------- | ----------------------------------------------------- |
| `content`     | `Buffer \| string` | Yes      | Raw Buffer (e.g. `file.buffer`) or base64 string      |
| `filename`    | `string`           | Yes      | Attachment file name (e.g. `file.originalname`)       |
| `type`        | `string`           | Yes      | MIME type (e.g. `file.mimetype`, `'application/pdf'`) |
| `disposition` | `string`           | No       | `'attachment'` (default) or `'inline'`                |
| `contentId`   | `string`           | No       | Content ID for inline attachments                     |

> **Choosing between `sendEmailFromTemplate` and `sendEmailUsingFileAttachment`:**
>
> - Use `sendEmailFromTemplate` when the email body is the primary concern and attachments are incidental/optional.
> - Use `sendEmailUsingFileAttachment` when the file attachment is the primary concern (e.g. forwarding an uploaded file). It enforces that attachments are present and accepts `Buffer` from in-memory uploads directly.

#### `sendEmailCustomHtmlBody(params: EmailParams)`

Send emails with custom HTML content. Attachments are optional.

```typescript
await sendgridService.sendEmailCustomHtmlBody({
  to: 'recipient@example.com',
  from: 'sender@example.com',
  subject: 'Hello',
  html: '<h1>Hello World!</h1>',
});
```

#### `sendEmailCustomText(params: EmailParams)`

Send plain text emails. Attachments are optional.

```typescript
await sendgridService.sendEmailCustomText({
  to: 'recipient@example.com',
  from: 'sender@example.com',
  subject: 'Hello',
  text: 'Hello World!',
});
```

### Sending Emails with URL Attachments

> **⚠ Breaking Change (v2.x):** The method `sendEmailWithS3Attachment` has been renamed to
> `sendEmailWithUrlAttachment` to better reflect its capability. It supports **any publicly
> accessible URL** — AWS S3, Google Cloud Storage, Azure Blob Storage, CDN links, or any
> direct HTTPS file link. Please update all existing usages of `sendEmailWithS3Attachment`.

The module supports sending emails with attachments fetched directly from any public URL using Nodemailer transport:

```typescript
// Inject the service
constructor(private readonly sendgridService: SendgridService) {}

// Send email with a URL-based attachment (S3, GCS, Azure, CDN, etc.)
await this.sendgridService.sendEmailWithUrlAttachment({
  to: 'recipient@example.com',
  from: 'sender@example.com', // optional if defaultFromEmail is set
  subject: 'Document Attached',
  text: 'Please find the attached document',
  url: 'https://your-bucket.s3.amazonaws.com/path/to/file', // or any public URL
  fileName: 'document.pdf' // optional, defaults to 'attachment'
});
```

#### URL Attachment Parameters

| Parameter | Type               | Required | Description                                             |
| --------- | ------------------ | -------- | ------------------------------------------------------- |
| to        | string \| string[] | Yes      | Recipient email address(es)                             |
| from      | string             | No       | Sender email address (falls back to defaultFromEmail)   |
| subject   | string             | Yes      | Email subject                                           |
| text      | string             | Yes      | Email body text                                         |
| url       | string             | Yes      | Full public URL to the file (S3, GCS, Azure, CDN, etc.) |
| fileName  | string             | No       | Custom filename for the attachment                      |

#### Response

The method returns a Promise that resolves to the Nodemailer send result object.

## Configuration Options

| Option      | Type     | Description                  |
| ----------- | -------- | ---------------------------- |
| apiKey      | string   | Your SendGrid API key        |
| defaultFrom | string?  | Default sender email address |
| sandboxMode | boolean? | Enable SendGrid sandbox mode |
| masking     | boolean? | Enable email masking in logs |

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

## Migration Guide

### v2.0.x → v2.1.x

**No breaking changes.** This is a backward-compatible feature release. All existing code continues to work without modification.

> `v2.1.1` is a documentation-only patch — no code changes from `v2.1.0`.

**New capabilities added:**

#### 1. `attachments[].content` now accepts `Buffer`

Previously only a base64 string was accepted. You can now pass a raw `Buffer` and the package converts it internally.

```typescript
// Before (v2.0.x) — manual conversion required
attachments: [
  {
    content: file.buffer.toString('base64'), // ← had to do this yourself
    filename: file.originalname,
    type: file.mimetype,
  },
];

// After (v2.1.0) — pass Buffer directly
attachments: [
  {
    content: file.buffer, // ← Buffer now accepted natively
    filename: file.originalname,
    type: file.mimetype,
  },
];
```

#### 2. New method: `sendEmailUsingFileAttachment()`

A dedicated method for attachment-first email flows. If you were using `sendEmailFromTemplate` to send file attachments, consider migrating to this method for clearer intent and upfront validation.

```typescript
// Before (v2.0.x)
await sendgridService.sendEmailFromTemplate({
  to: 'user@example.com',
  subject: 'Doc',
  template: 'd-xxx',
  attachments: [
    {
      content: file.buffer.toString('base64'),
      filename: 'doc.pdf',
      type: 'application/pdf',
    },
  ],
});

// After (v2.1.0) — recommended when attachment is the primary purpose
await sendgridService.sendEmailUsingFileAttachment({
  to: 'user@example.com',
  subject: 'Doc',
  template: 'd-xxx',
  attachments: [
    { content: file.buffer, filename: 'doc.pdf', type: 'application/pdf' },
  ],
});
```

> `sendEmailFromTemplate()` still works and still accepts attachments — migrating to `sendEmailUsingFileAttachment()` is recommended but not required.

---

### v1.x → v2.x

**Contains breaking changes.**

#### `sendEmailWithS3Attachment` renamed to `sendEmailWithUrlAttachment`

The method was renamed to reflect that it supports any public URL (S3, GCS, Azure Blob, CDN), not just AWS S3.

```typescript
// Before (v1.x)
await sendgridService.sendEmailWithS3Attachment({ ... });

// After (v2.x)
await sendgridService.sendEmailWithUrlAttachment({ ... });
```

The parameters and return value are identical — only the method name changed.

---

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please create an issue in the GitHub repository or contact our support team.
