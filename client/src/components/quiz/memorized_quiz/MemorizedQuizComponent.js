// @flow

import _ from 'lodash';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Table } from '../../design/Table';
import { GS } from '../../style';
import { D, i18n } from '../../../i18n/index';
import type { UserInfo } from '../../../types';

type Props = {|
  myInfo: UserInfo,
  quizList: string[],
|};

export class MemorizedQuizComponent extends React.PureComponent {
  props: Props;
  state: void;

  render() {
    if (_.isEmpty(this.props.quizList)) {
      return <Text style={[GS.margin10, GS.errorBox]}>{i18n(D().quiz.quizMenu.memorizedQuizList.noQuizzes)}</Text>;
    }
    return (
      <View>
        <Text style={S.label}>
          {i18n(D().quiz.quizMenu.memorizedQuizList.quizTitle, {
            num: this.props.quizList.length,
          })}
        </Text>
        <Table
          data={this.props.quizList}
          labels={[i18n(D().quiz.quizMenu.memorizedQuizList.quizHeader)]}
          toValues={[quiz => quiz]}
          aligns={['center']}
        />
      </View>
    );
  }
}

const S = StyleSheet.create({
  label: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 20,
  },
});
