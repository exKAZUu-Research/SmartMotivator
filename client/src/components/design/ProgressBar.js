// @flow

import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from './ComplexProgressBar';
import { GS } from '../style';
import { D, i18n } from '../../i18n/index';

type Props = {|
  title?: string,
  timeStart?: moment,
  timeEnd?: moment,
  achievedCount: number,
  goalCount: number,
  isPointProgress?: boolean,
  alternativeOps?: any,
|};

export function Progress(props: Props) {
  const { timeStart, timeEnd, goalCount, achievedCount } = props;

  const actualCounts = achievedCount < goalCount ? [achievedCount, goalCount - achievedCount] : [goalCount, 0];

  return (
    <View style={[GS.margin10, GS.padding10, S.progressContainer]}>
      {props.title && <Text style={S.title}>{props.title}</Text>}
      {renderProgressMessage(goalCount, achievedCount)}
      <ProgressBar
        actualCounts={actualCounts}
        target={goalCount}
        barColors={[BAR_COLOR, 'transparent']}
        barTextColors={[BAR_TEXT_COLORS, 'black']}
        width={MAX_BAR_WIDTH}
        height={BAR_HEIGHT}
        unit={i18n(D().common.unit.correctCount)}
      />
      {timeStart && timeEnd && renderTimeProgress(timeStart.startOf('day'), timeEnd.startOf('day'))}
    </View>
  );
}

function renderProgressMessage(goalCount, achievedCount) {
  const remainingQuizCount = goalCount - achievedCount;
  if (remainingQuizCount > 0) {
    return (
      <Text style={S.barLabel}>
        {i18n(D().progress.remainingQuizzes, {
          number: remainingQuizCount,
          correctCount: achievedCount,
          goalCorrectCount: goalCount,
        })}
      </Text>
    );
  } else {
    return (
      <Text style={S.barLabel}>
        {i18n(D().progress.succeeded, {
          correctCount: achievedCount,
          goalCorrectCount: goalCount,
        })}
      </Text>
    );
  }
}

function renderTimeProgress(timeStart: moment, timeEnd: moment) {
  const today = moment();
  const diffDays = timeEnd.diff(timeStart, 'days') - today.diff(timeStart, 'days');
  const diffHours = (timeEnd.diff(timeStart, 'hours') - today.diff(timeStart, 'hours')) % 24;
  return (
    <View style={S.progressContainer}>
      <Text style={S.barLabel}>
        {i18n(D().progress.remainingDays, {
          diffDays,
          diffHours,
          startMonth: timeStart.month() + 1,
          startDay: timeStart.date(),
          endMonth: timeEnd.month() + 1,
          endDay: timeEnd.date(),
        })}
      </Text>
      <ProgressBar
        actualCounts={[today.diff(timeStart, 'days'), timeEnd.diff(timeStart, 'days') - today.diff(timeStart, 'days')]}
        target={timeEnd.diff(timeStart, 'days')}
        barColors={[BAR_COLOR, 'transparent']}
        barTextColors={[BAR_TEXT_COLORS, 'black']}
        width={MAX_BAR_WIDTH}
        height={BAR_HEIGHT / 1.5}
        unit={i18n(D().common.unit.day)}
      />
    </View>
  );
}

export const BAR_COLOR = '#070';
const BAR_TEXT_COLORS = 'white';
const BAR_HEIGHT = 30;
const MAX_BAR_WIDTH = 220;

const S = StyleSheet.create({
  progressContainer: {
    margin: 0,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    margin: 10,
  },
  barLabel: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
});
