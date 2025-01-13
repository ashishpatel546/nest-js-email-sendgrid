import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
// import { SendgridService } from './sendgrid.service';
import { SENDGRID_OPTIONS } from './sendgrid.constants';
import { SendgridModuleOptions, SendgridModuleAsyncOptions, SendgridModuleOptionsFactory } from './interfaces/sendgrid-options.interface';
import { SendgridService } from './sendgrid.service';

@Global()
@Module({})
export class SendgridModule {
  static register(options: SendgridModuleOptions): DynamicModule {
    return {
      module: SendgridModule,
      global: options.isGlobal ?? false,
      providers: [
        {
          provide: SENDGRID_OPTIONS,
          useValue: options,
        },
        SendgridService,
      ],
      exports: [SendgridService],
    };
  }

  static registerAsync(options: SendgridModuleAsyncOptions): DynamicModule {
    return {
      module: SendgridModule,
      global: options.isGlobal ?? false,
      imports: options.imports || [],
      providers: [
        ...this.createAsyncProviders(options),
        SendgridService,
      ],
      // exports: [],
      exports: [SendgridService],
    };
  }

  private static createAsyncProviders(options: SendgridModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    if (!options.useClass) {
      throw new Error('useClass is required when not using useExisting or useFactory');
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: SendgridModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: SENDGRID_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const injectionToken = options.useExisting || options.useClass;
    if (!injectionToken) {
      throw new Error('useClass or useExisting is required when not using useFactory');
    }

    return {
      provide: SENDGRID_OPTIONS,
      useFactory: async (optionsFactory: SendgridModuleOptionsFactory) => {
        try {
          return await optionsFactory.createSendgridModuleOptions();
        } catch (error) {
          throw new Error(`Failed to create Sendgrid module options: ${error.message}`);
        }
      },
      inject: [injectionToken],
    };
  }
}