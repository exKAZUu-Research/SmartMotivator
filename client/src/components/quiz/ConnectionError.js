// @flow
import React from 'react';
import { Button, Text, View } from 'react-native';

import { GS } from '../style';

import { D, i18n } from '../../i18n/index';

type Props = {|
  retry?: () => any,
|};

export function ConnectionError(props: Props) {
  return (
    <View style={GS.flex}>
      <View>
        <Text style={[GS.errorBox, GS.margin10]}>{i18n(D().quiz.connectionError.errorMessage)}</Text>
        {props.retry && <Button title={i18n(D().common.retry)} onPress={props.retry} />}
      </View>
    </View>
  );
}
