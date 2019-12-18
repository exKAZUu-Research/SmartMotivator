// @flow

import _ from 'lodash';
import React from 'react';
import { Alert, AsyncStorage, Button, Text, TouchableOpacity, View } from 'react-native';

import { ButtonBox } from '../design/ButtonBox';
import { DefaultScrollView } from '../design/DefaultScrollView';
import { GS } from '../style';
import { KEY_MCIIS, KEY_MCII_CREATED } from '../../models/global_storage_keys';
import { getOrInitDBValue } from '../../models/util';
import { updateVisitation } from '../util';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';
import { LS } from './style';
import { MCIIDetail } from './MCIIDetail';

import type { MCII, Navigator, ObservableData } from '../../types';

const KEY_CHECKED_MCII_POLICY_CHANGE = 'checkedMCIIPolicyChange';

type NavParams = {|
  observableData: ObservableData,
|};

type State = {|
  mciis: MCII[],
|};

export class MCIIListScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State = {
    mciis: [],
  };

  componentDidMount() {
    tracker.trackScreenViewNoTabs('mcii_list');
    this.fetch();
    const { observableData } = this.props.navigation.state.params;
    updateVisitation(observableData, 'mciiComponent');
  }

  componentWillUnmount() {
    const { observableData } = this.props.navigation.state.params;
    observableData.myInfo.update(observableData.myInfo.get());
    tracker.trackScreenViewOnDismount();
  }

  onPressDelete(index: number) {
    Alert.alert(i18n(D().mcii.mciiList.deletionAlertTitle), i18n(D().mcii.mciiList.deletionAlertBody), [
      {
        text: i18n(D().common.cancel),
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: i18n(D().common.delete),
        onPress: async () => {
          tracker.trackEvent('mcii', 'delete', { data: { index } });
          const mciis = this.state.mciis;
          _.pullAt(mciis, [index]);
          this.setState({ mciis });
          await AsyncStorage.setItem(KEY_MCIIS, JSON.stringify(mciis));
        },
      },
    ]);
  }

  onPressEdit(index: number | null) {
    const observableData = this.props.navigation.state.params.observableData;
    this.props.navigation.navigate('MCIIEditScreen', {
      index,
      mciis: this.state.mciis,
      onFinish: (mcii: MCII) => this.createMCII(index, mcii),
      observableData,
    });
  }

  async checkMCIIPolicyChange() {
    const checkedMCIIPolicyChangeJSON = await getOrInitDBValue(KEY_CHECKED_MCII_POLICY_CHANGE, () => 'false');
    const checkedMCIIPolicyChange = JSON.parse(checkedMCIIPolicyChangeJSON);
    if (checkedMCIIPolicyChange || this.state.mciis.length === 0) {
      await AsyncStorage.setItem(KEY_CHECKED_MCII_POLICY_CHANGE, JSON.stringify(true));
      return;
    }
    Alert.alert(
      i18n(D().mcii.mciiList.sendAlertTitle),
      i18n(D().mcii.mciiList.sendAlertBody),
      [
        {
          text: i18n(D().mcii.mciiList.sendMciiData),
          onPress: async () => {
            tracker.trackEvent('mcii', 'keep', { data: this.state.mciis });
            await AsyncStorage.setItem(KEY_CHECKED_MCII_POLICY_CHANGE, JSON.stringify(true));
          },
        },
        {
          text: i18n(D().mcii.mciiList.deleteMciiData),
          onPress: async () => {
            tracker.trackEvent('mcii', 'reset');
            this.setState({ mciis: [] });
            await AsyncStorage.setItem(KEY_MCIIS, JSON.stringify([]));
            await AsyncStorage.setItem(KEY_CHECKED_MCII_POLICY_CHANGE, JSON.stringify(true));
          },
        },
      ],
      { cancelable: false }
    );
  }

  async createMCII(index: number | null, mcii: MCII) {
    const mciis = [].concat(this.state.mciis);
    if (index === null) {
      mciis.push(mcii);
      const newIndex = mciis.length - 1;
      tracker.trackEvent('mcii', 'create', { data: { index: newIndex, mcii } });
    } else {
      mciis[index] = mcii;
      tracker.trackEvent('mcii', 'update', { data: { index, mcii } });
    }
    this.setState({ mciis });

    await AsyncStorage.setItem(KEY_MCIIS, JSON.stringify(mciis));

    const alreadyCreated = await AsyncStorage.getItem(KEY_MCII_CREATED);
    if (!alreadyCreated) {
      // await achieveSetMciiFirst(this.props.navigation.state.params.observableData);
      await AsyncStorage.setItem(KEY_MCII_CREATED, 'true');
    }
  }

  async fetch() {
    const mciisJSON = await getOrInitDBValue(KEY_MCIIS, () => '[]');
    const mciis = JSON.parse(mciisJSON);
    this.setState({ mciis });
    await this.checkMCIIPolicyChange();
  }

  renderContent() {
    const empty = _.size(this.state.mciis) === 0;
    return (
      <View style={GS.flex}>
        {empty && this.renderDescription()}
        <ButtonBox>
          <Button title={i18n(D().mcii.mciiList.startMcii)} onPress={() => this.onPressEdit(null)} />
        </ButtonBox>
        {!empty && this.renderMCIIs()}
      </View>
    );
  }

  renderDescription() {
    return (
      <View style={LS.descriptionBlock}>
        <Text style={LS.descriptionText}>{i18n(D().mcii.mciiList.mciiDescription)}</Text>
      </View>
    );
  }

  renderMCIIs() {
    const items = _.map(this.state.mciis, (mcii, i) => {
      const style = [LS.mciiItem, i === 0 ? LS.firstItem : null];
      return (
        <TouchableOpacity style={style} key={i} onPress={() => this.onPressEdit(i)}>
          <View style={GS.row}>
            <MCIIDetail mcii={mcii} />
            <View style={GS.flexCenter}>
              <Button title={i18n(D().common.delete)} onPress={() => this.onPressDelete(i)} color="darkorange" />
            </View>
          </View>
        </TouchableOpacity>
      );
    });
    return <DefaultScrollView>{items}</DefaultScrollView>;
  }

  render() {
    return <View style={GS.flex}>{this.renderContent()}</View>;
  }
}
