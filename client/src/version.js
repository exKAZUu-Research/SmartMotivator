// @flow

type Courses = 'english' | 'informatics';

const VERSION = require('../package.json').version;

export const IS_STAGING = true;
export const FULL_VERSION = VERSION + (IS_STAGING ? '-beta' : '') + (__DEV__ ? ' (DEV)' : '');

export const FIXED_COURSE: Courses | null = null;

const ANDROID_APP_ID = 'com.willingring.quiz';
export const ANDROID_STORE_URI = 'https://play.google.com/store/apps/details?id=' + ANDROID_APP_ID;

const APPLE_APP_ID = 'id1186150118';
export const APPLE_STORE_URI = 'itms-apps://itunes.apple.com/app/' + APPLE_APP_ID;
