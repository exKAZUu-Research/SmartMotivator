// @flow
import { BaseMapper } from './BaseMapper';

export class IntMapper extends BaseMapper {
  async get(): Promise<?number> {
    const str = await this.rawGet();
    return parseInt(str) || null;
  }

  async getNonNull(): Promise<number> {
    const str = await this.rawGet();
    return parseInt(str) | 0;
  }

  set(value: number): Promise<void> {
    return this.rawSet((value | 0).toString());
  }
}
