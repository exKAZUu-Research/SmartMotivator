// @flow

import React from 'react';
import { Text, View } from 'react-native';

import type { Navigator } from '../../types';

type NavParams = {};

export class DateOffsetScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: void;

  /* ---- ---- ---- ---- life cycle events ---- ---- ---- ---- */

  componentDidMount() {}

  /* ---- ---- ---- ---- custom actions ---- ---- ---- ---- */

  /* ---- ---- ---- ---- rendering ---- ---- ---- ---- */

  render() {
    return (
      <View>
        <Text>Hello world</Text>
      </View>
    );
  }
}
