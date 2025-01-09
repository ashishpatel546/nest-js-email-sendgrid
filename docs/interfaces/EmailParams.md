[nest-js-email-sendgrid](../README.md) / EmailParams

# Interface: EmailParams

Interface for email parameters
EmailParams

## Table of contents

### Properties

- [data](EmailParams.md#data)
- [fileName](EmailParams.md#filename)
- [from](EmailParams.md#from)
- [html](EmailParams.md#html)
- [subject](EmailParams.md#subject)
- [template](EmailParams.md#template)
- [text](EmailParams.md#text)
- [to](EmailParams.md#to)
- [url](EmailParams.md#url)

## Properties

### data

• `Optional` **data**: `Record`\<`string`, `any`\>

Dynamic template data

#### Defined in

sendgrid.service.ts:160

---

### fileName

• `Optional` **fileName**: `string`

Attachment file name

#### Defined in

sendgrid.service.ts:164

---

### from

• `Optional` **from**: `string`

Sender email address

#### Defined in

sendgrid.service.ts:156

---

### html

• `Optional` **html**: `string`

HTML content

#### Defined in

sendgrid.service.ts:168

---

### subject

• `Optional` **subject**: `string`

Email subject

#### Defined in

sendgrid.service.ts:170

---

### template

• `Optional` **template**: `string`

SendGrid template ID

#### Defined in

sendgrid.service.ts:158

---

### text

• `Optional` **text**: `string`

Plain text content

#### Defined in

sendgrid.service.ts:162

---

### to

• **to**: `string` \| `string`[]

Recipient email address or array of addresses

#### Defined in

sendgrid.service.ts:154

---

### url

• `Optional` **url**: `string`

Attachment URL

#### Defined in

sendgrid.service.ts:166
