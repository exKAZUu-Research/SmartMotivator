// @flow

import { AsyncStorage, Platform } from 'react-native';

import * as storage from './typed_storage';
import { saveIntoList } from './util';
import { FIXED_COURSE, FULL_VERSION, IS_STAGING } from '../version';

import type {
  ExperimentMode,
  PointRanking,
  School,
  UserData as ServerUserData,
  StatisticsList,
  SurveyAnswer,
  SurveyKind,
  UserFollow,
  UserFollowDetail,
  UserInfo,
  UserSearch,
  UserSettings,
} from '../types';
import type { DailyPointRanking, Mission, MissionInfo } from '../components/mission/types';
import type { ResponseP } from './connection_type';
import type {
  Answer,
  AnswerWithStats,
  CourseInfo,
  MemorizedQuizInfo,
  PreTestQuiz,
  QuizFinishedInfo,
  QuizItem,
  QuizSet,
} from '../components/quiz/types';

const LOCAL_URL_IOS = 'http://localhost:3000';
const LOCAL_URL_ANDROID = 'http://10.0.2.2:3000';
const STAGING_URL = '';
const PRODUCTION_URL = '';

export const SERVER_URL = __DEV__
  ? Platform.select({ android: LOCAL_URL_ANDROID, ios: LOCAL_URL_IOS })
  : IS_STAGING ? STAGING_URL : PRODUCTION_URL;

const SEND_BUFFER_KEY = 'connection.buffer';

type UserData = {};

/* ===== ===== ===== ===== GET ===== ===== ===== ===== */

export function receiveServerStatusEx(): ResponseP<void> {
  return getEx('', 'status.json');
}

export function receiveMyInfoEx(userId: string): ResponseP<UserInfo> {
  return getEx(userId, `users/${userId}.json`);
}

export function receiveStatisticsEx(userId: string): ResponseP<StatisticsList> {
  return getEx(userId, `study_histories.json?userId=${userId}`);
}

export function receiveRecommendedSettingEx(userId: string): ResponseP<UserSettings> {
  return getEx(userId, `users/${userId}/recommended_setting.json`);
}

// call GET -> api/users#search_user
export function receiveSearchUserEx(userId: string, query: string): ResponseP<UserSearch[]> {
  return getEx(userId, `users/${userId}/search.json?query=${query}`);
}

// call GET -> api/users#show_following
export function receiveFollowingEx(userId: string): ResponseP<UserFollow[]> {
  return getEx(userId, `users/${userId}/following.json`);
}

// call GET -> api/users#show_user_details
export function receiveUserDetailsEx(myId: string, selectedUserId: string): ResponseP<UserFollowDetail> {
  return getEx(myId, `users/${myId}/user_details.json?selected_user_id=${selectedUserId}`);
}

export function receiveQuizStatsEx(userId: string): ResponseP<QuizSet[]> {
  return getEx(userId, `new_quizzes/progress.json?userId=${userId}`);
}

export function receiveQuizCourseEx(userId: string): ResponseP<CourseInfo[]> {
  return getEx(userId, `new_quizzes/courses.json?userId=${userId}`);
}

export function receiveQuizListEx(userId: string, course: string, genre: string): ResponseP<QuizItem[]> {
  return getEx(userId, `new_quizzes/${course}/${genre}.json?userId=${userId}`);
}

export function receiveMemorizedQuizEx(userId: string, course: string, genre: string): ResponseP<MemorizedQuizInfo[]> {
  return getEx(userId, `new_quizzes/${course}/${genre}/memorized.json?userId=${userId}`);
}

export function receiveSchool(userId: string, schoolId: string): ResponseP<School> {
  return getEx(userId, `schools/${schoolId}.json?userId=${userId}`);
}

export function receiveMissionInfo(userId: string): ResponseP<MissionInfo> {
  return getEx(userId, `mission.json?userId=${userId}`);
}

export function receiveMissionRankingInfo(userId: string, top: number, around: number): ResponseP<PointRanking> {
  return getEx(userId, `mission/ranking.json?userId=${userId}&top=${top}&around=${around}`);
}

export function receiveMissionSelfRanking(userId: string, size: number): ResponseP<DailyPointRanking> {
  return getEx(userId, `mission/self_ranking.json?userId=${userId}&size=${size}`);
}

