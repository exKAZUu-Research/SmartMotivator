// @flow

import moment from 'moment';
import React from 'react';
import { Text, View } from 'react-native';

import { D, i18n } from '../../i18n/index';
import * as storage from '../../models/typed_storage';

type State = {| timeList: Date[] |};

export class AlarmMessageComponent extends React.Component {
  props: {};
  state: State = { timeList: [] };

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps() {
    this.refresh();
  }

  async refresh() {
    const timeList = await storage.alarmTimeList.getNonNull();
    this.setState({ timeList });
  }

  render() {
    const { timeList } = this.state;
    if (timeList.length === 0) {
      return (
        <View>
          <Text>{i18n(D().alarm.alarmMessage.unavailable)}</Text>
        </View>
      );
    }
    const time = timeList.map(date => moment(date).format('HH:mm')).join(', ');
    const msg = i18n(D().alarm.alarmMessage.available, { time });
    return (
      <View>
        <Text>{msg}</Text>
      </View>
    );
  }
}
