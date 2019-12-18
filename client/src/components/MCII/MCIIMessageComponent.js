// @flow

import React from 'react';
import { Text, View } from 'react-native';

import { KEY_MCIIS } from '../../models/global_storage_keys';
import { getOrInitDBValue } from '../../models/util';

import type { MCII } from '../../types';

import { D, i18n } from '../../i18n/index';

type Props = {| defaultMessage: string |};
type State = {| mcii: MCII | null |};

export class MCIIMessageComponent extends React.Component {
  props: Props;
  state: State = { mcii: null };

  componentDidMount() {
    this.fetch();
  }

  componentWillReceiveProps() {
    this.fetch();
  }

  async fetch() {
    const mciisJSON = await getOrInitDBValue(KEY_MCIIS, () => '[]');
    const mciis = safeJsonParse(mciisJSON) || [];
    if (mciis.length > 0) {
      this.setState({ mcii: mciis[0] });
    } else {
      this.setState({ mcii: null });
    }
  }

  render() {
    const mcii = this.state.mcii;
    if (mcii) {
      return (
        <View>
          <Text>
            「{mcii.wish}」{i18n(D().mcii.common.wishSuffix)}「{mcii.outcome}」{i18n(D().mcii.common.outcomeSuffix)}
          </Text>
        </View>
      );
    }
    return (
      <View>
        <Text>{this.props.defaultMessage}</Text>
      </View>
    );
  }
}

function safeJsonParse(json: string): * {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error(e);
  }
}
