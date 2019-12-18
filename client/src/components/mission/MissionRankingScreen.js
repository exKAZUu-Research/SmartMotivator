// @flow

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Ellipsis, IconNameCell, Table } from '../design/Table';
import { DefaultScrollView } from '../design/DefaultScrollView';
import { D, i18n } from '../../i18n/index';
import { receiveMissionRankingInfo } from '../../models/connection';
import { tracker } from '../../models/Tracker';
import { getApproximatePointText } from './util';

import type { Navigator, ObservableData, PointRanking, UserInfo } from '../../types';

type NavParams = {|
  myInfo: UserInfo,
  observableData: ObservableData,
|};

type Props = {|
  navigation: Navigator<NavParams>,
|};

type State = {|
  ranking: PointRanking | null,
|};

export class MissionRankingScreen extends React.Component {
  props: Props;
  state: State = { ranking: null };

  componentDidMount() {
    tracker.trackScreenViewNoTabs('missionRankingScreen');
    this.load();
  }

  gotoDetail(userId: string) {
    const { observableData } = this.props.navigation.state.params;
    this.props.navigation.navigate('UserDetailScreen', { userId, observableData });
  }

  async load() {
    const { myInfo } = this.props.navigation.state.params;
    const response = await receiveMissionRankingInfo(myInfo.id, 5, 5);
    if (response.success) {
      const ranking = response.data;
      console.log('ranking', ranking);
      this.setState({ ranking });
    } else {
      // TODO
    }
  }

  render() {
    const { ranking } = this.state;
    if (!ranking) {
      return null;
    }

    const { myInfo } = this.props.navigation.state.params;
    const toValues = [u => <IconNameCell {...u} />, u => getApproximatePointText(u.point)];
    const onPress = user => this.gotoDetail(user.id);
    const flexes = [1, 3, 2];
    const aligns = ['center', 'left', 'center'];
    const ellipses = ranking.topUsers.length > 0 && ranking.rivalUsers && ranking.rivalUsers.length > 0;
    return (
      <DefaultScrollView>
        <View>
          <Text style={S.rankingLabel}>{ranking.name}</Text>
          <Table
            data={ranking.topUsers}
            labels={[i18n(D().userModel.name), i18n(D().common.point)]}
            toValues={toValues}
            onPress={onPress}
            ranking={u => u.point}
            highlight={u => u.id === myInfo.id}
            flexes={flexes}
            aligns={aligns}
          />
          {ellipses && <Ellipsis />}
          {ranking.rivalUsers && (
            <Table
              data={ranking.rivalUsers}
              toValues={toValues}
              rankStart={ranking.rivalTopRank}
              hiddenTop={ranking.hiddenRivalCount}
              onPress={onPress}
              ranking={u => u.point}
              highlight={u => u.id === myInfo.id}
              flexes={flexes}
              aligns={aligns}
            />
          )}
        </View>
      </DefaultScrollView>
    );
  }
}
const S = StyleSheet.create({
  rankingLabel: {
    fontSize: 20,
    marginVertical: 10,
    textAlign: 'center',
  },
});
