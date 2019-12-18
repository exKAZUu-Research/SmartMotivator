// @flow

import React from 'react';
import { View } from 'react-native';
import { Rect, Svg } from 'react-native-svg';

const HEIGHT = 5;
const COLOR_BG = '#e1efe1';
const COLOR_1 = 'green';
const COLOR_2 = 'lightgreen';

type Props = {
  value1: number,
  value2: number,
  max: number,
  height?: number,
};

export class AutoResizeProgress extends React.Component {
  props: Props;
  state = { width: 0 };

  renderBar() {
    const { width } = this.state;
    if (width === 0) return null;

    const { value1, value2, max, height } = this.props;
    const h = height || HEIGHT;
    if (max === 0) {
      return (
        <Svg width={width} height={h}>
          <Rect width={width} height={h} fill={COLOR_BG} />
        </Svg>
      );
    }
    return (
      <Svg width={width} height={h}>
        <Rect width={width} height={h} fill={COLOR_BG} />
        <Rect width={width * value2 / max} height={h} fill={COLOR_2} />
        <Rect width={width * value1 / max} height={h} fill={COLOR_1} />
      </Svg>
    );
  }

  render() {
    const onLayout = ({ nativeEvent }) => {
      const width = nativeEvent.layout.width;
      this.setState({ width });
    };
    return <View onLayout={onLayout}>{this.renderBar()}</View>;
  }
}
