// @flow

import { EventEmitter } from 'fbemitter';

type Subscription = { remove(): void };

export class Observable<T> {
  emitter: any = new EventEmitter();
  value: T;

  constructor(value: T) {
    this.value = value;
  }

  get(): T {
    return this.value;
  }

  update(value: T) {
    this.value = value;
    this.emitter.emit('change', value);
  }

  observe(func: T => void | Promise<void>): Subscription {
    const sub = this.emitter.addListener('change', func);
    return sub;
  }
}
