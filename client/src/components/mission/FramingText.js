// @flow
import React from 'react';
import { StyleSheet, Text } from 'react-native';

type Props = {
  positive: boolean,
  style?: any,
};
export function FramingText(props: Props) {
  const { positive, style, ...restProps } = props;
  const s1 = S.framingText;
  const s2 = positive ? S.positive : S.negative;
  return <Text {...restProps} style={[s1, s2, style]} />;
}

const NEGATIVE_TO_POSITIVE_RATE = 0.3;
export function showPositive(positive: boolean, randomValue: number): boolean {
  return positive || randomValue < NEGATIVE_TO_POSITIVE_RATE;
}

const S = StyleSheet.create({
  framingText: {
    padding: 5,
    textAlign: 'center',
  },
  positive: {
    backgroundColor: '#e7ffe7',
  },
  negative: {
    backgroundColor: '#fee',
  },
});
