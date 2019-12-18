// @flow

import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

export function Morisawa(props: Object) {
  const { style, ...rest } = props;
  return <Text {...rest} style={[style, morisawaTextStyle]} />;
}

const S = StyleSheet.create({
  // 学参 教科書 ICA
  kyoukasho: {
    fontFamily: Platform.select({
      ios: 'TTG Kyoukasho ICA Pro',
      android: 'TTG-GKyokaICAPro-Regular',
    }),
  },
  // 学参常改 常改教科書 ICA
  jokai: {
    fontFamily: Platform.select({
      ios: 'TTG Jo Kyoukasho ICA ProN',
      android: 'TTG-GJKyokaICAProN-Regular',
    }),
  },
});

export const morisawaTextStyle = S.jokai;
