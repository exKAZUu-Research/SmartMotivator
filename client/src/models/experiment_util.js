// @flow

import type { ExperimentMode } from '../types';

export const CURRENT_EXPERIMENT_MODES: ExperimentMode[] = ['current', 'design', 'noExam', 'minimal'];

export function isInCurrectExperiment(experimentMode: ExperimentMode | null) {
  return experimentMode && CURRENT_EXPERIMENT_MODES.includes(experimentMode);
}
