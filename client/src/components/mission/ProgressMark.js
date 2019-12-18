// @flow

import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Circle, Rect, Svg } from 'react-native-svg';

export const CHECK = false;
const MARGIN = 5;
const STRONG_COLOR = '#2d8f2d';
const MARK_COLOR = '#7ed67e';
const EMPTY_COLOR = '#e1efe1';

type Props = {
  width: number,
  height: number,
  start: number,
  current: number,
  max: number,
};
export class ProgressMark extends React.Component {
  props: Props;

  renderCircleMark(index: number, fill: boolean) {
    const { height } = this.props;
    const r = height / 2;
    const cx = r + index * (height + MARGIN);
    return <Circle key={index} cx={cx} cy={r} r={r} fill={fill ? MARK_COLOR : EMPTY_COLOR} />;
  }

  renderIconMark(index: number, fill: boolean) {
    if (fill) {
      return (
        <Icon
          key={index}
          name={'check-square-o'}
          size={this.props.height}
          style={{ marginRight: MARGIN }}
          color={STRONG_COLOR}
        />
      );
    }
    return (
      <Icon
        key={index}
        name={'square-o'}
        size={this.props.height}
        style={{ marginRight: MARGIN }}
        color={STRONG_COLOR}
      />
    );
  }

  renderRectMark(index: number, fill: boolean) {
    const r = 4;
    const width = 50;
    return (
      <Rect
        key={index}
        x={index * (width + MARGIN)}
        rx={r}
        ry={r}
        width={width}
        height={Math.min(10, this.props.height)}
        fill={fill ? MARK_COLOR : EMPTY_COLOR}
      />
    );
  }

  render() {
    const { width, height, start, max } = this.props;
    if (CHECK) {
      return (
        <View width={width} height={height} style={{ flexDirection: 'row' }}>
          {_.times(max, i => this.renderIconMark(i, i < start))}
        </View>
      );
    }
    return (
      <Svg width={width} height={height}>
        {_.times(max, i => this.renderRectMark(i, i < start))}
      </Svg>
    );
  }
}
