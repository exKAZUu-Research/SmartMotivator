// @flow

import React from 'react';
import { Button, View } from 'react-native';
import { NavigationActions } from 'react-navigation';

import { Select } from '../design/Select';
import { ButtonBox } from '../design/ButtonBox';
import { tracker } from '../../models/Tracker';
import { D, LANG, i18n, setLang } from '../../i18n/index';

import type { Navigator, ObservableData, SupportLanguages } from '../../types';

const MODES: SupportLanguages[] = ['en', 'ja'];
const LABELS: { [mode: SupportLanguages]: string } = {
  en: 'English',
  ja: '日本語',
};

type NavParams = {|
  observableData: ObservableData,
|};

type State = {|
  lang: SupportLanguages,
|};

export class LocaleSelectScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State;

  constructor(props: *) {
    super(props);
    this.state = { lang: LANG };
  }

  componentDidMount() {
    tracker.trackScreenViewNoTabs('locale_selection');
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  backToTop() {
    const actions = [NavigationActions.navigate({ routeName: 'RootScreen' })];
    const resetAction = NavigationActions.reset({ index: 0, actions });
    this.props.navigation.dispatch(resetAction);
  }

  async save() {
    setLang(this.state.lang);
    this.backToTop();
  }

  render() {
    return (
      <View>
        <Select
          options={MODES}
          valueToLabel={LABELS}
          value={this.state.lang}
          onValueChange={lang => this.setState({ lang })}
        />
        <ButtonBox>
          <Button title={i18n(D().common.save)} onPress={() => this.save()} />
        </ButtonBox>
      </View>
    );
  }
}
