// @flow

import _ from 'lodash';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-root-toast';

import { MissionProgress } from './MissionProgress';
import { QuizResultTable } from './QuizResultTable';
import { DefaultScrollView } from '../design/DefaultScrollView';
import { MissionView } from '../mission/MissionView';
import { MissionResultModal } from './MissionResultModal';
import { isAccumulatedType } from '../mission/util';
import { BORDER_COLOR, GS } from '../style';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';

import type { Navigator, ObservableData } from '../../types';
import type { QuizItem, Result } from './types';
import type { MissionInfo } from '../mission/types';

type Props = {|
  items: QuizItem[],
  result: Result,
  missionInfos: MissionInfo[],
  observableData: ObservableData,
  screenNav: Navigator<*>,
  studyAgain: () => any,
|};

type State = {|
  firstPage: boolean,
  showModal: boolean,
  startProgressAnimation: boolean,
|};

export class QuizFinishedComponent extends React.PureComponent {
  props: Props;
  state: State = { firstPage: true, showModal: false, startProgressAnimation: false };
  toasts: Toast[] = []; // eslint-disable-line react/sort-comp

  componentDidMount() {
    tracker.trackScreenViewNoTabs('quiz_finished');
    this.checkMissionClearModal();
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  checkMissionClearModal() {
    const myInfo = this.props.observableData.myInfo.get();
    if (myInfo.experimentMode === 'minimal') return;

    const missions = this.props.missionInfos[0].missions;
    const isAllAccumulatedType = _.every(missions, isAccumulatedType);

    const useToast = isAllAccumulatedType || myInfo.setting.praiseEffort;
    if (useToast) {
      this.praise(myInfo.setting.praiseEffort, !isAllAccumulatedType);
      this.setState({ startProgressAnimation: true });
    } else {
      this.setState({ showModal: true });
    }
  }

  closeMissionClearModal() {
    this.setState({ showModal: false, startProgressAnimation: true });
  }

  praise(praiseEffort: boolean, restrictMessage: boolean) {
    let message = '';
    if (praiseEffort) {
      const allI18nKeys = D().achievementHelper.effortPraises;
      const chosenKeys = restrictMessage ? allI18nKeys : allI18nKeys.slice(0, 3);
      message = i18n(D().quiz.quizFinished.resultMessageEffort, { praise: i18n(chosenKeys) });
    } else {
      const answers = this.props.result.answers;
      const nAnswered = answers.length;
      const nCorrect = _.filter(answers, a => a.correct).length;
      if (nCorrect / nAnswered > 0.7) {
        message = i18n(D().quiz.quizFinished.resultMessagePerformance, {
          praise: i18n(D().achievementHelper.performancePraises),
          nCorrect,
        });
      }
    }
    if (message) {
      const t = Toast.show(message, { duration: Toast.durations.SHORT, position: Toast.positions.CENTER });
      this.toasts.push(t);
    }
  }

  hideAllToasts() {
    _.forEach(this.toasts, toast => {
      Toast.hide(toast);
    });
    this.toasts = [];
  }

  goSecondPage() {
    this.hideAllToasts();
    this.setState({ firstPage: false });
  }

  studyAgain() {
    this.hideAllToasts();
    this.props.studyAgain();
  }

  renderSecondPage() {
    const { result, items, screenNav } = this.props;

    return (
      <View style={[GS.flex, GS.themeBackground]}>
        {this.renderResultStat()}
        <DefaultScrollView>
          <View style={S.tableContainer}>
            <QuizResultTable items={items} result={result} screenNav={screenNav} />
          </View>
        </DefaultScrollView>
        {this.renderSecondPageFooter()}
      </View>
    );
  }

  renderResultStat() {
    const answers = this.props.result.answers;
    const nAnswer = answers.length;
    let nCorrect = 0;
    for (const ans of answers) {
      if (ans.correct) {
        nCorrect += 1;
      }
    }

    const rate = Math.round(100 * nCorrect / nAnswer);
    const unit = i18n(D().common.unit.correctCount);
    const labelText = `${i18n(D().common.correctCount)} (${i18n(D().common.correctRate)})`;
    const valueText = `${nCorrect}${unit} (${rate}%)`;
    return (
      <View style={[GS.tableBody, { backgroundColor: 'white', padding: 5 }]}>
        <Text style={GS.textCenter}>{labelText}</Text>
        <Text style={[GS.textCenter, { fontSize: 28 }]}>{valueText}</Text>
      </View>
    );
  }

  renderFirstPage() {
    const { observableData, missionInfos, screenNav } = this.props;
    const { startProgressAnimation } = this.state;
    const mis = startProgressAnimation ? missionInfos : [missionInfos[0]];
    const answers = this.props.result.answers;
    return (
      <View style={[GS.flex, GS.themeBackground]}>
        <MissionProgress missionInfo={missionInfos[0]} answers={answers} max={answers.length} />
        <View style={[GS.flex, GS.flexCenterH]}>
          <MissionView
            observableData={observableData}
            missionInfos={mis}
            screenNav={screenNav}
            emphasizeMissions={true}
            animation={startProgressAnimation}
          />
        </View>
        {this.renderFirstPageFooter()}
        {this.renderMissionClearModal()}
      </View>
    );
  }

  renderMissionClearModal() {
    const info = this.props.missionInfos[0];
    const answers = this.props.result.answers;
    return (
      <MissionResultModal
        visible={this.state.showModal}
        hide={() => this.closeMissionClearModal()}
        missionInfo={info}
        answers={answers}
      />
    );
  }

  renderFirstPageFooter() {
    return (
      <View style={GS.row}>
        <TouchableOpacity key="1" style={[GS.flex, GS.mainButton, S.button]} onPress={() => this.goSecondPage()}>
          <Text style={S.buttonText}>{i18n(D().common.next)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderSecondPageFooter() {
    const { screenNav } = this.props;
    // ボタンコンポーネントが使いまわされると連打されたときにバグるので、
    // 使いまわされないように key を指定しています。
    return (
      <View style={GS.row}>
        <TouchableOpacity key="2" style={[GS.flex, GS.subButton, S.button]} onPress={() => screenNav.goBack('_top')}>
          <Text style={S.buttonText}>{i18n(D().quiz.quizFinished.goTop)}</Text>
        </TouchableOpacity>
        <TouchableOpacity key="3" style={[GS.flex, GS.mainButton, S.button]} onPress={() => this.studyAgain()}>
          <Text style={S.buttonText}>{i18n(D().quiz.quizFinished.studyMore)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    if (this.state.firstPage && this.props.observableData.myInfo.get().experimentMode !== 'minimal') {
      return this.renderFirstPage();
    } else {
      return this.renderSecondPage();
    }
  }
}

const S = StyleSheet.create({
  button: {
    margin: 10,
    borderRadius: 4,
    paddingVertical: 8,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
  },
  tableContainer: {
    margin: 10,
    backgroundColor: 'white',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: BORDER_COLOR,
  },
});
