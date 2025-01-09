[nest-js-email-sendgrid](../README.md) / SendgridModuleAsyncOptions

# Interface: SendgridModuleAsyncOptions

## Table of contents

### Properties

- [imports](SendgridModuleAsyncOptions.md#imports)
- [inject](SendgridModuleAsyncOptions.md#inject)
- [useFactory](SendgridModuleAsyncOptions.md#usefactory)

## Properties

### imports

• `Optional` **imports**: `any`[]

#### Defined in

interfaces/sendgrid-options.interface.ts:7

---

### inject

• `Optional` **inject**: `any`[]

#### Defined in

interfaces/sendgrid-options.interface.ts:9

---

### useFactory

• **useFactory**: (...`args`: `any`[]) => [`SendgridModuleOptions`](SendgridModuleOptions.md) \| `Promise`\<[`SendgridModuleOptions`](SendgridModuleOptions.md)\>

#### Type declaration

▸ (`...args`): [`SendgridModuleOptions`](SendgridModuleOptions.md) \| `Promise`\<[`SendgridModuleOptions`](SendgridModuleOptions.md)\>

##### Parameters

| Name      | Type    |
| :-------- | :------ |
| `...args` | `any`[] |

##### Returns

[`SendgridModuleOptions`](SendgridModuleOptions.md) \| `Promise`\<[`SendgridModuleOptions`](SendgridModuleOptions.md)\>

#### Defined in

interfaces/sendgrid-options.interface.ts:8
