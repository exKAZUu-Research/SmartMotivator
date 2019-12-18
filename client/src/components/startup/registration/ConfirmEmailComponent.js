// @flow

import React from 'react';
import { Alert, Button, Text, View } from 'react-native';

import { createUserByEmailEx } from '../../../models/connection';
import { ButtonBox } from '../../design/ButtonBox';
import { GS } from '../../style';
import { LS } from './style';
import { D, i18n } from '../../../i18n/index';

type Props = {|
  email: string,
  back: () => void,
  next: () => Promise<void>,
|};

type State = {|
  sending: boolean,
  hasError: boolean,
|};

export class ConfirmEmailComponent extends React.PureComponent {
  props: Props;
  state: State = { sending: false, hasError: false };

  alert(message: string) {
    const buttons = [{ text: i18n(D().common.ok), onPress: () => this.props.back() }];
    Alert.alert('', message, buttons, { cancelable: false });
  }

  async submit() {
    const { email } = this.props;
    this.setState({ sending: true, hasError: false });
    const response = await createUserByEmailEx(email);
    this.setState({ sending: false });
    if (response.success) {
      this.props.next();
    } else {
      if (response.error === 'badRequest') {
        if (response.data.field === 'email') {
          this.alert(i18n(D().startup.registration.inputEmail.enterSchoolEmail));
          return;
        }
        if (response.data.field === 'course') {
          this.alert(i18n(D().startup.registration.inputEmail.useOtherApp));
          return;
        }
      }
      this.alert(i18n(D().startup.registration.confirmEmail.registrationFailure));
    }
  }

  render() {
    return (
      <View style={GS.flex}>
        <View style={LS.formBlock}>
          <Text style={LS.label}>{i18n(D().startup.registration.confirmEmail.confirmation)}</Text>
        </View>
        <View style={LS.formBlock}>
          <Text>{i18n(D().userModel.email)}</Text>
          <Text style={LS.value}>{this.props.email}</Text>
        </View>
        <ButtonBox direction="horizontal">
          <Button onPress={() => this.props.back()} title={i18n(D().common.back)} />
          <Button
            title={this.state.sending ? i18n(D().common.sending) : i18n(D().common.register)}
            onPress={() => this.submit()}
            disabled={this.state.sending}
          />
        </ButtonBox>
        <View style={LS.formBlock}>
          <Text style={[GS.errorBox, !this.state.hasError && GS.hidden]}>
            {i18n(D().startup.registration.confirmEmail.registrationFailure)}
          </Text>
        </View>
        <View style={GS.flex2} />
      </View>
    );
  }
}
