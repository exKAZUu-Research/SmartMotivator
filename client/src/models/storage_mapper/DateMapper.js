// @flow
import { BaseMapper } from './BaseMapper';

export class DateMapper extends BaseMapper {
  async get(): Promise<?Date> {
    const str = await this.rawGet();
    const num = parseInt(str);
    if (num) {
      return new Date(num);
    }
    return null;
  }

  async getNonNull(): Promise<number> {
    const date = await this.get();
    return date || new Date();
  }

  set(value: Date): Promise<void> {
    const time = value.getTime();
    return this.rawSet(time.toString());
  }
}
