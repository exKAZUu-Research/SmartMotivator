// @flow

import { BoolMapper, DateListMapper, IntMapper, ObjectMapper, StringMapper } from './storage_mapper/';
import * as KEYS from './global_storage_keys';

import type { StartupRecord } from '../components/startup/RegistrationComponent';
import type { DailyStatistics, SurveyAnswer } from '../types';

export const migrationVersion = new IntMapper('migrationVersion');
export const userId = new StringMapper(KEYS.KEY_USER_ID);

export const surveyAnswer1: ObjectMapper<SurveyAnswer> = new ObjectMapper('surveyAnswer1');
export const surveyAnswer2: ObjectMapper<SurveyAnswer> = new ObjectMapper('surveyAnswer2');

export const dailyStatistics: ObjectMapper<DailyStatistics> = new ObjectMapper('dailyStatistics');
export const startupCache: ObjectMapper<StartupRecord> = new ObjectMapper('startupCache');
export const lastQuizGenre = new StringMapper('lastQuizGenre');
export const alarmTimeList = new DateListMapper('alarmTimeList');

export const configurationFinished: BoolMapper = new BoolMapper('configurationFinished');
export const pretestFinished: BoolMapper = new BoolMapper('pretestFinished');
export const posttestFinished: BoolMapper = new BoolMapper('posttestFinished');
