// @flow

import React from 'react';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { Platform } from 'react-native';

import { tracker } from '../models/Tracker';

type Props = {|
  folder: string,
  tabKeys?: void,
  changeTabEvent?: ({ i: number }) => any,
  forceTab?: number,
  renderContent?: any,
  children?: any,
|};

export class TabComponent extends React.Component {
  props: Props;
  state: void;
  tabview: ScrollableTabView;
  track: boolean;

  /* ---- ---- ---- ---- life cycle events ---- ---- ---- ---- */

  componentDidMount() {
    this.track = Platform.OS === 'ios';
  }

  /* ---- ---- ---- ---- custom actions ---- ---- ---- ---- */

  /* ---- ---- ---- ---- rendering ---- ---- ---- ---- */

  render() {
    const onChangeTab = ({ i, ref }) => {
      if (this.track) {
        const tabKey = ref.props.tabKey;
        tracker.trackScreenViewOnTabChange(`${this.props.folder}/${tabKey}`);
      }
      this.track = true;
      if (this.props.changeTabEvent) {
        this.props.changeTabEvent({ i });
      }
    };
    return (
      <ScrollableTabView
        initialPage={this.props.forceTab || 0}
        ref={tabview => {
          this.tabview = tabview;
        }}
        onChangeTab={onChangeTab}
        children={this.props.renderContent || this.props.children}
      />
    );
  }
}
