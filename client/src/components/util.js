// @flow

import { Dimensions } from 'react-native';

import type { ComponentsVisited, ObservableData } from '../types';

export const IS_NARROW_SCREEN = Dimensions.get('window').height <= 600;

export function updateVisitation(observableData: ObservableData, key: $Keys<ComponentsVisited>): void {
  // const flags = observableData.componentsVisited.get();
  // if (flags[key]) return; // already visited
  //
  // const newFlags = { ...flags, [key]: true };
  // observableData.componentsVisited.update(newFlags);
  // storage.componentsVisited.set(newFlags);
}
