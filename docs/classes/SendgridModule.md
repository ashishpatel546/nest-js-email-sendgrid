[nest-js-email-sendgrid](../README.md) / SendgridModule

# Class: SendgridModule

## Table of contents

### Constructors

- [constructor](SendgridModule.md#constructor)

### Methods

- [register](SendgridModule.md#register)
- [registerAsync](SendgridModule.md#registerasync)

## Constructors

### constructor

• **new SendgridModule**(): [`SendgridModule`](SendgridModule.md)

#### Returns

[`SendgridModule`](SendgridModule.md)

## Methods

### register

▸ **register**(`options`): `DynamicModule`

Register SendGrid module with synchronous options

#### Parameters

| Name      | Type                                                              | Description                           |
| :-------- | :---------------------------------------------------------------- | :------------------------------------ |
| `options` | [`SendgridModuleOptions`](../interfaces/SendgridModuleOptions.md) | SendGrid module configuration options |

#### Returns

`DynamicModule`

Dynamic module configuration

#### Defined in

sendgrid.module.ts:13

---

### registerAsync

▸ **registerAsync**(`options`): `DynamicModule`

Register SendGrid module with asynchronous options

#### Parameters

| Name      | Type                                                                        | Description                                     |
| :-------- | :-------------------------------------------------------------------------- | :---------------------------------------------- |
| `options` | [`SendgridModuleAsyncOptions`](../interfaces/SendgridModuleAsyncOptions.md) | Async options for SendGrid module configuration |

#### Returns

`DynamicModule`

Dynamic module configuration

#### Defined in

sendgrid.module.ts:32
