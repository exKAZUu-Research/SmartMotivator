// @flow

import React from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import { DefaultScrollView } from '../../design/DefaultScrollView';
import { ButtonBox } from '../../design/ButtonBox';
import { loginUserWithIdAndPasswordEx } from '../../../models/connection';
import { GS } from '../../style';
import { LS } from './style';
import { D, i18n } from '../../../i18n/index';

import type { UserInfo } from '../../../types';

type Props = {|
  back: () => void,
  next: (myInfo: UserInfo) => Promise<void>,
|};

type State = {|
  loginId: string,
  password: string,
  sending: boolean,
  errorMessage: string,
|};

export class InputPreparedAccountComponent extends React.PureComponent {
  inputLoginId: TextInput;
  inputPasswrod: TextInput;
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      loginId: '',
      password: '',
      sending: false,
      errorMessage: '',
    };
  }

  isValid() {
    return this.state.loginId && this.state.password;
  }

  async login() {
    const { loginId, password } = this.state;
    this.setState({ sending: true, errorMessage: '' });

    const response = await loginUserWithIdAndPasswordEx(loginId, password);
    if (response.success) {
      const myInfo = response.data;
      this.props.next(myInfo);
    } else {
      let errorMessage = i18n(D().startup.registration.inputPreparedAccount.loginFailure);
      if (response.error === 'badRequest') {
        switch (response.data.field) {
          case 'loginId':
            errorMessage += i18n(D().startup.registration.inputPreparedAccount.wrongId);
            break;
          case 'course':
            errorMessage += i18n(D().startup.registration.inputPreparedAccount.wrongCourse);
            break;
          case 'password':
            errorMessage += i18n(D().startup.registration.inputPreparedAccount.wrongPassword);
            break;
        }
      }
      this.setState({ sending: false, errorMessage });
    }
  }

  render() {
    return (
      <DefaultScrollView>
        <View style={GS.margin10}>
          <Text style={[GS.caution]}>実験中に画面のデザインが変化することがございます。ご了承ください。</Text>
        </View>
        <View style={LS.formBlock}>
          <Text style={LS.label}>{i18n(D().userModel.loginId)}</Text>
          <TextInput
            ref={inputLoginId => {
              this.inputLoginId = inputLoginId;
            }}
            style={[GS.textInput, LS.textInput]}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="ascii-capable"
            autoFocus={true}
            returnKeyType="next"
            onSubmitEditing={() => {
              this.inputPasswrod.focus();
            }}
            value={this.state.loginId}
            onChangeText={loginId => this.setState({ loginId })}
          />
        </View>
        <View style={LS.formBlock}>
          <Text style={LS.label}>{i18n(D().userModel.password)}</Text>
          <TextInput
            ref={inputPasswrod => {
              this.inputPasswrod = inputPasswrod;
            }}
            style={[GS.textInput, LS.textInput]}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="ascii-capable"
            value={this.state.password}
            onChangeText={password => this.setState({ password })}
          />
        </View>
        <ButtonBox direction="horizontal">
          <Button title={i18n(D().common.back)} onPress={this.props.back} />
          <Button title={i18n(D().common.login)} onPress={() => this.login()} disabled={!this.isValid()} />
        </ButtonBox>
        {!!this.state.errorMessage && (
          <View style={LS.formBlock}>
            <Text style={GS.errorBox}>{this.state.errorMessage}</Text>
          </View>
        )}
        <View style={GS.flex} />
        <KeyboardSpacer />
      </DefaultScrollView>
    );
  }
}
