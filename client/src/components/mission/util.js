// @flow

import type { Mission, MissionInfo } from './types';
import { D, i18n } from '../../i18n/index';

export const MISSION_TYPE_ANSWER = 'answer';
export const MISSION_TYPE_CORRECT = 'correct';
export const MISSION_TYPE_FAST_CORRECT = 'fastCorrect';
export const MISSION_TYPE_MULTI_CORRECT = 'multiCorrect';
export const MISSION_TYPE_MULTI_FAST_CORRECT = 'multiFastCorrect';
export const MISSION_TYPE_MEMORIZE = 'memorized';

/**
 * ミッションの見出し文字列を取得します。
 */
export function missionTitle(mission: Mission, short: boolean): string {
  const diff = mission.goalValue - mission.startValue;
  switch (mission.type) {
    case MISSION_TYPE_ANSWER:
      return i18n(D().mission.common.answerTitle, { num: diff });
    case MISSION_TYPE_CORRECT:
      return i18n(D().mission.common.correctTitle, { num: diff });
    case MISSION_TYPE_MULTI_CORRECT:
      return i18n(D().mission.common.correctTitle, { num: mission.quizCount });
    case MISSION_TYPE_FAST_CORRECT: {
      const threshold = (mission.threshold / 1000).toFixed(0);
      const key = short ? D().mission.common.fastCorrectTitleShort : D().mission.common.fastCorrectTitleLong;
      return i18n(key, { num: diff, threshold });
    }
    case MISSION_TYPE_MULTI_FAST_CORRECT: {
      const threshold = (mission.threshold / 1000).toFixed(0);
      const key = short ? D().mission.common.fastCorrectTitleShort : D().mission.common.fastCorrectTitleLong;
      return i18n(key, { num: mission.quizCount, threshold });
    }
    case MISSION_TYPE_MEMORIZE:
      return i18n(D().mission.common.memorizedTitle, { num: diff });
  }
  return '';
}

/**
 * ミッションの進捗の文字列を取得します。
 */
export function missionProgressText(mission: Mission, missionInfo: MissionInfo): string {
  const value = Math.max(mission.goalValue - getMissionProgress(missionInfo, mission), 0);
  if (isAccumulatedType(mission)) {
    return i18n(D().mission.common.progress, { value });
  }
  return `あと${value}回`;
}

export function getMissionProgress(missionInfo: MissionInfo, mission: Mission): number {
  const countKey = mission.type + (mission.threshold || '');
  return missionInfo.counts[countKey];
}

export function adjustedMissionReward(originalReward: number, bonus: number): number {
  return Math.round(originalReward * bonus);
}

export function getTextOfApproximateInteger(integer: number): string {
  const suffixes = [
    '万',
    '億',
    '兆',
    '京',
    '垓',
    '禾予',
    '穣',
    '溝',
    '澗',
    '正',
    '載,',
    '極',
    '恒河沙',
    '阿僧祇',
    '那由他',
    '不可思議',
    '無量大数',
  ];
  const unit = 10000;
  let index = -1;
  while (integer >= unit && index < suffixes.length) {
    integer /= unit;
    index++;
  }
  return index >= 0 ? `${integer.toPrecision(4)}${suffixes[index]}` : integer.toString();
}

export function getApproximatePointText(point: number): string {
  return `💎${getTextOfApproximateInteger(point)}`;
}
export function isAccumulatedType(mission: Mission): boolean {
  return mission.type !== MISSION_TYPE_MULTI_CORRECT && mission.type !== MISSION_TYPE_MULTI_FAST_CORRECT;
}
