// @flow

import moment from 'moment';

export const YMD = 'YYYY-MM-DD';
export const READABLE_DATE = 'M月D日';
export const READABLE_DATETIME = 'M月D日 HH:mm:ss';
export const READABLE_TIME = 'HH:mm';
export const READABLE_DATEHOUR = 'M月D日 HH時';

export function startOfWeek(offsetWeek: number): moment {
  const base = moment()
    .startOf('day')
    .add(offsetWeek, 'week');
  return base.startOf('week'); // sunday
}

export function startOfWeekStr(offsetWeek: number): string {
  const day = startOfWeek(offsetWeek);
  return day.format(YMD);
}

export function todayStr(): string {
  const day = moment().startOf('day');
  // const day = moment().startOf('day').add(-1, 'day');
  return day.format(YMD);
}

export function weekText(startDate: moment): string {
  return (
    startDate.format(READABLE_DATE) +
    '～' +
    startDate
      .clone()
      .add(6, 'day')
      .format(READABLE_DATE)
  );
}
