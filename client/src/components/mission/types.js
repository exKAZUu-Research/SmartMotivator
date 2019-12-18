// @flow

export type MissionType = 'answer' | 'correct' | 'fastCorrect' | 'multiCorrect' | 'multiFastCorrect' | 'memorized';
export type Mission = {
  uuid: string,
  type: MissionType,
  startValue: number,
  goalValue: number,
  quizCount: number,
  threshold: number,
  reward: number,
  isShort: boolean,
  earned?: number,
};

export type MissionInfo = {
  point: number,
  missions: Mission[],
  rank: number,
  rankingName: string,
  highscoreRank: number,
  level: number,
  bonus: number,
  levelPointRange: { max: number, min: number },
  counts: { [countKey: string]: number },
  missionClearedToday: boolean,
};

export type FinishedMission = {
  mission: Mission,
  finishedAt: number,
};

export type MissionRankingUser = {
  id: string,
  name: string,
  point: number,
  rank: number,
};

export type DailyPointRanking = {
  ranking: { date: string, point: number }[],
  current: number,
};
