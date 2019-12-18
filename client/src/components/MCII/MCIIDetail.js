// @flow

import _ from 'lodash';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GS } from '../style';
import { D, i18n } from '../../i18n/index';

import type { IfThenPlan, MCII } from '../../types';

function complementText(text) {
  return text || i18n(D().common.untitled);
}

function renderIfThenPlans(ifThenPlans: IfThenPlan[]) {
  return _.map(ifThenPlans, (ifThenPlan, i) => {
    return (
      <View key={i}>
        <Text style={S.ifThenPlan}>
          {i18n(D().mcii.mciiList.obstacle)}「{complementText(ifThenPlan.obstacle)}」{i18n(
            D().mcii.common.obstacleSuffix
          )}
        </Text>
        <Text style={S.ifThenPlan}>
          {i18n(D().mcii.mciiList.behavior)}「{complementText(ifThenPlan.behavior)}」{i18n(
            D().mcii.common.behaviorSuffix
          )}
        </Text>
      </View>
    );
  });
}

export function MCIIDetail({ mcii }: { mcii: MCII }) {
  return (
    <View style={GS.flex}>
      <View style={S.mciiHeader}>
        <Text style={S.wish}>
          「{complementText(mcii.wish)}」{i18n(D().mcii.common.wishSuffix)}
        </Text>
        <Text style={S.wish}>
          「{complementText(mcii.outcome)}」{i18n(D().mcii.common.outcomeSuffix)}
        </Text>
      </View>
      {renderIfThenPlans(mcii.ifThenPlans)}
    </View>
  );
}

const S = StyleSheet.create({
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
});
