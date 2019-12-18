// @flow

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { asRank, getTextOfStatValue } from './util';

import { receiveStatisticsEx } from '../../models/connection';
import { YMD, todayStr } from '../../models/date_util';
import { dig } from '../../models/util';
import { D, i18n } from '../../i18n/index';
import * as storage from '../../models/typed_storage';

import type { DailyStatistics, StatisticsList, StatisticsTuple, UserInfo } from '../../types';

type Props = {|
  myInfo: UserInfo,
  defaultMessage: string,
|};

type State = {|
  dailyStats: DailyStatistics | null,
  stats: StatisticsList | null,
|};

export class ProgressMessageComponent extends React.Component {
  props: Props;
  state: State = { dailyStats: null, stats: null };

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps() {
    this.refresh();
  }

  diff(oldValue: number | null, newValue: number | null, biggerIsBetter: boolean) {
    if (newValue == null) return null;
    if (oldValue == null) {
      if (newValue > 0) {
        return (
          <Text>
            (<Text style={S.upMark}>+{newValue.toFixed(0)}</Text>)
          </Text>
        );
      } else {
        return null;
      }
    }
    const diff = Math.round(newValue - oldValue);
    if (diff === 0) return null;
    if (xor(diff < 0, biggerIsBetter))
      return (
        <Text>
          (<Text style={S.upMark}>↑{Math.abs(diff)}</Text>)
        </Text>
      );
    return (
      <Text>
        (<Text style={S.downMark}>↓{Math.abs(diff)}</Text>)
      </Text>
    );
  }

  async refresh() {
    const myId = this.props.myInfo.id;
    const dailyStats = await fetchDailyStatistics(myId);
    const response = await receiveStatisticsEx(myId);
    if (dailyStats !== null && response.success) {
      const stats = response.data;
      this.setState({ dailyStats, stats });
    } else {
      this.setState({ dailyStats: null, stats: null });
    }
  }

  renderItem(
    label: string,
    oldValue: number | null,
    newValue: number | null,
    presenter: (val: number | null) => string,
    biggerIsBetter: boolean
  ) {
    return (
      <Text>
        {label}: {presenter(newValue)}
        {this.diff(oldValue, newValue, biggerIsBetter)}
      </Text>
    );
  }

  renderMessage() {
    const dailyStats = this.state.dailyStats;
    const stats = this.state.stats;
    if (!dailyStats) return null;
    if (!stats) return null;

    const pairs = _.sortBy(Object.entries(dailyStats), pair => pair[0]);
    const todayYMD = todayStr();
    const todayIndex = _.findIndex(pairs, pair => pair[0] === todayYMD);
    const yesterdayStats: StatisticsTuple = dig(pairs, todayIndex - 1, 1);
    const yesterdayYMD = dig(pairs, todayIndex - 1, 0);
    if (!yesterdayStats) {
      return null;
    }

    const date = moment(yesterdayYMD, YMD).format('M/D');
    const oldT = yesterdayStats;
    const newT = stats.all;
    const elems = [
      i18n(D().studyHistory.progressMessage.progressPrefix, { date }),
      this.renderItem(
        i18n(D().common.correctCount),
        oldT.count.value,
        newT.count.value,
        x => getTextOfStatValue(x, 'count'),
        true
      ),
    ];
    if (this.props.myInfo.setting.compMode !== 'none') {
      elems.push(i18n(D().studyHistory.progressMessage.comma));
      elems.push(this.renderItem(i18n(D().common.rank), oldT.count.rank, newT.count.rank, asRank, false));
    }
    elems.push(i18n(D().studyHistory.progressMessage.progressSuffix));
    return (
      <View>
        <Text children={elems} />
      </View>
    );
  }

  renderText(text: string) {
    return (
      <View>
        <Text>{text}</Text>
      </View>
    );
  }

  render() {
    return this.renderMessage() || this.renderText(this.props.defaultMessage);
  }
}

function xor(a: boolean, b: boolean): boolean {
  return (a || b) && !(a && b);
}

async function fetchDailyStatistics(userId: string): Promise<DailyStatistics | null> {
  const today = todayStr();
  const dailyStats = (await storage.dailyStatistics.get()) || {};
  if (dailyStats[today]) return dailyStats;

  const response = await receiveStatisticsEx(userId);
  if (!response.success) {
    return null;
  }
  const stats = response.data;
  dailyStats[today] = stats.all;
  await storage.dailyStatistics.set(dailyStats);
  return dailyStats;
}

const S = StyleSheet.create({
  upMark: {
    color: 'green',
  },
  downMark: {
    color: 'red',
  },
});
