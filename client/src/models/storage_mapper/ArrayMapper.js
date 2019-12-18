// @flow
import { BaseMapper } from './BaseMapper';

export class ArrayMapper<T> extends BaseMapper {
  async get(): Promise<T[] | null> {
    const json = await this.rawGet();
    return json ? JSON.parse(json) : null;
  }

  async getNonNull(): Promise<T[]> {
    return (await this.get()) || [];
  }

  set(value: T[]): Promise<void> {
    return this.rawSet(JSON.stringify(value));
  }

  async append(values: T[]): Promise<void> {
    const list = await this.getNonNull();
    await this.set(list.concat(values));
  }
}
