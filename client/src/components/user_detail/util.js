// @flow

import type { Navigator, ObservableData } from '../../types';

export function gotoUserDetail(userId: string, observableData: ObservableData, screenNav: Navigator<*>) {
  if (!screenNav) return;
  screenNav.navigate('UserDetailScreen', { userId, observableData });
}
