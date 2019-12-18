// @flow

import React from 'react';
import { Image, Platform, ScrollView, View } from 'react-native';
import PhotoView from 'react-native-photo-view';

import { tracker } from '../../../models/Tracker';
import { GS } from '../../style';

import type { Navigator } from '../../../types';

type NavParams = {|
  source: any,
|};

export class ImageViewScreen extends React.PureComponent {
  props: { navigation: Navigator<NavParams> };
  state: { init: boolean } = { init: false };

  componentDidMount() {
    tracker.trackScreenViewNoTabs('image_view');
    setTimeout(() => this.setState({ init: true }), 0);
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  render() {
    const { source } = this.props.navigation.state.params;
    if (!this.state.init) return <View />;
    if (Platform.OS === 'android') {
      return <PhotoView style={GS.flex} source={source} androidScaleType="fitCenter" />;
    } else {
      return (
        <ScrollView horizontal={true} minimumZoomScale={0.5} maximumZoomScale={3.0}>
          <Image source={source} />
        </ScrollView>
      );
    }
  }
}
