import { DynamicModule, Module, Provider } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';
import { SendgridModuleAsyncOptions, SendgridModuleOptions } from './interfaces/sendgrid-options.interface';
import { SENDGRID_OPTIONS } from './sendgrid.constants';

@Module({})
export class SendgridModule {
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
