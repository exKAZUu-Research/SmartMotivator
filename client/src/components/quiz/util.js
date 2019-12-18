// @flow

import { Image } from 'react-native';

import { openURL } from '../design/Link';
import { morisawaTextStyle } from '../design/Morisawa';
import { SERVER_URL } from '../../models/connection';

import type { FetchedImage, QuizItem } from './types';
import type { Map, Navigator } from '../../types';

export const INPUT_TYPE_KEYBOARD = 'keyboard';
export const INPUT_TYPE_TEXT = 'text';
export const INPUT_TYPE_KANA = 'kana';
export const INPUT_TYPE_BOOL = 'bool';
export const INPUT_TYPE_NUMBER = 'number';

export const EMBEDDED_CORRECT_RATE_THRESHOLD = 50;

export function isBottomButton(item: QuizItem) {
  return item.inputType !== INPUT_TYPE_KEYBOARD && item.inputType !== INPUT_TYPE_TEXT;
}

export async function fetchImage(images: Map<string>): Map<FetchedImage> {
  const fetchedImages = {};
  for (const key in images) {
    let url = images[key];
    if (!url) continue;
    if (url.indexOf('http') !== 0) {
      url = SERVER_URL + url;
    }
    try {
      const size = await new Promise((resolve, reject) => {
        Image.getSize(url, (width, height) => resolve({ width, height }), reject);
      });
      fetchedImages[key] = { url, width: size.width, height: size.height };
    } catch (e) {
      // skip
    }
  }
  return fetchedImages;
}

/*
export function nextDataset(currentDataset: QuizDataset): QuizDataset | null {
  const course = currentDataset.course;
  const list = QUIZ_DATASETS_IN_COURSES[course];
  if (list.length > 1) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].genre === currentDataset.genre) {
        return list[(i + 1) % list.length];
      }
    }
  }
  return null;
}
*/

export function getFont(item: QuizItem): * {
  return item.font === 'morisawa' ? morisawaTextStyle : null;
}

export function buildGoCommentary(item: QuizItem, nav: Navigator<*>): ?() => any {
  const text = item.commentary;
  if (!text) {
    return null;
  }
  if (text.indexOf('http') === 0) {
    return () => openURL(text);
  }
  if (item.inputType === INPUT_TYPE_BOOL) {
    return () => nav.navigate('LecResultScreen', { quiz: item });
  }
  return () => nav.navigate('SimpleTextScreen', { text });
}
