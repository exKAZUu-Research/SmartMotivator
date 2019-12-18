// @flow
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { GS } from '../../style';
import { ButtonBox } from '../../design/ButtonBox';
import { D, i18n } from '../../../i18n/index';

type Props = {|
  gotoTermsEmail: () => void,
  gotoTermsPreparedAccount: () => void,
  gotoTermsNoAccount: () => void,
|};

export function MenuComponent(props: Props) {
  return (
    <View style={GS.flex}>
      <View style={GS.flex2} />
      <Text style={S.logo}>スマートモチベーター</Text>
      <View style={GS.flex2} />
      <ButtonBox>
        <Button title={i18n(D().startup.registration.menu.signupOrLoginWithEmail)} onPress={props.gotoTermsEmail} />
      </ButtonBox>
      <View style={GS.flex} />
      <ButtonBox>
        <Button
          title={i18n(D().startup.registration.menu.loginWithIdAndPassword)}
          onPress={props.gotoTermsPreparedAccount}
        />
      </ButtonBox>
      <View style={GS.flex} />
      <ButtonBox>
        <Button title={i18n(D().startup.registration.menu.signupWithoutEmail)} onPress={props.gotoTermsNoAccount} />
      </ButtonBox>
      <View style={GS.flex6} />
    </View>
  );
}

const S = StyleSheet.create({
  logo: {
    fontSize: 30,
    textAlign: 'center',
  },
});
