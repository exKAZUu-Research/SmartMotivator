// @flow
import { BaseMapper } from './BaseMapper';

export class ObjectMapper<T: Object> extends BaseMapper {
  async get(): Promise<T | null> {
    const json = await this.rawGet();
    return json ? JSON.parse(json) : null;
  }

  async getNonNull(): Promise<T> {
    return JSON.parse((await this.rawGet()) || '{}');
  }

  set(value: T): Promise<void> {
    return this.rawSet(JSON.stringify(value));
  }

  async patch(patch: Object): Promise<T> {
    const value = await this.getNonNull();
    const patched = { ...value, ...patch };
    await this.set(patched);
    return patched;
  }
}
