// @flow
import _ from 'lodash';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SplittedMiniBar } from '../mission/SplittedMiniBar';
import {
  MISSION_TYPE_MULTI_CORRECT,
  MISSION_TYPE_MULTI_FAST_CORRECT,
  adjustedMissionReward,
  getMissionProgress,
  getTextOfApproximateInteger,
} from '../mission/util';
import { FramingMessageComponent } from './FramingMessageComponent';
import { BORDER_COLOR, GS } from '../style';
import { D, i18n } from '../../i18n/index';

import type { Navigator, ObservableData } from '../../types';
import type { MissionInfo, MissionType } from '../mission/types';

type Props = {|
  missionInfo: MissionInfo,
  observableData: ObservableData,
  screenNav: Navigator<*>,
  action: () => any,
|};

export function QuizPrestartView(props: Props) {
  const { missionInfo, observableData } = props;
  const myInfo = observableData.myInfo.get();
  return (
    <View style={[GS.flex, GS.themeBackground]}>
      <View style={GS.flex2} />
      <View style={S.framingContainer}>
        <FramingMessageComponent myInfo={myInfo} missionInfo={missionInfo} style={S.framingText} />
      </View>
      <View style={[GS.padding10]}>
        {renderMissionItem(missionInfo, MISSION_TYPE_MULTI_CORRECT, D().mission.common.correctTitle)}
        {renderMissionItem(missionInfo, MISSION_TYPE_MULTI_FAST_CORRECT, D().mission.common.fastCorrectTitleLong)}
      </View>
      <View style={GS.flex3} />
      <View style={GS.row}>
        <TouchableOpacity style={[GS.flex, GS.mainButton, S.button]} onPress={props.action}>
          <Text style={S.buttonText}>{i18n(D().common.start)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function renderMissionItem(missionInfo: MissionInfo, type: MissionType, key: string) {
  const mission = _.find(missionInfo.missions, m => m.type === type);
  if (!mission) return null;

  const num = <Text style={S.missionTextStrong}>{mission.quizCount}</Text>;
  const threshold = <Text style={S.missionTextStrong}>{(mission.threshold / 1000).toFixed(0)}</Text>;
  const children = replaceText(key, num, threshold);

  const current = getMissionProgress(missionInfo, mission) - mission.startValue;
  const max = mission.goalValue - mission.startValue;
  const reward = adjustedMissionReward(mission.reward, missionInfo.bonus);
  return (
    <View style={[S.mission]}>
      <View style={GS.row}>
        <Text style={S.missionLabel}>Mission</Text>
      </View>
      <Text style={S.missionText} children={children} />
      <View style={[S.markContainer, GS.row]}>
        <View style={[S.barContainer, GS.flex]}>
          <SplittedMiniBar height={15} animation={false} current={current} max={max} />
        </View>
        <Text style={[GS.textRight]}>
          {'💎+'}
          {getTextOfApproximateInteger(reward)}
        </Text>
      </View>
    </View>
  );
}
function replaceText(i18nKey: string, num: any, threshold: any) {
  const placeholderNum = '__NUM__';
  const placeholderThreshold = '__THRESHOLD__';
  const env = { num: placeholderNum, threshold: placeholderThreshold };
  const text = i18n(i18nKey, env);

  const children = [];
  text.split(placeholderNum).forEach((subText, i) => {
    if (i > 0) {
      children.push(num);
    }
    subText.split(placeholderThreshold).forEach((token, j) => {
      if (j > 0) {
        children.push(threshold);
      }
      children.push(token);
    });
  });
  return children;
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
  mission: {
    margin: 10,
    borderColor: BORDER_COLOR,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'white',
    borderRadius: 3,
  },
  missionLabel: {
    fontSize: 20,
    // textAlign: 'right',
    fontStyle: 'italic',
    color: '#aaa',
  },
  missionText: {
    fontSize: 18,
  },
  missionTextStrong: {
    fontSize: 30,
  },
  markContainer: {
    marginTop: 10,
    marginBottom: 5,
  },
  barContainer: {
    marginRight: 5,
  },
  framingContainer: {
    // borderTopWidth: StyleSheet.hairlineWidth,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderColor: BORDER_COLOR,
    marginBottom: 20,
  },
  framingText: {
    fontSize: 20,
    padding: 10,
  },
});
