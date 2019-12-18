// @flow

import React from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

import { SurveyAgreement } from './SurveyAgreement';
import { SurveyQuestionComponent } from './SurveyQuestionComponent';
import { buildSurveyAnswer } from '../../models/SurveyAnswer';
import { sendSurvey, sendSurveyMetaInfo } from '../../models/connection';
import { ButtonBox } from '../design/ButtonBox';
import { SURVEY_DATA_1 } from '../../resources/survey';
import { GS } from '../style';
import { D, i18n } from '../../i18n/index';
import * as storage from '../../models/typed_storage';

import type { SurveyAnswer, SurveyKind, UserInfo } from '../../types';

const KEY: SurveyKind = 'survey';
type Props = {|
  myInfo: UserInfo,
  onFinish: () => Promise<boolean>,
|};

type State = {|
  answer: SurveyAnswer | null,
  sending: boolean,
|};

export class PreSurveyComponent extends React.Component {
  props: Props;
  state: State = { answer: null, sending: false };

  componentDidMount() {
    this.initialize();
  }

  async finish() {
    this.setState({ sending: true });

    const success = await this.sendFinishSurvey();
    if (success) {
      const totallySuccess = await this.props.onFinish();
      if (totallySuccess) {
        return;
      }
    }
    this.setState({ sending: false });
  }

  async goToEnd() {
    const answer = await storage.surveyAnswer1.getNonNull();
    answer.finishedAt = Date.now();
    await storage.surveyAnswer1.set(answer);
    this.setState({ answer });
  }

  async goToQuestion() {
    const answer = this.state.answer || buildSurveyAnswer();
    answer.startedAt = Date.now();
    await storage.surveyAnswer1.set(answer);
    this.setState({ answer });
    await sendSurveyMetaInfo(answer, KEY); // 失敗してもアンケート終了時に再送するので、特に問題はない
  }

  async initialize() {
    const answer = (await storage.surveyAnswer1.get()) || buildSurveyAnswer();
    this.setState({ answer });
  }

  async sendFinishSurvey(): Promise<boolean> {
    const answer = await storage.surveyAnswer1.getNonNull();
    if (answer.isSent) {
      return true;
    }

    const success = await sendSurvey(answer, KEY);
    if (success) {
      answer.isSent = true;
      await storage.surveyAnswer1.set(answer);
      return true;
    } else {
      const errorMsg = i18n(D().survey.preSurvey.surveySendingFailure);
      Alert.alert(i18n(D().common.connectionErrorTitle), errorMsg);
      return false;
    }
  }

  renderEnd() {
    return (
      <View style={GS.flex}>
        <View style={[GS.flex2, GS.flexCenterV]}>
          <View style={GS.margin10}>
            <Text style={[S.question, GS.textCenter]}>{i18n(D().survey.common.thankYou)}</Text>
          </View>
          <ButtonBox>
            <Button
              title={i18n(D().survey.preSurvey.startApplication)}
              onPress={() => this.finish()}
              disabled={this.state.sending}
            />
          </ButtonBox>
        </View>
        <View style={GS.flex}>
          {this.state.sending && (
            <View style={GS.margin10}>
              <Text style={GS.textCenter}>{i18n(D().survey.preSurvey.pleaseWait)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  renderQuestion() {
    return (
      <SurveyQuestionComponent
        myInfo={this.props.myInfo}
        surveyKey={KEY}
        answerStorage={storage.surveyAnswer1}
        allSurveyData={SURVEY_DATA_1}
        next={() => this.goToEnd()}
      />
    );
  }

  render() {
    const answer = this.state.answer;
    if (answer) {
      if (answer.finishedAt > 0) {
        return this.renderEnd();
      } else if (answer.startedAt > 0) {
        return this.renderQuestion();
      }
      return <SurveyAgreement action={() => this.goToQuestion()} />;
    }
    return <View />;
  }
}

const S = StyleSheet.create({
  /* end */
  question: { fontSize: 22, margin: 20 },
});
