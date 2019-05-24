import { waitForAssertion } from '@gojob/wait-for-assertion';
import { Datastore } from '@google-cloud/datastore';

import { CloudDatastoreService } from './cloud-datastore.service';
import { DatastoreEmulatorManager } from './datastore-emulator-manager';

type AccountEntity = {
  email: string;
  level?: number;
};

/**
 * Integration tests suite intended to be run against
 * the Cloud Datastore emulator.
 *
 * @see https://cloud.google.com/datastore/docs/tools/datastore-emulator
 * @see {README.md}
 */
describe('CloudDatastoreService', () => {
  let cloudDatastoreService: CloudDatastoreService;
  let datastoreEmulator: DatastoreEmulatorManager;
  const kind = 'Account';

  beforeAll(() => {
    datastoreEmulator = new DatastoreEmulatorManager();
    cloudDatastoreService = new CloudDatastoreService({});
  });

  beforeEach(() => datastoreEmulator.reset());

  describe('Data fetching', () => {
    describe('findOneByKey', () => {
      it('resolves with undefined when no result is matching with the given key', async () => {
        const result = await cloudDatastoreService.findOneByKey(kind, 123456);
        expect(result).toBeUndefined();
      });

      it('finds any result with the target key', async () => {
        const id = 123456;
        const accountFixture: AccountEntity = { email: 'my-account@nest-rocks.com' };
        await datastoreEmulator.createEntityWithKey(kind, id, accountFixture);

        return waitForAssertion(async () => {
          const result = await cloudDatastoreService.findOneByKey<AccountEntity>(kind, id);
          expect(result).toBeDefined();
          expect(result!.email).toEqual(accountFixture.email);
          expect((result as any)[Datastore.KEY].id).toEqual(id.toString());
        });
      });
    });

    describe('findOneByField', () => {
      it('resolves with undefined when no result is matching the filter', async () => {
        const result = await cloudDatastoreService.findOneByField(kind, 'email', '123456');
        expect(result).toBeUndefined();
      });

      it('finds any result matching the filter (by string property)', async () => {
        const email = 'hello@itsme.com';
        await datastoreEmulator.createEntity(kind, { email });

        return waitForAssertion(async () => {
          const result = await cloudDatastoreService.findOneByField<AccountEntity>(kind, 'email', email);
          expect(result).toBeDefined();
          expect(result!.email).toEqual(email);
        });
      });

      it('finds any result matching the filter (by number property)', async () => {
        const [email, level] = ['20190504-12345', 3];
        const accountFixture = { email, level };
        await datastoreEmulator.createEntity(kind, accountFixture);

        return waitForAssertion(async () => {
          const result = await cloudDatastoreService.findOneByField<AccountEntity>(kind, 'level', 3);
          expect(result).toBeDefined();
          expect(datastoreEmulator.removeDatastoreKeyProp(result)).toEqual(accountFixture);
        });
      });
    });

    describe('findAllByField', () => {
      it('resolves with an empty array when no result is matching the filter', async () => {
        const results = await cloudDatastoreService.findAllByField(kind, 'email', '123456');
        expect(results).toEqual([]);
      });

      it('finds all results matching the filter', async () => {
        const level = 5;
        const entities: AccountEntity[] = [
          { email: 'jenny@nestjs.com', level },
          { email: 'david@gojob.com', level: 4 },
          { email: 'vinceops@github.com', level },
        ];
        await datastoreEmulator.createEntities(kind, entities);
        const expectedResults = entities.filter(ent => ent.level === level);

        return waitForAssertion(async () => {
          const results = await cloudDatastoreService.findAllByField(kind, 'level', level);
          expect(results).toHaveLength(expectedResults.length);
          expect(results.map(datastoreEmulator.removeDatastoreKeyProp)).toEqual(expectedResults);
        });
      });
    });
  });

  describe('Data update', () => {
    describe('save', () => {
      it.each`
        label          | value
        ${'not given'} | ${undefined}
        ${'unknown'}   | ${'unknown-id'}
      `('inserts a new entity when ID is $label', async ({ value }) => {
        const collection = await datastoreEmulator.getAll(kind);
        expect(collection).toHaveLength(0);

        const newEntity: AccountEntity = { email: 'michel@nestjs.com', level: 4 };
        await cloudDatastoreService.save(kind, value, newEntity);

        return waitForAssertion(async () => {
          const updatedCollection = await datastoreEmulator.getAll(kind);
          expect(updatedCollection).toHaveLength(1);
          expect(datastoreEmulator.removeDatastoreKeyProp(updatedCollection[0])).toEqual(newEntity);
        });
      });

      it('updates data when an existing ID is given', async () => {
        const newEntity: AccountEntity = { email: 'jack@gojob.com', level: 7 };
        const id = '12345';
        await datastoreEmulator.createEntityWithKey(kind, id, newEntity);

        const level = 8;
        await cloudDatastoreService.save(kind, id, { ...newEntity, level });

        return waitForAssertion(async () => {
          const updatedEntity = await cloudDatastoreService.findOneByKey<AccountEntity>(kind, id);
          expect(updatedEntity!.level).toBe(level);
          expect(updatedEntity!.email).toBe(newEntity.email);
        });
      });
    });
  });
});
