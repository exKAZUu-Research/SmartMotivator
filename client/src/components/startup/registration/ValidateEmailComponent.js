// @flow

import React from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import { DefaultScrollView } from '../../design/DefaultScrollView';
import { ButtonBox } from '../../design/ButtonBox';
import { confirmUserByEmailAndPasscodeEx } from '../../../models/connection';
import { GS } from '../../style';
import { LS } from './style';
import { D, i18n } from '../../../i18n/index';

import type { UserInfo } from '../../../types';

type Props = {|
  email: string,
  back: () => any,
  next: (myInfo: UserInfo) => any,
|};

type State = {|
  passcode: string,
  sending: boolean,
  hasError: boolean,
|};

export class ValidateEmailComponent extends React.PureComponent {
  props: Props;
  state: State = {
    passcode: '',
    sending: false,
    hasError: false,
  };

  async validate() {
    const email = this.props.email;
    const passcode = this.state.passcode;
    if (!passcode) return;

    this.setState({ sending: true, hasError: false });
    const response = await confirmUserByEmailAndPasscodeEx(email, passcode);
    if (response.success) {
      const myInfo = response.data;
      this.setState({ sending: false });
      this.props.next(myInfo);
    } else {
      this.setState({ sending: false, hasError: true });
    }
  }

  render() {
    return (
      <DefaultScrollView>
        <View style={LS.formBlock}>
          <Text style={LS.label}>{i18n(D().userModel.passcode)}</Text>
          <TextInput
            keyboardType={'numeric'}
            style={[GS.textInput, LS.textInput]}
            value={this.state.passcode}
            onChangeText={passcode => this.setState({ passcode })}
          />
          <Text style={[GS.note, LS.marginBottom]}>
            {i18n(D().startup.registration.validateEmail.passcodeDescription, { email: this.props.email })}
          </Text>
          <Text style={GS.note}>{i18n(D().startup.registration.validateEmail.passcodeLossDescription)}</Text>
        </View>
        <ButtonBox direction="horizontal">
          <Button onPress={() => this.props.back()} title={i18n(D().common.back)} />
          <Button
            title={i18n(D().common.validate)}
            onPress={() => this.validate()}
            disabled={this.state.passcode.length === 0}
          />
        </ButtonBox>
        <View style={LS.formBlock}>
          <Text style={[GS.errorBox, !this.state.hasError && GS.hidden]}>
            {i18n(D().startup.registration.validateEmail.certificationFailure)}
          </Text>
        </View>
        <View style={GS.flex3} />
        <KeyboardSpacer />
      </DefaultScrollView>
    );
  }
}
