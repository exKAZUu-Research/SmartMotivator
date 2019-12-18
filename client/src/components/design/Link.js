// @flow

import React from 'react';
import { Alert, Linking, Text, TouchableOpacity } from 'react-native';

import { GS } from '../style';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';

type Props = {|
  children?: any,
  href: string,
  textStyle?: ?any,
|};

export function Link(props: Props) {
  const content =
    typeof props.children === 'string' ? (
      <Text style={[GS.linkText, props.textStyle]}>{props.children}</Text>
    ) : (
      props.children
    );

  return <TouchableOpacity onPress={() => openURL(props.href)}>{content}</TouchableOpacity>;
}

export function openURL(url: string) {
  tracker.trackEvent('link', 'open', { label: url });
  const encodedUrl = encodeURI(url);
  Linking.canOpenURL(encodedUrl)
    .then(supported => {
      if (!supported) {
        Alert.alert(`"${url}"${i18n(D().common.impossibleToOpen)}`);
      } else {
        return Linking.openURL(encodedUrl);
      }
    })
    .catch(err => console.error('An error occurred', err));
}
