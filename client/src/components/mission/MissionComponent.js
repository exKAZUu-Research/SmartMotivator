// @flow

import React from 'react';
import { View } from 'react-native';

import { MissionView } from './MissionView';
import { GS } from '../style';
import { receiveMissionInfo } from '../../models/connection';

import type { MissionInfo } from './types';
import type { Navigator, ObservableData } from '../../types';

type Props = {
  observableData: ObservableData,
  screenNav: Navigator<*>,
};
type State = {|
  missionInfo: MissionInfo | null,
|};
export class MissionComponent extends React.Component {
  props: Props;
  state: State = { missionInfo: null };

  componentDidMount() {
    this.init();
  }

  componentWillReceiveProps() {
    this.init();
  }

  async init() {
    const { observableData } = this.props;
    const myInfo = observableData.myInfo.get();
    const response = await receiveMissionInfo(myInfo.id);
    if (response.success) {
      // console.log(response.data);
      this.setState({ missionInfo: response.data });
    } else {
      // TODO
    }
  }

  render() {
    const { missionInfo } = this.state;
    if (!missionInfo) {
      return <View style={GS.flex} />;
    }
    return (
      <MissionView
        observableData={this.props.observableData}
        missionInfos={[missionInfo]}
        screenNav={this.props.screenNav}
        emphasizeMissions={false}
        animation={false}
      />
    );
  }
}
