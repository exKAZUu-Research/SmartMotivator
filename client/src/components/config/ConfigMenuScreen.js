// @flow

import React from 'react';
import { View } from 'react-native';

import { Observer } from '../Observer';
import { MenuItem } from '../design/MenuItem';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';
import { updateVisitation } from '../util';
import { isInCurrectExperiment } from '../../models/experiment_util';

import type { Navigator, ObservableData, UserInfo } from '../../types';

type NavParams = {|
  observableData: ObservableData,
|};

type State = {|
  myInfo: UserInfo,
|};

export class ConfigMenuScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State = { myInfo: this.props.navigation.state.params.observableData.myInfo.get() };

  componentDidMount() {
    tracker.trackScreenViewNoTabs('config_menu');
    const { observableData } = this.props.navigation.state.params;
    updateVisitation(observableData, 'configurationComponent');
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  gotoAvatarSelection() {
    const { observableData } = this.props.navigation.state.params;
    this.props.navigation.navigate('ConfigAvatarScreen', { observableData });
  }

  gotoConfig() {
    const { observableData } = this.props.navigation.state.params;
    this.props.navigation.navigate('ConfigFeaturesScreen', { observableData });
  }

  gotoCourseSelect() {
    const { observableData } = this.props.navigation.state.params;
    this.props.navigation.navigate('CourseSelectScreen', { observableData });
  }

  gotoIntroduction() {
    const { observableData } = this.props.navigation.state.params;
    this.props.navigation.navigate('IntroductionEditScreen', { observableData });
  }

  gotoProfile() {
    const { observableData } = this.props.navigation.state.params;
    this.props.navigation.navigate('NameEditScreen', { observableData });
  }

  gotoResetHistory() {
    const { observableData } = this.props.navigation.state.params;
    this.props.navigation.navigate('StudyHistoryResetScreen', { observableData });
  }

  gotoSelectLocale() {
    const { observableData } = this.props.navigation.state.params;
    this.props.navigation.navigate('LocaleSelectScreen', { observableData });
  }

  render() {
    const { myInfo } = this.state;
    const canChangeSetting = myInfo.experimentMode !== 'fixed' && myInfo.experimentMode !== 'random';
    const canSwitchCourse = __DEV__ || myInfo.role === 'developer';
    const canResetStudyHistory = !isInCurrectExperiment(myInfo.experimentMode);

    return (
      <View>
        <Observer
          data={this.props.navigation.state.params.observableData}
          onChangeMyInfo={myInfo => this.setState({ myInfo })}
        />
        <MenuItem
          text={i18n(D().config.configMenu.changeName)}
          value={myInfo.name}
          onPress={() => this.gotoProfile()}
        />
        <MenuItem
          text={i18n(D().config.configMenu.editIntroduction)}
          value={myInfo.introduction}
          onPress={() => this.gotoIntroduction()}
        />
        <MenuItem text={i18n(D().config.configMenu.changeAvatar)} onPress={() => this.gotoAvatarSelection()} />
        {canChangeSetting && (
          <MenuItem text={i18n(D().config.configMenu.changeSettings)} onPress={() => this.gotoConfig()} />
        )}
        <MenuItem text={i18n(D().config.configMenu.changeLocale)} onPress={() => this.gotoSelectLocale()} />
        {canResetStudyHistory && (
          <MenuItem text={i18n(D().config.configMenu.resetStudyHistory)} onPress={() => this.gotoResetHistory()} />
        )}
        {canSwitchCourse && (
          <MenuItem
            text={i18n(D().config.configMenu.changeCourse)}
            value={myInfo.courseName}
            onPress={() => this.gotoCourseSelect()}
          />
        )}
      </View>
    );
  }
}
