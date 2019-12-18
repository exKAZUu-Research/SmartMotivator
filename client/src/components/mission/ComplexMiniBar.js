// @flow

import React from 'react';
import { Animated } from 'react-native';
import { Path, Svg, Text } from 'react-native-svg';

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
  extra: number,
  fillExtra: boolean,
  text: string,
  baseLabel: string,
  maxLabel: string,
  progress: number, // 0 to 1
  color: Colors,
  animation: boolean,
|};

export class ComplexMiniBar extends React.Component {
  animatedValue: any;
  path1: Path;
  props: Props;
  state: {};

  static defaultProps = {
    color: 'green',
    extra: 0,
    fillExtra: false,
    text: '',
    baseLabel: '',
    maxLabel: '',
  };

  constructor(props: any) {
    super(props);

    this.animatedValue = new Animated.Value(this.props.progress);
    this.animatedValue.addListener(({ value }) => {
      if (this.path1) {
        this.path1.setNativeProps({ d: this.getRectPath(value, true) });
      }
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.progress !== nextProps.progress) {
      if (nextProps.animation) {
        const option = { toValue: nextProps.progress, duration: ANIMATION_TIME };
        Animated.timing(this.animatedValue, option).start();
      } else {
        this.animatedValue.setValue(nextProps.progress);
      }
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    return this.props.text !== nextProps.text;
  }

  getRectPath(rate: number, full: boolean) {
    const { width, extra, height } = this.props;
    let w = Math.round(rate * width);
    if (w > width) {
      w = w % width;
      if (full && w === 0) {
        w = width;
      }
    }
    return rect(w + extra, height);
  }

  render() {
    const { width, extra, height, fillExtra, progress, color, text, maxLabel, baseLabel } = this.props;
    const colorTable = COLOR_TABLE[color];
    const fullWidth = width + extra;
    const hasLabel = !!(baseLabel || maxLabel);

    return (
      <Svg width={width + extra + (hasLabel ? 20 : 0)} height={height + (hasLabel ? 15 : 0)}>
        <Path d={rect(fullWidth, height)} fill={colorTable.empty} />
        <Path d={this.getRectPath(progress, false)} fill={colorTable.progress} ref={x => (this.path1 = x)} />
        <Path d={rect(extra, height)} fill={fillExtra ? colorTable.fill : 'white'} />
        <Text x={fullWidth - 5} y={0} textAnchor="end" fontSize={height * 0.6}>
          {text}
        </Text>

        {!!baseLabel && <Path d={`m ${extra - 0.5} ${height} v 5`} stroke="black" />}
        {!!baseLabel && (
          <Text x={extra - 0.5} y={height + 3} textAnchor="middle" fontSize={10}>
            {baseLabel}
          </Text>
        )}
        {!!maxLabel && <Path d={`m ${fullWidth - 0.5} ${height} v 5`} stroke="black" />}
        {!!maxLabel && (
          <Text x={fullWidth - 0.5} y={height + 3} textAnchor="middle" fontSize={10}>
            {maxLabel}
          </Text>
        )}
      </Svg>
    );
  }
}

function rect(width: number, height: number) {
  const x = 0;
  const y = 0;
  return `m ${x} ${y} h ${width} v ${height} h ${-width} z`;
}
