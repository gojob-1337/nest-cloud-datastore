# Nest Cloud Datastore

Cloud Datastore module for Nestjs

## Getting started

```bash
yarn add @gojob/nest-cloud-datastore
# or
npm install @gojob/nest-cloud-datastore
```

## Implementing

### Importing the module

If you use the [default configuration](https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application) of GCP client libraries, just import the module `CloudDatastoreModule` as-is.

Otherwise, the configuration passed to the constructor of [Datastore](https://cloud.google.com/nodejs/docs/reference/datastore/3.1.x/Datastore#constructor_1) can be customized in two ways:

* With the static method `forRoot`:

```typescript
import { CloudDatastoreModule, DatastoreModuleAsyncOptions } from '@gojob/nest-cloud-datastore';

const datastoreModule = CloudDatastoreModule.forRoot({ keyFile: configService.get('GCP_KEY_FILE_DATASTORE') });
export default datastoreModule;
```

* With the static method `forRootAsync`, for configuration object built dynamically:

```typescript
import { CloudDatastoreModule, DatastoreModuleAsyncOptions } from '@gojob/nest-cloud-datastore';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

const moduleConfig: DatastoreModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({ keyFile: configService.get('GCP_KEY_FILE_DATASTORE') }),
};

const datastoreModule = CloudDatastoreModule.forRootAsync(moduleConfig);
export default datastoreModule;
```

### Injecting the service

Once the module imported, `CloudDatastoreService` is made available in the injection scope.
Have a look at `src/cloud-datastore.integration-test.ts` to see the methods available.

## Testing

Thanks to the Docker image `google/cloud-sdk` including an emulator, testing the integration of your features with Cloud Datastore is pretty straightforward. Download `docker-compose.yml` from this git repository, then:

```bash
docker-compose up -d # run the emulator
curl localhost:8081 # ensure the emulator is available

# run your tests, with the following environment variables:
# DATASTORE_EMULATOR_HOST=localhost:8081
# DATASTORE_PROJECT_ID=datastore-testing
```

A helper class `DatastoreEmulator` is provided in this package, in order to easily:

* Remove the data stored by the emulator (`reset`)
* Remove the Datastore-specific property of an entity instantiated by the client library (`removeDatastoreKeyProp`)
* Create entities (`createEntity`, `createEntities`)
* Fetch all entities stored by the emulator (`getAll`)

Examples of tests are available `src/cloud-datastore.integration-test.ts`.

## Contributing

```bash
yarn install
```

### Build

```bash
yarn build
```

### Run tests

```bash
docker-compose up -d # start the Cloud Datastore emulator
yarn integration
docker-compose down
```
