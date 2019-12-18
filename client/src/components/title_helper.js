// @flow

import _ from 'lodash';

import { D, i18n } from '../i18n/index';

const REQUIRED_POINTS = [30, 60, 90, 110, 130, 140, 150, 160];

type Bounds = { min: number, max: number };

/** zero start */
export function getLevel(point: number): number {
  let totalRequiredPoint = 0;
  for (let i = 0; i < REQUIRED_POINTS.length; i++) {
    totalRequiredPoint += REQUIRED_POINTS[i];
    if (point < totalRequiredPoint) {
      return i;
    }
  }
  return (point - totalRequiredPoint) / _.last(REQUIRED_POINTS);
}

export function getBoundsFromLevel(level: number): Bounds {
  if (level < REQUIRED_POINTS.length) {
    return {
      min: _.sum(_.take(REQUIRED_POINTS, level)),
      max: _.sum(_.take(REQUIRED_POINTS, level + 1)),
    };
  } else {
    return {
      min: _.sum(REQUIRED_POINTS) + (level - REQUIRED_POINTS.length - 1) * _.last(REQUIRED_POINTS),
      max: _.sum(REQUIRED_POINTS) + (level - REQUIRED_POINTS.length) * _.last(REQUIRED_POINTS),
    };
  }
}

export function getTitleFromLevel(level: number): string {
  return i18n(D().titleHelper.title, { level });
}
