// @flow

import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

import { FramingText, showPositive } from './FramingText';
import { BORDER_COLOR, GS } from '../style';
import { D, i18n } from '../../i18n/index';
import { getApproximatePointText } from './util';

import type { MissionInfo } from './types';
import type { UserInfo } from '../../types';

type ViewProps = {
  myInfo: UserInfo,
  missionInfo: MissionInfo,
  small: boolean,
  wide: boolean,
};

export class LevelView extends React.PureComponent {
  props: ViewProps;
  state = { rand: Math.random() };

  render() {
    const { myInfo, missionInfo, small, wide } = this.props;
    const { rand } = this.state;
    return (
      <View style={S.wrapper}>
        <View style={S.framingContainer}>{renderMessage(myInfo, missionInfo, rand, wide && S.wideFramingMessage)}</View>
        <View style={GS.flexCenterH}>
          <LevelBadge level={missionInfo.level} small={small} />
        </View>
      </View>
    );
  }
}

type BadgeProps = {
  level: number,
  small: boolean,
};
export function LevelBadge({ level, small }: BadgeProps) {
  let digitStyle;
  if (small) {
    if (level < 10) {
      digitStyle = MODAL_S.imageText1DigitS;
    } else if (level < 100) {
      digitStyle = MODAL_S.imageText2DigitsS;
    } else {
      digitStyle = MODAL_S.imageText3DigitsS;
    }
  } else {
    if (level < 10) {
      digitStyle = MODAL_S.imageText1Digit;
    } else if (level < 100) {
      digitStyle = MODAL_S.imageText2Digits;
    } else {
      digitStyle = MODAL_S.imageText3Digits;
    }
  }
  return (
    <View style={[MODAL_S.imageContainer, small && MODAL_S.imageContainerS]}>
      <Image style={[MODAL_S.image, small && MODAL_S.imageS]} source={require('../../../img/level.png')} />
      <Text style={[MODAL_S.imageText, digitStyle]}>{level}</Text>
    </View>
  );
}

export function renderMessage(myInfo: UserInfo, missionInfo: MissionInfo, randomValue: number, textStyle: any = null) {
  const nextLevel = missionInfo.level + 1;
  const point = missionInfo.levelPointRange.max - missionInfo.point;
  const approxPoint = getApproximatePointText(point);
  if (showPositive(myInfo.setting.positiveFraming, randomValue)) {
    const msg = i18n(D().mission.level.positiveFramingMessage, { approxPoint, nextLevel });
    return (
      <FramingText positive={true} style={textStyle}>
        {msg}
      </FramingText>
    );
  } else {
    const msg = i18n(D().mission.level.negativeFramingMessage, { approxPoint, nextLevel });
    return (
      <FramingText positive={false} style={textStyle}>
        {msg}
      </FramingText>
    );
  }
}

const S = StyleSheet.create({
  wrapper: {
    backgroundColor: 'white',
    borderColor: BORDER_COLOR,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  wideFramingMessage: {
    fontSize: 18,
    padding: 10,
  },
  framingContainer: {
    padding: 5,
    paddingBottom: 0,
  },
});

const SIZE = 160;
const RATE = 0.75;
const MODAL_S = StyleSheet.create({
  imageContainer: {
    width: SIZE,
    height: SIZE,
    marginTop: 20,
    marginBottom: 10,
  },
  imageContainerS: {
    width: SIZE * RATE,
    height: SIZE * RATE,
    marginTop: 5,
    marginBottom: 0,
  },
  image: {
    width: SIZE,
    height: SIZE,
    position: 'absolute',
    top: 0,
    resizeMode: 'contain',
  },
  imageS: {
    width: SIZE * RATE,
    height: SIZE * RATE,
  },
  imageText: {
    textAlign: 'center',
    color: '#76a619',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    ...Platform.select({
      ios: {
        fontFamily: 'Symbol',
      },
      android: {
        fontFamily: 'serif',
      },
    }),
  },
  imageText1Digit: {
    fontSize: 100,
    top: Platform.OS === 'ios' ? 20 : -10,
  },
  imageText2Digits: {
    fontSize: 80,
    top: Platform.OS === 'ios' ? 25 : 0,
  },
  imageText3Digits: {
    fontSize: 60,
    top: Platform.OS === 'ios' ? 35 : 15,
  },
  imageText1DigitS: {
    fontSize: 100 * RATE,
    top: (Platform.OS === 'ios' ? 20 : -10) * RATE,
  },
  imageText2DigitsS: {
    fontSize: 80 * RATE,
    top: (Platform.OS === 'ios' ? 25 : 0) * RATE,
  },
  imageText3DigitsS: {
    fontSize: 60 * RATE,
    top: (Platform.OS === 'ios' ? 35 : 15) * RATE,
  },
});
