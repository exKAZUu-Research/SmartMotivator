// @flow

import _ from 'lodash';
import moment from 'moment';
import 'moment/locale/ja';

import { AsyncStorage } from 'react-native';

import { JA_DICTIONARY, SKELETON_DICTIONARY } from './ja';
import { EN_DICTIONARY } from './en';

export let LANG = 'ja';

export async function loadLang(): Promise<void> {
  const lang = await AsyncStorage.getItem('lang');
  if (lang) {
    LANG = lang;
  }
  moment.locale(LANG);
}

export function setLang(lang: 'ja' | 'en'): Promise<void> {
  LANG = lang;
  moment.locale(LANG);
  return AsyncStorage.setItem('lang', lang);
}

type Dic = typeof SKELETON_DICTIONARY;
export function D(): Dic {
  if (LANG === 'en') {
    return EN_DICTIONARY;
  }
  return JA_DICTIONARY;
}

export function i18n(templateStringOrArray: string | string[], params: any): string {
  const template = Array.isArray(templateStringOrArray) ? _.sample(templateStringOrArray) : templateStringOrArray;
  return _.template(template)(params);
}
