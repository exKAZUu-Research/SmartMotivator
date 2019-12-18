// @flow

import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ARROW_COLOR, BORDER_COLOR } from '../style';

type Props = {|
  text?: string,
  value?: string,
  children?: any,
  onPress?: () => void,
|};

export function MenuItem(props: Props) {
  const onPress = props.onPress;

  const content = (
    <View style={S.itemBlock}>
      <View style={S.textContainer}>
        {!!props.text && <Text style={S.text}>{props.text}</Text>}
        {!!props.value && (
          <Text style={S.subText} numberOfLines={1}>
            {props.value}
          </Text>
        )}
        {props.children}
      </View>
      {!!onPress && (
        <View style={S.arrowContainer}>
          <Icon name="angle-right" style={S.arrow} />
        </View>
      )}
    </View>
  );

  if (!onPress) return content;
  return <TouchableWithoutFeedback onPress={onPress}>{content}</TouchableWithoutFeedback>;
}

const S = StyleSheet.create({
  itemBlock: {
    flexDirection: 'row',
    borderColor: BORDER_COLOR,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
  },
  subText: {
    marginLeft: 5,
    flex: 1,
    overflow: 'hidden',
    fontSize: 16,
    textAlign: 'right',
    color: '#666',
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingRight: 16,
  },
  arrow: {
    color: ARROW_COLOR,
    fontSize: 24,
  },
});
