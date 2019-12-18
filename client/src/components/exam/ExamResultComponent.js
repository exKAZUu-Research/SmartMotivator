// @flow
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AutoResizeProgress } from '../design/AutoResizeProgress';
import { GS } from '../style';
import { D, i18n } from '../../i18n/index';

import type { Answer, PreTestQuiz } from '../quiz/types';
// import type { Navigator } from '../../types';

type Props = {
  quiz: PreTestQuiz[],
  answers: Answer[],
};

export class ExamResultComponent extends React.Component {
  props: Props;

  renderGenre(quiz: PreTestQuiz, index: number) {
    const { answers } = this.props;

    let correct = 0;
    let wrong = 0;
    quiz.quizzes.forEach(q => {
      answers.forEach(ans => {
        if (q.key === ans.quizKey) {
          if (ans.correct) {
            correct++;
          } else {
            wrong++;
          }
        }
      });
    });
    const sum = correct + wrong;
    const rateText = i18n(D().common.correctRate);
    return (
      <View style={S.item} key={index}>
        <View style={GS.row}>
          <Text style={S.label}>{quiz.label}</Text>
          <Text>
            {rateText}: {(100 * correct / sum).toFixed(0)}%
          </Text>
        </View>
        <AutoResizeProgress value1={correct} value2={0} max={sum} height={20} />
      </View>
    );
  }

  render() {
    const { quiz } = this.props;
    return <View style={S.container}>{quiz.map((q, i) => this.renderGenre(q, i))}</View>;
  }
}

const S = StyleSheet.create({
  container: {
    padding: 10,
  },
  item: {
    margin: 10,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
});
