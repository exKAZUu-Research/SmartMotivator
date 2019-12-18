// @flow

import type { MissionInfo } from '../mission/types';

export type Answer = {
  quizKey: string,
  correct: boolean,
  spentTime: number,

  answerIndex?: number | null,
  answerText?: string | null,
};

export type AnswerStats = {|
  quizKey: string,
  memorized: number,
|};

export type AnswerWithStats = AnswerStats & Answer;

export type QuizFinishedInfo = {|
  stats: AnswerStats[],
  completedNow: boolean,
|};

export type Result = {|
  memorizedAllQuizzes: boolean,
  answers: Answer[],
|};

export type MemorizedQuizInfo = {|
  key: string,
  label: string,
  consecutiveCorrectCount: number,
  memorized: boolean,
|};

// ----- ----- ----- ----- New API ----- ----- ----- -----

export type CourseInfo = {
  key: string,
  label: string,
};

export type QuizSet = {
  course: string,
  genre: string,
  label: string,
  memorized: number,
  correct: number,
  answered: number,
  total: number,
};

export type FetchedImage = { url: string, width: number, height: number };

export type QuizItem = {
  key: string,
  label: string,
  hijack: ?string,
  preText: ?string,
  problem: string,
  inputType: string,
  answers: string[],
  answerSize: ?number,
  correctIndex: number,
  shuffle: boolean,
  commentaryLabel: ?string,
  commentary: ?string,
  defaultPercentage: ?number,
  font: ?string,
  images: ?{ [name: string]: string },

  // ---- サーバーで動的に
  correctCount: number,
  totalCount: number,

  // ---- クライアントで生成
  shuffledIndexes?: number[],
  fetchedImages?: { [name: string]: FetchedImage },
};

export type QuizFinishedInfo2 = {
  quizItems: QuizItem[],
  answers: Answer[],
  memorizedAllQuizzes: boolean,
  missionInfos: MissionInfo[],
};

export type PreTestQuiz = {
  label: string,
  quizzes: QuizItem[],
};
