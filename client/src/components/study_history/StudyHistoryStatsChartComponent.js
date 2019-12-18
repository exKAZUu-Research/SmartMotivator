// @flow

import 'babel-polyfill';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bar } from 'react-native-pathjs-charts';

import { GS } from '../style';
import { YMD, startOfWeek } from '../../models/date_util';
import { normalizeStatValue } from './util';
import { D, i18n } from '../../i18n/index';
import { CHART_OPTIONS } from './chart_util';

import type { StatisticsKind, StatisticsList } from '../../types';

type Item = {|
  name: string,
  v: number | null,
|};

type Props = {|
  kind: StatisticsKind,
  statistics: StatisticsList,
  alternativeOps?: Object,
|};

const weeksToPlotFull = 7;
const weeksToPlotTop = 4;

export class StudyHistoryStatsChartComponent extends React.Component {
  props: Props;
  state: void;

  formatData() {
    let hasData = false;
    const goals = [];
    const values = [];
    let max = 0;

    const weeksToPlot = this.props.alternativeOps ? weeksToPlotTop : weeksToPlotFull;

    for (let i = -weeksToPlot + 1; i <= 0; i++) {
      const week = startOfWeek(i);
      const weekYMD = week.format(YMD);
      const weekLabel = week.add(6, 'days').format('M/D');
      const tuple = this.props.statistics[weekYMD];

      const goal: Item = { name: ' ', v: null };
      const value: Item = { name: weekLabel, v: null };

      goals.push(goal);
      values.push(value);

      if (tuple) {
        const one = tuple[this.props.kind];
        if (one.goal) {
          hasData = true;
          const v = normalizeStatValue(one.goal, this.props.kind);
          goal.v = v;
          max = Math.max(max, v);
        }
        if (one.value) {
          hasData = true;
          const v = normalizeStatValue(one.value, this.props.kind);
          value.v = v;
          max = Math.max(max, v);
        }
      }
    }
    if (!hasData) return null;
    return { data: [goals, values], max };
  }

  render() {
    const data = this.formatData();

    if (data === null) {
      return (
        <Text style={[GS.margin10, GS.infoBox, { fontSize: 16 }]}>
          {i18n(D().studyHistory.studyHistoryChart.chartDescription)}
        </Text>
      );
    }
    const axisY = Object.assign({}, CHART_OPTIONS.axisY, { max: data.max });
    const options = Object.assign({}, CHART_OPTIONS, { axisY }, this.props.alternativeOps);

    return (
      <View style={S.chartBlock}>
        <Bar data={data.data} options={options} accessorKey="v" />
      </View>
    );
  }
}

const S = StyleSheet.create({
  chartBlock: {
    marginBottom: 10,
  },
});
