// @flow

import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { ButtonBox } from '../design/ButtonBox';
import { GS } from './../style';
import { D, i18n } from '../../i18n/index';

type Props = {|
  action: () => any,
|};

export function SurveyAgreement(props: Props) {
  return (
    <View style={GS.flex}>
      <View style={[GS.flex, S.agreement]}>
        <Text style={S.agreementTextBlock}>{i18n(D().survey.common.surveyDescription)}</Text>
        <Text style={S.agreementTextBlock}>{i18n(D().survey.common.agreementDescription)}</Text>
      </View>
      <View style={GS.flex}>
        <ButtonBox>
          <Button title={i18n(D().survey.common.startSurvey)} onPress={props.action} />
        </ButtonBox>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  agreement: { margin: 25 },
  agreementTextBlock: { fontSize: 18, marginVertical: 10 },
});
