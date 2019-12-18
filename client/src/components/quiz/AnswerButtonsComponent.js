// @flow
import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

import { GS, MAIN_BUTTON_BG_COLOR } from '../style';
import { D, i18n } from '../../i18n/index';

type Props = {|
  answers: string[],
  layout: 0 | 1 | 2,
  columns?: number,
  onPressAnswer?: ?(index: number) => any,
  onPressSurrender?: ?() => any,
  correctHighlightF?: number => boolean,
  wrongHighlightF?: (number | null) => boolean,
  correctHighlight?: number,
  wrongHighlight?: number | null,
  style?: any,
  textStyle?: any,
|};

export class AnswerButtonsComponent extends React.PureComponent {
  props: Props;
  state: void;

  static LAYOUT_HORIZONTAL = 1;
  static LAYOUT_TABLE = 2;
  static LAYOUT_VERTICAL = 0;

  renderAnswerButton(text: string, index: number, style: ?any) {
    if (!text) {
      return <View key={index} style={[GS.flex, S.answerBox, S.emptyBox]} />;
    }
    const { correctHighlightF = _ => false, wrongHighlightF = _ => false } = this.props;
    const bg = correctHighlightF(index) ? S.bgCorrect : wrongHighlightF(index) ? S.bgWrong : S.bgDefault;

    const elem = (
      <View key={index} style={[GS.flex, S.answerBox, bg, style]}>
        <Text style={[S.answer, this.props.textStyle]}>{text}</Text>
      </View>
    );

    const f = this.props.onPressAnswer;
    if (f) {
      return (
        <TouchableWithoutFeedback key={index} onPress={() => f(index)}>
          {elem}
        </TouchableWithoutFeedback>
      );
    } else {
      return elem;
    }
  }

  renderHorizontalLayoutButtons() {
    return (
      <View style={[GS.row, GS.margin5, S.horizontalContainer, this.props.style]}>
        {this.props.answers.map((answer, index) => this.renderAnswerButton(answer, index))}
        {this.renderSurrenderButton(i18n(D().quiz.answerButtons.surrenderSmall))}
      </View>
    );
  }

  renderSurrenderButton(text: string, style: ?any) {
    const elem = (
      <View style={[GS.flex, S.answerBox, S.bgSurrender, style]}>
        <Text style={[S.answer, S.bgSurrenderText, this.props.textStyle]}>{text}</Text>
      </View>
    );

    const f = this.props.onPressSurrender;
    if (f) {
      return <TouchableWithoutFeedback onPress={f}>{elem}</TouchableWithoutFeedback>;
    } else {
      return elem;
    }
  }

  renderTableLayoutButtons() {
    const columns = this.props.columns || 2;
    const answers = this.props.answers;
    const len = Math.ceil(answers.length / columns);
    const rows = [];
    for (let i = 0; i < len; i++) {
      const cells = [];
      for (let j = 0; j < columns; j++) {
        const index = i * columns + j;
        const answer = answers[index];
        if (answer) {
          cells.push(this.renderAnswerButton(answer, index));
        } else {
          cells.push(this.renderAnswerButton('', index));
        }
      }
      rows.push(
        <View key={i} style={[GS.row, GS.flex]}>
          {cells}
        </View>
      );
    }
    return (
      <View style={[GS.margin5, this.props.style]}>
        {rows}
        {this.renderSurrenderButton(i18n(D().quiz.answerButtons.surrenderLarge), S.marginTop)}
      </View>
    );
  }

  renderVerticalLayoutButtons() {
    return (
      <View style={[GS.margin5, this.props.style]}>
        {this.props.answers.map((answer, index) => this.renderAnswerButton(answer, index))}
        {this.renderSurrenderButton(i18n(D().quiz.answerButtons.surrenderLarge), S.marginTop)}
      </View>
    );
  }

  render() {
    switch (this.props.layout) {
      case AnswerButtonsComponent.LAYOUT_VERTICAL:
        return this.renderVerticalLayoutButtons();
      case AnswerButtonsComponent.LAYOUT_HORIZONTAL:
        return this.renderHorizontalLayoutButtons();
      case AnswerButtonsComponent.LAYOUT_TABLE:
        return this.renderTableLayoutButtons();
    }
    console.error('unreachable');
    return null;
  }
}

type ButtonProps = {
  title: string,
  onPress: () => any,
  isSurrender: boolean,
  style?: any,
  textStyle?: any,
};
export function AnswerButton(props: ButtonProps) {
  const containerStyles = [S.singleButtonContainerStyle, props.isSurrender ? S.bgSurrender : S.bgDefault, props.style];
  return (
    <TouchableWithoutFeedback onPress={props.onPress}>
      <View style={[S.answerBox, containerStyles]}>
        <Text style={[S.answer, props.textStyle]}>
          {props.isSurrender ? i18n(D().quiz.answerButtons.surrenderLarge) : props.title}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const S = StyleSheet.create({
  horizontalContainer: {
    height: 60,
  },
  answerBox: {
    margin: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderColor: MAIN_BUTTON_BG_COLOR,
    borderWidth: 1,
    borderRadius: 999,
  },
  emptyBox: {
    borderColor: 'transparent',
  },
  answer: { textAlign: 'center', fontSize: 20 },
  marginTop: { marginTop: 20 },

  singleButtonContainerStyle: { padding: 15 },

  bgDefault: { backgroundColor: 'white' },
  bgSurrender: { backgroundColor: 'rgba(255,255,255, 1)', borderColor: '#ffde93' },
  bgSurrenderText: { color: '#666' },
  bgCorrect: { borderColor: 'transparent', backgroundColor: 'hsl(120, 73%, 75%)' },
  bgWrong: { borderColor: 'transparent', backgroundColor: 'hsl(9, 100%, 64%)' },
});
