// @flow

import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { D, i18n } from '../../i18n/index';

type Props = {|
  value: number,
|};

export function CorrectRate(props: Props) {
  const quizPercentage = props.value.toFixed(0);
  const text = i18n(D().quiz.common.percentage, { quizPercentage });
  return <Text style={S.text}>{text}</Text>;
}

const S = StyleSheet.create({
  text: {
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255, 0.7)',
    padding: 2,
    fontSize: 14,
  },
});
