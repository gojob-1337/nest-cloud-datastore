import { Datastore } from '@google-cloud/datastore';
import request from 'request-promise-native';

/**
 * Helper class relying on env. variable `DATASTORE_EMULATOR_HOST`
 * to operate on the Cloud Datastore emulator (creating/editing fixtures
 * data, resetting the datastore, etc).
 */
export class DatastoreEmulatorManager {
  constructor(private readonly datastore: Datastore = new Datastore()) {}

  /**
   * Send a request to the Datastore emulator to **empty** all its data.
   *
   * @return Resolves on success, or rejects.
   */
  reset() {
    return request(`http://${process.env.DATASTORE_EMULATOR_HOST}/reset`, { method: 'post' });
  }

  /**
   * Return a given object without its Datastore-specific "KEY" prop (if any).
   *
   * @param entity Object supposed to be an instance of Datastore entity.
   *
   * @return A shallow copy of `entity` without the prop `[Datastore.KEY]` (or the entity).
   */
  removeDatastoreKeyProp(entity: any) {
    if (!entity || !entity[Datastore.KEY]) {
      return entity;
    }

    const { [Datastore.KEY]: _, ...rest } = entity;
    return rest;
  }

  /**
   * Fetch all entities of a given kind.
   *
   * @param kind Kind name.
   *
   * @return Resolves with an array of entities, or rejects.
   */
  async getAll(kind: string) {
    const query = this.datastore.createQuery(kind);
    const [results] = await this.datastore.runQuery(query);
    return results;
  }

  /**
   * Insert an entity in Datastore with a key composed of
   * `kind` and `nameOrId`.
   *
   * @param kind Kind name.
   * @param nameOrId Entity identifier.
   * @param data Entity to be inserted.
   *
   * @return Resolves on success, or rejects.
   */
  createEntityWithKey(kind: string, nameOrId: string | number, data: Record<string, unknown>) {
    return this.datastore.insert({
      data,
      key: this.datastore.key([kind, nameOrId]),
    });
  }

  /**
   * Insert an entity in Datastore with a key composed of `kind` and
   * a random identifier.
   *
   * @param kind Kind name.
   * @param data Entity to be inserted.
   *
   * @return Resolves on success, or rejects.
   */
  createEntity(kind: string, data: Record<string, unknown>, nameOrId?: string | number) {
    return this.datastore.insert({
      data,
      key: this.datastore.key([kind, nameOrId]),
    });
  }

  /**
   * Insert multiple entities with a key composed of `kind` and
   * a random identifier.
   *
   * @param kind Kind name.
   * @param data Entities to be inserted.
   *
   * @return Resolves on success, or rejects.
   */
  createEntities(kind: string, entitiesPayloads: Array<Record<string, unknown>>) {
    const entities = entitiesPayloads.map((data: Record<string, unknown>) => ({
      data,
      key: this.datastore.key([kind]),
    }));

    return this.datastore.insert(entities);
  }
}
