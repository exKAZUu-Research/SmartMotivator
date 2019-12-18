// @flow

import React from 'react';
import { Alert, AsyncStorage, Button, Dimensions, StyleSheet, Text, View } from 'react-native';

import { ButtonBox } from '../../design/ButtonBox';
import { GS } from '../../style';
import { D, i18n } from '../../../i18n/index';
import { TERMS_OF_SERVICE } from '../../../resources/terms_of_service';
import { PRIVACY_POLICY } from '../../../resources/privacy_policy';
import { KEY_AGREED_TERMS } from '../../../models/global_storage_keys';
import { DefaultScrollView } from '../../design/DefaultScrollView';
import type { Navigator } from '../../../types';

type Props = {|
  back?: () => void,
  next?: () => void,
  navigation?: Navigator<*>,
  showAlert?: boolean,
|};

export class TermsScreen extends React.PureComponent {
  props: Props;
  state = { scrolledToBottom: false };

  componentDidMount() {
    if (this.props.showAlert) {
      Alert.alert(i18n(D().startup.registration.terms.alertTitle), i18n(D().startup.registration.terms.alertBody), [], {
        cancelable: false,
      });
    }
  }

  async onPressNext() {
    await AsyncStorage.setItem(KEY_AGREED_TERMS, JSON.stringify(true));
    if (this.props.next) {
      this.props.next();
    }
  }

  handleScroll(event: Object) {
    const windowHeight = Dimensions.get('window').height;
    const height = event.nativeEvent.contentSize.height;
    const offset = event.nativeEvent.contentOffset.y;
    if (windowHeight + offset >= height) {
      this.setState({ scrolledToBottom: true });
    }
  }

  renderButtons() {
    return (
      <ButtonBox direction="horizontal">
        {this.props.back ? <Button title={i18n(D().common.back)} onPress={this.props.back} /> : []}
        {this.props.next ? (
          <Button
            title={i18n(D().startup.registration.terms.agree)}
            onPress={() => this.onPressNext()}
            disabled={!this.state.scrolledToBottom}
          />
        ) : (
          []
        )}
      </ButtonBox>
    );
  }

  render() {
    return (
      <View style={GS.flex}>
        <DefaultScrollView style={[GS.flex, GS.padding10]} onScroll={event => this.handleScroll(event)}>
          <View style={S.block}>
            <Text style={S.title}>利用規約</Text>
            <Text style={S.body}>{TERMS_OF_SERVICE}</Text>
          </View>
          <View style={S.block}>
            <Text style={S.title}>プライバシーポリシー</Text>
            <Text style={S.body}>{PRIVACY_POLICY}</Text>
          </View>
        </DefaultScrollView>
        {this.renderButtons()}
      </View>
    );
  }
}

const S = StyleSheet.create({
  block: {
    margin: 5,
    marginBottom: 50,
  },
  title: {
    fontSize: 26,
    marginBottom: 5,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
});
