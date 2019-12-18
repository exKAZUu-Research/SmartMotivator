// @flow

import React from 'react';

import { Button, Platform, StyleSheet, View } from 'react-native';

type Props = {|
  direction?: 'vertical' | 'horizontal',
  children?: Button[],
|};

export function ButtonBox({ children, direction }: Props) {
  const len = React.Children.count(children);
  if (len === 0) {
    return null;
  }
  if (len === 1) {
    return <View style={S.single}>{children}</View>;
  }
  if (direction === 'horizontal') {
    const cs = React.Children.map(children, btn => <View style={S.hItem}>{btn}</View>);
    return <View style={S.h} children={cs} />;
  } else {
    const cs = React.Children.map(children, btn => <View style={S.vItem}>{btn}</View>);
    return <View style={S.v} children={cs} />;
  }
}

const S = StyleSheet.create({
  /* ---- ---- one button ---- ---- */
  single: {
    ...androidMargin(10),
  },
  /* ---- ---- vertical ---- ---- */
  v: {
    ...androidMargin(5),
  },
  vItem: {
    ...androidMargin(5),
  },
  /* ---- ---- horizontal ---- ---- */
  h: {
    flexDirection: 'row',
    ...androidMargin(5),
  },
  hItem: {
    flex: 1,
    ...androidMargin(5),
  },
});

function androidMargin(margin: number) {
  return Platform.select({ android: { margin } });
}
