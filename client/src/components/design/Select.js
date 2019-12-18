// @flow

import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { RadioButtons } from 'react-native-radio-buttons';
import Icon from 'react-native-vector-icons/FontAwesome';

import { BORDER_COLOR, GS } from '../style';

type Props<T> = {|
  disabled?: boolean,
  style?: any,
  options: T[],
  valueToLabel: ((value: T) => string) | { [value: T]: string },
  value: T | null,
  onValueChange: (value: T) => void,
|};

export function Select<T>(props: Props<T>) {
  const disabled = props.disabled || false;

  const { valueToLabel } = props;
  const f = typeof valueToLabel === 'function' ? valueToLabel : v => valueToLabel[v];

  return (
    <View style={props.style}>
      <RadioButtons
        options={props.options}
        onSelection={value => props.onValueChange(value)}
        selectedOption={props.value}
        renderOption={(option, selected, onSelect, index) => {
          return (
            <TouchableWithoutFeedback onPress={disabled ? undefined : onSelect} key={option}>
              <View style={[GS.row, index > 0 && S.trailingRowStyle]}>
                <Text style={[S.text, disabled && GS.disabledText]}>{f(option)}</Text>
                {selected && (
                  <View style={[GS.flexCenterV]}>
                    <Icon name="check" style={[S.checkMark, disabled && S.disabledCheckMark]} />
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          );
        }}
      />
    </View>
  );
}

const S = StyleSheet.create({
  trailingRowStyle: {
    borderTopColor: BORDER_COLOR,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  text: {
    padding: 10,
    flex: 1,
    fontSize: 16,
  },
  checkMark: {
    marginRight: 10,
    color: '#007AFF',
    fontSize: 20,
  },
  disabledCheckMark: {
    color: '#7fbcff',
  },
});
