// @flow

import React from 'react';
import _ from 'lodash';
import { Button, Text, View } from 'react-native';

import { GS } from './style';
import { D, i18n } from '../i18n/index';

export type StateForChecking = {
  error?: ?string,
  loading?: boolean,
  retry?: ?() => any,
};

export function loadStateWithPromises<T: StateForChecking>(
  comp: React.Component<*, *, T>,
  ...promises: Promise<?string | (() => any) | $Shape<T>>[]
) {
  comp.setState({ error: null, loading: true, retry: null });
  reloadStateWithPromises(comp, ...promises);
}

export async function reloadStateWithPromises<T: StateForChecking>(
  comp: React.Component<*, *, T>,
  ...promises: Promise<?string | (() => any) | $Shape<T>>[]
) {
  updateStateWithPromisesPrivate(comp, { error: null, loading: false, retry: null }, ...promises);
}

export async function updateStateWithPromises<T: StateForChecking>(
  comp: React.Component<*, *, T>,
  ...promises: Promise<?string | (() => any) | $Shape<T>>[]
) {
  updateStateWithPromisesPrivate(comp, {}, ...promises);
}

async function updateStateWithPromisesPrivate<T: StateForChecking>(
  comp: React.Component<*, *, T>,
  newState: $Shape<T>,
  ...promises: Promise<?string | (() => any) | $Shape<T>>[]
) {
  const errors = _.flatten(await Promise.all(promises));
  errors.forEach(ret => {
    if (ret) {
      if (typeof ret === 'string') {
        newState.error = ret;
      } else if (typeof ret === 'function') {
        newState.retry = (ret: () => any);
      } else if (typeof ret === 'object') {
        newState = Object.assign(newState, ret);
      }
    }
  });
  comp.setState(newState);
}

/**
 * @param error
 * @param loading
 * @param retry
 * @param render The rendering function. The reason why this is a function is because this prevents from constructing an invalid DOM (e.g. a non-null property receives a null value.).
 * @returns {*}
 */
export function renderAfterCheckingState(
  { error, loading, retry }: StateForChecking,
  render: () => ?React$Element<any> | false
) {
  if (error) {
    return (
      <View style={GS.flex}>
        <Text style={[GS.margin10, GS.errorBox]}>{error}</Text>
      </View>
    );
  } else if (retry) {
    return (
      <View style={GS.flex}>
        <Text style={[GS.errorBox, GS.margin10]}>{i18n(D().quiz.connectionError.errorMessage)}</Text>
        <Button title={i18n(D().common.retry)} onPress={retry} />
      </View>
    );
  } else if (loading !== false) {
    return (
      <View style={GS.flex}>
        <Text style={[GS.margin10, GS.textCenter]}>{i18n(D().common.nowLoading)}</Text>
      </View>
    );
  }
  return render() || null;
}
