// @flow

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Table } from '../design/Table';
import { FramingText, showPositive } from './FramingText';
import { getApproximatePointText } from './util';
import { receiveMissionSelfRanking } from '../../models/connection';
import { READABLE_DATEHOUR } from '../../models/date_util';
import { D, i18n } from '../../i18n/index';

import type { DailyPointRanking } from './types';
import type { UserInfo } from '../../types';

export const RANKING_SIZE = 5;
export const SMALL_RANKING_SIZE = 3;
export const OUTSIDE_TEXT = '圏外';

type Row = {
  rank: number | null,
  point: number,
  date: string | true | null,
};

type Props = {|
  myInfo: UserInfo,
  showTitle: boolean,
  small: boolean,
  wide: boolean,
|};

type State = {|
  rankingInfo: DailyPointRanking | null,
  rand: number,
|};

export class MyRankingComponent extends React.Component {
  props: Props;
  state: State = { rankingInfo: null, rand: Math.random() };

  componentDidMount() {
    this.mounted = true;
    this.load();
  }

  componentWillReceiveProps() {
    this.load();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async load() {
    const { myInfo } = this.props;
    const response = await receiveMissionSelfRanking(myInfo.id, RANKING_SIZE);
    if (!this.mounted) return;
    if (response.success) {
      const rankingInfo = response.data;
      this.setState({ rankingInfo });
    } else {
      // TODO
    }
  }

  makeRows(rankingInfo: DailyPointRanking): Row[] {
    const rows: Row[] = rankingInfo.ranking.map(x => ({ rank: null, point: x.point, date: x.date }));
    rows.push({ rank: null, point: rankingInfo.current, date: true });

    const len = RANKING_SIZE - rows.length;
    for (let i = 0; i < len; i++) {
      rows.push({ rank: null, point: -1 - i, date: null });
    }
    const sorted = _.sortBy(rows, r => -r.point);
    for (let i = 0; i < RANKING_SIZE; i++) {
      sorted[i].rank = i + 1;
    }
    const size = this.props.small ? SMALL_RANKING_SIZE : RANKING_SIZE;
    const myIndex = _.findIndex(sorted, x => x.date === true);
    if (myIndex < size) {
      return sorted.slice(0, size);
    } else {
      // 下２つを【自分の一つ上】と【自分】にする
      return sorted.slice(0, size - 2).concat([sorted[myIndex - 1], sorted[myIndex]]);
    }
  }

  mounted: boolean = false; // eslint-disable-line react/sort-comp

  renderDateCell(date: string | boolean | null): string {
    if (date === true) {
      return moment().format(READABLE_DATEHOUR);
    } else if (date) {
      return moment(date).format(READABLE_DATEHOUR);
    } else {
      return '-';
    }
  }

  renderPointCell(point: number): string {
    return point >= 0 ? getApproximatePointText(point) : '-';
  }

  renderRankCell(rank: number | null): string {
    return rank ? `${rank}${i18n(D().common.unit.rank)}` : OUTSIDE_TEXT;
  }

  renderTable(rankingInfo: DailyPointRanking) {
    const rows = this.makeRows(rankingInfo);
    return (
      <Table
        style={S.tableStyle}
        data={rows}
        toValues={[
          x => this.renderRankCell(x.rank),
          x => this.renderPointCell(x.point),
          x => this.renderDateCell(x.date),
        ]}
        highlight={x => x.date === true}
        flexes={[1, 2, 2]}
        aligns={['center', 'center', 'center']}
      />
    );
  }

  render() {
    const { myInfo, wide } = this.props;
    const { rankingInfo, rand } = this.state;
    if (!rankingInfo) {
      return null;
    }
    return (
      <View style={S.container}>
        {this.props.showTitle && (
          <Text style={[S.title, wide && S.wideTitle]}>{i18n(D().mission.myRanking.title)}</Text>
        )}
        {this.props.showTitle && renderMessage(myInfo, rankingInfo, rand, false, wide && S.wideFramingMessage)}
        {this.renderTable(rankingInfo)}
      </View>
    );
  }
}

function findRankAndPoint(rankingInfo: DailyPointRanking): { rank: number, point: number } {
  for (let i = rankingInfo.ranking.length - 1; i >= 0; i--) {
    const point = rankingInfo.ranking[i].point;
    if (point > rankingInfo.current) {
      return { rank: i + 1, point: point - rankingInfo.current };
    }
  }
  return { rank: 0, point: 0 };
}

export function renderMessage(
  myInfo: UserInfo,
  rankingInfo: DailyPointRanking,
  randomValue: number,
  noMessageWhenTop: boolean,
  textStyle: any
) {
  const { rank, point } = findRankAndPoint(rankingInfo);
  const approxPoint = getApproximatePointText(point);
  if (rank < 1) {
    if (noMessageWhenTop) {
      return null;
    }
    const msg = i18n(D().mission.myRanking.firstRankMessage);
    return (
      <FramingText positive={true} style={textStyle}>
        {msg}
      </FramingText>
    );
  }
  if (showPositive(myInfo.setting.positiveFraming, randomValue)) {
    const msg = i18n(D().mission.myRanking.positiveFramingMessage, { approxPoint, rank });
    return (
      <FramingText positive={true} style={textStyle}>
        {msg}
      </FramingText>
    );
  } else {
    const msg = i18n(D().mission.myRanking.negativeFramingMessage, { approxPoint, rank });
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
  tableStyle: {
    backgroundColor: 'white',
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
