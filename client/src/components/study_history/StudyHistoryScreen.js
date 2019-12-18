// @flow

import _ from 'lodash';
import React from 'react';
import { AsyncStorage, Button, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { StudyHistoryRankChartComponent } from './StudyHistoryRankChartComponent';
import { StudyHistoryStatsChartComponent } from './StudyHistoryStatsChartComponent';
import { ErrorComponent } from '../ErrorComponent';
import { GS } from '../style';
import { receiveStatisticsEx, resend, updateStudyHistoryEx } from '../../models/connection';
import { YMD, startOfWeek, startOfWeekStr } from '../../models/date_util';
import { dig } from '../../models/util';
import { KEY_LAST_STATISTICS_CHECKED } from '../../models/global_storage_keys';
import { tracker } from '../../models/Tracker';
import { TabComponent } from '../TabComponent';
import { updateVisitation } from '../util';
import { D, i18n } from '../../i18n/index';
import {
  KINDS,
  LABEL,
  LIMIT,
  UNIT,
  asRank,
  getDefaultStatData,
  getTextOfStatValue,
  normalizeStatValue,
  reachGoal,
} from './util';

import type { Navigator, ObservableData, OneStatistics, StatisticsKind, StatisticsList } from '../../types';

export const TABS = KINDS;

function normalizeInput(str: string, kind: StatisticsKind): number {
  const num = parseFloat(str);
  switch (kind) {
    case 'rate':
      return num / 100;
    case 'count':
    case 'memorizedWord':
      return num;
    case 'spentTime':
      return num * 1000;
  }
  return 0;
}

type NavParams = {|
  observableData: ObservableData,
|};

type State = {|
  refreshing: boolean,
  error: string | null,
  statistics: StatisticsList | null,
  goals: { [key: string]: string },
|};

export class StudyHistoryScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State = {
    refreshing: false,
    error: null,
    statistics: null,
    goals: {},
  };

  componentDidMount() {
    this.fetchData();
    tracker.trackScreenViewWithTabs(`study_history/${TABS[0]}`);
    const { observableData } = this.props.navigation.state.params;
    updateVisitation(observableData, 'studyHistoryComponent');
  }

  componentWillUnmount() {
    const { observableData } = this.props.navigation.state.params;
    observableData.myInfo.update(observableData.myInfo.get());
    tracker.trackScreenViewOnDismount();
  }

  async setGoal(goalString: string, weekOffset: number, tabNumber: number) {
    const { observableData } = this.props.navigation.state.params;
    const myInfo = observableData.myInfo.get();

    if (!goalString) return;

    const kind = TABS[tabNumber];
    const goal = normalizeInput(goalString, kind);
    const startDate = startOfWeekStr(weekOffset);
    const statistics = this.state.statistics;

    if (statistics === null) {
      return;
    }

    const data = {};
    data[startDate] = {};
    data[startDate][kind] = { goal };
    const response = await updateStudyHistoryEx(myInfo.id, data);
    if (!response.success) {
      const error = i18n(D().connectionError[response.error]);
      this.setState({ error });
      return;
    }
    tracker.trackEvent('study_history', 'set_goal', { label: kind, data: { startDate, goal } });

    if (!statistics[startDate]) {
      statistics[startDate] = getDefaultStatData();
    }
    statistics[startDate][kind].goal = goal;
    this.setState({ statistics });
  }

  async checkReachGoal(statsList: StatisticsList | null, kind: StatisticsKind) {
    const lastWeekStr = startOfWeekStr(-1);
    const stats: OneStatistics = dig(statsList, lastWeekStr, kind);
    const reached = reachGoal(kind, stats);
    if (!reached) return;

    let showToast = false;
    let info = null;
    const lastChecked = await AsyncStorage.getItem(KEY_LAST_STATISTICS_CHECKED);
    if (lastChecked) {
      info = JSON.parse(lastChecked);
      if (info.date < lastWeekStr) {
        showToast = true;
      } else if (!info[kind]) {
        showToast = true;
      }
    } else {
      info = {};
      showToast = true;
    }
    if (showToast) {
      info.date = lastWeekStr;
      info[kind] = true;
      await AsyncStorage.setItem(KEY_LAST_STATISTICS_CHECKED, JSON.stringify(info));
    }
  }

  async fetchData() {
    const { observableData } = this.props.navigation.state.params;
    const myInfo = observableData.myInfo.get();
    await resend();
    const response = await receiveStatisticsEx(myInfo.id);
    if (response.success) {
      const statistics = response.data;
      const data = statistics[startOfWeek(0).format(YMD)] || getDefaultStatData();
      const goals = _.mapValues(data, (oneStat, statKind) => {
        const num = normalizeStatValue(oneStat.goal, statKind);
        return num ? num.toFixed(0) : '';
      });
      this.setState({ statistics, goals });
    } else {
      const error = i18n(D().connectionError[response.error]);
      this.setState({ error, refreshing: false });
    }
  }

  async refresh(tabNumber: number) {
    this.setState({ refreshing: true });
    await this.fetchData();
    this.setState({ refreshing: false });
  }

  validateInput(tab: StatisticsKind) {
    if (parseFloat(this.state.goals[tab]) > LIMIT[tab]) {
      const error = i18n(D().validation.lessThanOrEqualTo, {
        field: LABEL[tab],
        count: LIMIT[tab],
      });
      return <Text style={[GS.margin10, GS.errorBox]}>{error}</Text>;
    }
    return null;
  }

  renderBarTitle(st: StatisticsList, tab: StatisticsKind) {
    const labelValue = (label: string, value: string, suffix: any) => `${label}: ${value}`;
    const startDate = startOfWeekStr(0);

    const title = i18n(D().studyHistory.studyHistory.numberCorrectPerWeek);

    const thisWeekLabel = i18n(D().common.thisWeek, { label: LABEL[tab] });
    const thisWeekValue = getTextOfStatValue(st[startDate][tab].value, tab);
    const allTimeLabel = i18n(D().studyHistory.studyHistory.allTimeShort, { label: LABEL[tab] });
    const allTimeValue = getTextOfStatValue(st.all[tab].value, tab);

    const thisWeek = labelValue(thisWeekLabel, thisWeekValue);
    const allTime = labelValue(allTimeLabel, allTimeValue);

    return (
      <Text style={S.note}>
        {title}（{thisWeek}、{allTime}）
      </Text>
    );
  }

  renderContent(st: StatisticsList, tabNumber: number) {
    const { observableData } = this.props.navigation.state.params;
    const myInfo = observableData.myInfo.get();

    const tab = TABS[tabNumber];
    const tabLabel = LABEL[tab];
    const showRank = myInfo.setting.pointType === 'other';
    const refresher = <RefreshControl refreshing={this.state.refreshing} onRefresh={() => this.refresh(tabNumber)} />;
    return (
      <ScrollView key={tabNumber} tabKey={tab} tabLabel={tabLabel} style={GS.flex} refreshControl={refresher}>
        <View style={S.goalContainer}>
          <Text style={S.goalLabel}>{i18n(D().common.weeklyGoal)}: </Text>
          <TextInput
            placeholder={i18n(D().common.inputPlaceholder)}
            style={S.goalInput}
            keyboardType="numeric"
            value={this.state.goals[tab]}
            selectTextOnFocus={true}
            onChangeText={goal => {
              this.state.goals[tab] = goal;
              this.setState({ goals: this.state.goals });
            }}
          />
          <Text style={S.goalUnit}>{UNIT[tab]}</Text>
          <Button
            disabled={!(parseFloat(this.state.goals[tab]) > 0 && parseFloat(this.state.goals[tab]) <= LIMIT[tab])}
            onPress={() => this.setGoal(this.state.goals[tab], 0, tabNumber)}
            title={i18n(D().common.save)}
          />
        </View>
        <View style={S.pointInfoContainer}>{this.renderBarTitle(st, tab)}</View>
        {this.validateInput(tab)}
        <StudyHistoryStatsChartComponent statistics={st} kind={tab} />
        {showRank && <View style={S.pointInfoContainer}>{this.renderGraphTitle(st, tab)}</View>}
        {showRank && <StudyHistoryRankChartComponent statistics={st} kind={tab} />}
      </ScrollView>
    );
  }

  renderGraphTitle(st: StatisticsList, tab: StatisticsKind) {
    const startDate = startOfWeekStr(0);

    const title = i18n(D().studyHistory.studyHistory.rankingPerWeek);
    const thisWeekIs = i18n(D().common.thisWeekIs, { label: LABEL[tab] });
    const totalUsers = i18n(D().studyHistory.studyHistory.allUsersShort, { numOfUsers: st.numOfUsers });
    const currentRank = asRank(st[startDate][tab].rank);
    return (
      <Text style={S.note}>
        {title}（{thisWeekIs}
        {totalUsers}の{currentRank}）
      </Text>
    );
  }

  renderScrollableTab() {
    const st = this.state.statistics;
    if (!st)
      return (
        <View>
          <Text>{i18n(D().common.nowLoading)}</Text>
        </View>
      );
    return (
      <View style={GS.flex}>
        <TabComponent
          folder={'study_history'}
          renderContent={TABS.map((_, index) => this.renderContent(st, index))}
          changeTabEvent={({ i }) => {
            this.checkReachGoal(st, TABS[i]);
          }}
        />
      </View>
    );
  }

  render() {
    return <ErrorComponent error={this.state.error}>{this.renderScrollableTab()}</ErrorComponent>;
  }
}

const S = StyleSheet.create({
  header: { padding: 10, paddingBottom: 0 },
  big: { fontSize: 20 },
  note: { fontSize: 16 },

  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  pointInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  goalLabel: {
    padding: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  goalUnit: {
    padding: 10,
    fontSize: 18,
  },
  goalInput: {
    flex: 1,
    height: 35,
    margin: 2,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    fontSize: 12,
  },
});
