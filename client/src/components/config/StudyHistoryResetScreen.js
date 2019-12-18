// @flow
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { deleteQuizStatsEx } from '../../models/connection';
import { GS } from '../style';
import { D, i18n } from '../../i18n/index';

import type { Navigator, ObservableData } from '../../types';

type NavParams = {|
  observableData: ObservableData,
|};
type State = {
  sending: boolean,
};
export class StudyHistoryResetScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State = { sending: false };

  confirmReset() {
    this.setState({ sending: true });
    Alert.alert('', i18n(D().config.resetStudyHistory.confirmReset), [
      {
        text: i18n(D().common.cancel),
        onPress: () => {
          this.setState({ sending: false });
        },
        style: 'cancel',
      },
      {
        text: i18n(D().common.reset),
        onPress: () => this.resetData(),
      },
    ]);
  }

  async resetData() {
    const { observableData } = this.props.navigation.state.params;
    const response = await deleteQuizStatsEx(observableData.myInfo.get().id);
    if (response.success) {
      observableData.myInfo.update(observableData.myInfo.get());
    }
    this.setState({ sending: false });
    const msg = response.success
      ? i18n(D().config.resetStudyHistory.succeedToReset)
      : i18n(D().config.resetStudyHistory.failToReset);
    Alert.alert('', msg);
  }

  renderResetButton() {
    if (this.state.sending) {
      return (
        <View style={[GS.mainButtonW, S.button, S.buttonDisabled]}>
          <Text style={[S.buttonText]}>{i18n(D().config.resetStudyHistory.resetText)}</Text>
        </View>
      );
    } else {
      return (
        <TouchableOpacity style={[GS.mainButtonW, S.button]} onPress={() => this.confirmReset()}>
          <Text style={[S.buttonText]}>{i18n(D().config.resetStudyHistory.resetText)}</Text>
        </TouchableOpacity>
      );
    }
  }

  render() {
    return (
      <View style={GS.padding10}>
        <Text style={S.description}>{i18n(D().config.resetStudyHistory.description)}</Text>
        <Text style={S.description}>{i18n(D().config.resetStudyHistory.notification)}</Text>
        {this.renderResetButton()}
      </View>
    );
  }
}

const S = StyleSheet.create({
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  description: {
    marginBottom: 10,
  },
  button: {
    paddingVertical: 5,
    backgroundColor: '#ff3300',
    borderColor: '#e62e00',
  },
  buttonDisabled: {},
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
  },
});
