// @flow

import React from 'react';
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

import { D, i18n } from '../../i18n/index';

const MARK_CORRECT = i18n(D().common.correctMark);
const MARK_WRONG = i18n(D().common.wrongMark);

type Props = {|
  correct: boolean,
  showTapToNextProblem: boolean,
  onPress?: ?() => any,
|};

export function Mark({ correct, showTapToNextProblem, onPress }: Props) {
  const mark = correct ? (
    <View style={S1.markContainer}>
      <Image source={ImgSrc} style={S1.resultImage} />
      {showTapToNextProblem && (
        <Text style={[S1.resultMarkDesc, S1.colorCorrectDesc]}>{i18n(D().quiz.mark.tapToNextProblem)}</Text>
      )}
    </View>
  ) : (
    <View style={S1.markContainer}>
      <Text style={[S1.resultMark, S1.colorWrong]}>{MARK_WRONG}</Text>
    </View>
  );
  if (!onPress) {
    return mark;
  }
  return <TouchableWithoutFeedback onPress={onPress}>{mark}</TouchableWithoutFeedback>;
}

const ImgSrc = require('../../../img/correct_mark.png');

const S1 = StyleSheet.create({
  markContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  resultMark: {
    textAlign: 'center',
    fontSize: 300,
    backgroundColor: 'transparent',
  },
  resultMarkDesc: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  resultImage: {
    width: 200,
    height: 200,
    marginTop: 125,
  },
  colorCorrect: {
    color: 'rgba(0, 200, 0, 0.5)',
  },
  colorWrong: {
    color: 'rgba(230, 0, 0, 0.5)',
  },
  colorCorrectDesc: {
    color: 'rgba(0, 180, 0, 0.8)',
  },
});

type MarkTextProps = {
  correct: boolean,
  style?: any,
};
export function MarkText(props: MarkTextProps) {
  const { correct, style, ...rest } = props;
  if (correct) {
    return (
      <Text style={[S2.colorCorrect, style]} {...rest}>
        {MARK_CORRECT}
      </Text>
    );
  } else {
    return (
      <Text style={[S2.colorWrong, style]} {...rest}>
        {MARK_WRONG}
      </Text>
    );
  }
}

const S2 = StyleSheet.create({
  colorCorrect: { color: 'green' },
  colorWrong: { color: 'red' },
});
