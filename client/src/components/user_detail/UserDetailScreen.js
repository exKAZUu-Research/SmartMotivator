// @flow

import React from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconItem } from '../design/IconItem';

import { GS } from '../style';
import { receiveUserDetailsEx, updateFollowEx, updateMuteEx } from '../../models/connection';
import { ErrorComponent } from '../ErrorComponent';
import { getTextOfStatValue } from '../study_history/util';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';
import { getApproximatePointText } from '../mission/util';

import type { Navigator, ObservableData, UserFollowDetail } from '../../types';

type NavParams = {|
  userId: string,
  observableData: ObservableData,
|};

type State = {|
  userData: UserFollowDetail | null,
  error: string | null,
|};

export class UserDetailScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State = {
    userData: null,
    error: null,
  };

  componentDidMount() {
    tracker.trackScreenViewNoTabs(`follow/user_details`);
    this.fetchData();
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  async fetchData() {
    const { observableData } = this.props.navigation.state.params;
    const response = await receiveUserDetailsEx(
      observableData.myInfo.get().id,
      this.props.navigation.state.params.userId
    );
    if (response.success) {
      const userData = response.data;
      this.setState({ userData, error: null });
    } else {
      const error = i18n(D().connectionError[response.error]);
      this.setState({ userData: null, error });
    }
  }

  async followUser(user: UserFollowDetail) {
    const { observableData } = this.props.navigation.state.params;
    const response = await updateFollowEx(observableData.myInfo.get().id, user.id);
    if (response.success) {
      this.fetchData();
    } else {
      const error = i18n(D().connectionError[response.error]);
      this.setState({ error });
    }
  }

  async muteUser(user: UserFollowDetail) {
    const { observableData } = this.props.navigation.state.params;
    const response = await updateMuteEx(observableData.myInfo.get().id, user.id);
    if (response.success) {
      this.fetchData();
    } else {
      const error = i18n(D().connectionError[response.error]);
      this.setState({ error });
    }
  }

  renderUserDetails(user: UserFollowDetail) {
    const { observableData, userId } = this.props.navigation.state.params;
    const myInfo = observableData.myInfo.get();
    const isYourself = myInfo.id === userId;
    let name = user.muted ? i18n(D().common.muted) : user.name;
    if (isYourself) {
      name += i18n(D().common.youSuffix);
    }
    let desc = '';
    if (!user.muted) {
      desc += user.introduction.length === 0 ? i18n(D().userModel.emptyIntroduction) : user.introduction;
    }
    const followButtonTitle = i18n(user.followed ? D().follow.userDetail.unfollow : D().follow.userDetail.follow);
    const muteButtonTitle = i18n(user.muted ? D().follow.userDetail.unmute : D().follow.userDetail.mute);
    return (
      <View>
        <View style={GS.margin10}>
          <IconItem
            icon={user.icon}
            color={user.color}
            title={name}
            description={desc}
            style={{ borderBottomWidth: 0 }}
          />
        </View>
        <View style={[GS.margin10, GS.infoBox, S.box]}>
          <View style={GS.row}>
            <View style={GS.cell}>
              <Text style={S.boxText}>{i18n(D().common.correctCount)}</Text>
            </View>
            <View style={GS.cell}>
              <Text style={S.boxText}>{getTextOfStatValue(user.correctAns, 'count')}</Text>
            </View>
          </View>
          <View style={GS.row}>
            <View style={GS.cell}>
              <Text style={S.boxText}>{i18n(D().common.correctRate)}</Text>
            </View>
            <View style={GS.cell}>
              <Text style={S.boxText}>{getTextOfStatValue(user.percentCorrectAns, 'rate')}</Text>
            </View>
          </View>
          <View style={GS.row}>
            <View style={GS.cell}>
              <Text style={S.boxText}>{i18n(D().common.answerSpeed)}</Text>
            </View>
            <View style={GS.cell}>
              <Text style={S.boxText}>{getTextOfStatValue(user.avgSpeed, 'spentTime')}</Text>
            </View>
          </View>
          <View style={GS.row}>
            <View style={GS.cell}>
              <Text style={S.boxText}>{i18n(D().common.point)}</Text>
            </View>
            <View style={GS.cell}>
              <Text style={S.boxText}>{getApproximatePointText(user.point)}</Text>
            </View>
          </View>
        </View>
        <Text style={S.boxNote}>{i18n(D().follow.userDetail.dataNote)}</Text>
        {!isYourself && (
          <View style={GS.padding10}>
            <Button title={followButtonTitle} onPress={() => this.followUser(user)} />
            <Text style={GS.textCenter}>{i18n(D().follow.userDetail.followNotificationNote)}</Text>
          </View>
        )}
        {!isYourself && (
          <View style={GS.padding10}>
            <Button title={muteButtonTitle} onPress={() => this.muteUser(user)} />
            <Text style={GS.textCenter}>{i18n(D().follow.userDetail.muteNotificationNote)}</Text>
          </View>
        )}
      </View>
    );
  }
  render() {
    return (
      <ErrorComponent error={this.state.error}>
        <ScrollView>{this.state.userData && this.renderUserDetails(this.state.userData)}</ScrollView>
      </ErrorComponent>
    );
  }
}
const S = StyleSheet.create({
  box: {
    marginVertical: 0,
  },
  boxText: {
    fontSize: 18,
  },
  boxNote: {
    marginRight: 15,
    marginTop: 5,
    textAlign: 'right',
  },
});
