// @flow

import _ from 'lodash';
import React from 'react';
import { ListView } from 'react-native';

import { receiveFollowingEx } from '../../models/connection';
import { IconItem, RankingIconItem } from '../design/IconItem';
import { gotoUserDetail } from '../user_detail/util';
import { D, i18n } from '../../i18n/index';

import type { StateForChecking } from '../render_util';
import { loadStateWithPromises, reloadStateWithPromises, renderAfterCheckingState } from '../render_util';
import type { Navigator, ObservableData, UserFollow } from '../../types';
import { getApproximatePointText } from '../mission/util';

type UserFollowWithRank = UserFollow & { rank: number };

type Props = {|
  observableData: ObservableData,
  screenNav: Navigator<*>,
|};

type State = {|
  followees: any,
|} & StateForChecking;

export class FollowingComponent extends React.Component {
  props: Props;
  state: State = {
    followees: null,
  };

  componentDidMount() {
    loadStateWithPromises(this, this.fetchFollowees());
  }

  componentWillReceiveProps() {
    reloadStateWithPromises(this, this.fetchFollowees());
  }

  async fetchFollowees() {
    const myInfo = this.props.observableData.myInfo.get();
    const response = await receiveFollowingEx(myInfo.id);
    if (!response.success) {
      return i18n(D().connectionError[response.error]);
    }

    let users = response.data;
    if (_.isEmpty(users)) {
      return i18n(D().follow.following.noFollowees);
    }

    const seriousCompMode = myInfo.setting.pointType === 'other';
    if (seriousCompMode) {
      users = _.orderBy(users, ['point', 'name'], ['desc', 'asc']);
      users.forEach((user: any, index) => {
        user.rank = index + 1;
      });
    } else {
      const partitionedUsers = _.partition(users, ['id', myInfo.id]);
      users = _.concat(partitionedUsers[0], _.orderBy(partitionedUsers[1], 'name', 'asc'));
    }
    const dsUsers = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
    });
    return { followees: dsUsers.cloneWithRows(users) };
  }

  renderRow(user: UserFollowWithRank) {
    const myInfo = this.props.observableData.myInfo.get();
    const seriousCompMode = myInfo.setting.pointType === 'other';

    let displayName = user.muted ? i18n(D().common.muted) : user.name;

    const isYourself = myInfo.id === user.id;
    if (isYourself) {
      displayName += i18n(D().common.youSuffix);
    }
    const desc = [];
    if (!user.muted) {
      if (_.isEmpty(user.introduction)) {
        desc.push(i18n(D().userModel.emptyIntroduction));
      } else {
        desc.push(user.introduction);
      }
    }
    desc.push(getApproximatePointText(user.point));

    if (seriousCompMode) {
      return (
        <RankingIconItem
          rank={user.rank}
          icon={user.icon}
          color={user.color}
          title={displayName}
          description={desc.join('\n')}
          action={() => gotoUserDetail(user.id, this.props.observableData, this.props.screenNav)}
        />
      );
    } else {
      return (
        <IconItem
          icon={user.icon}
          color={user.color}
          title={displayName}
          description={desc.join('\n')}
          action={() => gotoUserDetail(user.id, this.props.observableData, this.props.screenNav)}
        />
      );
    }
  }
  render() {
    return renderAfterCheckingState(this.state, () => (
      <ListView
        enableEmptySections={true}
        dataSource={this.state.followees}
        renderRow={rowData => this.renderRow(rowData)}
      />
    ));
  }
}
