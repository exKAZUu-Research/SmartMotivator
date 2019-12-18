// @flow
import React from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import { DefaultScrollView } from '../../design/DefaultScrollView';
import { ButtonBox } from '../../design/ButtonBox';
import { GS } from '../../style';
import { LS } from './style';
import { D, i18n } from '../../../i18n/index';

const EMAIL_PATTERN = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

type Props = {|
  initialEmail: string,
  back: () => void,
  next: (email: string) => Promise<void>,
|};

export class InputEmailComponent extends React.PureComponent {
  emailInput: TextInput;
  props: Props;
  state = { email: this.props.initialEmail };

  async goConfirm() {
    const email = this.state.email;
    if (!email) return;
    this.props.next(email);
  }

  goConfirmAfterValidatingEmail(email: string) {
    const showError = message => {
      Alert.alert(
        i18n(D().startup.registration.inputEmail.wrongEmail),
        message,
        [{ text: i18n(D().common.ok), onPress: () => this.emailInput.focus() }],
        { cancelable: false }
      );
    };
    if (!EMAIL_PATTERN.test(email)) {
      showError(D().startup.registration.inputEmail.enterAppropriateEmail);
      return;
    }
    this.goConfirm();
  }

  render() {
    return (
      <DefaultScrollView>
        <View style={LS.formBlock}>
          <Text style={LS.label}>{i18n(D().userModel.email)}</Text>
          <TextInput
            style={[GS.textInput, LS.textInput]}
            ref={thisTextInput => {
              this.emailInput = thisTextInput;
            }}
            autoCapitalize="none"
            autoCorrect={false}
            selectTextOnFocus={true}
            blurOnSubmit={true}
            keyboardType={'email-address'}
            placeholder={'username@example.com'}
            value={this.state.email}
            onChangeText={email => this.setState({ email })}
          />
          <Text style={GS.note}>{i18n(D().startup.registration.inputEmail.experimentDescription)}</Text>
        </View>
        <ButtonBox direction="horizontal">
          <Button title={i18n(D().common.back)} onPress={this.props.back} />
          <Button
            title={i18n(D().common.confirm)}
            onPress={() => this.goConfirmAfterValidatingEmail(this.state.email)}
            disabled={this.state.email.length === 0}
          />
        </ButtonBox>
        <View style={GS.flex} />
        <KeyboardSpacer />
      </DefaultScrollView>
    );
  }
}
