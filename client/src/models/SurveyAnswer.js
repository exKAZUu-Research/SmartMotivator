// @flow

import type { SurveyAnswer } from '../types';

export function buildSurveyAnswer(): SurveyAnswer {
  return {
    startedAt: 0,
    content: [],
    finishedAt: 0,
    resumedAt: 0,
    isSent: false,
  };
}
