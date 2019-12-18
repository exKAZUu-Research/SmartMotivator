// @flow

/* eslint-disable react/sort-comp */

import _ from 'lodash';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import { AnswerButton, AnswerButtonsComponent } from './AnswerButtonsComponent';
import { MissionProgress } from './MissionProgress';
import { ComplexTextComponent } from './it/ComplexTextComponent';
import { CorrectRate } from './CorrectRate';
import { Mark } from './Mark';
import { DefaultScrollView } from '../design/DefaultScrollView';
import { tracker } from '../../models/Tracker';
import { GS, MAIN_BUTTON_BG_COLOR } from '../style';
import { D, i18n } from '../../i18n/index';
import {
  EMBEDDED_CORRECT_RATE_THRESHOLD,
  INPUT_TYPE_BOOL,
  INPUT_TYPE_KANA,
  INPUT_TYPE_KEYBOARD,
  INPUT_TYPE_NUMBER,
  INPUT_TYPE_TEXT,
  buildGoCommentary,
  getFont,
  isBottomButton,
} from './util';

import type { Navigator } from '../../types';
import type { Answer, QuizItem } from './types';
import type { MissionInfo } from '../mission/types';

const KANA = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク'];

type Props = {|
  items: QuizItem[],
  missionInfo?: MissionInfo,
  screenNav: Navigator<*>,
  onFinish: (_: Answer[]) => any,
|};

type State = {|
  progress: number,
  result: Answer | null,
  answerText: '',
|};

export class QuizRunnerComponent extends React.PureComponent {
  answers: Answer[];
  confirmationTimer: ?number;
  props: Props;
  startTime: number;
  state: State;
  textInput: TextInput;

  constructor(props: Props) {
    super(props);
    this.answers = [];
    this.startTime = 0;
    this.confirmationTimer = null;
    this.state = { result: null, progress: 0, answerText: '' };
  }

  /* ---- ---- ---- ---- life cycle events ---- ---- ---- ---- */

  componentDidMount() {
    tracker.trackScreenViewNoTabs('quiz_runner');
    this.start();
  }

  componentWillUnmount() {
    if (this.confirmationTimer) {
      clearTimeout(this.confirmationTimer);
      this.confirmationTimer = null;
    }
    tracker.trackScreenViewOnDismount();
  }

  /* ---- ---- ---- ---- custom actions ---- ---- ---- ---- */

  answer(index: number | null, item: QuizItem) {
    if (this.state.result) return;

    let answerIndex = index;
    if (index != null && item.shuffledIndexes) {
      answerIndex = item.shuffledIndexes[index];
    }
    const result: Answer = {
      quizKey: item.key,
      correct: answerIndex === item.correctIndex,
      spentTime: Date.now() - this.startTime,
      answerIndex,
    };
    this.setAnswer(item, result);
  }

  answerText(item: QuizItem, ignoreIfEmpty: boolean) {
    const { answerText } = this.state;
    if (ignoreIfEmpty && !answerText) return;
    const correct = item.answers != null && answerText === item.answers[0];
    const result: Answer = {
      quizKey: item.key,
      correct,
      spentTime: Date.now() - this.startTime,
      answerText,
    };
    this.setAnswer(item, result);
  }

  setAnswer(item: QuizItem, result: Answer) {
    this.answers[this.state.progress] = result;
    this.setState({ result });

    if (!isBottomButton(item)) {
      this.confirmationTimer = setTimeout(() => this.next(), 3000);
    }
  }

  start() {
    this.startTime = Date.now();
  }

  next() {
    if (this.confirmationTimer) {
      clearTimeout(this.confirmationTimer);
      this.confirmationTimer = null;
    }
    const progress = this.state.progress + 1;
    if (progress < this.props.items.length) {
      this.startTime = Date.now();
      this.setState({ result: null, progress, answerText: '' });
      setTimeout(() => {
        const currentItem = this.props.items[progress];
        if (currentItem.inputType === INPUT_TYPE_KEYBOARD && this.textInput != null) {
          this.textInput.focus();
        }
      }, 0);
    } else {
      this.props.onFinish(this.answers);
    }
  }

  isSame(selectIndex: ?number, originalIndex: ?number, shuffledIndexes: ?(number[])): boolean {
    if (originalIndex == null) {
      return selectIndex == null;
    }
    if (selectIndex == null) {
      return false;
    }
    if (shuffledIndexes == null) {
      return originalIndex === selectIndex;
    }
    return originalIndex === shuffledIndexes[selectIndex];
  }

