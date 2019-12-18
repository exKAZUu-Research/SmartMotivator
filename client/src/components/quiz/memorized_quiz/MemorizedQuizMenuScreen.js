// @flow

import React from 'react';
import { Text, View } from 'react-native';

import { ErrorComponent } from '../../ErrorComponent';
import { MemorizedQuizComponent } from './MemorizedQuizComponent';
import { receiveMemorizedQuizEx } from '../../../models/connection';
import { DefaultScrollView } from '../../design/DefaultScrollView';
import { GS } from '../../style';
import { D, i18n } from '../../../i18n/index';
import { tracker } from '../../../models/Tracker';

import { TabComponent } from '../../TabComponent';

import type { Navigator, ObservableData } from '../../../types';

type MemorizedQuizListTab = 'memorized' | 'wrong' | 'correct';

const TAB_KEYS: MemorizedQuizListTab[] = ['memorized', 'wrong', 'correct'];

const TAB_LABELS: { [key: MemorizedQuizListTab]: string } = {
  memorized: i18n(D().quiz.quizMenu.memorizedQuizList.memorized),
  wrong: i18n(D().quiz.quizMenu.memorizedQuizList.wrong),
  correct: i18n(D().quiz.quizMenu.memorizedQuizList.correct),
};

type NavParams = {|
  course: string,
  genre: string,
  observableData: ObservableData,
|};

type State = {|
  quizTable: string[][],
  loadingQuizzes: boolean,
  error: string | null,
|};

export class MemorizedQuizMenuScreen extends React.PureComponent {
  props: { navigation: Navigator<NavParams> };
  state: State = {
    quizTable: [],
    loadingQuizzes: true,
    error: null,
  };

  componentDidMount() {
    this.getDataList(true);
    const initTab = 0;
    tracker.trackScreenViewWithTabs(`quiz/memorizedQuizList/${TAB_KEYS[initTab]}`);
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  async getDataList(showLoading: boolean) {
    const { course, genre, observableData } = this.props.navigation.state.params;
    if (showLoading) {
      this.setState({ loadingQuizzes: true });
    }
    const myInfo = observableData.myInfo.get();
    const response = await receiveMemorizedQuizEx(myInfo.id, course, genre);
    if (!response.success) {
      const error = i18n(D().connectionError[response.error]);
      this.setState({ error, loadingQuizzes: false });
      return;
    }
    const quizInfos = response.data;
    const memorized = [];
    const wrong = [];
    const correct = [];
    for (const quizInfo of quizInfos) {
      const qName = quizInfo.label;
      if (qName) {
        if (quizInfo.memorized) {
          memorized.push(qName);
        } else if (quizInfo.consecutiveCorrectCount > 0) {
          correct.push(qName);
        } else {
          wrong.push(qName);
        }
      }
    }

    this.setState({ quizTable: [memorized, wrong, correct], loadingQuizzes: false });
  }

  renderContent(index: number) {
    const tabKey = TAB_KEYS[index];
    const tabLabel = TAB_LABELS[tabKey];
    const observableData = this.props.navigation.state.params.observableData;
    const myInfo = observableData.myInfo.get();

    return (
      <View key={index} style={GS.flex} tabKey={tabKey} tabLabel={tabLabel}>
        <DefaultScrollView alwaysBounceVertical={false}>
          <MemorizedQuizComponent myInfo={myInfo} quizList={this.state.quizTable[index]} />
        </DefaultScrollView>
      </View>
    );
  }

  render() {
    if (this.state.loadingQuizzes) {
      return <Text style={[GS.margin10, GS.textCenter]}>{i18n(D().common.nowLoading)}</Text>;
    }
    return (
      <ErrorComponent error={this.state.error}>
        <TabComponent
          folder={'quiz/memorizedQuizList'}
          renderContent={TAB_KEYS.map((_, index) => this.renderContent(index))}
        />
      </ErrorComponent>
    );
  }
}
