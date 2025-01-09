import { DynamicModule, Module, Provider } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';
import { SendgridModuleAsyncOptions, SendgridModuleOptions } from './interfaces/sendgrid-options.interface';
import { SENDGRID_OPTIONS } from './sendgrid.constants';

@Module({})
export class SendgridModule {
  /**
   * Register SendGrid module with synchronous options
   * @param options - SendGrid module configuration options
   * @returns Dynamic module configuration
   */
  static register(options: SendgridModuleOptions): DynamicModule {
    return {
      module: SendgridModule,
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

  /**
   * Register SendGrid module with asynchronous options
   * @param options - Async options for SendGrid module configuration
   * @returns Dynamic module configuration
   */
  static registerAsync(options: SendgridModuleAsyncOptions): DynamicModule {
    return {
      module: SendgridModule,
      imports: options.imports || [],
      providers: [
        this.createAsyncOptionsProvider(options),
        SendgridService,
      ],
      exports: [SendgridService],
    };
  }

  /**
   * Creates async options provider
   * @param options - Async options for SendGrid module
   * @returns Provider configuration
   */
  private static createAsyncOptionsProvider(
    options: SendgridModuleAsyncOptions,
  ): Provider {
    return {
      provide: SENDGRID_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }
}
