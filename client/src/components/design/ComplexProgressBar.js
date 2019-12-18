// @flow

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { StateForChecking } from '../render_util';

import { GS } from '../style';

type Props = {|
  title?: string,
  actualCounts: number[],
  barColors?: string[],
  barTextColors?: string[],
  target: number,
  height?: number,
  width?: number,
  color?: string,
  unit: string,
|};

type State = {|
  width: number,
|} & StateForChecking;

export class ProgressBar extends React.Component {
  props: Props;
  state: State = {
    width: 0,
  };

  componentDidMount() {
    this.setState({ width: 0 });
  }

  getSize(progress: number, amount: number, totalWidth: number, minBarWidth: number): number {
    let width = totalWidth * progress;
    width = this.minimumWidth(width, amount);
    return this.maximumWidth(width, amount, totalWidth, minBarWidth);
  }

  barPart(
    width: number,
    height: number,
    barAmount: number,
    unit: string,
    index?: number = -1,
    barColor?: string | null = null,
    barTextColor?: string | null = null
  ) {
    if (width === 0) {
      return null;
    }
    return (
      <View
        style={[
          S.singleBar,
          {
            backgroundColor: barColor,
            width,
            height: height - BORDER_WIDTH_BARS,
          },
        ]}
        key={index}
      >
        <Text style={[S.barText, { color: barTextColor }]}>
          {barAmount}
          {unit}
        </Text>
      </View>
    );
  }

  /**
   * Find maximum Size based on minimum of other bars
   */
  maximumWidth(width: number, amount: number, totalWidth: number, minBarWidth: number): number {
    const maximumWidth = totalWidth - minBarWidth + this.minimumWidth(0, amount);
    return Math.min(width, maximumWidth);
  }

  measureView(event: any) {
    this.setState({ width: event.nativeEvent.layout.width });
  }

  /**
   * Find minimum Size based on digits
   */
  minimumWidth(width: number, amount: number): number {
    if (amount > 99) {
      return Math.max(width, MIN_BAR_WIDTH_3_DIGIT);
    } else if (amount > 9) {
      return Math.max(width, MIN_BAR_WIDTH_2_DIGIT);
    } else if (amount > 0) {
      return Math.max(width, MIN_BAR_WIDTH_1_DIGIT);
    }
    return width;
  }

  render() {
    const { unit } = this.props;
    // Styling
    const totalWidth = this.props.width ? this.props.width : this.state.width;
    const height = this.props.height ? this.props.height : BAR_HEIGHT;

    // Size of bars
    const minBarWidths = this.props.actualCounts.map(ac => this.minimumWidth(0, ac));
    const minBarWidth = minBarWidths.reduce((sum, value) => sum + value, 0);
    const barWidths = this.props.actualCounts.map(ac => {
      const acWidth = this.getSize(ac / this.props.target, ac, totalWidth, minBarWidth);
      return acWidth;
    });

    return (
      <View onLayout={event => this.measureView(event)} style={[GS.margin10, GS.padding10, S.progressContainer]}>
        {this.props.title && <Text style={S.title}>{this.props.title}</Text>}
        <View style={[S.completeBar, { height, width: totalWidth + BORDER_WIDTH_BARS }]}>
          {barWidths &&
            barWidths.map((barWidth, index) =>
              this.barPart(
                barWidth,
                height,
                this.props.actualCounts[index],
                unit,
                index,
                this.props.barColors && this.props.barColors[index],
                this.props.barTextColors && this.props.barTextColors[index]
              )
            )}
        </View>
      </View>
    );
  }
}

export const BAR_COLOR = '#070';
const BAR_HEIGHT = 30;
const BORDER_WIDTH = 1;
const BORDER_WIDTH_BARS = BORDER_WIDTH * 2;
const MIN_BAR_WIDTH_1_DIGIT = 30;
const MIN_BAR_WIDTH_2_DIGIT = 40;
const MIN_BAR_WIDTH_3_DIGIT = 50;

const S = StyleSheet.create({
  progressContainer: {
    margin: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    margin: 10,
  },
  completeBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderColor: '#204040',
    borderWidth: BORDER_WIDTH,
  },
  singleBar: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barText: {
    textAlign: 'center',
    fontSize: 14,
  },
});
