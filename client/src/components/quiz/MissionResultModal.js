// @flow
import _ from 'lodash';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MyModal } from '../mission/MyModal';
import { MISSION_TYPE_MULTI_CORRECT, MISSION_TYPE_MULTI_FAST_CORRECT } from '../mission/util';
import { BORDER_COLOR, GS } from '../style';
import { D, i18n } from '../../i18n/index';

import type { Answer } from './types';
import type { MissionInfo } from '../mission/types';

type Props = {
  visible: boolean,
  hide: () => any,
  missionInfo: MissionInfo,
  answers: Answer[],
};
export function MissionResultModal(props: Props) {
  const result1 = getCorrectMissionResult(props.missionInfo, props.answers);
  const result2 = getFastCorrectMissionResult(props.missionInfo, props.answers);
  const praise = (result1 && result1.clear) || (result2 && result2.clear);
  return (
    <MyModal visible={props.visible} hide={props.hide}>
      {praise && <Text style={S.praise}>{i18n(D().mission.common.praise)}</Text>}
      <View>
        {result1 && renderMissionItem(result1)}
        {result2 && renderMissionItem(result2)}
      </View>
    </MyModal>
  );
}

type MisisonResult = {
  text: string,
  clear: boolean,
};

function getCorrectMissionResult(missionInfo: MissionInfo, answers: Answer[]): MisisonResult | null {
  const m = _.find(missionInfo.missions, m => m.type === MISSION_TYPE_MULTI_CORRECT);
  if (!m) return null;

  const text = i18n(D().mission.common.correctTitle, { num: m.quizCount });
  const cnt = _.filter(answers, a => a.correct).length;
  const clear = cnt >= m.quizCount;
  return { text, clear };
}

function getFastCorrectMissionResult(missionInfo: MissionInfo, answers: Answer[]): MisisonResult | null {
  const m = _.find(missionInfo.missions, m => m.type === MISSION_TYPE_MULTI_FAST_CORRECT);
  if (!m) return null;

  const threshold = (m.threshold / 1000).toFixed(0);
  const text = i18n(D().mission.common.fastCorrectTitleLong, { num: m.quizCount, threshold });
  const cnt = _.filter(answers, a => a.correct && a.spentTime <= m.threshold).length;
  const clear = cnt >= m.quizCount;
  return { text, clear };
}

function renderMissionItem(result: MisisonResult) {
  const boxStyle = result.clear ? S.missionBoxClear : S.missionBoxFailed;
  return (
    <View style={[S.mission, boxStyle]}>
      <View style={GS.row}>
        <Text style={S.missionLabel}>Mission</Text>
        <View style={GS.flex} />
        {result.clear ? <Text style={S.missionClear}>CLEAR!!</Text> : <Text style={S.missionFailed}>FAILED</Text>}
      </View>
      <Text style={S.missionText}>{result.text}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  praise: {
    textAlign: 'center',
    fontSize: 20,
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
  missionBoxClear: {
    borderColor: '#ff3300',
  },
  missionBoxFailed: {
    // borderColor: 'blue',
  },
  missionLabel: {
    fontSize: 20,
    // textAlign: 'right',
    fontStyle: 'italic',
    color: '#aaa',
  },
  missionClear: {
    fontSize: 20,
    color: '#ff3300',
    fontWeight: 'bold',
  },
  missionFailed: {
    fontSize: 20,
    color: 'blue',
  },
  missionText: {
    fontSize: 24,
  },
});
