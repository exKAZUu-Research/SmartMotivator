// @flow

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AutoResizeProgress } from '../design/AutoResizeProgress';
import { BORDER_COLOR, GS } from '../style';
import { receiveQuizStatsEx } from '../../models/connection';
import { tracker } from '../../models/Tracker';
import { DefaultScrollView } from '../design/DefaultScrollView';
import { loadStateWithPromises, renderAfterCheckingState } from '../render_util';
import { D, i18n } from '../../i18n/index';
import * as storage from '../../models/typed_storage';

import type { StateForChecking } from '../render_util';
import type { QuizSet } from './types';
import type { Navigator, ObservableData } from '../../types';

type NavParams = {|
  observableData: ObservableData,
  minimal: boolean,
  onSelect: (QuizSet[], string) => void,
|};

type State = {|
  quizSets: QuizSet[],
  selectedGenre: string,
|} & StateForChecking;

export class QuizMenuScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State = { quizSets: [], selectedGenre: '' };

  /* ---- ---- ---- ---- life cycle events ---- ---- ---- ---- */

  componentDidMount() {
    tracker.trackScreenViewNoTabs('quiz_menu');
    loadStateWithPromises(this, this.init());
  }

  componentWillUnmount() {
    const { observableData } = this.props.navigation.state.params;
    observableData.myInfo.update(observableData.myInfo.get());
    tracker.trackScreenViewOnDismount();
  }

  /* ---- ---- ---- ---- custom actions ---- ---- ---- ---- */

  onPressMemorizedQuizzes(course: string, genre: string) {
    const { observableData } = this.props.navigation.state.params;
    this.props.navigation.navigate('MemorizedQuizMenuScreen', { course, genre, observableData });
  }

  onPressSelect(genre: string) {
    const { onSelect } = this.props.navigation.state.params;
    storage.lastQuizGenre.set(genre);
    onSelect(this.state.quizSets, genre);
    this.props.navigation.goBack();
  }

  async init() {
    const selectedGenre = await storage.lastQuizGenre.get();
    if (selectedGenre) {
      this.setState({ selectedGenre });
    }

    const { observableData } = this.props.navigation.state.params;
    const response = await receiveQuizStatsEx(observableData.myInfo.get().id);
    if (!response.success) {
      return () => this.init();
    }
    return { quizSets: response.data };
  }

  renderContent() {
    if (this.props.navigation.state.params.minimal) {
      return <DefaultScrollView>{this.state.quizSets.map(set => this.renderMinimalItem(set))}</DefaultScrollView>;
    }
    return (
      <DefaultScrollView style={[GS.themeBackground]}>
        <View style={GS.padding5}>{this.state.quizSets.map(set => this.renderItem(set))}</View>
      </DefaultScrollView>
    );
  }

  /* ---- ---- ---- ---- rendering ---- ---- ---- ---- */

  renderItem(set: QuizSet) {
    const selected = set.genre === this.state.selectedGenre;
    const all = set.total;
    const memorized = set.memorized;
    const correct = set.correct;
    const memorizedText = i18n(D().newTop.newTop.genreInfo, { memorized, correct, all });
    return (
      <View style={S.container} key={set.genre}>
        {selected && (
          <View style={GS.flexEndH}>
            <Text style={S.selected}>{i18n(D().quiz.quizMenu.selected)}</Text>
          </View>
        )}
        <View style={[S.box, selected ? S.selectedBox : null]}>
          <View style={[GS.row, GS.flexCenter]}>
            <View style={[GS.flex9]}>
              <Text style={S.quizTitle}>{set.label}</Text>
            </View>
            <TouchableOpacity
              style={[GS.subButton, S.buttonWide]}
              onPress={() => this.onPressMemorizedQuizzes(set.course, set.genre)}
            >
              <Text style={[S.buttonText, S.buttonTextSmall]}>{i18n(D().quiz.quizMenu.showDetail)}</Text>
            </TouchableOpacity>
          </View>
          <View style={S.secondRow}>
            <Text style={S.statText}>{memorizedText}</Text>
            <AutoResizeProgress value1={memorized} value2={correct} max={all} />
          </View>
          {selected ? (
            <View style={[GS.mainButtonDisabled, S.button]}>
              <Text style={[S.buttonText, S.buttonTextLarge, GS.mainButtonDisabledText]}>
                {i18n(D().quiz.quizMenu.selectQuiz)}
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={[GS.mainButtonW, S.button]} onPress={() => this.onPressSelect(set.genre)}>
              <Text style={[S.buttonText, S.buttonTextLarge]}>{i18n(D().quiz.quizMenu.selectQuiz)}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  renderMinimalItem(set: QuizSet) {
    if (set.genre === this.state.selectedGenre) {
      return (
        <View key={set.genre} style={[GS.row, GS.tableBody, S.row]}>
          <Text style={[S.mark, S.selectedMark]}>{'✓'}</Text>
          <Text style={S.selectLabel}>{set.label}</Text>
        </View>
      );
    } else {
      return (
        <TouchableOpacity key={set.genre} style={[GS.row, GS.tableBody, S.row]} onPress={this.onPressSelect(set.genre)}>
          <Text style={[S.mark]}>{'✓'}</Text>
          <Text style={S.selectLabel}>{set.label}</Text>
        </TouchableOpacity>
      );
    }
  }

  render() {
    return renderAfterCheckingState(this.state, () => this.renderContent());
  }
}

const SELECT_COLOR = '#a00000';

const S = StyleSheet.create({
  /* ----- common ----- */
  button: {
    paddingVertical: 5,
  },
  buttonText: {
    textAlign: 'center',
  },
  /* ----- container ----- */
  container: {
    margin: 5,
  },
  selected: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    backgroundColor: SELECT_COLOR,
    color: 'white',
  },
  box: {
    padding: 15,
    backgroundColor: 'white',
    borderColor: BORDER_COLOR,
    borderWidth: 1,
  },
  selectedBox: {
    borderWidth: 2,
    borderColor: SELECT_COLOR,
  },
  /* ----- first ----- */
  quizTitle: {
    fontSize: 20,
  },
  buttonWide: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  buttonTextSmall: {
    fontSize: 14,
  },
  /* ----- second ----- */
  secondRow: {
    marginVertical: 10,
  },
  statText: {
    fontSize: 12,
    color: '#555',
  },
  /* ----- third ----- */
  buttonTextLarge: {
    fontSize: 16,
    padding: 5,
  },

  /* ----- ----- minimal ----- ----- */
  row: {
    alignItems: 'center',
    height: 50,
  },
  mark: {
    fontSize: 24,
    color: '#eee',
    paddingHorizontal: 10,
  },
  selectedMark: {
    color: 'green',
  },
  selectLabel: {
    fontSize: 16,
  },
});
