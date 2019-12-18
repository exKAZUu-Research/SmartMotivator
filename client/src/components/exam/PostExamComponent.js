// @flow
import React from 'react';

import { ExamComponent } from './ExamComponent';

import type { UserInfo } from '../../types';

type Props = {
  myInfo: UserInfo,
  finish: () => any,
};
export function PostExamComponent(props: Props) {
  return <ExamComponent {...props} post={true} />;
}
