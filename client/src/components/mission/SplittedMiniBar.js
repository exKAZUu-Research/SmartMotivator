// @flow
import _ from 'lodash';
import React from 'react';
import { Animated, View } from 'react-native';
import { ClipPath, G, Path, Rect, Svg } from 'react-native-svg';

import { ANIMATION_TIME, COLOR_TABLE } from './MiniBar';

const RADIUS = 4;
const MARGIN = 4;
const WIDTH = 50;

type Props = {|
  height: number,
  current: number,
  max: number,
  animation: boolean,
|};

export class SplittedMiniBar extends React.Component {
  animatedValue: any;
  path1: Path;
  props: Props;
  state = { width: 0 };

  constructor(props: any) {
    super(props);

    this.animatedValue = new Animated.Value(this.props.current);
    this.animatedValue.addListener(({ value }) => {
      if (this.path1) {
        this.path1.setNativeProps({ width: this.calcWidth(value) });
      }
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.current !== nextProps.current) {
      if (nextProps.animation) {
        const option = { toValue: nextProps.current, duration: ANIMATION_TIME };
        Animated.timing(this.animatedValue, option).start();
      } else {
        this.animatedValue.setValue(nextProps.current);
      }
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: any) {
    return this.props.max !== nextProps.max || this.state !== nextState;
  }

  calcWidth(current: number): string {
    return ((WIDTH + MARGIN) * current - MARGIN / 2).toFixed(0);
  }

  renderBar() {
    const { width } = this.state;
    if (width === 0) return null;
    const { height, current } = this.props;
    const colorTable = COLOR_TABLE.green;
    return (
      <Svg width={width} height={height}>
        {this.renderClip('myclip')}
        <G clipPath={'url(#myclip)'}>
          <Rect width={width} height={height} fill={colorTable.empty} />
          <Rect
            width={this.calcWidth(current)}
            height={height}
            fill={colorTable.progress}
            ref={x => (this.path1 = x)}
          />
        </G>
      </Svg>
    );
  }

  renderClip(id: string) {
    const { max, height } = this.props;
    const { width } = this.state;
    const w = Math.min((width + MARGIN) / max - MARGIN, WIDTH);
    return (
      <ClipPath id={id}>
        {_.times(max, i => <Rect key={i} rx={RADIUS} ry={RADIUS} width={w} height={height} x={(w + MARGIN) * i} />)}
      </ClipPath>
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
