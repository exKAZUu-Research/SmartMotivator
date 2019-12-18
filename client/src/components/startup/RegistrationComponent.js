// @flow

import React from 'react';
import { View } from 'react-native';
import { List } from 'immutable';

import { MenuComponent } from './registration/MenuComponent';
import { TermsScreen } from './registration/TermsScreen';
import { InputEmailComponent } from './registration/InputEmailComponent';
import { ConfirmEmailComponent } from './registration/ConfirmEmailComponent';
import { ValidateEmailComponent } from './registration/ValidateEmailComponent';
import { InputPreparedAccountComponent } from './registration/InputPreparedAccountComponent';
import { InputNameComponent } from './registration/InputNameComponent';
import { ConfirmNameComponent } from './registration/ConfirmNameComponent';

import { GS } from '../style';
import { FIXED_COURSE } from '../../version';
import * as storage from '../../models/typed_storage';

import type { UserInfo } from '../../types';

type Scene =
  | 'menu'
  | 'termsEmail'
  | 'termsPreparedAccount'
  | 'termsNoAccount'
  | 'inputEmail'
  | 'confirmEmail'
  | 'validateEmail'
  | 'inputPreparedAccount'
  | 'inputName'
  | 'confirmName';

type Route = {| scene: Scene | null |};

type Props = {|
  complete: (myInfo: UserInfo) => void,
|};

type State = {|
  email: string,
  name: string,
  course: string,
  loginId: string,
  myInfo: UserInfo | null,
  routes: List<Route>,
|};

export class RegistrationComponent extends React.PureComponent {
  props: Props;
  state: State = {
    email: '',
    name: '',
    course: '',
    loginId: '',
    myInfo: null,
    routes: List([{ scene: 'menu' }]),
  };

  componentDidMount() {
    this.init();
  }

  goBack() {
    const { routes } = this.state;
    this.setState({ routes: routes.pop() });
  }

  goto(scene: Scene) {
    const { routes } = this.state;
    this.setState({ routes: routes.push({ scene }) });
  }

  async init() {
    const cache = await getCache();
    if (cache.email) this.setState({ email: cache.email });
    if (cache.name) this.setState({ name: cache.name });
  }

  renderScene(route: Route) {
    const back = () => this.goBack();
    switch (route.scene) {
      case 'menu': {
        return (
          <MenuComponent
            gotoTermsEmail={() => this.goto('termsEmail')}
            gotoTermsPreparedAccount={() => this.goto('termsPreparedAccount')}
            gotoTermsNoAccount={() => this.goto('termsNoAccount')}
          />
        );
      }

      case 'termsEmail':
      case 'termsPreparedAccount':
      case 'termsNoAccount': {
        const nextScene = {
          termsEmail: 'inputEmail',
          termsPreparedAccount: 'inputPreparedAccount',
          termsNoAccount: 'inputName',
        }[route.scene];
        const next = () => {
          this.goto(nextScene);
        };
        return <TermsScreen next={next} back={back} showAlert={false} />;
      }
      case 'inputEmail': {
        const next = async (email: string) => {
          this.setState({ email });
          await storage.startupCache.patch({ email });
          this.goto('confirmEmail');
        };
        return <InputEmailComponent initialEmail={this.state.email} next={next} back={back} />;
      }
      case 'confirmEmail': {
        const next = async () => {
          await storage.startupCache.patch({ emailRegistered: true });
          this.goto('validateEmail');
        };
        return <ConfirmEmailComponent email={this.state.email} next={next} back={back} />;
      }
      case 'validateEmail':
      case 'inputPreparedAccount': {
        const next = async (myInfo: UserInfo) => {
          await storage.userId.set(myInfo.id);
          await storage.startupCache.patch({ id: myInfo.id });
          if (myInfo.ready) {
            this.props.complete(myInfo);
          } else {
            const name = myInfo.name || this.state.name;
            this.setState({ myInfo, name });
            this.goto('inputName');
          }
        };
        if (route.scene === 'validateEmail') {
          return <ValidateEmailComponent email={this.state.email} next={next} back={back} />;
        } else {
          return <InputPreparedAccountComponent next={next} back={back} />;
        }
      }
      case 'inputName': {
        const fixedCourse = FIXED_COURSE || (this.state.myInfo && this.state.myInfo.course) || null;
        const next = async (name: string, course: string) => {
          this.setState({ name, course });
          await storage.startupCache.patch({ name, course });
          this.goto('confirmName');
        };
        return (
          <InputNameComponent
            initialName={this.state.name}
            initialCourse={this.state.course}
            fixedCourse={fixedCourse}
            next={next}
            back={back}
          />
        );
      }
      case 'confirmName': {
        const next = async (myInfo: UserInfo) => {
          await storage.userId.set(myInfo.id);
          console.log('userId', myInfo.id);
          return this.props.complete(myInfo);
        };
        return (
          <ConfirmNameComponent
            name={this.state.name}
            course={this.state.course}
            myInfo={this.state.myInfo}
            next={next}
            back={back}
          />
        );
      }
    }
    return null;
  }

  render() {
    const { routes } = this.state;
    const route = routes.last();
    return <View style={[GS.flex, GS.bgWhite]}>{route && this.renderScene(route)}</View>;
  }
}

export type StartupRecord = {
  email: string,
  name: string,
};

async function getCache(): Promise<StartupRecord> {
  const cache = await storage.startupCache.get();
  if (cache) return cache;
  await storage.startupCache.set(DEFAULT_STARTUP_RECORD);
  return { ...DEFAULT_STARTUP_RECORD };
}

const DEFAULT_STARTUP_RECORD: StartupRecord = {
  email: '',
  name: '',
};
