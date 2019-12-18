// @flow
import { BaseMapper } from './BaseMapper';

export class StringMapper extends BaseMapper {
  get(): Promise<?string> {
    return this.rawGet();
  }

  async getNonNull(): Promise<string> {
    return (await this.rawGet()) || '';
  }

  set(value: string): Promise<void> {
    return this.rawSet(value);
  }
}
