// @flow
import React from 'react';
import { Alert, Button, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import Icon from 'react-native-vector-icons/FontAwesome';

import { COLORS_LIST, ICONS_LIST } from './utils';
import { ButtonBox } from '../design/ButtonBox';
import { DefaultScrollView } from '../design/DefaultScrollView';
import { BORDER_COLOR, GS } from '../style';
import { updateMyInfoEx } from '../../models/connection';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';

import type { Navigator, ObservableData, UserInfo } from '../../types';

type NavParams = {|
  observableData: ObservableData,
|};

type State = {|
  myInfo: UserInfo,
  icon: string,
  color: string,
  disabled: boolean,
|};

export class ConfigAvatarScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State;

  constructor(props: *) {
    super(props);
    const myInfo = this.props.navigation.state.params.observableData.myInfo.get();
    this.state = {
      myInfo,
      icon: myInfo.icon,
      color: myInfo.color,
      disabled: false,
    };
  }

  componentDidMount() {
    tracker.trackScreenViewNoTabs('icon_configuration');
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  async save() {
    tracker.trackEvent('config', 'update');

    const { observableData } = this.props.navigation.state.params;
    const { myInfo, icon, color } = this.state;
    this.setState({ disabled: true });
    const response = await updateMyInfoEx(myInfo.id, { icon, color });
    if (response.success) {
      const myInfo = response.data;
      observableData.myInfo.update(myInfo);
      this.props.navigation.goBack();
    } else {
      this.setState({ disabled: false });
      Alert.alert(i18n(D().common.connectionErrorTitle), i18n(D().common.saveError));
    }
  }

  renderColorPicker() {
    return (
      <DefaultScrollView tabLabel={i18n(D().config.configAvatar.pickColor)} alwaysBounceVertical={false}>
        <View style={S.horizontalList}>
          {COLORS_LIST.map(color => (
            <TouchableWithoutFeedback onPress={() => this.setState({ color })} key={color}>
              <View style={[S.listItem, S.bordered, { backgroundColor: color }]} />
            </TouchableWithoutFeedback>
          ))}
        </View>
      </DefaultScrollView>
    );
  }

  renderFooter() {
    return (
      <View style={[S.footer]}>
        <ButtonBox>
          <Button title={i18n(D().common.save)} onPress={() => this.save()} />
        </ButtonBox>
      </View>
    );
  }

  renderHeader() {
    const color = this.state.color;
    const iconStyle = color && { color };
    return (
      <View style={[GS.flexCenter, S.header]}>
        <View style={[GS.flexCenter, S.iconBlock, S.bordered]}>
          <Icon name={this.state.icon} style={[iconStyle, S.largeIcon]} />
        </View>
      </View>
    );
  }

  renderIconPicker() {
    return (
      <DefaultScrollView tabLabel={i18n(D().config.configAvatar.pickIcon)} alwaysBounceVertical={false}>
        <View style={S.horizontalList}>
          {ICONS_LIST.map(icon => (
            <TouchableWithoutFeedback onPress={() => this.setState({ icon })} key={icon}>
              <View style={[S.listItem, S.bordered, GS.flexCenter]}>
                <Icon name={icon} style={S.smallIcon} />
              </View>
            </TouchableWithoutFeedback>
          ))}
        </View>
      </DefaultScrollView>
    );
  }

  render() {
    return (
      <View style={GS.flex}>
        {this.renderHeader()}
        <ScrollableTabView style={GS.flex}>
          {this.renderIconPicker()}
          {this.renderColorPicker()}
        </ScrollableTabView>
        {this.renderFooter()}
      </View>
    );
  }
}

export const S = StyleSheet.create({
  /* ---- shared ---- */
  bordered: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 2,
    backgroundColor: 'white',
  },
  /* ---- header ---- */
  header: {
    margin: 10,
  },
  iconBlock: {
    width: 150,
    height: 150,
  },
  largeIcon: {
    fontSize: 100,
    textAlign: 'center',
  },
  /* ---- body ---- */
  horizontalList: {
    marginVertical: 15,
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  listItem: {
    margin: 5,
    height: 50,
    width: 50,
  },
  smallIcon: {
    fontSize: 20,
    textAlign: 'center',
  },
  /* ---- footer ---- */
  footer: {
    borderTopWidth: 1,
    borderColor: BORDER_COLOR,
  },
});
