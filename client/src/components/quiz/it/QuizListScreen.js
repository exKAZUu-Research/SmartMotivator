// @flow

import React from 'react';

import { DefaultScrollView } from '../../design/DefaultScrollView';
import { MenuItem } from '../../design/MenuItem';
import { tracker } from '../../../models/Tracker';
import { receiveQuizStatsEx } from '../../../models/connection';

import type { Navigator, ObservableData } from '../../../types';
import type { QuizSet } from '../types';

type NavParams = {|
  observableData: ObservableData,
|};

export class QuizListScreen extends React.PureComponent {
  props: { navigation: Navigator<NavParams> };
  state = { quizSet: [] };

  /* ---- ---- ---- ---- life cycle events ---- ---- ---- ---- */

  componentDidMount() {
    tracker.trackScreenViewNoTabs('quiz_list');
    this.init();
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  /* ---- ---- ---- ---- custom actions ---- ---- ---- ---- */

  async init() {
    const { observableData } = this.props.navigation.state.params;
    const response = await receiveQuizStatsEx(observableData.myInfo.get().id);
    if (!response.success) {
      return () => this.init();
    }
    return this.setState({ quizSet: response.data });
  }

  gotoSubList(quizSet: QuizSet) {
    const { observableData } = this.props.navigation.state.params;
    this.props.navigation.navigate('QuizSubListScreen', {
      observableData,
      quizSet,
      title: quizSet.label,
    });
  }

  render() {
    return (
      <DefaultScrollView>
        {this.state.quizSet.map(set => {
          const action = () => this.gotoSubList(set);
          return <MenuItem key={set.genre} text={set.label} onPress={action} />;
        })}
      </DefaultScrollView>
    );
  }
}
