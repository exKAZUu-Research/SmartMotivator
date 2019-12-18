// @flow

import 'babel-polyfill';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StockLine } from 'react-native-pathjs-charts';

import { GS } from '../style';
import { YMD, startOfWeek } from '../../models/date_util';
import { D, i18n } from '../../i18n/index';
import { CHART_OPTIONS } from './chart_util';

import type { StatisticsKind, StatisticsList } from '../../types';

type Item = {|
  week: number | null,
  rank: number | null,
|};

type Props = {|
  kind: StatisticsKind,
  statistics: StatisticsList,
|};

const weeksToPlot = 7;

export class StudyHistoryRankChartComponent extends React.Component {
  props: Props;
  state: void;

  formatData() {
    let defaultRank = 0;
    const ranks = [];
    for (let i = -weeksToPlot + 1; i <= 0; i++) {
      const week = startOfWeek(i);
      const weekYMD = week.format(YMD);
      const weekInfo = this.props.statistics[weekYMD];
      const rank: Item = { week: i, rank: defaultRank };

      if (weekInfo) {
        const one = weekInfo[this.props.kind];
        if (one.rank) {
          rank.rank = this.props.statistics.numOfUsers - one.rank;
          defaultRank = one.rank;
          ranks.push(rank);
        }
      } else {
        ranks.push(rank);
      }
    }
    return [ranks];
  }

  render() {
    const changeLabelsY = {
      labelFunction: v => {
        if (!Number.isInteger(v)) {
          return '';
        }
        return this.props.statistics.numOfUsers - v;
      },
    };

    const changeLabelsX = {
      labelFunction: v => {
        const week = startOfWeek(v);
        const weekLabel = week.add(6, 'days').format('M/D');
        return weekLabel;
      },
    };

    const optionsY = Object.assign({}, CHART_OPTIONS.axisY, changeLabelsY);
    const optionsX = Object.assign({}, CHART_OPTIONS.axisX, changeLabelsX);
    const options = Object.assign({}, CHART_OPTIONS, { axisX: optionsX, axisY: optionsY });

    const data = this.formatData();
    if (data === null) {
      return (
        <Text style={[GS.margin10, GS.infoBox, { fontSize: 16 }]}>
          {i18n(D().studyHistory.studyHistoryChart.chartDescription)}
        </Text>
      );
    }
    return (
      <View style={S.chartBlock}>
        <StockLine data={data} options={options} xKey="week" yKey="rank" accessorKey="v" />
      </View>
    );
  }
}

const S = StyleSheet.create({
  chartBlock: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
});
