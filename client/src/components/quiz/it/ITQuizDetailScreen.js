// @flow

import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { ButtonBox } from '../../design/ButtonBox';
import { tracker } from '../../../models/Tracker';
import { openURL } from '../../design/Link';
import { ComplexTextComponent } from './ComplexTextComponent';
import { BORDER_COLOR, GS } from '../../style';
import { D, i18n } from '../../../i18n/index';
import { fetchImage } from '../util';

import type { Map, Navigator } from '../../../types';
import type { QuizItem, QuizSet } from '../types';

const KANA = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク'];
type Img = { url: string, width: number, height: number };

type NavParams = {|
  quizSet: QuizSet,
  quizItem: QuizItem,
|};

type State = {
  showAnswer: boolean,
  imageMap: Map<Img> | null,
};

export class ITQuizDetailScreen extends React.PureComponent {
  props: { navigation: Navigator<NavParams> };
  state: State = { showAnswer: false, imageMap: null };

  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.title,
  });

  componentDidMount() {
    const { quizSet, quizItem } = this.props.navigation.state.params;
    tracker.trackScreenViewNoTabs(`quiz_list/${quizSet.course}/${quizSet.genre}/${quizItem.key}`);
    this.init(quizItem);
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  async init(quiz: QuizItem) {
    if (quiz.images) {
      const imageMap = await fetchImage(quiz.images);
      this.setState({ imageMap });
    } else {
      this.setState({ imageMap: {} });
    }
  }

  openExplanation(quiz: QuizItem, commentary: string) {
    if (commentary.indexOf('http') === 0) {
      tracker.trackEvent(`quiz_list`, 'open_explanation', {
        label: quiz.key,
      });
      openURL(commentary);
    } else {
    }
  }

  showAnswer(quiz: QuizItem) {
    tracker.trackEvent('quiz_list', 'show_answer', { label: quiz.key });
    this.setState({ showAnswer: true });
  }

  renderAnswer(quiz: QuizItem) {
    let commentaryButton = null;
    const commentary = quiz.commentary;
    if (commentary) {
      const title = i18n(D().quiz.itQuiz.goToCommentary);
      const onPress = () => this.openExplanation(quiz, commentary);
      commentaryButton = <Button title={title} onPress={onPress} />;
    }

    if (this.state.showAnswer) {
      const answer = KANA[quiz.correctIndex];
      const text = i18n(D().quiz.itQuizList.answerDescription, { answer });
      return (
        <ButtonBox direction="horizontal">
          {commentaryButton}
          <Text style={S.answer}>{text}</Text>
        </ButtonBox>
      );
    } else {
      return (
        <ButtonBox direction="horizontal">
          {commentaryButton}
          <Button title={i18n(D().quiz.itQuizList.checkAnswer)} onPress={() => this.showAnswer(quiz)} />
        </ButtonBox>
      );
    }
  }

  render() {
    const { quizItem } = this.props.navigation.state.params;
    const { imageMap } = this.state;
    if (!imageMap) return null;

    return (
      <View style={GS.flex}>
        <View style={[GS.flex, GS.padding10]}>
          <ComplexTextComponent text={quizItem.problem} imageMap={imageMap} screenNav={this.props.navigation} />
        </View>
        <View style={S.answerContainer}>{this.renderAnswer(quizItem)}</View>
      </View>
    );
  }
}

const S = StyleSheet.create({
  answerContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER_COLOR,
  },
  answer: {
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
  },
});
