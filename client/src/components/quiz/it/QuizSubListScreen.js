// @flow

import _ from 'lodash';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

import { MenuItem } from '../../design/MenuItem';
import { receiveQuizListEx } from '../../../models/connection';
import { DefaultScrollView } from '../../design/DefaultScrollView';
import { tracker } from '../../../models/Tracker';

import type { Navigator, ObservableData } from '../../../types';
import type { QuizItem, QuizSet } from '../types';

type NavParams = {|
  observableData: ObservableData,
  quizSet: QuizSet,
|};

export class QuizSubListScreen extends React.PureComponent {
  props: { navigation: Navigator<NavParams> };
  state = { quizzes: [] };

  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.title,
  });

  componentDidMount() {
    const { quizSet } = this.props.navigation.state.params;
    tracker.trackScreenViewNoTabs(`quiz_list/${quizSet.course}/${quizSet.genre}`);
    this.init();
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  async init() {
    const { observableData, quizSet } = this.props.navigation.state.params;
    const userId = observableData.myInfo.get().id;
    const response = await receiveQuizListEx(userId, quizSet.course, quizSet.genre);
    if (!response.success) {
      return () => this.init();
    }
    return this.setState({ quizzes: response.data });
  }

  renderRow(quiz: QuizItem, isDev: boolean) {
    const { quizSet } = this.props.navigation.state.params;
    const f = () => {
      this.props.navigation.navigate('ITQuizDetailScreen', { title: quiz.label, quizItem: quiz, quizSet });
    };
    const showIcon = isDev && quiz.images && !_.isEmpty(quiz.images);
    return (
      <MenuItem text={quiz.label} key={quiz.key} onPress={f}>
        {showIcon ? <Icon name="file-image-o" /> : null}
      </MenuItem>
    );
  }

  render() {
    const isDev = __DEV__ || this.props.navigation.state.params.observableData.myInfo.get().role === 'developer';
    return <DefaultScrollView>{this.state.quizzes.map(q => this.renderRow(q, isDev))}</DefaultScrollView>;
  }
}
