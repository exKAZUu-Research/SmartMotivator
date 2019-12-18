// @flow

import React from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';

import { DefaultScrollView } from '../design/DefaultScrollView';
import { ButtonBox } from '../design/ButtonBox';
import { MAX_INTRODUCTION_LENGTH } from './utils';
import { GS } from '../style';
import { updateMyInfoEx } from '../../models/connection';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';

import type { Navigator, UserInfo } from '../../types';

type State = {|
  myInfo: UserInfo,
  introduction: string,
  error: string | null,
|};

export class IntroductionEditScreen extends React.Component {
  props: { navigation: Navigator<*> };
  state: State;

  constructor(props: *) {
    super(props);
    const myInfo = this.props.navigation.state.params.observableData.myInfo.get();
    this.state = {
      myInfo,
      introduction: myInfo.introduction,
      error: null,
    };
  }

  componentDidMount() {
    tracker.trackScreenViewNoTabs('config_introduction');
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  async save() {
    const { myInfo, introduction } = this.state;
    if (introduction.length > MAX_INTRODUCTION_LENGTH) {
      const error = i18n(D().validation.tooLong, {
        field: i18n(D().userModel.introduction),
        count: MAX_INTRODUCTION_LENGTH,
      });
      this.setState({ error });
      return;
    }

    const { observableData } = this.props.navigation.state.params;
    const response = await updateMyInfoEx(myInfo.id, { introduction });
    if (response.success) {
      const myInfo = response.data;
      observableData.myInfo.update(myInfo);
      this.props.navigation.goBack();
    } else {
      Alert.alert(i18n(D().common.connectionErrorTitle), i18n(D().common.saveError));
    }
  }

  render() {
    return (
      <DefaultScrollView>
        <View style={GS.margin10}>
          <TextInput
            style={GS.textInput}
            onChangeText={introduction => this.setState({ introduction })}
            value={this.state.introduction}
          />
          <Text style={[GS.caution]}>{i18n(D().common.inputCaution)}</Text>
        </View>
        <ButtonBox>
          <Button
            title={i18n(D().common.save)}
            onPress={() => this.save()}
            disabled={this.state.introduction.length === 0}
          />
        </ButtonBox>
        {this.state.error && <Text style={[GS.errorBox, GS.margin10]}>{this.state.error}</Text>}
      </DefaultScrollView>
    );
  }
}
