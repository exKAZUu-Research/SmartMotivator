// @flow

import _ from 'lodash';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MarkText } from './Mark';
import { Table } from '../design/Table';
import { GS } from '../style';
import { D, i18n } from '../../i18n/index';
import { buildGoCommentary, getFont, isBottomButton } from './util';

import type { Navigator } from '../../types';
import type { Answer, QuizItem, Result } from './types';

type Props = {|
  items: QuizItem[],
  result: Result,
  screenNav: Navigator<*>,
|};

export class QuizResultTable extends React.PureComponent {
  props: Props;
  state: void;

  renderAnswerLine(correct: boolean, answer: string, textStyle: any) {
    return (
      <View style={[GS.row, GS.flexCenterH]}>
        <MarkText correct={correct} />
        <Text style={[S.answerText, textStyle]}>{answer}</Text>
      </View>
    );
  }

  renderAnswer(item: QuizItem, answer: Answer) {
    const correct = answer.correct;
    if (isBottomButton(item)) {
      return <MarkText correct={correct} style={GS.textCenter} />;
    }
    const font = getFont(item);
    const correctText = item.answers ? item.answers[item.correctIndex] : '';
    if (correct) {
      return this.renderAnswerLine(true, correctText, font);
    }
    let wrongText = i18n(D().quiz.quizFinished.notAnswered);
    if (answer.answerText) {
      wrongText = answer.answerText;
    } else if (item.answers && answer.answerIndex != null) {
      wrongText = item.answers[answer.answerIndex];
    }
    return (
      <View>
        {this.renderAnswerLine(true, correctText, font)}
        {this.renderAnswerLine(false, wrongText, font)}
      </View>
    );
  }

  renderQuizName(item: QuizItem) {
    const textStyle = [];
    const f = buildGoCommentary(item, this.props.screenNav);
    if (f) {
      textStyle.push(GS.linkText);
    }
    const font = getFont(item);
    if (font) {
      textStyle.push(font);
    }

    let element = (
      <>
        {item.label}
      </>
    );
    if (f) {
      element = <TouchableOpacity onPress={f}>{element}</TouchableOpacity>;
    }
    if (!item.subLabel) {
      return element;
    }
    return (
      <View>
        {element}
        <Text style={[S.questionType]}>({item.subLabel})</Text>
      </View>
    );
  }

  render() {
    const { result, items } = this.props;
    const len = Math.min(items.length, result.answers.length);
    if (len === 0) return null;

    const toValues = [
      i => this.renderQuizName(items[i]),
      i => this.renderAnswer(items[i], result.answers[i]),
      i => `${(result.answers[i].spentTime / 1000).toFixed(1)}${i18n(D().common.unit.spentTime)}`,
    ];
    const labels = [
      i18n(D().quiz.quizFinished.question),
      i18n(D().quiz.quizFinished.answer),
      i18n(D().quiz.quizFinished.spentTime),
    ];
    const showAnswer = !isBottomButton(items[0]);
    const data = _.range(len);
    const flexes = showAnswer ? [1, 1, 1] : [3, 1, 1];
    const aligns = ['left', showAnswer ? 'left' : 'center', 'center'];
    return <Table data={data} labels={labels} toValues={toValues} flexes={flexes} aligns={aligns} />;
  }
}

const S = StyleSheet.create({
  questionType: {
    fontSize: 12,
    color: 'grey',
    marginTop: 5,
  },
  answerText: {
    marginLeft: 5,
  },
});
