// @flow

import React from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import _ from 'lodash';

import { DefaultScrollView } from '../design/DefaultScrollView';
import { ButtonBox } from '../design/ButtonBox';
import { Select } from '../design/Select';
import { BORDER_COLOR, GS } from '../style';
import { receiveRecommendedSettingEx } from '../../models/connection';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';

import type { UserInfo, UserSettings } from '../../types';

const pointTypeOption = ['absolute', 'self', 'other'];
const pointTypeValueToLabel = {
  absolute: '所定の目標を達成するモード',
  self: '自分の記録を塗り替えるモード',
  other: '他の人と競うモード',
};

const praiseOption = [false, true];
function praiseValueToLabel(praiseEffort: boolean): string {
  return praiseEffort ? '努力を褒める' : '成績を褒める';
}

const framingOption = [true, false];
function framingValueToLabel(positiveFraming: boolean): string {
  return positiveFraming ? '良い結果を目指すための応援' : '悪い結果をさけるための応援';
}

const growthResetEveryHourOption = [false, true];
function growthResetEveryHourValueToLabel(praiseEffort: boolean): string {
  return praiseEffort ? '1時間ごとにリセット' : '1日ごとにリセット';
}

type Option = UserSettings;

type Props = {|
  myInfo: UserInfo,
  initialSetting?: ?UserSettings,
  saveLabel: string,
  save: (setting: UserSettings) => Promise<boolean>,
|};

type State = Option & { disabled: boolean };

export class ConfigFeaturesComponent extends React.Component {
  props: Props;
  state: State = {
    disabled: false,
    ...settingToOption(this.props.initialSetting || this.props.myInfo.setting),
  };

  componentDidMount() {
    const isExistingUser = !('positiveFraming' in this.props.myInfo.setting);
    if (isExistingUser) {
      this.setToRecommendation();
    }
  }

  /* ---- ---- ---- ---- custom actions ---- ---- ---- ---- */

  async setToRecommendation() {
    const { myInfo } = this.props;
    tracker.trackEvent('config', 'recommend');
    this.setState({ disabled: true });
    const response = await receiveRecommendedSettingEx(myInfo.id);
    this.setState({ disabled: false });
    if (response.success) {
      const recommendedSetting = response.data;
      if (_.isEmpty(recommendedSetting)) {
        Alert.alert(i18n(D().common.error), i18n(D().config.configuration.recommendationSystemError));
      } else {
        const setting = Object.assign({}, myInfo.setting, recommendedSetting);
        const option = settingToOption(setting);
        this.setState(option);
      }
    } else {
      Alert.alert(i18n(D().common.connectionErrorTitle), i18n(D().config.configuration.recommendationConnectionError));
    }
    this.setState({ disabled: false });
  }

  async save() {
    tracker.trackEvent('config', 'update');
    this.setState({ disabled: true });
    const setting = optionToSetting(this.state);
    const success = await this.props.save(setting);
    if (!success) {
      this.setState({ disabled: false });
    }
  }

  /* ---- ---- ---- ---- rendering ---- ---- ---- ---- */

  renderFooter() {
    const { disabled } = this.state;
    const showRecommendation = this.props.myInfo.experimentMode !== 'manual';

    return (
      <View style={S.footer}>
        <ButtonBox>
          {showRecommendation && (
            <Button
              title={i18n(D().config.configuration.applyRecommendation)}
              onPress={() => this.setToRecommendation()}
              disabled={disabled}
            />
          )}
          <Button title={this.props.saveLabel} onPress={() => this.save()} disabled={disabled} />
        </ButtonBox>
      </View>
    );
  }

  renderMain() {
    return (
      <DefaultScrollView alwaysBounceVertical={false}>
        <Heading>大目標</Heading>
        <Text style={[S.itemWrapper, S.itemText]}>大目標の種類</Text>
        <Select
          style={S.indent}
          options={pointTypeOption}
          valueToLabel={pointTypeValueToLabel}
          value={this.state.pointType}
          onValueChange={pointType => this.setState({ pointType })}
        />
        <Text style={[S.itemWrapper, S.itemText]}>応援メッセージの内容</Text>
        <Select
          style={S.indent}
          options={framingOption}
          valueToLabel={framingValueToLabel}
          value={this.state.positiveFraming}
          onValueChange={positiveFraming => this.setState({ positiveFraming })}
        />
        <Heading>学習後のメッセージ</Heading>
        <Select
          style={S.indent}
          options={praiseOption}
          valueToLabel={praiseValueToLabel}
          value={this.state.praiseEffort}
          onValueChange={praiseEffort => this.setState({ praiseEffort })}
        />
        {__DEV__ && (
          <View>
            <Heading>ミッション難易度のリセットタイミング</Heading>
            <Select
              style={S.indent}
              options={growthResetEveryHourOption}
              valueToLabel={growthResetEveryHourValueToLabel}
              value={this.state.growthResetEveryHour}
              onValueChange={growthResetEveryHour => this.setState({ growthResetEveryHour })}
            />
          </View>
        )}
      </DefaultScrollView>
    );
  }

  render() {
    return (
      <View style={GS.flex}>
        {this.renderMain()}
        {this.renderFooter()}
      </View>
    );
  }
}

const S = StyleSheet.create({
  itemWrapper: {
    marginVertical: 5,
    marginHorizontal: 10,
  },
  itemText: {
    fontSize: 16,
  },
  groupText: {
    margin: 5,
    fontSize: 16,
  },
  indent: {
    marginLeft: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: BORDER_COLOR,
  },
});

function settingToOption(setting: UserSettings): Option {
  return setting;
}

function optionToSetting(option: Option): UserSettings {
  return option;
}

function Heading(props: { children?: any }) {
  return (
    <View style={GS.tableHead}>
      <Text style={GS.margin5}>{props.children}</Text>
    </View>
  );
}
