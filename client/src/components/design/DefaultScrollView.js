// @flow

import React from 'react';
import { ScrollView } from 'react-native';

export function DefaultScrollView(props: {}) {
  const customProps: any = {
    automaticallyAdjustContentInsets: false,
  };
  if (!props.refreshControl) {
    customProps.alwaysBounceVertical = false;
  }
  const finalProps = { ...customProps, ...props };
  return <ScrollView {...finalProps} />;
}
