// @flow

import { StyleSheet } from 'react-native';

import { BORDER_COLOR } from '../style';

/* Local Style */
export const LS = StyleSheet.create({
  mciiItem: {
    borderColor: BORDER_COLOR,
    borderBottomWidth: 1,
    padding: 10,
  },
  firstItem: {
    borderTopWidth: 1,
  },
  mciiHeader: {
    marginBottom: 10,
  },
  wish: {
    fontSize: 20,
  },
  ifThenPlan: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  descriptionBlock: {
    marginHorizontal: 20,
    marginVertical: 15,
  },
  descriptionText: {
    fontSize: 16,
    marginVertical: 10,
    lineHeight: 20,
  },
});
