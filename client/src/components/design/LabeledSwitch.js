// @flow

import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { GS } from '../style';

type Props = {|
  value: boolean,
  onChange: (value: boolean) => any,
  disabled?: boolean,
  children?: any,
|};

export function LabeledSwitch(props: Props) {
  const disabled = props.disabled || false;

  return (
    <View style={[GS.row, S.itemWrapper]}>
      <View style={[GS.flex, GS.flexCenterV]}>
        <Text style={[S.itemText, disabled && GS.disabledText]}>{props.children}</Text>
      </View>
      <View style={GS.flexCenterV}>
        <Switch disabled={disabled} onValueChange={props.onChange} value={props.value} />
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  itemWrapper: {
    marginVertical: 5,
    marginHorizontal: 10,
  },
  itemText: {
    fontSize: 16,
  },
});
