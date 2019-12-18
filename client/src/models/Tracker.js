// @flow

import _ from 'lodash';
import moment from 'moment';

import { sendEventLog } from './connection';

const historyStack = [];

class Tracker {
  trackScreenViewOnTabChange(screenName: string) {
    historyStack.pop();
    historyStack.push(screenName);
    this.trackScreenView(screenName);
  }

  trackScreenViewNoTabs(screenName: string) {
    historyStack.push(screenName);
    this.trackScreenView(screenName);
  }

  trackScreenViewWithTabs(screenName: string) {
    historyStack.push(screenName);
  }

  trackScreenViewOnDismount() {
    historyStack.pop();
    if (historyStack.length > 0) {
      this.trackScreenView(historyStack[historyStack.length - 1]);
    }
  }

  trackScreenView(screenName: string) {
    return sendEventLog('screen_view', screenName, null, moment());
  }

  trackEvent(category: string, action: string, optionalValues?: { label?: string, value?: number, data?: any }) {
    return sendEventLog(category, action, _.get(optionalValues, 'label'), _.get(optionalValues, 'data'));
  }
}

export const tracker = new Tracker();
