// @flow

import type { NavigationAction, NavigationScreenProp } from 'react-navigation';

import { Observable } from './models/Observable';

/* ==== ==== ==== ==== general ==== ==== ==== ==== */

export type Id<T> = (x: T) => T;
export type Map<V, K = string> = { [key: K]: V };

/* ==== ==== ==== ==== myInfo ==== ==== ==== ==== */

export type SupportLanguages = 'ja' | 'en';

export type UserSettings = {
  pointType: 'absolute' | 'self' | 'other',
  positiveFraming: boolean,
  praiseEffort: boolean,
  growthResetEveryHour: boolean,
};

type UserRole = '' | 'id_auth' | 'specific_email' | 'trial' | 'developer';
export type ExperimentMode = 'current' | 'design' | 'noExam' | 'minimal';

/* ---- ---- componentsVisited ---- ---- */

export type ComponentsVisited = {
  quizChartComponent?: boolean,
  itQuizComponent?: boolean,
  itQuizComponent?: boolean,
  studyHistoryComponent?: boolean,
  rankingComponent?: boolean,
  pointComponent?: boolean,
  followComponent?: boolean,
  mciiComponent?: boolean,
  alarmComponent?: boolean,
  configurationComponent?: boolean,
  calendarComponent?: boolean,
  pointRankingComponent?: boolean,
};

type UserSchool = {
  id: string,
  name: string,
};

export type UserInfo = {
  id: string,
  name: string,
  email: string,
  course: string,
  courseName: string,
  role: UserRole,
  ready: boolean,
  setting: UserSettings,
  icon: string,
  color: string,
  introduction: string,
  experimentMode: ExperimentMode | null,
  experimentEndDay: ExperimentMode | null,
  schoolId: string | null,
  school: UserSchool | null,
};

/* ==== ==== ==== ==== study history ==== ==== ==== ==== */

export type StatisticsSet<T> = {
  rate: T,
  count: T,
  spentTime: T,
  memorizedWord: T,
};
export type OneStatistics = {
  goal: number | null,
  value: number | null,
  rank: number,
};
export type StatisticsTuple = StatisticsSet<OneStatistics>;
export type StatisticsList = {
  [key: string]: StatisticsTuple,
  numOfUsers: number,
};
export type StatisticsKind = $Keys<StatisticsSet<void>>;
export type DailyStatistics = {
  [date: string]: StatisticsTuple,
};

/* ==== ==== ==== ==== user ==== ==== ==== ==== */

export type UserSearch = {
  id: string,
  name: string,
  icon: string,
  color: string,
  introduction: string,
  lastAccess: string,
  // course: string,
  muted: boolean,
  point: number,
};

export type UserFollow = UserSearch & {
  point: number,
  correctAns: number,
};

export type UserFollowDetail = UserFollow & {
  percentCorrectAns: number,
  avgSpeed: number,
  followed: boolean,
};

/* ==== ==== ==== ==== MCII ==== ==== ==== ==== */

export type Obstacle = string | null;
export type Behavior = string | null;
export type IfThenPlan = {
  obstacle: Obstacle,
  behavior: Behavior,
};
export type MCII = {
  wish: string | null,
  outcome: string | null,
  ifThenPlans: IfThenPlan[],
};

/* ==== ==== ==== ==== survey ==== ==== ==== ==== */

export type SurveyKind = 'survey' | 'survey2';
export type SurveyAnswerContent = (string | number)[];
export type SurveyAnswer = {
  startedAt: number,
  content: SurveyAnswerContent,
  resumedAt: number,
  finishedAt: number,
  isSent: boolean,
};

/* ==== ==== ==== ==== ranking ==== ==== ==== ==== */

export type UserRankingInfo = {
  id: string,
  name: string,
  icon: string,
  color: string,
  lastAccess: string,
  point: number,
};

export type PointRanking = {
  name: string,
  topUsers: UserRankingInfo[],
  rivalUsers: UserRankingInfo[] | null,
  rivalTopRank: number,
  hiddenRivalCount: number,
};

/* ==== ==== ==== ==== school ==== ==== ==== ==== */

export type School = {
  id: string,
  contactText: string,
};

/* ==== ==== ==== ==== UserData ==== ==== ==== ==== */
export type UserData<T> = {
  value: T,
  time: string,
};

/* ==== ==== ==== ==== util ==== ==== ==== ==== */

export type Storage<T> = {
  get(): Promise<T | null>,
  set(v: T): Promise<void>,
};

export type ObservableData = {
  myInfo: Observable<UserInfo>,
  // componentsVisited: Observable<ComponentsVisited>,
  configurationFinished: Observable<boolean>,
};

/* ==== ==== ==== ==== Navigation ==== ==== ==== ==== */

type NavigationParams<T> = { params: T };

export type Navigator<T> = NavigationScreenProp<NavigationParams<T>, NavigationAction>;
