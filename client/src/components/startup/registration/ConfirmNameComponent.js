// @flow
import uuid from 'uuid';
import React from 'react';
import { Button, Text, View } from 'react-native';

import { ButtonBox } from '../../design/ButtonBox';
import { GS } from '../../style';
import { LS } from './style';
import { createUserEx, updateMyInfoEx } from '../../../models/connection';
import { COURSES_NAMES } from './courses';
import { D, i18n } from '../../../i18n/index';

import type { UserInfo } from '../../../types';

type Props = {|
  name: string,
  course: string,
  myInfo: UserInfo | null,
  back: () => void,
  next: (myInfo: UserInfo) => Promise<void>,
|};

export class ConfirmNameComponent extends React.PureComponent {
  props: Props;
  state = {
    sending: false,
    hasError: false,
  };

  async submit() {
    this.setState({ sending: true, hasError: false });

    const { name, course } = this.props;
    if (this.props.myInfo) {
      const userId = this.props.myInfo.id;
      const response = await updateMyInfoEx(userId, { name, course });
      if (response.success) {
        const myInfo = response.data;
        this.props.next(myInfo);
      } else {
        this.setState({ sending: false, hasError: true });
      }
    } else {
      const userId = uuid.v4();
      const response = await createUserEx(userId, { name, course });
      if (response.success) {
        const myInfo = response.data;
        this.props.next(myInfo);
      } else {
        this.setState({ sending: false, hasError: true });
      }
    }
  }

  render() {
    return (
      <View style={GS.flex}>
        <View style={LS.formBlock}>
          <Text style={LS.label}>{i18n(D().startup.registration.confirmName.confirmation)}</Text>
        </View>
        <View style={LS.formBlock}>
          <Text>{i18n(D().userModel.name)}</Text>
          <Text style={LS.value}>{this.props.name}</Text>
        </View>
        <View style={LS.formBlock}>
          <Text>{i18n(D().userModel.course)}</Text>
          <Text style={LS.value}>{COURSES_NAMES[this.props.course]}</Text>
        </View>
        <ButtonBox direction="horizontal">
          <Button onPress={() => this.props.back()} title={i18n(D().common.back)} />
          <Button
            title={this.state.sending ? i18n(D().common.sending) : i18n(D().common.enter)}
            onPress={() => this.submit()}
            disabled={this.state.sending}
          />
        </ButtonBox>
        <View style={LS.formBlock}>
          <Text style={[GS.errorBox, !this.state.hasError && GS.hidden]}>
            {i18n(D().startup.registration.confirmName.sendingFailure)}
          </Text>
        </View>
        <View style={GS.flex} />
      </View>
    );
  }
}
