// @flow
import React from 'react';

import { ExamComponent } from './ExamComponent';

import type { UserInfo } from '../../types';

type Props = {
  myInfo: UserInfo,
  finish: () => any,
};
export function PreExamComponent(props: Props) {
  return <ExamComponent {...props} post={false} />;
}
