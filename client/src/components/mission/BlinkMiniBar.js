// @flow

import React from 'react';
import { Animated, Easing } from 'react-native';
import { Rect, Svg, Text } from 'react-native-svg';

export const COLOR_TABLE = {
  green: { fill: '#328c32', progress: '#7ed67e', empty: '#e1efe1' },
  blue: { fill: '#046', progress: '#2190d1', empty: '#cedae5' },
  purple: { fill: '#405', progress: '#90a', empty: '#ebe' },
};
type Colors = 'green' | 'blue' | 'purple';

export const ANIMATION_TIME = 700;

type Props = {|
  width: number,
  height: number,
  text: string,
  max: number,
  current: number,
  active: number,
  color: Colors,
|};

export class BlinkMiniBar extends React.Component {
  animatedValue: any;
  mounted: boolean;
  path1: Rect;
  props: Props;
  state: void;

  static defaultProps = {
    color: 'green',
    text: '',
  };

  constructor(props: any) {
    super(props);
    this.mounted = false;

    this.animatedValue = new Animated.Value(0);
    this.animatedValue.addListener(({ value }) => {
      if (this.path1) {
        // console.log({ opacity: value });
        this.path1.setNativeProps({ opacity: value });
      }
    });
  }

  componentDidMount() {
    this.mounted = true;
    this.animate();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  animate() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.animatedValue, {
          toValue: 0.7,
          duration: 700,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(this.animatedValue, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.quad),
        }),
      ])
    ).start();
  }

  renderActiveValue(color: string) {
    const { width, height, current, active, max } = this.props;
    if (max === 0) return null;
    const x = width * current / max;
    const w = width * active / max;
    return <Rect x={x} width={w} height={height} fill={color} opacity={0} ref={x => (this.path1 = x)} />;
  }

  renderCurrentValue(color: string) {
    const { width, height, current, max } = this.props;
    if (max === 0) return null;
    return <Rect width={width * current / max} height={height} fill={color} />;
  }

  render() {
    const { width, height, color, text } = this.props;
    const colorTable = COLOR_TABLE[color];

    return (
      <Svg width={width} height={height}>
        <Rect width={width} height={height} fill={colorTable.empty} />
        {this.renderCurrentValue(colorTable.progress)}
        {this.renderActiveValue(colorTable.progress)}
        <Text x={width - 5} textAnchor="end" fontSize={height * 0.6}>
          {text}
        </Text>
      </Svg>
    );
  }
}