export function receiveMissionHistory(userId: string): ResponseP<ServerUserData<Mission>[]> {
  return getEx(userId, `user_data/mission.json?userId=${userId}`);
}

function getEx<T, E>(userId: string, path: string): ResponseP<T, E> {
  return fetchEx(`${SERVER_URL}/${path}`, {
    method: 'GET',
    headers: buildHeader(false, userId),
  });
}

/* ===== ===== ===== ===== POST ===== ===== ===== ===== */

export function createUserEx(id: string, opts: Object = {}): ResponseP<UserInfo> {
  const user = { id, course: FIXED_COURSE, ...opts };
  return postEx(id, 'users.json', { user });
}

type ByEmailError = { field: 'email' };
export function createUserByEmailEx(email: string): ResponseP<void, ByEmailError> {
  return postEx(null, 'users.json', { user: { email, course: FIXED_COURSE } });
}

export function confirmUserByEmailAndPasscodeEx(email: string, passcode: string): ResponseP<UserInfo> {
  return postEx(null, 'users.json', { user: { email, passcode } });
}

type LoginError = { field: string, message: string };
export function loginUserWithIdAndPasswordEx(loginId: string, password: string): ResponseP<UserInfo, LoginError> {
  return postEx(null, 'users.json', { user: { loginId, password, course: FIXED_COURSE } });
}

export function updateStudyHistoryEx(userId: string, data: Object): ResponseP<void> {
  return postEx(userId, 'study_histories.json', { userId, data });
}

export function updateMissionInfo(userId: string, answers: AnswerWithStats[]): ResponseP<MissionInfo[]> {
  return postEx(userId, `mission.json`, { userId, answers });
}

export function postQuizStart(userId: string, course: string, genre: string): ResponseP<QuizItem[]> {
  return postEx(userId, `new_quizzes/${course}/${genre}/start.json?userId=${userId}`, {});
}

export function postExam1Start(userId: string): ResponseP<PreTestQuiz[]> {
  return postEx(userId, `new_quizzes/start_pretest.json?userId=${userId}`, {});
}

export function postExam1Result(data: Answer[], post: boolean): Promise<boolean> {
  const kind = post ? 'exam2' : 'exam1';
  return send(kind, JSON.stringify(data), true);
}

export function postQuizResultEx(
  userId: string,
  course: string,
  genre: string,
  answers: Answer[]
): ResponseP<QuizFinishedInfo> {
  return postEx(userId, `quizzes/${course}/${genre}.json?userId=${userId}`, {
    answers,
    time: Date.now(),
  });
}

function postEx<T, E>(userId: string | null, path: string, body: Object): ResponseP<T, E> {
  return fetchEx(`${SERVER_URL}/${path}`, {
    method: 'POST',
    headers: buildHeader(true, userId),
    body: JSON.stringify(body),
  });
}

/* ----- ----- ----- ----- send userdata ----- ----- ----- ----- */

export async function sendSurvey(answer: SurveyAnswer, surveyType: SurveyKind): Promise<boolean> {
  const success = await sendSurveyMetaInfo(answer, surveyType);
  if (success) {
    return send(surveyType, JSON.stringify(answer.content), false /* no buffer */);
  } else {
    return false;
  }
}

export function sendEventLog(
  category: string,
  action: string | null = null,
  label: string | null = null,
  data: any = null
): Promise<boolean> {
  return send('event', JSON.stringify({ category, action, label, data }), true);
}

export async function resend(): Promise<boolean> {
  const userId: string = await getUserId();
  const buffJSON = await AsyncStorage.getItem(SEND_BUFFER_KEY);
  if (!buffJSON) {
    return false;
  }
  await AsyncStorage.removeItem(SEND_BUFFER_KEY);
  const buff: UserData[] = JSON.parse(buffJSON);
  return sendCore(userId, buff, true);
}

async function send(kind: string, value: string, buffer: boolean): Promise<boolean> {
  const userId: string = await getUserId();
  const time = Date.now();
  const sendData: UserData = { userId, kind, value, time_msec: time };
  return sendCore(userId, [sendData], buffer);
}

