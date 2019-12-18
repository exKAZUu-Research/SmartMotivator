// @flow

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { Alert, Button, Platform, PushNotificationIOS, StyleSheet, Text, TimePickerAndroid, View } from 'react-native';
import PushNotification from 'react-native-push-notification';

import { updateVisitation } from '../util';
import { DefaultScrollView } from '../design/DefaultScrollView';
import { ButtonBox } from '../design/ButtonBox';
import { GS } from '../style';
import { D, i18n } from '../../i18n/index';
import * as storage from '../../models/typed_storage';
import { tracker } from '../../models/Tracker';

import type { Navigator } from '../../types';

const ALARM_MESSAGE = i18n(D().alarm.alarmConfig.alarmMessage);
const NOP = (_: any) => {};

type State = {|
  timeList: Date[],
  permitted: boolean,
|};

export class AlarmConfigScreen extends React.Component {
  props: { navigation: Navigator<*> };
  state: State = { timeList: [], permitted: true };

  componentDidMount() {
    const { observableData } = this.props.navigation.state.params;
    updateVisitation(observableData, 'alarmComponent');
    // You need this addEventListener() for requestPermissions() promise to resolve.
    // https://github.com/facebook/react-native/issues/9105
    tracker.trackScreenViewNoTabs(`alarm/config`);
    PushNotificationIOS.addEventListener('register', NOP);
    this.processPermissions();
    this.loadDB();
  }

  componentWillUnmount() {
    PushNotificationIOS.removeEventListener('register', NOP);
    tracker.trackScreenViewOnDismount();
    const { observableData } = this.props.navigation.state.params;
    observableData.myInfo.update(observableData.myInfo.get());
  }

  add(hour: number, minute: number): Promise<void> {
    const target = moment().startOf('day');
    target.set('hour', hour);
    target.set('minute', minute);

    return this.update(dateList => {
      const sameTimeExists = _.some(dateList, d => isSameTimeM(moment(d), target));
      if (sameTimeExists) {
        Alert.alert('', i18n(D().alarm.alarmConfig.sameDateError));
        return null;
      }
      dateList.push(target.toDate());
      return dateList;
    });
  }

  delete(index: number): Promise<void> {
    return this.update(dateList => {
      dateList.splice(index, 1);
      return dateList;
    });
  }

  inputTime() {
    if (Platform.OS === 'android') {
      return this.inputTimeAndroid();
    } else {
      return this.inputTimeIOS();
    }
  }

  async inputTimeAndroid() {
    const { action, hour, minute } = await TimePickerAndroid.open({ is24Hour: true });
    if (action !== TimePickerAndroid.dismissedAction) {
      this.add(hour, minute);
    }
  }

  async inputTimeIOS() {
    const onChange = (date: Date) => {
      this.props.navigation.goBack();
      setTimeout(() => {
        const input = moment(date);
        this.add(input.get('hour'), input.get('minute'));
      }, 0);
    };
    this.props.navigation.navigate('DatePickerScreen', { onChange });
  }

  async loadDB() {
    const timeList = await storage.alarmTimeList.getNonNull();
    this.setState({ timeList });
  }

  processPermissions() {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.checkPermissions(permissions => {
        if (!permissions.alert) {
          PushNotificationIOS.requestPermissions().then(() => {
            PushNotificationIOS.checkPermissions(permissions => {
              const permitted = !!permissions.alert;
              this.setState({ permitted });
            });
          });
        }
      });
    }
  }

  async update(f: (dateList: Date[]) => Date[] | null): Promise<void> {
    const oldTimeList = await storage.alarmTimeList.getNonNull();
    const newTimeList = f(oldTimeList);
    if (newTimeList === null) {
      return;
    }
    await storage.alarmTimeList.set(newTimeList);
    setAlarm(newTimeList);
    this.setState({ timeList: newTimeList });
  }

  renderRow(index: number, date: Date) {
    return (
      <View key={index} style={[GS.tableBody, GS.row, GS.flexCenterH]}>
        <View style={[GS.flex, GS.cell]}>
          <Text style={S.date}>{moment(date).format('HH:mm')}</Text>
        </View>
        <ButtonBox>
          <Button title={i18n(D().common.delete)} onPress={() => this.delete(index)} color="red" />
        </ButtonBox>
      </View>
    );
  }

  render() {
    if (!this.state.permitted) {
      return <Text style={[GS.errorBox, GS.margin10]}>{i18n(D().alarm.alarmConfig.pushPermissionAlert)}</Text>;
    }

    return (
      <View style={GS.flex}>
        <Text style={[GS.note, GS.margin10]}>{i18n(D().alarm.alarmConfig.reminderDescription)}</Text>
        <DefaultScrollView alwaysBounceVertical={false}>
          {this.state.timeList.map((d, i) => this.renderRow(i, d))}
        </DefaultScrollView>
        <ButtonBox>
          <Button title={i18n(D().common.add)} onPress={() => this.inputTime()} />
        </ButtonBox>
      </View>
    );
  }
}

const S = StyleSheet.create({
  date: {
    margin: 10,
    fontSize: 18,
  },
});

function isSameTimeM(m1: moment, m2: moment): boolean {
  return m1.hours() === m2.hours() && m1.minutes() === m2.minutes();
}

function setAlarm(dateList: Date[]) {
  PushNotification.cancelAllLocalNotifications();
  if (Platform.OS === 'ios') {
    for (const date of dateList) {
      PushNotificationIOS.scheduleLocalNotification({
        fireDate: +date,
        alertBody: ALARM_MESSAGE,
        repeatInterval: 'day',
      });
    }
  } else {
    for (const date of dateList) {
      PushNotification.localNotificationSchedule({
        date,
        message: ALARM_MESSAGE,
        repeatType: 'day',
      });
    }
  }
}

export async function suppressTodaysNotification() {
  const tomorrow = moment()
    .startOf('day')
    .add(1, 'day');
  const timeList = await storage.alarmTimeList.getNonNull();
  const newTimeList: Date[] = timeList.map(date => {
    const d = moment(date);
    const target = tomorrow.clone();
    target.set('hour', d.get('hour'));
    target.set('minute', d.get('minute'));
    return target.toDate();
  });
  setAlarm(newTimeList);
}
