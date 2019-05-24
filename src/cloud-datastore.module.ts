import { DynamicModule, Module } from '@nestjs/common';
import { ModuleMetadata, Provider, Type } from '@nestjs/common/interfaces';

import { CloudDatastoreService, DATASTORE_CONFIG_TOKEN } from './cloud-datastore.service';

export type DatastoreModuleOptions = {
  keyFile?: string;
  projectId?: string;
  credentials?: {
    client_email?: string;
    private_key?: string;
  };
};

export interface DatastoreOptionsFactory {
  createDatastoreOptions(): Promise<DatastoreModuleOptions> | DatastoreModuleOptions;
}

export interface DatastoreModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<DatastoreOptionsFactory>;
  useClass?: Type<DatastoreOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<DatastoreModuleOptions> | DatastoreModuleOptions;
  inject?: any[];
}

@Module({
  providers: [CloudDatastoreService],
  exports: [CloudDatastoreService],
})
export class CloudDatastoreModule {
  /**
   * Allow building the configuration of the module asynchronously, based
   * on any dependency of the application.
   * Works exactly like `@nestjs/graphql`'s `GraphQLModule.forRootAsync`.
   *
   * @param options Dependency injection parameters used to inject the options of the module.
   *
   * @return a `DynamicModule` based on `CloudDatastoreModule`.
   */
  static forRootAsync(options: DatastoreModuleAsyncOptions): DynamicModule {
    return {
      module: CloudDatastoreModule,
      imports: options.imports,
      providers: this.createAsyncProviders(options),
    };
  }

  /**
   * Pass a custom configuration to `Datastore` constructor
   *
   * @param options Configuration for the `Datastore` class from `@google-cloud/datastore`.
   *
   * @return a `DynamicModule` based on `CloudDatastoreModule`.
   */
  static forRoot(options: DatastoreModuleOptions): DynamicModule {
    return {
      module: CloudDatastoreModule,
      providers: [
        {
          provide: DATASTORE_CONFIG_TOKEN,
          useValue: options,
        },
      ],
    };
  }

  private static createAsyncProviders(options: DatastoreModuleAsyncOptions): Provider[] {
    const asyncProviders = [this.createAsyncOptionsProvider(options)];

    if (options.useExisting || options.useFactory) {
      return asyncProviders;
    }

    if (options.useClass) {
      return [
        ...asyncProviders,
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }

    throw new Error('No provider can be built for async CloudDatastoreModule');
  }

  private static createAsyncOptionsProvider(options: DatastoreModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: DATASTORE_CONFIG_TOKEN,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: DATASTORE_CONFIG_TOKEN,
      useFactory: async (optionsFactory: DatastoreOptionsFactory) => await optionsFactory.createDatastoreOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
