// @flow
import { BaseMapper } from './BaseMapper';

export class DateListMapper extends BaseMapper {
  async get(): Promise<?(Date[])> {
    const str = await this.rawGet();
    if (str) {
      const list = JSON.parse(str);
      return list.map(num => new Date(num));
    }
    return null;
  }

  async getNonNull(): Promise<Date[]> {
    const list = await this.get();
    return list || [];
  }

  set(values: Date[]): Promise<void> {
    const numbers = values.map(d => d.getTime());
    return this.rawSet(JSON.stringify(numbers));
  }
}
