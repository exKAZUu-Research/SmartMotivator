// @flow

import React from 'react';
import { Button, DatePickerIOS, View } from 'react-native';

import { D, i18n } from '../../i18n/index';
import type { Navigator } from '../../types';

export class DatePickerScreen extends React.Component {
  props: { navigation: Navigator<*> };
  state = { time: new Date() };

  render() {
    return (
      <View>
        <DatePickerIOS
          date={this.state.time}
          mode="time"
          onDateChange={time => this.setState({ time })}
          minuteInterval={15}
        />
        <Button
          title={i18n(D().common.save)}
          onPress={() => this.props.navigation.state.params.onChange(this.state.time)}
        />
      </View>
    );
  }
}