  answerLength(item: QuizItem): number {
    return item.answerSize || (item.answers && item.answers.length) || 0;
  }

  generateAnswers(item: QuizItem): string[] {
    switch (item.inputType) {
      case INPUT_TYPE_TEXT:
        if (item.answers) {
          return item.answers;
        }
        break;
      case INPUT_TYPE_BOOL:
        return [i18n(D().quiz.lecQuizRunner.correct), i18n(D().quiz.lecQuizRunner.wrong)];
      case INPUT_TYPE_KANA: {
        const len = this.answerLength(item);
        return KANA.slice(0, len);
      }
      case INPUT_TYPE_NUMBER: {
        const len = this.answerLength(item);
        return _.range(len).map(i => (i + 1).toString());
      }
    }
    return [];
  }

  /* ---- ---- ---- ---- rendering ---- ---- ---- ---- */

  renderProblem(item: QuizItem, isBottomButtonQuiz: boolean, textStyle: any) {
    if (isBottomButtonQuiz) {
      return (
        <View style={GS.padding10}>
          {item.preText ? <Text style={[S.preText, S.preTextMargin, textStyle]}>{item.preText}</Text> : null}
          <ComplexTextComponent text={item.problem} imageMap={item.fetchedImages} screenNav={this.props.screenNav} />
          {item.answers &&
            item.answers.map((answer, index) => (
              <View key={index} style={[GS.row, S.problemAnswerBox]}>
                <Text style={[S.problemAnswer, S.problemAnswerIndex]}>{index + 1}.</Text>
                <Text style={[S.problemAnswer, GS.flex]}>{answer}</Text>
              </View>
            ))}
          {item.label ? <Text style={S.source}>{item.label}</Text> : null}
        </View>
      );
    } else {
      const style = isSentence(item.problem) ? S.problemLong : S.problem;
      let preTextElement = null;
      if (item.preText || item.hijack) {
        const preText = item.preText || null;
        const hijack = item.hijack ? i18n(D().quiz.quizRunner.hijack, { label: item.hijack }) : null;
        preTextElement = (
          <View style={[GS.row, GS.flexStartH]}>
            {preText && <Text style={[GS.flex, S.preTextMargin, S.preText, textStyle]}>{preText}</Text>}
            {hijack && <Text style={S.hijack}>{hijack}</Text>}
          </View>
        );
      }
      return (
        <View style={GS.padding10}>
          {preTextElement}
          <>
            {item.problem}
          </>
        </View>
      );
    }
  }

  renderAnswerInput(item: QuizItem, font: any) {
    return (
      <View style={GS.flex}>
        <TextInput
          ref={x => (this.textInput = x)}
          placeholder={i18n(D().common.inputPlaceholder)}
          style={[GS.margin10, GS.textInput, S.textInput, font]}
          value={this.state.answerText}
          onSubmitEditing={() => this.answerText(item, true)}
          onChangeText={answerText => this.setState({ answerText })}
        />
        <View style={GS.flex} />
        <AnswerButton
          title={i18n(D().common.enter)}
          isSurrender={!this.state.answerText}
          onPress={() => this.answerText(item, false)}
          style={GS.margin10}
          textStyle={font}
        />
        <KeyboardSpacer />
      </View>
    );
  }

  renderAnswerButtons(item: QuizItem, isBottomButtonQuiz: boolean, textStyle: any) {
    const { result } = this.state;

    let answers = this.generateAnswers(item);
    if (item.shuffledIndexes) {
      answers = item.shuffledIndexes.map(i => answers[i]);
    }
    let correctHighlightF = _ => false;
    let wrongHighlightF = _ => false;
    if (result) {
      correctHighlightF = n => this.isSame(n, item.correctIndex, item.shuffledIndexes);
      if (!result.correct) {
        wrongHighlightF = n => this.isSame(n, result.answerIndex, item.shuffledIndexes);
      }
    }

    const commonFields = {
      answers,
      correctHighlightF,
      wrongHighlightF,
      onPressAnswer: n => this.answer(n, item),
      onPressSurrender: () => this.answer(null, item),
      textStyle: [textStyle],
    };
    if (isBottomButtonQuiz) {
      return <AnswerButtonsComponent {...commonFields} layout={AnswerButtonsComponent.LAYOUT_HORIZONTAL} />;
    }
    if (answers.length > 5) {
      return (
        <View style={S.wordAnswerContainer}>
          <AnswerButtonsComponent
            {...commonFields}
            layout={AnswerButtonsComponent.LAYOUT_TABLE}
            columns={3}
            style={GS.flex}
          />
        </View>
      );
    }
    if (_.some(answers, isSentence)) {
      commonFields.textStyle.push(S.longAnswer);
    }
    for (let i = answers.length; i < 4; i++) {
      answers.push('');
    }
    return (
      <View style={S.wordAnswerContainer}>
        <AnswerButtonsComponent {...commonFields} layout={AnswerButtonsComponent.LAYOUT_VERTICAL} style={GS.flex} />
      </View>
    );
  }

