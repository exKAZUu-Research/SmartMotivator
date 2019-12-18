// @flow

import moment from 'moment';
import React from 'react';
import { AppState, AsyncStorage, NetInfo } from 'react-native';

import { TopComponent } from './top/TopComponent';
import { resend } from '../models/connection';
import { getOrInitDBValue } from '../models/util';
import { YMD } from '../models/date_util';
import { Observable } from '../models/Observable';
import { tracker } from '../models/Tracker';

import type { Navigator, ObservableData, UserInfo } from '../types';

const KEY_LAST_LAUNCH_DATE = 'lastLaunchDate';
const KEY_LAUNCH_COUNT = 'launchCount';

type Props = {|
  myInfo: UserInfo,
  configurationFinished: boolean,
  pretestFinished: boolean,
  posttestFinished: boolean,
  screenNav: Navigator<void>,
|};

export class MainComponent extends React.Component {
  observableData: ObservableData;
  props: Props;
  state: void;

  static navigationOptions = {
    header: null,
  };

  constructor(props: Props) {
    super(props);

    const { myInfo } = this.props;
    this.observableData = {
      myInfo: new Observable(myInfo),
      configurationFinished: new Observable(this.props.configurationFinished),
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    this.initialize();
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  async checkAppLaunchAchievement() {
    const today = moment().startOf('day');
    const yesterday = moment()
      .startOf('day')
      .subtract(1, 'day');
    const past = moment()
      .startOf('day')
      .subtract(10, 'days');
    const lastLaunchDate = await getOrInitDBValue(KEY_LAST_LAUNCH_DATE, () => past.format(YMD));
    const launchCount = await getOrInitDBValue(KEY_LAUNCH_COUNT, () => '0');
    if (moment(lastLaunchDate, YMD).isBefore(today)) {
      const newLaunchCount = moment(lastLaunchDate, YMD).isSame(yesterday) ? parseInt(launchCount) + 1 : 1;
      // const p1 = achieveAppLaunch(this.observableData, newLaunchCount);
      return AsyncStorage.multiSet([
        [KEY_LAUNCH_COUNT, `${newLaunchCount}`],
        [KEY_LAST_LAUNCH_DATE, today.format(YMD)],
      ]);
    }
  }

  handleAppStateChange(appState: string) {
    if (appState === 'active') {
      tracker.trackEvent('app', 'relaunch', { data: moment() });
    }
    if (appState === 'background') {
      tracker.trackEvent('app', 'background', { data: moment() });
    }
  }

  handleConnectivityChange(isConnected: boolean) {
    if (isConnected) {
      return resend();
    }
  }

  async initialize() {
    await tracker.trackEvent('app', 'launch', { data: moment() });
    await resend();
  }

  render() {
    const { pretestFinished, posttestFinished, screenNav } = this.props;
    return (
      <TopComponent
        screenNav={screenNav}
        pretestFinished={pretestFinished}
        posttestFinished={posttestFinished}
        observableData={this.observableData}
      />
    );
  }
}
