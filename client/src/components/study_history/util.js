// @flow

import type { OneStatistics, StatisticsKind, StatisticsSet, StatisticsTuple } from '../../types';

import { D, i18n } from '../../i18n/index';

export const KINDS: StatisticsKind[] = ['count', 'rate', 'spentTime', 'memorizedWord'];

export const LABEL: StatisticsSet<string> = {
  rate: i18n(D().common.correctRate),
  count: i18n(D().common.correctCount),
  spentTime: i18n(D().common.spentTime),
  memorizedWord: i18n(D().common.memorized),
};

export const UNIT: StatisticsSet<string> = {
  rate: i18n(D().common.unit.correctRate),
  count: i18n(D().common.unit.correctCount),
  spentTime: i18n(D().common.unit.avgSpentTime),
  memorizedWord: i18n(D().common.unit.memorized),
};

export const LIMIT: StatisticsSet<number> = {
  rate: 100,
  count: 100000,
  spentTime: 600,
  memorizedWord: 100000,
};

export function getDefaultStatData(): StatisticsTuple {
  return {
    rate: { goal: null, value: 0, rank: 0 },
    count: { goal: null, value: 0, rank: 0 },
    spentTime: { goal: null, value: 0, rank: 0 },
    memorizedWord: { goal: null, value: 0, rank: 0 },
  };
}

export function normalizeStatValue(value: number, kind: string): number {
  switch (kind) {
    case 'rate':
      return value * 100;
    case 'count':
    case 'memorizedWord':
      return value;
    case 'spentTime':
      return value / 1000;
  }
  console.error('unreachable');
  return 0;
}

export function getTextOfStatValue(value: number | null, tab: StatisticsKind): string {
  if (value === null) return '-';

  switch (tab) {
    case 'rate':
      return (value * 100).toFixed(0) + UNIT[tab];
    case 'count':
      return value + UNIT[tab];
    case 'spentTime':
      return (value / 1000).toFixed(1) + UNIT[tab];
    case 'memorizedWord':
      return value + UNIT[tab];
  }
  console.error('unreachable');
  return '?';
}

export function asRank(value: number | null): string {
  if (value == null) return '-';
  return `${value.toFixed(0)}${i18n(D().common.unit.rank)}`;
}

export function biggerIsBetterKind(kind: StatisticsKind): boolean {
  switch (kind) {
    case 'rate':
      return true;
    case 'count':
      return true;
    case 'spentTime':
      return false;
    case 'memorizedWord':
      return true;
  }
  console.error('unreachable');
  return false;
}

export function reachGoal(kind: StatisticsKind, record: OneStatistics): boolean {
  const biggerIsBetter = biggerIsBetterKind(kind);
  return (
    record != null &&
    record.goal != null &&
    record.value != null &&
    (biggerIsBetter ? record.value >= record.goal : record.value <= record.goal)
  );
}