  renderNextButton(item: QuizItem) {
    const title = item.commentaryLabel || i18n(D().quiz.lecQuizRunner.showCommentary);
    const onPress = buildGoCommentary(item, this.props.screenNav);
    return (
      <View style={[GS.row, GS.themeBackground]}>
        {onPress && (
          <TouchableOpacity key="1" style={[GS.flex, GS.subButton, S.button]} onPress={onPress}>
            <Text style={S.buttonText}>{title}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity key="2" style={[GS.flex, GS.mainButton, S.button]} onPress={() => this.next()}>
          <Text style={S.buttonText}>{i18n(D().common.next)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderMissionProgress(answer: Answer | null) {
    const { missionInfo, items } = this.props;
    if (!missionInfo) return null;
    const answers = this.answers;
    const props = { missionInfo, answers, answer, max: items.length };
    return <MissionProgress {...props} />;
  }

  renderResult(result: Answer, autoTransition: boolean) {
    if (result.correct) {
      if (autoTransition) {
        return <Mark correct={true} showTapToNextProblem={true} onPress={() => this.next()} />;
      }
      return <Mark correct={true} showTapToNextProblem={false} />;
    } else {
      return <Mark correct={false} showTapToNextProblem={false} />;
    }
  }

  render() {
    const { items } = this.props;
    const { progress, result } = this.state;
    const item = items[progress];

    let rate = 0;
    if (item.defaultPercentage != null && item.totalCount < EMBEDDED_CORRECT_RATE_THRESHOLD) {
      rate = item.defaultPercentage;
    } else if (item.totalCount > 0) {
      rate = Math.round(100 * item.correctCount / item.totalCount);
    }
    const font = getFont(item);

    if (isBottomButton(item)) {
      return (
        <View style={[GS.flex, GS.themeBackground]}>
          {this.renderMissionProgress(result)}
          <CorrectRate value={rate} />
          <DefaultScrollView style={{ backgroundColor: 'white' }}>
            {this.renderProblem(item, true, font)}
          </DefaultScrollView>
          {result && this.renderResult(result, false)}
          {result && this.renderNextButton(item)}
          {this.renderAnswerButtons(item, true, font)}
        </View>
      );
    }
    return (
      <View style={[GS.flex, GS.themeBackground]}>
        {this.renderMissionProgress(result)}
        <CorrectRate value={rate} />
        {this.renderProblem(item, false, font)}
        {item.inputType === INPUT_TYPE_KEYBOARD
          ? this.renderAnswerInput(item, font)
          : this.renderAnswerButtons(item, false, font)}
        {result && this.renderResult(result, true)}
      </View>
    );
  }
}

const SENTENCE_PATTERN = /, |，|。/;
function isSentence(str: string): boolean {
  return SENTENCE_PATTERN.test(str);
}

const S = StyleSheet.create({
  // ---- ---- ---- ---- problem area ---- ---- ---- ----
  preTextMargin: {
    marginBottom: 10,
  },
  preText: {
    fontSize: 18,
  },
  hijack: {
    color: 'red',
    borderColor: 'red',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginLeft: 4,
    fontSize: 10,
    // height: 24,
    // lineHeight: 24,
  },
  // ---- problem
  problem: {
    textAlign: 'center',
    fontSize: 26,
  },
  problemLong: {
    fontSize: 20,
  },
  // ---- problem answers
  problemAnswerBox: {
    marginTop: 15,
  },
  problemAnswerIndex: {
    width: 24,
  },
  problemAnswer: {
    fontSize: 16,
  },
  // ---- source
  source: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'right',
  },
  // ---- ---- ---- ---- answer buttons area ---- ---- ---- ----
  wordAnswerContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  longAnswer: {
    fontSize: 16,
    textAlign: 'left',
  },
  textInput: {
    borderWidth: 1,
    borderColor: MAIN_BUTTON_BG_COLOR,
    backgroundColor: 'white',
  },
  // ---- ---- ---- ---- footer buttons area ---- ---- ---- ----
  button: {
    margin: 10,
    borderRadius: 4,
    paddingVertical: 8,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
  },
});
