// @flow

import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { ButtonBox } from '../design/ButtonBox';
import { buildSurveyAnswer } from '../../models/SurveyAnswer';
import { SurveyQuestionComponent } from './SurveyQuestionComponent';
import { SURVEY_DATA_2 } from '../../resources/survey';
import { GS } from '../style';
import { sendSurvey, sendSurveyMetaInfo } from '../../models/connection';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';
import * as storage from '../../models/typed_storage';

import type { SurveyAnswer, SurveyKind, UserInfo } from '../../types';

const KEY: SurveyKind = 'survey2';

type Props = {|
  myInfo: UserInfo,
  onFinish: () => any,
|};

type State = {|
  answer: SurveyAnswer | null,
  sending: boolean,
|};

export class PostSurveyComponent extends React.Component {
  props: Props;
  state: State = {
    answer: null,
    sending: false,
  };

  componentDidMount() {
    tracker.trackScreenViewNoTabs('second_survey');
    this.initialize();
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  async goToEnd() {
    this.setState({ sending: true });
    // 回答終了直後
    const answer = await storage.surveyAnswer2.getNonNull();
    answer.finishedAt = Date.now();
    await storage.surveyAnswer2.set(answer);
    this.setState({ answer });

    // 送信済み
    const success = await sendSurvey(answer, KEY);
    console.log({ success });
    if (success) {
      answer.isSent = true;
      await storage.surveyAnswer2.set(answer);
      this.setState({ answer, sending: false });
    } else {
      this.setState({ sending: false });
    }
  }

  async goToQuestion() {
    const answer: SurveyAnswer = buildSurveyAnswer();
    await storage.surveyAnswer2.set(answer);
    this.setState({ answer });
    await sendSurveyMetaInfo(answer, KEY);
  }

  async initialize() {
    const answer = await storage.surveyAnswer2.get();
    this.setState({ answer });
  }

  renderAgreement() {
    return (
      <View style={GS.flex}>
        <View style={[GS.flex, GS.flexCenter, S.agreement]}>
          <Text style={S.agreementText}>{i18n(D().survey.postSurvey.surveyDescription)}</Text>
          <Text style={S.agreementText}>{i18n(D().survey.postSurvey.postTest)}</Text>
        </View>
        <View style={GS.flex}>
          <ButtonBox>
            <Button title={i18n(D().survey.common.startSurvey)} onPress={() => this.goToQuestion()} />
          </ButtonBox>
        </View>
      </View>
    );
  }

  renderEnd() {
    return (
      <View style={GS.flex}>
        <View style={GS.flex} />
        {this.renderEndContent()}
        <View style={GS.flex} />
      </View>
    );
  }

  renderEndContent() {
    const answer = this.state.answer;
    if (this.state.sending) {
      return (
        <View style={GS.flex}>
          <Text style={[S.question, GS.textCenter]}>{i18n(D().survey.postSurvey.sendingSurvey)}</Text>
        </View>
      );
    }
    if (answer && answer.isSent) {
      return (
        <View style={GS.flex}>
          <Text style={[S.question, GS.textCenter]}>{i18n(D().survey.common.thankYou)}</Text>
          <ButtonBox>
            <Button title={i18n(D().survey.postSurvey.backToApp)} onPress={() => this.props.onFinish()} />
          </ButtonBox>
        </View>
      );
    }
    return (
      <View style={GS.flex}>
        <Text style={[S.question, GS.textCenter]}>{i18n(D().survey.postSurvey.surveySendingFailure)}</Text>
        <View style={S.noteBlock}>
          <Text style={S.noteText}>{i18n(D().survey.postSurvey.accessLater)}</Text>
        </View>
        <ButtonBox>
          <Button title={i18n(D().survey.postSurvey.resend)} onPress={() => this.goToEnd()} />
        </ButtonBox>
      </View>
    );
  }

  renderMain() {
    const answer = this.state.answer;
    if (answer) {
      if (answer.finishedAt) {
        return this.renderEnd();
      }
      return this.renderQuestion();
    }
    return this.renderAgreement();
  }

  renderQuestion() {
    const { myInfo } = this.props;
    return (
      <SurveyQuestionComponent
        myInfo={myInfo}
        surveyKey={KEY}
        answerStorage={storage.surveyAnswer2}
        allSurveyData={SURVEY_DATA_2}
        next={() => this.goToEnd()}
      />
    );
  }

  render() {
    return <View style={S.container}>{this.renderMain()}</View>;
  }
}

const S = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    padding: 20,
  },
  /* agreement */
  agreement: { margin: 25 },
  agreementText: {
    fontSize: 18,
    marginTop: 20,
  },
  /* end */
  question: { fontSize: 22, margin: 20 },

  noteBlock: {
    margin: 20,
  },
  noteText: {
    color: 'red',
  },
});
