// @flow

import React from 'react';
import { Text, View } from 'react-native';

import { GS } from './style';

type Props = {|
  error: ?string,
  children?: any,
|};

export function ErrorComponent(props: Props) {
  if (props.error) {
    return (
      <View>
        <Text style={[GS.margin10, GS.errorBox]}>{props.error}</Text>
      </View>
    );
  } else {
    return props.children;
  }
}
