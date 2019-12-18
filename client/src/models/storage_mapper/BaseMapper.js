// @flow
import { AsyncStorage } from 'react-native';

export class BaseMapper {
  key: string;

  constructor(key: string) {
    this.key = key;
  }

  async hasValue(): Promise<boolean> {
    const rawValue = await this.rawGet();
    return rawValue !== null;
  }

  rawGet(): Promise<?string> {
    return AsyncStorage.getItem(this.key);
  }

  rawSet(value: string): Promise<void> {
    return AsyncStorage.setItem(this.key, value);
  }

  remove(): Promise<void> {
    return AsyncStorage.removeItem(this.key);
  }
}
