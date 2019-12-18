// @flow

import _ from 'lodash';
import React from 'react';
import { Alert, AsyncStorage, Button, Text, TouchableOpacity, View } from 'react-native';

import { Table } from './design/Table';
import { ButtonBox } from './design/ButtonBox';
import { GS } from './style';
import { D, i18n } from '../i18n/index';
import { tracker } from '../models/Tracker';

export class StorageViewerScreen extends React.Component {
  props: {};
  state = { pairs: [] };

  componentDidMount() {
    this.loadData();
    tracker.trackScreenViewNoTabs('storageViewer');
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  async loadData() {
    const allKeys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(_.sortBy(allKeys));
    this.setState({ pairs });
  }

  remove(key: string) {
    const removeItem = async () => {
      await AsyncStorage.removeItem(key);
      await this.loadData();
    };
    Alert.alert(i18n(D().storageViewer.keyDeletionAlert, { key }), null, [
      { text: i18n(D().common.cancel), style: 'cancel' },
      { text: i18n(D().common.ok), onPress: removeItem },
    ]);
  }

  reset() {
    const clearDB = async () => {
      await AsyncStorage.clear();
      console.log('clear all data manually @ storage viewer');
      await this.loadData();
    };

    Alert.alert(i18n(D().storageViewer.dataResetAlert), null, [
      { text: i18n(D().common.cancel), style: 'cancel' },
      { text: i18n(D().common.ok), onPress: clearDB },
    ]);
  }

  render() {
    return (
      <View style={GS.flex}>
        <ButtonBox>
          <Button title={i18n(D().common.reset)} onPress={() => this.reset()} />
        </ButtonBox>
        <Table
          data={this.state.pairs}
          labels={['key', 'value']}
          toValues={[
            ([key, _]) => (
              <TouchableOpacity onPress={() => this.remove(key)}>
                <Text style={GS.linkText}>{key}</Text>
              </TouchableOpacity>
            ),
            ([_, value]) => value,
          ]}
          flexes={[1, 2]}
          aligns={['left', 'left']}
          bodyScrollable={true}
        />
      </View>
    );
  }
}
