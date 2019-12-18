// @flow
/* eslint-disable react/no-multi-comp */

import React from 'react';

import { renderMessage as renderAbsoluteMessage } from '../mission/LevelView';
import { renderMessage as renderOtherMessage } from '../mission/MissionRankingComponent';
import { RANKING_SIZE, renderMessage as renderSelfMessage } from '../mission/MyRankingComponent';
import { receiveMissionRankingInfo, receiveMissionSelfRanking } from '../../models/connection';

import type { PointRanking, UserInfo } from '../../types';
import type { DailyPointRanking, MissionInfo } from '../mission/types';

type Props = {
  myInfo: UserInfo,
  missionInfo: MissionInfo,
  style?: any,
};

export class FramingMessageComponent extends React.PureComponent {
  props: Props;
  state = { rand: Math.random() };

  render() {
    const { rand } = this.state;
    const props = { rand, ...this.props };
    switch (props.myInfo.setting.pointType) {
      case 'absolute':
        return <AbsoluteTypeComponent {...props} />;
      case 'self':
        return <SelfTypeComponent {...props} />;
      case 'other': {
        return <OtherTypeComponent {...props} />;
      }
    }
    console.log('unknown pointType', props.myInfo.setting.pointType);
    return null;
  }
}

type InnerProps = {
  myInfo: UserInfo,
  missionInfo: MissionInfo,
  style?: any,
  rand: number,
};

function AbsoluteTypeComponent(props: InnerProps) {
  const { myInfo, missionInfo, rand, style } = props;
  return renderAbsoluteMessage(myInfo, missionInfo, rand, style);
}
/*
* 点滅が何なのかわからない
* あと〜ポイントと、点滅が関係ある？
* 現在〜ポイントはイラない
*/
class SelfTypeComponent extends React.PureComponent {
  props: InnerProps;
  state: { pointRanking: DailyPointRanking | null };
  mounted: boolean;

  constructor(props: InnerProps) {
    super(props);
    this.state = { pointRanking: null };
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    this.load();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async load() {
    const response = await receiveMissionSelfRanking(this.props.myInfo.id, RANKING_SIZE);
    if (!this.mounted) return;
    if (response.success) {
      this.setState({ pointRanking: response.data });
    }
  }

  render() {
    const { pointRanking } = this.state;
    if (pointRanking) {
      const { myInfo, rand, style } = this.props;
      return renderSelfMessage(myInfo, pointRanking, rand, true, style);
    }
    return null;
  }
}

class OtherTypeComponent extends React.PureComponent {
  props: InnerProps;
  state: { pointRanking: PointRanking | null };
  mounted: boolean;

  constructor(props: InnerProps) {
    super(props);
    this.state = { pointRanking: null };
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    this.load();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async load() {
    const response = await receiveMissionRankingInfo(this.props.myInfo.id, 0, 3);
    if (!this.mounted) return;
    if (response.success) {
      this.setState({ pointRanking: response.data });
    }
  }

  render() {
    const { pointRanking } = this.state;
    if (pointRanking) {
      const { myInfo, rand, style } = this.props;
      return renderOtherMessage(myInfo, pointRanking, rand, true, style);
    }
    return null;
  }
}
/*
function renderBar(current: number, max: number, missionInfo: MissionInfo) {
  const active = _.sumBy(missionInfo.missions, m => adjustedMissionReward(m.reward, missionInfo.bonus));
  const msg1 = `現在${current}pt`;
  const msg2 = `あと${max - current}pt`;
  return (
    <View style={{ marginHorizontal: 20, marginTop: 5 }}>
      <View style={GS.row}>
        <Text>{msg1}</Text>
        <View style={GS.flex} />
        <Text style={GS.textRight}>{msg2}</Text>
      </View>
      <BlinkMiniBar width={FULL_WIDTH - 40} height={5} max={max} current={current} active={active} color={'blue'} />
    </View>
  );
}
*/