async function sendCore(userId: string, data: UserData[], buffer): Promise<boolean> {
  if (data.length === 0) return true;
  let success = false;
  try {
    const response = await fetch(`${SERVER_URL}/user_data.json`, {
      method: 'POST',
      headers: buildHeader(true, userId),
      body: JSON.stringify({ data }),
    });
    success = response.ok;
  } catch (e) {
    if (buffer) {
      await saveIntoList(SEND_BUFFER_KEY, data);
      return true;
    }
    return false;
  }
  if (success) {
    await resend();
  }
  return success;
}

/* ===== ===== ===== ===== UPDATE ===== ===== ===== ===== */

type UpdateMyInfo = {
  name?: string,
  ready?: boolean,
  setting?: any,
  course?: string,
  icon?: string,
  color?: string,
  introduction?: string,
  experimentMode?: ?ExperimentMode,
};
export function updateMyInfoEx(userId: string, myInfoPatch: UpdateMyInfo, rest: Object = {}): ResponseP<UserInfo> {
  return putEx(userId, `users/${userId}.json`, { user: myInfoPatch, ...rest });
}

export async function sendSurveyMetaInfo(answer: SurveyAnswer, surveyType: SurveyKind): Promise<boolean> {
  if (surveyType !== 'survey') return true;
  const userId = await getUserId();
  const { startedAt, resumedAt, finishedAt } = answer;
  const survey = { startedAt, resumedAt, finishedAt };
  const response = await updateMyInfoEx(userId, {}, { survey });
  return response.success;
}

export function updateFollowEx(myId: string, followId: string): ResponseP<void> {
  return putEx(myId, `users/${myId}/toggle_follow.json?follow_id=${followId}`, {});
}

export function updateMuteEx(myId: string, muteeId: string): ResponseP<void> {
  return putEx(myId, `users/${myId}/toggle_mute.json?mutee_id=${muteeId}`, {});
}

function putEx<T, E>(userId: string | null, path: string, body: Object): ResponseP<T, E> {
  return fetchEx(`${SERVER_URL}/${path}`, {
    method: 'PUT',
    headers: buildHeader(true, userId),
    body: JSON.stringify(body),
  });
}

/* ===== ===== ===== ===== DELETE ===== ===== ===== ===== */

export function deleteQuizStatsEx(userId: string): ResponseP<QuizSet[]> {
  return deleteEx(userId, `new_quizzes/progress.json?userId=${userId}`);
}

function deleteEx<T, E>(userId: string, path: string): ResponseP<T, E> {
  return fetchEx(`${SERVER_URL}/${path}`, {
    method: 'DELETE',
    headers: buildHeader(false, userId),
  });
}

/* ===== ===== ===== ===== MISC ===== ===== ===== ===== */

type FetchOption =
  | { method: 'GET' | 'DELETE', headers: { [string]: string } }
  | { method: 'POST' | 'PUT', headers: { [string]: string }, body: string };
async function fetchEx<T, E>(path: string, option: FetchOption): ResponseP<T, E> {
  let response;
  try {
    response = await fetch(path, option);
  } catch (e) {
    return { success: false, error: 'offline' };
  }
  if (response.ok) {
    if (response.status === 204) {
      const data: T = (undefined: any);
      return { success: true, data };
    }
    const data: T = await response.json();
    return { success: true, data };
  }
  console.log({ status: response.status });
  if (response.status === 403) {
    return { success: false, error: 'forbidden' };
  }
  if (response.status >= 500) {
    return { success: false, error: 'internalServerError' };
  }
  if (response.status === 404) {
    return { success: false, error: 'notFound' };
  }
  const data: E = await response.json();
  return { success: false, error: 'badRequest', data };
}

function getUserId(): Promise<string> {
  return storage.userId.getNonNull();
}

type CUSTOM_HTTP_HEADER = {
  Accept: string,
  'Content-Type'?: string,
  'X-USER-ID'?: string,
  'X-CLIENT-VERSION'?: string,
};

function buildHeader(hasBody: boolean, userId: string | null): CUSTOM_HTTP_HEADER {
  const header: CUSTOM_HTTP_HEADER = {
    Accept: 'application/json',
    'X-CLIENT-VERSION': FULL_VERSION,
  };
  if (hasBody) {
    header['Content-Type'] = 'application/json';
  }
  if (userId) {
    header['X-USER-ID'] = userId;
  }
  return header;
}
