// @flow

import { D, i18n } from '../../../i18n/index';

export const COURSE_ENGLISH = 'english';
export const COURSE_ITPASS = 'itpassport';
export const COURSE_IT = 'informatics';

export const INITIAL_COURSES = [COURSE_ENGLISH, COURSE_ITPASS, COURSE_IT];

export const COURSES_NAMES = {
  [COURSE_ENGLISH]: i18n(D().startup.registration.courses.english),
  [COURSE_ITPASS]: i18n(D().startup.registration.courses.itpassport),
  [COURSE_IT]: i18n(D().startup.registration.courses.informatics),
};
