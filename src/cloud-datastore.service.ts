import { Datastore } from '@google-cloud/datastore';
import { Inject, Optional } from '@nestjs/common';

import { DatastoreModuleOptions } from './cloud-datastore.module';

export const DATASTORE_CONFIG_TOKEN = 'DATASTORE_CONFIG_TOKEN';

export class CloudDatastoreService {
  private readonly datastore: Datastore;

  constructor(@Optional() @Inject(DATASTORE_CONFIG_TOKEN) datastoreConfig: DatastoreModuleOptions) {
    this.datastore = new Datastore(datastoreConfig);
  }

  /**
   * Look for an Entity using its key identifier.
   *
   * @param kind Kind name.
   * @param nameOrId Key value.
   *
   * @template T expected type of the resolved result.
   *
   * @return Resolve with a result (if any), or rejects.
   */
  async findOneByKey<T extends any>(kind: string, nameOrId: string | number): Promise<T | undefined> {
    const [result] = await this.datastore.get(this.datastore.key([kind, nameOrId]));
    return result;
  }

  /**
   * Look for an Entity having a field `fieldName` equal to `value`.
   *
   * @param kind Kind name.
   * @param fieldName Name of the field used as a filter.
   * @param value Filter value.
   *
   * @template T expected type of the resolved result.
   *
   * @return Resolve with a result (if any), or rejects.
   */
  async findOneByField<T extends any>(kind: string, fieldName: string, value: any): Promise<T | undefined> {
    const query = this.datastore.createQuery(kind).filter(fieldName, '=', value);
    const [results] = await this.datastore.runQuery(query);
    return results && results[0];
  }

  /**
   * Look for all entites having a field `fieldName` equal to `value`.
   *
   * @param kind Kind name.
   * @param fieldName Name of the field used as a filter.
   * @param value Filter value.
   *
   * @template T expected type of the resolved results.
   *
   * @return Resolve with results (if any), or rejects.
   */
  async findAllByField<T extends any>(kind: string, fieldName: string, value: any): Promise<T[]> {
    const query = this.datastore.createQuery(kind).filter(fieldName, '=', value);
    const [results] = await this.datastore.runQuery(query);
    return results;
  }

  /**
   * Insert or update (upsert) the given entity `data`.
   * ⚠ Partial updates are not handled. Props not in `data` will be lost on completion.
   *
   * @param kind Kind name.
   * @param nameOrId (optional) Fixed identifier of the entity (or generated automatically).
   * @param data Entity data.
   *
   * @template T expected type of the entity data.
   *
   * @return Resolves on success, or rejects.
   */
  async save<T extends any>(kind: string, nameOrId: string | number | undefined, data: T) {
    return this.datastore.save({
      data,
      key: this.datastore.key([kind, nameOrId]),
    });
  }

  /**
   * Will be removed, lul. Placeholder/boilerplate method. Not a business need.
   */
  async findAll(kind: string) {
    const query = this.datastore.createQuery(kind);
    const [results] = await this.datastore.runQuery(query);
    return results;
  }
}
