// @flow

import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const margin = { top: 20, bottom: 40, left: 30, right: 40 };

export const CHART_OPTIONS = {
  width: width - (margin.left + margin.right),
  height: 240 - (margin.top + margin.bottom),
  margin,
  color: '#007700',
  axisX: {
    showAxis: true,
    showLines: true,
    showLabels: true,
    showTicks: false,
    zeroAxis: true,
    orient: 'bottom',
    label: {
      fontSize: 14,
      fontWeight: false,
      fill: '#34495E',
    },
  },
  axisY: {
    showAxis: true,
    showLines: true,
    showLabels: true,
    showTicks: false,
    zeroAxis: false,
    orient: 'left',
    label: {
      fontFamily: 'Arial',
      fontSize: 14,
      fontWeight: false,
      fill: '#34495E',
    },
  },
};
