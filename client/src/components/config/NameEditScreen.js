// @flow

import React from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';

import { DefaultScrollView } from '../design/DefaultScrollView';
import { ButtonBox } from '../design/ButtonBox';
import { MAX_NAME_LENGTH } from './utils';
import { GS } from '../style';
import { updateMyInfoEx } from '../../models/connection';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';

import type { Navigator, ObservableData, UserInfo } from '../../types';

type NavParams = {|
  observableData: ObservableData,
|};

type State = {|
  myInfo: UserInfo,
  name: string,
  error: string | null,
|};

export class NameEditScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State;

  constructor(props: *) {
    super(props);
    const myInfo = this.props.navigation.state.params.observableData.myInfo.get();
    this.state = {
      myInfo,
      name: myInfo.name,
      error: null,
    };
  }

  componentDidMount() {
    tracker.trackScreenViewNoTabs('config_profile');
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  async save() {
    const { myInfo, name } = this.state;
    if (name.length > MAX_NAME_LENGTH) {
      const error = i18n(D().validation.tooLong, {
        field: i18n(D().userModel.name),
        count: MAX_NAME_LENGTH,
      });
      this.setState({ error });
      return;
    }

    const { observableData } = this.props.navigation.state.params;
    const response = await updateMyInfoEx(myInfo.id, { name });
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
          <TextInput style={GS.textInput} onChangeText={name => this.setState({ name })} value={this.state.name} />
          <Text style={[GS.caution]}>{i18n(D().common.inputCaution)}</Text>
        </View>
        <ButtonBox>
          <Button title={i18n(D().common.save)} onPress={() => this.save()} disabled={this.state.name.length === 0} />
        </ButtonBox>
        {this.state.error && <Text style={[GS.errorBox, GS.margin10]}>{this.state.error}</Text>}
      </DefaultScrollView>
    );
  }
}
