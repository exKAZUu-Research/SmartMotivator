// @flow

import moment from 'moment';
import React from 'react';
import { Text, View } from 'react-native';

import { Table } from '../design/Table';
import { DefaultScrollView } from '../design/DefaultScrollView';
import { READABLE_TIME } from '../../models/date_util';
import { getApproximatePointText, missionTitle } from './util';
import { GS } from '../style';
import { D, i18n } from '../../i18n/index';
import { CalendarComponent } from './CalendarComponent';
import { tracker } from '../../models/Tracker';

import type { FinishedMission } from './types';
import type { Navigator, UserInfo } from '../../types';

type NavParams = {|
  myInfo: UserInfo,
|};

type Props = {|
  navigation: Navigator<NavParams>,
|};

type State = {|
  finishedMissions: FinishedMission[],
|};

export class MissionHistoryScreen extends React.Component {
  props: Props;
  state: State = { finishedMissions: [] };

  componentDidMount() {
    tracker.trackScreenViewNoTabs('missionHistoryScreen');
  }

  renderPoint(value: number | null | void) {
    return value == null ? '💎 ?' : getApproximatePointText(value);
  }
  renderSummary() {
    const allData = this.state.finishedMissions;
    let ambiguous = false;
    let totalPoint = 0;
    for (const data of allData) {
      const point = data.mission.earned;
      if (point == null) {
        ambiguous = true;
      } else {
        totalPoint += point;
      }
    }
    return (
      <Text style={[GS.margin10, GS.infoBox, GS.padding5]}>
        {i18n(D().mission.missionHistory.missionCount)}: {allData.length}、
        {i18n(D().mission.missionHistory.totalPoint)}: {this.renderPoint(ambiguous ? null : totalPoint)}
      </Text>
    );
  }
  renderTable() {
    const toValues = [
      data => moment(data.finishedAt).format(READABLE_TIME),
      data => missionTitle(data.mission, false),
      data => this.renderPoint(data.mission.earned),
    ];
    const labels = [
      i18n(D().mission.missionHistory.achievedTime),
      i18n(D().mission.missionHistory.missionName),
      i18n(D().mission.missionHistory.point),
    ];
    const flexes = [2, 3, 2];
    const aligns = ['center', 'left', 'center'];
    return (
      <Table
        data={this.state.finishedMissions}
        labels={labels}
        toValues={toValues}
        flexes={flexes}
        aligns={aligns}
        noData={i18n(D().mission.missionHistory.noRecord)}
      />
    );
  }
  render() {
    return (
      <View style={GS.flex}>
        <View style={[GS.flex2]}>
          <CalendarComponent
            onSelectDate={(date, finishedMissions) => this.setState({ finishedMissions })}
            myInfo={this.props.navigation.state.params.myInfo}
          />
        </View>
        <View style={GS.flex3}>
          <DefaultScrollView style={GS.flex}>
            {this.renderSummary()}
            {this.renderTable()}
          </DefaultScrollView>
        </View>
      </View>
    );
  }
}
