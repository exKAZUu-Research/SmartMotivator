// @flow

import { AsyncStorage } from 'react-native';

export async function getOrInitDBValue(key: string, getInitialValue: () => string): Promise<string> {
  const value = await AsyncStorage.getItem(key);
  if (value !== null) {
    return value;
  }
  const initialValue = getInitialValue();
  await AsyncStorage.setItem(key, initialValue);
  return initialValue;
}

export async function saveIntoList(key: string, element: any) {
  const json = await AsyncStorage.getItem(key);
  const list = json ? JSON.parse(json) : [];
  const newList = list.concat(element);
  await AsyncStorage.setItem(key, JSON.stringify(newList));
}

export function dig(target: any, ...keys: any[]): any {
  let digged = target;
  if (digged) {
    for (const key of keys) {
      if (typeof key === 'function') {
        digged = key(digged);
      } else {
        digged = digged[key];
      }
      if (typeof digged === 'undefined') {
        return undefined;
      }
    }
  }
  return digged;
}
