// @flow

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { GS } from './style';

const LOADING_GIF = require('../../img/loading.gif');

const S = StyleSheet.create({
  loading: {
    marginTop: 20,
  },
  container: {
    alignItems: 'center',
  },
});

export function LoadingComponent(props: any) {
  return (
    <View style={[GS.flex, S.container]}>
      <Image style={S.loading} source={LOADING_GIF} />
    </View>
  );
}
