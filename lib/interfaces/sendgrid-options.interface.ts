export interface SendgridModuleOptions {
  apiKey: string;
  defaultFromEmail: string;
}

export interface SendgridModuleAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => Promise<SendgridModuleOptions> | SendgridModuleOptions;
  inject?: any[];
}
