// @flow

import _ from 'lodash';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconNameCell, Table } from '../design/Table';
import { FramingText, showPositive } from './FramingText';
import { receiveMissionRankingInfo } from '../../models/connection';
import { getApproximatePointText } from './util';
import { GS } from '../style';
import { D, i18n } from '../../i18n/index';

import type { PointRanking, UserInfo } from '../../types';

const RANKING_SIZE = 5;
const SMALL_RANKING_SIZE = 3;

type Props = {|
  myInfo: UserInfo,
  ranking?: PointRanking | null,
  showMessage: boolean,
  small: boolean,
  wide: boolean,
  goRanking: (() => any) | null,
|};

type State = {|
  ranking: PointRanking | null,
  rand: number,
|};

export class MissionRankingComponent extends React.Component {
  props: Props;
  state: State = {
    ranking: this.props.ranking || null,
    rand: Math.random(),
  };

  componentDidMount() {
    this.mounted = true;
    this.load(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.load(nextProps);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async load(props: Props) {
    const { myInfo, small, ranking } = props;
    if (ranking) {
      this.setState({ ranking });
    } else {
      const response = await receiveMissionRankingInfo(myInfo.id, 0, small ? SMALL_RANKING_SIZE : RANKING_SIZE);
      if (!this.mounted) return;
      if (response.success) {
        this.setState({ ranking: response.data });
      } else {
        // TODO
      }
    }
  }

  mounted: boolean = false; // eslint-disable-line react/sort-comp

  renderTable(ranking: PointRanking) {
    const { myInfo } = this.props;
    return (
      <Table
        style={{ backgroundColor: 'white' }}
        data={ranking.rivalUsers || ranking.topUsers}
        toValues={[u => <IconNameCell small={true} {...u} />, u => getApproximatePointText(u.point)]}
        rankStart={ranking.rivalTopRank}
        hiddenTop={ranking.hiddenRivalCount}
        ranking={u => u.point}
        highlight={u => u.id === myInfo.id}
        flexes={[1, 3, 2]}
        aligns={['center', 'left', 'center']}
      />
    );
  }

  renderTitle(ranking: PointRanking) {
    const { wide, goRanking } = this.props;
    return (
      <View style={[GS.row, GS.flexSeparateV, S.title]}>
        <Text style={wide && S.wideTitle}>{ranking.name}</Text>
        {goRanking && (
          <TouchableOpacity onPress={goRanking}>
            <Text style={GS.linkText}>{i18n(D().mission.mission.seeRankingMore)}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  render() {
    const { myInfo, showMessage, wide } = this.props;
    const { ranking, rand } = this.state;
    if (!ranking) {
      return null;
    }
    return (
      <View style={S.container}>
        {showMessage && this.renderTitle(ranking)}
        {showMessage && renderMessage(myInfo, ranking, rand, false, wide && S.wideFramingMessage)}
        {this.renderTable(ranking)}
      </View>
    );
  }
}

function findRankAndPoint(myInfo: UserInfo, ranking: PointRanking): { rank: number, point: number } {
  const sortedUser = _.sortBy(ranking.rivalUsers || ranking.topUsers, u => -u.point);

  let lastScore = null;
  let rank = 0;
  for (let index = 0; index < sortedUser.length; index++) {
    const user = sortedUser[index];
    if (user.id === myInfo.id) {
      if (index === 0) {
        return { rank: 0, point: 0 };
      }
      const point = sortedUser[index - 1].point - sortedUser[index].point;
      return { rank, point };
    }
    const score = user.point;
    if (lastScore === null) {
      rank = index + ranking.rivalTopRank;
    } else if (lastScore > score) {
      rank = index + ranking.rivalTopRank + ranking.hiddenRivalCount;
    }
    lastScore = score;
  }
  return { rank: 0, point: 0 };
}

export function renderMessage(
  myInfo: UserInfo,
  ranking: PointRanking,
  randomValue: number,
  noMessageWhenTop: boolean,
  textStyle: any = null
) {
  const { rank, point } = findRankAndPoint(myInfo, ranking);
  const approxPoint = getApproximatePointText(point);
  if (rank < 1) {
    if (noMessageWhenTop) {
      return null;
    }
    const msg = i18n(D().mission.missionRanking.firstRankMessage);
    return (
      <FramingText positive={true} style={textStyle}>
        {msg}
      </FramingText>
    );
  }
  if (showPositive(myInfo.setting.positiveFraming, randomValue)) {
    const msg = i18n(D().mission.missionRanking.positiveFramingMessage, { approxPoint, rank });
    return (
      <FramingText positive={true} style={textStyle}>
        {msg}
      </FramingText>
    );
  } else {
    const msg = i18n(D().mission.missionRanking.negativeFramingMessage, { approxPoint, rank });
    return (
      <FramingText positive={false} style={textStyle}>
        {msg}
      </FramingText>
    );
  }
}

const S = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  rankingLabel: {
    fontSize: 20,
    marginVertical: 10,
    textAlign: 'center',
  },
  title: {
    marginBottom: 2,
  },
  wideTitle: {
    fontSize: 16,
  },
  wideFramingMessage: {
    fontSize: 18,
    padding: 10,
  },
});
