// @flow

import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ARROW_COLOR, BORDER_COLOR, GS } from '../style';
import { D, i18n } from '../../i18n/index';

const MARK_CORRECT = i18n(D().common.correctMark);
const MARK_WRONG = i18n(D().common.wrongMark);

type Props = {
  title: string,
  description?: string,
  icon?: string,
  color?: string,
  action?: () => void,
  style?: any,
  children?: any,
  markAchieved?: boolean,
  backgroundColor?: string,
  markRead?: boolean,
  highlightUser?: boolean,
};

export function IconItem(props: Props) {
  const color = props.color;
  const iconStyle = color && { color };

  // if markAchieved is defined, style it either correct or wrong
  let markAchieved = null;
  if (props.markAchieved != null) {
    const style = [GS.bold, props.markAchieved ? S1.colorCorrect : S1.colorWrong];
    const text = props.markAchieved ? MARK_CORRECT : MARK_WRONG;
    markAchieved = <Text style={style}>{text}</Text>;
  }

  // if markRead is true, set it
  const markRead = props.markRead != null ? props.markRead : true;

  // if highlightUser is defined, highlight his block
  const highlightBox = props.highlightUser ? S1.highlightBox : null;
  const block = (
    <View style={[S1.block, props.style, { backgroundColor: props.backgroundColor }]}>
      <View style={S1.iconContainer}>
        <View style={S1.parent}>
          <View style={S1.fullScreen}>{props.icon && <Icon name={props.icon} style={[S1.icon, iconStyle]} />}</View>
          <View style={S1.markReadFloatView}>{!markRead && <Icon name="circle" style={S1.colorMark} />}</View>
        </View>
      </View>
      <View style={S1.textBlock}>
        <Text style={S1.title} numberOfLines={1}>
          {props.title}
        </Text>
        {!!props.description && <Text style={S1.description}>{props.description}</Text>}
        {props.children}
      </View>
      {props.markAchieved != null && <View style={S1.markContainer}>{markAchieved}</View>}
      {props.action && (
        <View style={S1.arrowContainer}>
          <Icon name="angle-right" style={S1.arrow} />
        </View>
      )}
      <View style={highlightBox} />
    </View>
  );

  if (!props.action) {
    return block;
  }
  return <TouchableWithoutFeedback onPress={props.action}>{block}</TouchableWithoutFeedback>;
}

type RankingProps = Props & { rank: number };

export function RankingIconItem(props: RankingProps) {
  const { rank, style, ...iconProps } = props;
  return (
    <View style={[S2.block, style]}>
      <IconItem {...iconProps} style={S2.overrideIconItem} />
      <View style={S2.rankContainer}>
        <Text style={S2.rankText} numberOfLines={1}>
          <Text style={S2.rankNumber}>{rank}</Text> {i18n(D().common.unit.rank)}
        </Text>
      </View>
    </View>
  );
}

const S1 = StyleSheet.create({
  block: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 1,
    borderColor: BORDER_COLOR,
  },
  highlightBox: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.05,
    backgroundColor: 'black',
  },
  iconContainer: {
    justifyContent: 'center',
    width: 70,
    // backgroundColor: '#eee',
  },
  icon: {
    fontSize: 50,
    color: '#666',
    textAlign: 'center',
  },
  textBlock: {
    paddingVertical: 5,
    flex: 1,
  },
  title: {
    marginBottom: 2,
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {},
  arrowContainer: {
    padding: 5,
    justifyContent: 'center',
    // backgroundColor: '#eee',
  },
  markContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 20,
  },
  arrow: {
    color: ARROW_COLOR,
    fontSize: 50,
  },
  colorCorrect: {
    paddingBottom: 5,
    color: 'green',
    fontSize: 30,
  },
  colorWrong: {
    color: 'red',
    fontSize: 20,
  },
  colorMark: {
    color: 'red',
    fontSize: 15,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
  },
  markReadFloatView: {
    position: 'absolute',
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
  },
  parent: {
    flex: 1,
  },
});

const S2 = StyleSheet.create({
  block: {
    borderBottomWidth: 1,
    borderColor: BORDER_COLOR,
    justifyContent: 'center',
  },
  overrideIconItem: {
    marginLeft: 60,
    paddingLeft: 0,
    borderBottomWidth: 0,
  },
  rankContainer: {
    position: 'absolute',
    backgroundColor: 'transparent',
    paddingLeft: 10,
  },
  rankText: {
    fontSize: 18,
    color: '#333',
  },
  rankNumber: {
    fontSize: 32,
    color: '#666',
    fontStyle: 'italic',
  },
});
