// @flow

import _ from 'lodash';
import React from 'react';
import { ListView, TextInput, View } from 'react-native';

import { receiveSearchUserEx } from '../../models/connection';
import { IconItem } from '../design/IconItem';
import { gotoUserDetail } from '../user_detail/util';
import { GS } from '../style';
import { D, i18n } from '../../i18n/index';
import type { StateForChecking } from '../render_util';
import { loadStateWithPromises, renderAfterCheckingState } from '../render_util';
import type { Navigator, ObservableData, UserSearch } from '../../types';
import { getApproximatePointText } from '../mission/util';

type Props = {|
  observableData: ObservableData,
  screenNav: Navigator<*>,
|};

type State = {
  dsUsers: any,
} & StateForChecking;

export class SearchUsersComponent extends React.Component {
  props: Props;
  state: State = {
    dsUsers: null,
    error: i18n(D().follow.searchUsers.enterUserName),
  };

  async fetchData(searchVal: string) {
    if (!searchVal) {
      return i18n(D().follow.searchUsers.enterUserName);
    }

    const myInfo = this.props.observableData.myInfo.get();
    const response = await receiveSearchUserEx(myInfo.id, searchVal);
    if (!response.success) {
      return i18n(D().connectionError[response.error]);
    }
    const users = response.data;
    if (_.isEmpty(users)) {
      return i18n(D().common.usersNotFound);
    }

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    return { dsUsers: ds.cloneWithRows(users) };
  }

  renderRow(user: UserSearch) {
    const displayName = user.muted ? i18n(D().common.muted) : user.name;
    const desc = [];
    if (!user.muted) {
      if (user.introduction.length === 0) {
        desc.push(i18n(D().userModel.emptyIntroduction));
      } else {
        desc.push(user.introduction);
      }
    }
    desc.push(getApproximatePointText(user.point));
    return (
      <IconItem
        icon={user.icon}
        color={user.color}
        title={displayName}
        description={desc.join('\n')}
        action={() => {
          gotoUserDetail(user.id, this.props.observableData, this.props.screenNav);
        }}
      />
    );
  }
  renderTextInput() {
    const onChangeText = searchVal => {
      loadStateWithPromises(this, this.fetchData(searchVal));
    };
    return (
      <View style={[GS.margin10]}>
        <TextInput style={[GS.textInput]} placeholder={i18n(D().userModel.name)} onChangeText={onChangeText} />
      </View>
    );
  }
  renderUserList() {
    return renderAfterCheckingState(this.state, () => (
      <ListView
        enableEmptySections={true}
        dataSource={this.state.dsUsers}
        renderRow={rowData => this.renderRow(rowData)}
      />
    ));
  }
  render() {
    return (
      <View style={GS.flex}>
        {this.renderTextInput()}
        {this.renderUserList()}
      </View>
    );
  }
}
