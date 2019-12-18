// @flow

import React from 'react';
import { Text, View } from 'react-native';

import { dig } from '../../models/util';
import { startOfWeekStr } from '../../models/date_util';
import { receiveStatisticsEx } from '../../models/connection';

import type { OneStatistics, UserInfo } from '../../types';

import { D, i18n } from '../../i18n/index';

type Props = {|
  myInfo: UserInfo,
  defaultMessage: string,
|};

type State = {|
  record: OneStatistics | null,
|};

export class StudyHistoryMessageComponent extends React.Component {
  props: Props;
  state: State = { record: null };

  componentDidMount() {
    this.refresh();
  }

  async refresh() {
    const response = await receiveStatisticsEx(this.props.myInfo.id);
    if (response.success) {
      const statistics = response.data;
      const weekYMD = startOfWeekStr(0);
      const record: OneStatistics = dig(statistics, weekYMD, 'count');
      this.setState({ record });
    } else {
      this.setState({ record: null });
    }
  }

  render() {
    const record = this.state.record;
    if (record != null && record.goal != null) {
      const diff = record.goal - (record.value || 0);
      if (diff > 0) {
        return (
          <View>
            <Text>{i18n(D().studyHistory.studyHistoryTable.notYetAchieved, { diff })}</Text>
          </View>
        );
      } else {
        return (
          <View>
            <Text>{i18n(D().studyHistory.studyHistoryTable.alreadyAchieved)}</Text>
          </View>
        );
      }
    }
    return (
      <View>
        <Text>{this.props.defaultMessage}</Text>
      </View>
    );
  }
}
