// @flow

import React from 'react';
import { Alert, Button, View } from 'react-native';

import { Select } from '../design/Select';
import { ButtonBox } from '../design/ButtonBox';
import { updateMyInfoEx } from '../../models/connection';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';

import type { ExperimentMode, Navigator, ObservableData, UserInfo } from '../../types';

type Key = ExperimentMode | 'default';

const LABELS: { [mode: Key]: string } = {
  current: '現行版',
  design: 'デザイン改良版',
  noExam: '小目標版',
  minimal: '全部なし',
  default: 'デフォルト',
};
const MODES: Key[] = (Object.keys(LABELS): any);

type NavParams = {|
  observableData: ObservableData,
|};

type State = {|
  myInfo: UserInfo,
  expMode: Key | null,
|};

export class ExpModeSelectScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State;

  constructor(props: *) {
    super(props);
    const myInfo = this.props.navigation.state.params.observableData.myInfo.get();
    const expMode = myInfo.experimentMode;
    this.state = { myInfo, expMode };
  }

  componentDidMount() {
    tracker.trackScreenViewNoTabs('exp_mode_selection');
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  async save() {
    const { observableData } = this.props.navigation.state.params;
    const { myInfo, expMode } = this.state;
    const experimentMode: ?ExperimentMode = (expMode: any);
    const response = await updateMyInfoEx(myInfo.id, { experimentMode });
    if (response.success) {
      const myInfo = response.data;
      observableData.myInfo.update(myInfo);
      this.props.navigation.goBack();
    } else {
      Alert.alert(i18n(D().common.connectionErrorTitle), i18n(D().common.saveError));
    }
  }

  render() {
    return (
      <View>
        <Select
          options={MODES}
          valueToLabel={LABELS}
          value={this.state.expMode}
          onValueChange={expMode => this.setState({ expMode })}
        />
        <ButtonBox>
          <Button title={i18n(D().common.save)} onPress={() => this.save()} />
        </ButtonBox>
      </View>
    );
  }
}
