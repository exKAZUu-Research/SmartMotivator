// @flow

import React from 'react';
import { AsyncStorage, Button, StyleSheet, Text, View } from 'react-native';
import { NavigationActions } from 'react-navigation';

import { ButtonBox } from './design/ButtonBox';
import { Link } from './design/Link';
import { DefaultScrollView } from './design/DefaultScrollView';
import { GS } from './style';
import { receiveSchool } from '../models/connection';
import { tracker } from '../models/Tracker';
import { FULL_VERSION } from '../version';
import { COURSE_ENGLISH } from '../quiz_data/courses';
import { D, i18n } from '../i18n/index';
import { isInCurrectExperiment } from '../models/experiment_util';

import type { Navigator, ObservableData } from '../types';

type NavParams = {|
  observableData: ObservableData,
|};

type State = {|
  init: boolean,
  contactText: string | null,
|};

export class AboutScreen extends React.PureComponent {
  props: { navigation: Navigator<NavParams> };
  state: State = { init: false, contactText: null };

  componentDidMount() {
    tracker.trackScreenViewNoTabs('about');
    this.init();
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  gotoModeSwitch() {
    const { observableData } = this.props.navigation.state.params;
    this.props.navigation.navigate('ExpModeSelectScreen', { observableData });
  }

  gotoTerms() {
    this.props.navigation.navigate('TermsScreen', {});
  }

  async init() {
    const { observableData } = this.props.navigation.state.params;
    const myInfo = observableData.myInfo.get();
    let contactText = null;
    if (myInfo.schoolId) {
      const response = await receiveSchool(myInfo.id, myInfo.schoolId);
      if (response.success) {
        const school = response.data;
        if (school.contactText) {
          contactText = school.contactText;
        }
      }
    }
    this.setState({ init: true, contactText });
  }

  async reset() {
    await AsyncStorage.clear();
    console.log('clear all data manually @ about screen');
    const actions = [NavigationActions.navigate({ routeName: 'RootScreen' })];
    const resetAction = NavigationActions.reset({ index: 0, actions });
    this.props.navigation.dispatch(resetAction);
  }

  renderAppDesc() {
    return (
      <View style={S.block}>
        <Text style={GS.note}>{i18n(D().about.promotionDescription)}</Text>
      </View>
    );
  }

  renderContact() {
    if (!this.state.init) {
      return null;
    }
    return (
      <View style={S.block}>
        <Text style={S.title}>{i18n(D().about.aboutInquiry)}</Text>
        {this.renderLinks(this.state.contactText || i18n(D().about.defaultContact))}
      </View>
    );
  }

  renderLicense() {
    const { observableData } = this.props.navigation.state.params;
    if (observableData.myInfo.get().course !== COURSE_ENGLISH) return null;

    const ngslUrl = 'http://web.archive.org/web/20150906031052/http://www.newgeneralservicelist.org/';
    const cc30Url = 'http://creativecommons.org/licenses/by/3.0/';

    return (
      <View style={S.block}>
        <Text style={S.title}>{i18n(D().about.aboutEnglishWords)}</Text>

        <View style={S.descBlock}>
          <Text style={S.descText}>{i18n(D().about.aboutWordList)}</Text>
        </View>

        <View style={S.descBlock}>
          <Link textStyle={S.descText} href={ngslUrl}>
            A New General Service List 1.01
          </Link>
          <Text style={S.descText}>(Browne, Culligan and Phillips)</Text>
          <Link textStyle={S.descText} href={cc30Url}>
            CC BY 3.0
          </Link>
        </View>
      </View>
    );
  }

  renderLinks(text: string) {
    const nodes = [];
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      if (/^https?:/.test(line)) {
        nodes.push(
          <Link href={line} textStyle={S.descText}>
            {line}
          </Link>
        );
      } else if (/^\w+@\w+/.test(line) || false) {
        nodes.push(
          <Link href={'mailto:' + line} textStyle={S.descText}>
            {line}
          </Link>
        );
      } else {
        nodes.push(<Text style={S.descText}>{line}</Text>);
      }
    }
    return <View children={nodes} />;
  }

  renderProfile() {
    const { observableData } = this.props.navigation.state.params;
    const { name, email, courseName, experimentMode } = observableData.myInfo.get();

    return (
      <View style={S.block}>
        <Text style={S.title}>{i18n(D().userModel.introduction)}</Text>

        <View style={S.descBlock}>
          <Text style={S.descText}>
            {i18n(D().userModel.name)}: {name}
          </Text>
          {email ? (
            <Text style={S.descText}>
              {i18n(D().userModel.email)}: {email}
            </Text>
          ) : null}
          <Text style={S.descText}>
            {i18n(D().userModel.course)}: {courseName}
          </Text>
          {isInCurrectExperiment(experimentMode) && <Text style={S.descText}>{'実験: 参加中'}</Text>}
        </View>
      </View>
    );
  }

  renderSwitchButton() {
    return (
      <ButtonBox>
        <Button title={i18n(D().config.configMenu.changeExpMode)} onPress={() => this.gotoModeSwitch()} />
        <Button title="RESET" onPress={() => this.reset()} />
      </ButtonBox>
    );
  }

  renderTermsLink() {
    return <Button title={i18n(D().about.terms)} onPress={() => this.gotoTerms()} />;
  }

  renderVersion() {
    return (
      <View style={S.block}>
        <Text style={S.title}>{i18n(D().common.currentVersion)}</Text>

        <View style={S.descBlock}>
          <Text style={S.descText}>
            {i18n(D().common.version)}: {FULL_VERSION}
          </Text>
        </View>
      </View>
    );
  }

  render() {
    const { observableData } = this.props.navigation.state.params;
    const myInfo = observableData.myInfo.get();
    const canSwitchMode = __DEV__ || myInfo.role === 'developer';
    const isRandom = false;

    return (
      <DefaultScrollView>
        {this.renderTermsLink()}
        {isRandom && this.renderAppDesc()}
        {this.renderContact()}
        {this.renderLicense()}
        {this.renderProfile()}
        {this.renderVersion()}
        {canSwitchMode && this.renderSwitchButton()}
      </DefaultScrollView>
    );
  }
}

const S = StyleSheet.create({
  block: {
    margin: 15,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  descBlock: {
    marginBottom: 5,
  },
  descText: {
    lineHeight: 18,
  },
  featureDesc: {
    marginLeft: 10,
  },
  features: {
    paddingVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
});
