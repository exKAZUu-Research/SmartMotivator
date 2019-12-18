// @flow

import React from 'react';
import { Alert, AppState, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import codePush from 'react-native-code-push';

import { GS } from './components/style';
import { migrate } from './models/migration';
import * as storage from './models/typed_storage';
import './models/Tracker';
import { receiveMyInfoEx, receiveServerStatusEx } from './models/connection';
import { MainComponent } from './components/MainComponent';
import { StartupComponent } from './components/startup/StartupComponent';
import { LoadingComponent } from './components/LoadingComponent';
import { TermsScreen } from './components/startup/registration/TermsScreen';

import { ANDROID_STORE_URI, APPLE_STORE_URI, FULL_VERSION } from './version';
import { D, i18n, loadLang } from './i18n/index';
import { KEY_AGREED_TERMS } from './models/global_storage_keys';
import { getOrInitDBValue } from './models/util';

import type { UserInfo } from './types';
import type { ResponseP } from './models/connection_type';

const ENABLE_CODE_PUSH = !__DEV__;

type State = {|
  initialized: boolean,
  agreedTerms: boolean,
  myInfo: UserInfo | null,
  configurationFinished: boolean,
  pretestFinished: boolean,
  posttestFinished: boolean,
|};

const S = StyleSheet.create({
  version: {
    paddingRight: 3,
    fontSize: 10,
    textAlign: 'right',
  },
});

class RootScreen_ extends React.Component {
  state: State;

  static async forceUpdate() {
    let updateFinished = false;
    while (!updateFinished) {
      updateFinished = await this.update();
      if (!updateFinished) {
        await errorDialog(i18n(D().appRoot.updatingAppError), false);
      }
    }
  }

  // handleAppStateChange内でthisが変わってしまって参照できないためstaticにする
  static async update(): Promise<boolean> {
    console.log('Update begins');

    const syncOptions = {
      updateDialog: {
        title: i18n(D().appRoot.updateDialog.title),
        mandatoryUpdateMessage: i18n(D().appRoot.updateDialog.updateMessage),
        mandatoryContinueButtonLabel: i18n(D().common.update),
        optionalUpdateMessage: i18n(D().appRoot.updateDialog.updateMessage),
        optionalInstallButtonLabel: i18n(D().common.update),
        optionalIgnoreButtonLabel: i18n(D().common.cancel),
        appendReleaseDescription: true,
        descriptionPrefix: i18n(D().appRoot.updateDialog.descriptionPrefix),
      },
      mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
      installMode: codePush.InstallMode.IMMEDIATE,
    };

    try {
      await codePush.sync(syncOptions, status => {
        console.log(`Sync status: ${status}`);
      });
    } catch (e) {
      return false;
    }

    console.log('Update finished');
    return true;
  }

  constructor(props: any) {
    super(props);
    this.state = {
      initialized: false, // ちらつきを抑える
      agreedTerms: false,
      myInfo: null,
      configurationFinished: false,
      pretestFinished: false,
      posttestFinished: false,
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.initialize();
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange(appState: string) {
    if (ENABLE_CODE_PUSH && appState === 'active') {
      RootScreen_.update();
    }
  }

  async initialize() {
    if (ENABLE_CODE_PUSH) {
      await RootScreen_.forceUpdate(); // アップデートは必ずはじめに完了させる
    }
    await migrate();
    await loadLang();

    const agreedTermsJSON = await getOrInitDBValue(KEY_AGREED_TERMS, () => 'false');
    const agreedTerms = JSON.parse(agreedTermsJSON);
    const configurationFinished = await storage.configurationFinished.get();
    const pretestFinished = await storage.pretestFinished.get();
    const posttestFinished = await storage.posttestFinished.get();
    const userId = await storage.userId.get();
    if (userId) {
      const myInfo = await getOrRetry(() => receiveMyInfoEx(userId));
      console.log('myInfo', myInfo);
      this.setState({
        myInfo,
        initialized: true,
        agreedTerms,
        configurationFinished,
        pretestFinished,
        posttestFinished,
      });
    } else {
      await getOrRetry(() => receiveServerStatusEx());
      this.setState({ initialized: true, agreedTerms, configurationFinished, pretestFinished, posttestFinished });
    }
  }

  simpleContainer(content: any) {
    return (
      <View style={[GS.marginStatusBar, GS.flex]}>
        <Text style={S.version}>v{FULL_VERSION}</Text>
        {content}
      </View>
    );
  }

  render() {
    if (!this.state.initialized) {
      return this.simpleContainer(<LoadingComponent />);
    }

    const { myInfo, configurationFinished, pretestFinished, posttestFinished } = this.state;
    if (myInfo === null || !myInfo.ready) {
      const onFinish = async (myInfo: UserInfo) => {
        this.setState({ myInfo, agreedTerms: true });
        return true;
      };
      return this.simpleContainer(<StartupComponent initialMyInfo={myInfo} onFinish={onFinish} />);
    }
    if (!this.state.agreedTerms) {
      const next = () => {
        this.setState({ agreedTerms: true });
      };
      return this.simpleContainer(<TermsScreen next={next} showAlert={true} navigation={this.props.navigation} />);
    }
    return (
      <MainComponent
        myInfo={myInfo}
        pretestFinished={pretestFinished}
        posttestFinished={posttestFinished}
        configurationFinished={configurationFinished}
        screenNav={this.props.navigation}
      />
    );
  }
}

async function errorDialog(message: string, goStore: boolean): Promise<void> {
  if (goStore) {
    const uri = Platform.select({ ios: APPLE_STORE_URI, android: ANDROID_STORE_URI });
    if (uri) {
      return new Promise(resolve => {
        const onPress = async () => {
          await Linking.openURL(uri);
          resolve();
        };
        const button = { text: i18n(D().common.openAppStore), onPress };
        Alert.alert(i18n(D().common.error), message, [button]);
      });
    }
  }
  return new Promise(resolve => {
    Alert.alert(i18n(D().common.error), message, [{ text: i18n(D().common.ok), onPress: resolve }]);
  });
}

async function getOrRetry<T>(f: () => ResponseP<T>): Promise<T | null> {
  let value: T = (undefined: any); // avoid flowtype error.
  while (true) {
    const response = await f();
    if (response.success) {
      value = response.data;
      break;
    }
    let goStore = false;
    switch (response.error) {
      case 'notFound':
      case 'badRequest':
        return null; // ユーザを登録しなおす
      case 'forbidden': {
        goStore = true;
        break;
      }
      case 'internalServerError':
      case 'serviceUnavailable':
      case 'offline':
      // nop
    }
    const msg = i18n(D().connectionError[response.error]);
    await errorDialog(msg, goStore);
  }
  return value;
}

const codePushOptions = { checkFrequency: codePush.CheckFrequency.MANUAL };
export const RootScreen = ENABLE_CODE_PUSH ? codePush(codePushOptions)(RootScreen_) : RootScreen_;
// export const RootScreen = RootScreen_;
