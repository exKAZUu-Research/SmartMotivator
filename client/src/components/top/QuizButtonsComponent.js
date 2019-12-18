// @flow
import _ from 'lodash';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AutoResizeProgress } from '../design/AutoResizeProgress';
import { Observer } from '../Observer';
import { GS } from '../style';
import { D, i18n } from '../../i18n/index';
import { receiveQuizStatsEx } from '../../models/connection';
import * as storage from '../../models/typed_storage';

import type { QuizSet } from '../quiz/types';
import type { Navigator, ObservableData, UserInfo } from '../../types';

type Props = {|
  observableData: ObservableData,
  minimalMode: boolean,
  screenNav: Navigator<*>,
|};

type State = {|
  myInfo: UserInfo,
  quizSets: QuizSet[],
  selectedGenre: string,
|};

const DEFAULT_ENGLISH_GENRE_INDEX = 3; // 中級１

export class QuizButtonsComponent extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);

    const myInfo = props.observableData.myInfo.get();
    this.state = { myInfo, quizSets: [], selectedGenre: '' };
  }

  componentDidMount() {
    this.init();
  }

  componentWillReceiveProps() {
    this.init();
  }

  /* ---- ---- ---- ---- custom actions ---- ---- ---- ---- */

  gotoQuiz(course: string, genre: string) {
    if (course && genre) {
      const observableData = this.props.observableData;
      this.props.screenNav.navigate('QuizScreen', { observableData, course, genre });
    }
  }

  gotoQuizMenu(minimal: boolean) {
    this.props.screenNav.navigate('QuizMenuScreen', {
      myInfo: this.state.myInfo,
      minimal,
      observableData: this.props.observableData,
      onSelect: (quizSets, selectedGenre) => this.setState({ quizSets, selectedGenre }),
    });
  }

  async init() {
    const selectedGenre = await storage.lastQuizGenre.get();
    const { myInfo } = this.state;
    const response = await receiveQuizStatsEx(myInfo.id);
    if (response.success) {
      const quizSets = response.data;
      if (selectedGenre && _.some(quizSets, set => set.genre === selectedGenre)) {
        this.setState({ quizSets, selectedGenre });
      } else if (quizSets.length > 0) {
        let g = quizSets[0].genre;
        if (myInfo.course === 'english' && quizSets.length > DEFAULT_ENGLISH_GENRE_INDEX) {
          g = quizSets[DEFAULT_ENGLISH_GENRE_INDEX].genre;
        }
        this.setState({ quizSets, selectedGenre: g });
        await storage.lastQuizGenre.set(g);
      }
    } else {
      this.setState({ quizSets: [] });
    }
  }

  render() {
    const { minimalMode } = this.props;
    const { myInfo, quizSets, selectedGenre } = this.state;

    let genreName = '';
    let memorized = 0;
    let correct = 0;
    let all = 0;

    for (const set of quizSets) {
      if (set.course === myInfo.course && set.genre === selectedGenre) {
        genreName = set.label;
        memorized = set.memorized;
        correct = set.correct;
        all = set.total;
        break;
      }
    }

    const goList = () => this.gotoQuizMenu(minimalMode);
    return (
      <View>
        <View style={[GS.row, GS.flexCenter]}>
          <Text style={S.quizTitleText}>{genreName}</Text>
          {quizSets.length > 1 && (
            <TouchableOpacity style={[GS.subButton, S.button, S.buttonSmall]} onPress={goList}>
              <Text style={[S.buttonText, S.buttonTextSmall]}>{i18n(D().newTop.newTop.changeQuiz)}</Text>
            </TouchableOpacity>
          )}
        </View>

        {minimalMode ? (
          <View style={S.secondRow} />
        ) : (
          <View style={S.secondRow}>
            <Text style={S.quizStatText}>{i18n(D().newTop.newTop.genreInfo, { memorized, correct, all })}</Text>
            <AutoResizeProgress value1={memorized} value2={correct} max={all} />
          </View>
        )}
        <TouchableOpacity
          style={[GS.mainButton, S.button, S.buttonLarge]}
          onPress={() => this.gotoQuiz(myInfo.course, selectedGenre)}
        >
          <Text style={[S.buttonText, S.buttonTextLarge]}>{i18n(D().newTop.newTop.startQuiz)}</Text>
        </TouchableOpacity>
        <Observer data={this.props.observableData} onChangeMyInfo={myInfo => this.setState({ myInfo })} />
      </View>
    );
  }
}

const S = StyleSheet.create({
  // ---- ---- general
  button: {},
  buttonText: {
    textAlign: 'center',
  },
  // ---- ---- 1st line
  quizTitleText: {
    flex: 1,
    fontSize: 20,
  },
  buttonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 13,
    width: 100,
  },
  buttonTextSmall: {
    // color: '#875e00',
  },
  // ---- ---- 2nd line
  secondRow: {
    marginTop: 4,
    marginBottom: 10,
  },
  quizStatText: {
    color: '#4f3f16',
    fontSize: 12,
  },
  // ---- ---- 3rd line
  buttonLarge: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  buttonTextLarge: {
    lineHeight: 30,
    fontSize: 20,
  },
});
