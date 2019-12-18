// @flow

import React from 'react';
import { View } from 'react-native';

import { SearchUsersComponent } from './SearchUsersComponent';
import { FollowingComponent } from './FollowingComponent';
import { TabComponent } from '../TabComponent';
import { tracker } from '../../models/Tracker';
import { receiveFollowingEx } from '../../models/connection';
import { updateVisitation } from '../util';
import { GS } from '../style';
import { D, i18n } from '../../i18n/index';
import { loadStateWithPromises, reloadStateWithPromises, renderAfterCheckingState } from '../render_util';

import type { StateForChecking } from '../render_util';
import type { Navigator, UserFollow } from '../../types';

type FollowTab = 'userSearch' | 'following';

const TAB_KEYS: FollowTab[] = ['following', 'userSearch'];

const TAB_LABELS: { [key: FollowTab]: string } = {
  following: i18n(D().follow.followMain.following),
  userSearch: i18n(D().follow.followMain.userSearch),
};

type State = {|
  followees: UserFollow[],
|} & StateForChecking;

export class FollowMainScreen extends React.Component {
  props: { navigation: Navigator<*> };
  state: State = {
    followees: [],
  };

  componentDidMount() {
    loadStateWithPromises(this, this.fetchFollowees());

    tracker.trackScreenViewWithTabs(`follow/${TAB_KEYS[0]}`);
    const { observableData } = this.props.navigation.state.params;
    updateVisitation(observableData, 'followComponent');
  }

  componentWillReceiveProps() {
    reloadStateWithPromises(this, this.fetchFollowees());
  }

  componentWillUnmount() {
    const { observableData } = this.props.navigation.state.params;
    observableData.myInfo.update(observableData.myInfo.get());
    tracker.trackScreenViewOnDismount();
  }

  async fetchFollowees() {
    const { observableData } = this.props.navigation.state.params;
    const response = await receiveFollowingEx(observableData.myInfo.get().id);
    if (!response.success) {
      return i18n(D().connectionError[response.error]);
    }
    return { followees: response.data || [] }; // TODO: is this really nullable?
  }

  renderContent() {
    let forceTab = null;
    if (this.state.followees.length <= 1) {
      forceTab = TAB_KEYS.indexOf('userSearch');
    } else {
      forceTab = TAB_KEYS.indexOf('following');
    }
    forceTab = 0; // TODO: remove this line after fixing #1928
    return (
      <TabComponent
        folder={'following'}
        forceTab={forceTab}
        renderContent={TAB_KEYS.map((_, index) => this.renderTabContent(index))}
      />
    );
  }

  renderTabContent(index: number) {
    const tabKey = TAB_KEYS[index];
    const tabLabel = TAB_LABELS[tabKey];

    const { navigation } = this.props;
    const { observableData } = navigation.state.params;
    let tabContent = null;
    if (index === 0) {
      tabContent = <FollowingComponent observableData={observableData} screenNav={navigation} />;
    } else if (index === 1) {
      tabContent = <SearchUsersComponent observableData={observableData} screenNav={navigation} />;
    }

    return (
      <View key={index} style={GS.flex} tabKey={tabKey} tabLabel={tabLabel}>
        {tabContent}
      </View>
    );
  }

  render() {
    return <View style={GS.flex}>{renderAfterCheckingState(this.state, () => this.renderContent())}</View>;
  }
}
