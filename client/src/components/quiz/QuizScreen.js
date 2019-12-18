// @flow
import _ from 'lodash';
import React from 'react';

import { QuizPrestartView } from './QuizPrestartView';
import { QuizRunnerComponent } from './QuizRunnerComponent';
import { QuizFinishedComponent } from './QuizFinishedComponent';
import { LoadingComponent } from '../LoadingComponent';
import { postQuizResultEx, postQuizStart, receiveMissionInfo, updateMissionInfo } from '../../models/connection';
import { tracker } from '../../models/Tracker';
import { fetchImage } from './util';
import { isAccumulatedType } from '../mission/util';
import { suppressTodaysNotification } from '../alarm/AlarmConfigScreen';

import type { Answer, AnswerStats, AnswerWithStats, QuizItem, Result } from './types';
import type { MissionInfo } from '../mission/types';
import type { Navigator, ObservableData } from '../../types';

type FinishInfo = {
  result: Result,
  missionInfos: MissionInfo[],
};

type NavParams = {|
  course: string,
  genre: string,
  observableData: ObservableData,
|};

type State = {
  missionInfo: MissionInfo | null,
  items: QuizItem[],
  startQuiz: boolean,
  loadingResult: boolean,
  finished: FinishInfo | null,
};

const initialState = { items: [], startQuiz: false, missionInfo: null, loadingResult: false, finished: null };

export class QuizScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State = initialState;

  // ---- ---- ---- ---- life cycle events ---- ---- ---- ----

  componentDidMount() {
    const { course, genre } = this.props.navigation.state.params;
    tracker.trackScreenViewNoTabs(`quiz/${course}/${genre}`);
    this.loadQuiz();
  }

  componentWillUnmount() {
    const { observableData } = this.props.navigation.state.params;
    observableData.myInfo.update(observableData.myInfo.get());
    tracker.trackScreenViewOnDismount();
  }

  async finishQuiz(answers: Answer[]) {
    const { observableData, course, genre } = this.props.navigation.state.params;
    const myInfo = observableData.myInfo.get();

    this.setState({ loadingResult: true });
    const response = await postQuizResultEx(myInfo.id, (course: any), genre, answers);
    if (!response.success) {
      // TODO
      this.setState({ loadingResult: false });
      return;
    }

    const info = response.data;
    const statsMap: { [quizKey: string]: AnswerStats } = (_.keyBy(info.stats, 'quizKey'): any);
    const answersWithStats = answers.map((ans: Answer) => {
      const stats: AnswerStats = statsMap[ans.quizKey];
      const union: AnswerWithStats = (Object.assign({}, ans, stats): any);
      return union;
    });

    const missionInfoRes = await updateMissionInfo(myInfo.id, answersWithStats);
    const missionInfos: MissionInfo[] = missionInfoRes.success ? missionInfoRes.data : [];

    const result: Result = { answers, memorizedAllQuizzes: info.completedNow };

    const finished: FinishInfo = { result, missionInfos };
    this.setState({ loadingResult: false, finished });

    await suppressTodaysNotification();
  }

  // ---- ---- ---- ---- actions ---- ---- ---- ----

  async loadQuiz() {
    const { observableData, course, genre } = this.props.navigation.state.params;
    const userId = observableData.myInfo.get().id;

    const missionResponse = await receiveMissionInfo(userId);
    if (missionResponse.success) {
      const missionInfo = missionResponse.data;
      const isAllAccumulatedType = _.every(missionInfo.missions, isAccumulatedType);
      this.setState({ missionInfo, startQuiz: isAllAccumulatedType });
    }

    const response = await postQuizStart(userId, course, genre);
    if (response.success) {
      const items = response.data;
      for (const item of items) {
        if (item.images) {
          item.fetchedImages = await fetchImage(item.images);
        }
        if (item.shuffle) {
          const len = item.answerSize || (item.answers && item.answers.length) || 0;
          if (len > 0) {
            item.shuffledIndexes = _.shuffle(_.range(0, len));
          }
        }
      }
      this.setState({ items });
    }
  }

  studyAgain() {
    this.setState(initialState);
    this.loadQuiz();
    // TODO nextDataset
  }

  // ---- ---- ---- ---- rendering ---- ---- ---- ----

  renderQuizFinished(info: FinishInfo) {
    const { navigation } = this.props;
    const { observableData } = navigation.state.params;
    const { items } = this.state;

    return (
      <QuizFinishedComponent
        items={items}
        result={info.result}
        missionInfos={info.missionInfos}
        observableData={observableData}
        screenNav={navigation}
        studyAgain={() => this.studyAgain()}
      />
    );
  }

  // # 画面の種類
  // - 初期ロード
  // - クイズ中
  // - 結果送信中
  // - 結果
  render() {
    const { startQuiz, items, missionInfo, loadingResult, finished } = this.state;
    if (startQuiz) {
      if (finished) {
        return this.renderQuizFinished(finished);
      }
      if (loadingResult) {
        // 結果送信
        return <LoadingComponent />;
      }
      if (items.length > 0 && missionInfo != null) {
        return (
          <QuizRunnerComponent
            screenNav={this.props.navigation}
            missionInfo={missionInfo}
            items={items}
            onFinish={ans => this.finishQuiz(ans)}
          />
        );
      }
    } else if (missionInfo) {
      const { navigation } = this.props;
      const { observableData } = navigation.state.params;
      return (
        <QuizPrestartView
          missionInfo={missionInfo}
          observableData={observableData}
          screenNav={navigation}
          action={() => this.setState({ startQuiz: true })}
        />
      );
    }
    return <LoadingComponent />;
  }
}
