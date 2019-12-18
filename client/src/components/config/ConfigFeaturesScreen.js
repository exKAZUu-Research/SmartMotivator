// @flow

import React from 'react';
import { Alert } from 'react-native';

import { ConfigFeaturesComponent } from './ConfigFeaturesComponent';
import { updateMyInfoEx } from '../../models/connection';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';

import type { Navigator, ObservableData, UserSettings } from '../../types';

type NavParams = {|
  observableData: ObservableData,
|};

export class ConfigFeaturesScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: void;

  /* ---- ---- ---- ---- life cycle events ---- ---- ---- ---- */

  componentDidMount() {
    tracker.trackScreenViewNoTabs('configuration');
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  /* ---- ---- ---- ---- custom actions ---- ---- ---- ---- */

  async save(setting: UserSettings) {
    tracker.trackEvent('config', 'update');

    const { observableData } = this.props.navigation.state.params;
    const userId = observableData.myInfo.get().id;
    const response = await updateMyInfoEx(userId, { setting });
    if (response.success) {
      const myInfo = response.data;
      observableData.myInfo.update(myInfo);
      this.props.navigation.goBack();
      return true;
    } else {
      Alert.alert(i18n(D().common.connectionErrorTitle), i18n(D().common.saveError));
      return false;
    }
  }

  /* ---- ---- ---- ---- rendering ---- ---- ---- ---- */

  render() {
    const myInfo = this.props.navigation.state.params.observableData.myInfo.get();
    return <ConfigFeaturesComponent myInfo={myInfo} saveLabel={i18n(D().common.save)} save={s => this.save(s)} />;
  }
}
