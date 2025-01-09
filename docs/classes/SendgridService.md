[nest-js-email-sendgrid](../README.md) / SendgridService

# Class: SendgridService

## Implements

- `OnModuleInit`

## Table of contents

### Constructors

- [constructor](SendgridService.md#constructor)

### Methods

- [onModuleInit](SendgridService.md#onmoduleinit)
- [sendEmailCustomHtmlBody](SendgridService.md#sendemailcustomhtmlbody)
- [sendEmailCustomText](SendgridService.md#sendemailcustomtext)
- [sendEmailFromTemplate](SendgridService.md#sendemailfromtemplate)

## Constructors

### constructor

• **new SendgridService**(`options`): [`SendgridService`](SendgridService.md)

Creates an instance of SendgridService

#### Parameters

| Name      | Type                                                              | Description                                |
| :-------- | :---------------------------------------------------------------- | :----------------------------------------- |
| `options` | [`SendgridModuleOptions`](../interfaces/SendgridModuleOptions.md) | Configuration options for SendGrid service |

#### Returns

[`SendgridService`](SendgridService.md)

#### Defined in

sendgrid.service.ts:16

## Methods

### onModuleInit

▸ **onModuleInit**(): `void`

Initializes the SendGrid service with API key

#### Returns

`void`

**`Throws`**

Error if initialization fails

#### Implementation of

OnModuleInit.onModuleInit

#### Defined in

sendgrid.service.ts:127

---

### sendEmailCustomHtmlBody

▸ **sendEmailCustomHtmlBody**(`params`): `Promise`\<`string`\>

Sends an email with custom HTML body

#### Parameters

| Name     | Type                                          | Description                 |
| :------- | :-------------------------------------------- | :-------------------------- |
| `params` | [`EmailParams`](../interfaces/EmailParams.md) | The email parameters object |

#### Returns

`Promise`\<`string`\>

Promise resolving to 'success' when email is sent

**`Throws`**

if email addresses are invalid

#### Defined in

sendgrid.service.ts:61

---

### sendEmailCustomText

▸ **sendEmailCustomText**(`params`): `Promise`\<`string`\>

Sends an email with plain text content

#### Parameters

| Name     | Type                                          | Description                 |
| :------- | :-------------------------------------------- | :-------------------------- |
| `params` | [`EmailParams`](../interfaces/EmailParams.md) | The email parameters object |

#### Returns

`Promise`\<`string`\>

Promise resolving to 'success' when email is sent

**`Throws`**

if email addresses are invalid

#### Defined in

sendgrid.service.ts:95

---

### sendEmailFromTemplate

▸ **sendEmailFromTemplate**(`params`): `Promise`\<`string`\>

Sends an email using a SendGrid template

#### Parameters

| Name     | Type                                          | Description                 |
| :------- | :-------------------------------------------- | :-------------------------- |
| `params` | [`EmailParams`](../interfaces/EmailParams.md) | The email parameters object |

#### Returns

`Promise`\<`string`\>

Promise resolving to 'success' when email is sent

**`Throws`**

if email addresses are invalid

#### Defined in

sendgrid.service.ts:26
