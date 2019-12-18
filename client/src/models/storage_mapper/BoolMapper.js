// @flow
import { BaseMapper } from './BaseMapper';

export class BoolMapper extends BaseMapper {
  get(): Promise<boolean> {
    return this.hasValue();
  }

  set(value: boolean): Promise<void> {
    if (value) {
      return this.rawSet('true');
    } else {
      return this.remove();
    }
  }
}
