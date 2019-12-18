// @flow
import React from 'react';
import { Alert, View } from 'react-native';

import { RegistrationComponent } from './RegistrationComponent';
import { PreSurveyComponent } from '../survey/PreSurveyComponent';
import { updateMyInfoEx } from '../../models/connection';
import { D, i18n } from '../../i18n/index';

import type { UserInfo } from '../../types';

type Props = {|
  initialMyInfo: UserInfo | null,
  onFinish: (myInfo: UserInfo) => Promise<boolean>,
|};

type Page = 'registraton' | 'survey';

type State = {|
  myInfo: UserInfo | null,
  page: Page | null,
|};

export class StartupComponent extends React.PureComponent {
  props: Props;
  state: State = { page: null, myInfo: this.props.initialMyInfo };

  componentDidMount() {
    this.init();
  }

  init() {
    const myInfo = this.state.myInfo;
    if (myInfo && myInfo.name && myInfo.course) {
      this.setState({ myInfo, page: 'survey' });
    } else {
      this.setState({ myInfo, page: 'registraton' });
    }
  }

  render() {
    switch (this.state.page) {
      case 'registraton': {
        const complete = (myInfo: UserInfo) => {
          if (myInfo.ready) {
            this.props.onFinish(myInfo);
          } else {
            this.setState({ page: 'survey', myInfo });
          }
        };
        return <RegistrationComponent complete={complete} />;
      }

      case 'survey': {
        const { myInfo } = this.state;
        if (myInfo) {
          const onFinish = async () => {
            const { myInfo } = this.state;
            if (!myInfo) return false;

            const response = await updateMyInfoEx(myInfo.id, { ready: true });
            if (response.success) {
              const newMyInfo = response.data;
              return this.props.onFinish(newMyInfo);
            } else {
              const error = i18n(D().connectionError[response.error]);
              Alert.alert(i18n(D().common.connectionErrorTitle), error);
              return false;
            }
          };
          return <PreSurveyComponent myInfo={myInfo} onFinish={onFinish} />;
        }
      }
    }
    return <View />;
  }
}
