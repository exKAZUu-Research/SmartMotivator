// @flow

import _ from 'lodash';
import React from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

import { BORDER_COLOR, GS } from './../style';
import { ObjectMapper } from '../../models/storage_mapper/';
import { sendSurveyMetaInfo } from '../../models/connection';
import { DefaultScrollView } from '../design/DefaultScrollView';

import type { SurveyAnswer, SurveyAnswerContent, SurveyKind, UserInfo } from '../../types';

import { D, i18n } from '../../i18n/index';

const MARK = '✓';

type Survey = {|
  question: string,
  answers?: string[],
|};

type Props = {|
  myInfo: UserInfo,
  surveyKey: SurveyKind,
  next: () => any,
  answerStorage: ObjectMapper<SurveyAnswer>,
  allSurveyData: Survey[],
|};

type State = {|
  index: number,
  textAnswer: string,
  answerContent: SurveyAnswerContent,
|};

function isSelectableSurvey(survey: Survey): boolean {
  return !!survey.answers;
}

export class SurveyQuestionComponent extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      index: 0,
      answerContent: [],
      textAnswer: '',
    };
    this.restoreAsync();
  }

  answered() {
    const index = this.state.index;
    const currentSurvey = this.props.allSurveyData[index];
    if (isSelectableSurvey(currentSurvey)) {
      const currentAnswer = this.state.answerContent[index];
      return currentAnswer !== null && currentAnswer !== undefined;
    } else {
      return this.state.textAnswer.length > 0;
    }
  }

  async goNext() {
    if (!this.answered()) return;
    await this.trySaveText();
    const index = this.state.index + 1;
    const textAnswer = await this.tryLoadText(index);
    this.setState({ index, textAnswer });
  }

  async goPrev() {
    if (!this.hasPrev()) return;
    await this.trySaveText();
    const index = this.state.index - 1;
    const textAnswer = await this.tryLoadText(index);
    this.setState({ index, textAnswer });
  }

  async goToEnd() {
    await this.trySaveText();
    this.props.next();
  }

  hasPrev() {
    return this.state.index > 0;
  }

  async restoreAsync() {
    const answer = await this.props.answerStorage.get();
    if (!answer) return;

    const answerContent = answer.content;
    const len = Math.min(answerContent.length + 1, this.props.allSurveyData.length);
    let index = 0;
    for (let i = 0; i < len; i++) {
      index = i;
      if (answerContent[i] == null) break;
    }
    const textAnswer = await this.tryLoadText(index);
    this.setState({ index, textAnswer, answerContent });
    if (index > 0) {
      answer.resumedAt = Date.now();
      await this.props.answerStorage.set(answer);
      await sendSurveyMetaInfo(answer, this.props.surveyKey);
    }
  }

  async selectAnswer(choice: string | number) {
    const index = this.state.index;
    const answer = await this.props.answerStorage.getNonNull();
    answer.content[index] = choice;
    await this.props.answerStorage.set(answer);
    this.setState({ answerContent: answer.content });
  }

  tryLoadText(index: number): string {
    const currentSurvey = this.props.allSurveyData[index];
    if (isSelectableSurvey(currentSurvey)) {
      return '';
    } else {
      const str = this.state.answerContent[index];
      return str ? str.toString() : '';
    }
  }

  async trySaveText() {
    const currentSurvey = this.props.allSurveyData[this.state.index];
    if (!isSelectableSurvey(currentSurvey)) {
      const textAnswer = this.state.textAnswer;
      await this.selectAnswer(textAnswer);
    }
  }

  renderAnswer(answer: string, index: number) {
    const currentAnswer = this.state.answerContent[this.state.index];
    const markColor =
      currentAnswer === null || currentAnswer === undefined
        ? S.markColorUndetermined
        : currentAnswer === index ? S.markColorSelected : S.markColorNone;

    return (
      <TouchableWithoutFeedback key={index} onPress={() => this.selectAnswer(index)}>
        <View style={[S.answerBox, index === 0 ? S.borderTop : null]}>
          <Text style={S.answerText}>
            <Text style={[S.markStyle, markColor]}>{MARK}</Text>
            {'  '}
            {answer}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  renderAnswerAll() {
    const isDeveloper = __DEV__ || this.props.myInfo.role === 'developer';
    if (!isDeveloper) return null;
    const f = async () => {
      const answerContent = _.map(this.props.allSurveyData, surveyDatum => {
        const answers = surveyDatum.answers;
        return answers ? _.random(answers.length - 1) : i18n(D().survey.surveyQuestion.notApplicable);
      });
      const answer = await this.props.answerStorage.getNonNull();
      answer.content = answerContent;
      await this.props.answerStorage.set(answer);
      const index = answerContent.length - 1;
      const textAnswer = i18n(D().survey.surveyQuestion.notApplicable);
      this.setState({ answerContent, index, textAnswer });
    };
    return (
      <View style={S.debugBox}>
        <Button title={i18n(D().survey.surveyQuestion.AnswerRandomlyForTests)} onPress={f} />
      </View>
    );
  }

  renderAnswerInput(survey: Survey) {
    const answers = survey.answers;
    if (answers) {
      return <View>{_.map(answers, (answer, index) => this.renderAnswer(answer, index))}</View>;
    } else {
      return (
        <View style={S.inputBlock}>
          <TextInput
            style={S.input}
            multiline={true}
            value={this.state.textAnswer}
            onChangeText={textAnswer => this.setState({ textAnswer })}
          />
        </View>
      );
    }
  }

  renderFooter() {
    const index = this.state.index;
    const isLast = index === this.props.allSurveyData.length - 1;
    const rightBtnText = isLast ? i18n(D().common.finish) : i18n(D().common.next);
    const rightBtnAction = isLast ? () => this.goToEnd() : () => this.goNext();

    return (
      <View style={S.footerBox}>
        {this.renderAnswerAll()}
        <View style={S.navBox}>
          <View style={GS.flex}>
            <Button title={i18n(D().common.previous)} onPress={() => this.goPrev()} disabled={!this.hasPrev()} />
          </View>
          <Text style={S.questionIndexText}>
            {index + 1} / {this.props.allSurveyData.length}
          </Text>
          <View style={GS.flex}>
            <Button title={rightBtnText} onPress={rightBtnAction} disabled={!this.answered()} />
          </View>
        </View>
      </View>
    );
  }

  render() {
    const index = this.state.index;
    const currentSurvey = this.props.allSurveyData[index];
    return (
      <View style={GS.flex}>
        <DefaultScrollView>
          <Text style={S.question}>{this.props.allSurveyData[index].question}</Text>
          {this.renderAnswerInput(currentSurvey)}
        </DefaultScrollView>
        {this.renderFooter()}
      </View>
    );
  }
}

const S = StyleSheet.create({
  /* question */
  question: {
    fontSize: 18,
    margin: 20,
  },
  questionIndexText: {
    fontSize: 16,
    textAlign: 'center',
    width: 60,
  },
  /* answer */
  answerBox: {
    borderColor: BORDER_COLOR,
    borderBottomWidth: 1,
  },
  borderTop: { borderTopWidth: 1 },
  answerText: {
    fontSize: 20,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  markStyle: { fontWeight: 'bold' },
  markColorNone: { color: 'transparent' },
  markColorUndetermined: { color: '#ddd' },
  markColorSelected: { color: 'green' },

  inputBlock: {},
  input: {
    margin: 20,
    padding: 5,
    height: 120,
    borderColor: '#aaf',
    borderWidth: 1,
    fontSize: 16,
  },
  /* bottom navigator */
  footerBox: { margin: 10 },
  debugBox: { marginBottom: 10 },
  navBox: { flexDirection: 'row', alignItems: 'center' },
});
