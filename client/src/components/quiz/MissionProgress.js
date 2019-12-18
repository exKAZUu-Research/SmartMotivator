// @flow
import _ from 'lodash';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

import {
  MISSION_TYPE_MULTI_CORRECT,
  MISSION_TYPE_MULTI_FAST_CORRECT,
  isAccumulatedType,
  missionTitle,
} from '../mission/util';
import { GS } from '../style';

import type { Answer } from './types';
import type { MissionInfo } from '../mission/types';

type Props = {
  missionInfo: MissionInfo,
  answers: Answer[],
  max: number,
};

type State = void;

export class MissionProgress extends React.PureComponent {
  props: Props;
  state: State;

  renderCorrect() {
    const { missionInfo, answers } = this.props;
    const mission = _.find(missionInfo.missions, m => m.type === MISSION_TYPE_MULTI_CORRECT);
    const b = mission ? mission.quizCount : 0;
    const f = a => a.correct;
    const a = _.filter(answers, f).length;
    const title = mission ? missionTitle(mission, false) : '';
    return this.renderItem(title, a, b, false);
  }

  renderFastCorrect() {
    const { missionInfo, answers } = this.props;
    const mission = _.find(missionInfo.missions, m => m.type === MISSION_TYPE_MULTI_FAST_CORRECT);
    const b = mission ? mission.quizCount : 0;
    const threshold = mission ? mission.threshold : 0;
    const f = a => a.correct && a.spentTime <= threshold;
    const a = _.filter(answers, f).length;
    const title = mission ? missionTitle(mission, false) : '';
    return this.renderItem(title, a, b, true);
  }

  renderItemMessage(label: string, a: number, b: number) {
    return (
      <View style={[GS.row, S.cell]}>
        <Text style={[GS.flex, S.label]}>
          {label}
          {': '}
        </Text>
        <Text style={[S.text]}>
          <Text style={S.a}>{a}</Text>
          <Text style={S.b}>
            {' / '}
            {b}
          </Text>
        </Text>
      </View>
    );
  }

  renderItem(label: string, a: number, b: number, borderLeft: boolean) {
    const fullWidth = Dimensions.get('window').width / 2;
    const { max } = this.props;
    const width = fullWidth * a / max;
    const pass = a >= b;
    return (
      <View style={[GS.flex, S.progressBox, borderLeft && S.borderLeft]}>
        <View style={[S.progress, pass && S.progressClear, { width }]} />
        {this.renderItemMessage(label, a, b)}
      </View>
    );
  }

  render() {
    const isAllAccumulatedType = _.every(this.props.missionInfo.missions, isAccumulatedType);
    if (isAllAccumulatedType) return null;
    return (
      <View style={[GS.row, S.container]}>
        {this.renderCorrect()}
        {this.renderFastCorrect()}
      </View>
    );
  }
}

const S = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'black',
  },
  borderLeft: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'black',
  },
  progressBox: {
    backgroundColor: 'white',
  },
  cell: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  text: {
    fontSize: 16,
    paddingLeft: 5,
  },
  label: {
    fontSize: 12,
  },
  a: {
    fontSize: 30,
  },
  b: {},
  progress: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 0, 0.4)',
  },
  progressClear: {
    backgroundColor: 'rgba(0, 200, 0, 0.3)',
  },
});
