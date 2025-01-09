import { ModuleMetadata, Provider, Type } from '@nestjs/common';

export interface SendgridModuleOptions {
  apiKey: string;
  defaultFromEmail: string;
  isGlobal?: boolean;
}

export interface SendgridModuleOptionsFactory {
  createSendgridModuleOptions():
    | Promise<SendgridModuleOptions>
    | SendgridModuleOptions;
}

export interface SendgridModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  /** Existing provider to use for creating S3ModuleOptions */
  useExisting?: Type<SendgridModuleOptionsFactory>;
  /** Class to instantiate for creating S3ModuleOptions */
  useClass?: Type<SendgridModuleOptionsFactory>;
  /** Factory function to create S3ModuleOptions */
  useFactory?: (
    ...args: any[]
  ) => Promise<SendgridModuleOptions> | SendgridModuleOptions;
  /** Injectable dependencies for the useFactory function */
  inject?: any[];
  /** Make the module global */
  isGlobal?: boolean;
}
