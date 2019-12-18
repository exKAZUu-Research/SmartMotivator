// @flow
import React from 'react';

import type { ObservableData, UserInfo } from '../types';

type Props = {|
  children?: *,
  data: ObservableData,
  onChangeMyInfo?: (myInfo: UserInfo) => void | Promise<void>,
  onChangeConfigurationFinished?: (configurationFinished: boolean) => void,
|};

export class Observer extends React.Component {
  props: Props;
  state: void;
  subscriptions: { remove(): void }[];

  constructor(props: Props) {
    super(props);
    this.subscriptions = [];
  }

  componentDidMount() {
    const { data, onChangeMyInfo, onChangeConfigurationFinished } = this.props;
    if (onChangeMyInfo) {
      const s = data.myInfo.observe(onChangeMyInfo);
      this.subscriptions.push(s);
    }
    if (onChangeConfigurationFinished) {
      const s = data.configurationFinished.observe(onChangeConfigurationFinished);
      this.subscriptions.push(s);
    }
  }

  componentWillUnmount() {
    for (const subscription of this.subscriptions) {
      subscription.remove();
    }
    this.subscriptions = [];
  }

  render() {
    return React.isValidElement(this.props.children) ? this.props.children : null;
  }
}
