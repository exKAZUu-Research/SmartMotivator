// @flow

import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ConfigFeaturesComponent } from '../config/ConfigFeaturesComponent';
import { updateMyInfoEx } from '../../models/connection';
import { GS } from '../style';
import { D, i18n } from '../../i18n/index';
import * as storage from '../../models/typed_storage';

import type { ObservableData, UserSettings } from '../../types';

type Props = {|
  observableData: ObservableData,
|};

export class FirstConfigFeaturesComponent extends React.Component {
  props: Props;
  state: void;

  /* ---- ---- ---- ---- life cycle events ---- ---- ---- ---- */

  componentDidMount() {}

  /* ---- ---- ---- ---- custom actions ---- ---- ---- ---- */

  async save(setting: UserSettings) {
    const myInfo = this.props.observableData.myInfo.get();

    const response = await updateMyInfoEx(myInfo.id, { setting });
    if (response.success) {
      const newMyInfo = response.data;
      this.props.observableData.myInfo.update(newMyInfo);
      storage.configurationFinished.set(true);
      this.props.observableData.configurationFinished.update(true);
      return true;
    } else {
      Alert.alert(i18n(D().common.connectionErrorTitle), i18n(D().common.saveError));
      return false;
    }
  }

  /* ---- ---- ---- ---- rendering ---- ---- ---- ---- */

  render() {
    const myInfo = this.props.observableData.myInfo.get();
    const isManual = myInfo.experimentMode === 'manual';
    const isExistingUser = !('positiveFraming' in myInfo.setting);
    const msg = i18n(
      isExistingUser
        ? D().newTop.firstConfig.pleaseSetupExisting
        : isManual ? D().newTop.firstConfig.pleaseSetupManual : D().newTop.firstConfig.pleaseSetupDefault
    );

    return (
      <View style={[GS.flex, GS.marginStatusBar, S.container]}>
        <Text style={[GS.margin10, GS.note]}>{msg}</Text>
        <ConfigFeaturesComponent
          myInfo={myInfo}
          initialSetting={myInfo.setting}
          saveLabel={i18n(D().newTop.firstConfig.start)}
          save={s => this.save(s)}
        />
      </View>
    );
  }
}

const S = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
});
