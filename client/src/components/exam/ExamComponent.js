// @flow
import _ from 'lodash';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DefaultScrollView } from '../design/DefaultScrollView';
import { ExamResultComponent } from './ExamResultComponent';
import { QuizRunnerComponent } from '../quiz/QuizRunnerComponent';
import { GS } from '../style';
import { postExam1Result, postExam1Start } from '../../models/connection';
import { D, i18n } from '../../i18n/index';

import type { Answer, PreTestQuiz, QuizItem } from '../quiz/types';
import type { UserInfo } from '../../types';

type Page = 'pre1' | 'pre2' | 'quiz' | 'result';

type Props = {
  myInfo: UserInfo,
  finish: () => any,
  post: boolean,
};

type State = {
  page: Page,
  quiz: PreTestQuiz[],
  answers: Answer[],
  fetchFailed: boolean,
};

export class ExamComponent extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    const page = props.post ? 'pre2' : 'pre1';
    this.state = {
      page,
      quiz: [],
      answers: [],
      fetchFailed: false,
    };
  }

  componentDidMount() {
    this.load();
  }

  goResult(answers: Answer[]) {
    this.setState({ page: 'result', answers });
    postExam1Result(answers, this.props.post);
  }

  goResultWithoutAnswer() {
    if (!__DEV__) return;

    const answers = [];
    this.state.quiz.forEach(q => {
      q.quizzes.forEach(quiz => {
        const answerIndex = Math.random() < 0.5 ? 0 : 1;
        const answer = {
          quizKey: quiz.key,
          correct: answerIndex === 0,
          spentTime: 1000,
          answerIndex,
        };
        answers.push(answer);
      });
    });
    this.goResult(answers);
  }

  goSecondPage() {
    this.setState({ page: 'pre2' });
  }

  async load() {
    this.setState({ fetchFailed: false, quiz: [] });
    const { myInfo } = this.props;
    const response = await postExam1Start(myInfo.id);
    if (response.success) {
      const quiz = response.data;
      quiz.forEach(qs => {
        qs.quizzes.forEach(item => {
          if (item.shuffle) {
            const len = item.answerSize || (item.answers && item.answers.length) || 0;
            if (len > 0) {
              item.shuffledIndexes = _.shuffle(_.range(0, len));
            }
          }
        });
      });
      console.log('quiz', quiz);
      this.setState({ quiz });
    } else {
      this.setState({ fetchFailed: true });
    }
  }

  startQuiz() {
    this.setState({ page: 'quiz' });
  }

  renderContent() {
    const { page } = this.state;
    switch (page) {
      case 'pre1':
        return this.renderPreQuiz1();
      case 'pre2':
      case 'post1':
        return this.renderPreQuiz2();
      case 'quiz':
        return this.renderQuiz();
      case 'result':
        return this.renderPostQuiz();
    }
    return this.renderPreQuiz1();
  }

  renderLoading() {
    const { quiz, fetchFailed } = this.state;
    if (fetchFailed) {
      return (
        <View>
          <Text style={GS.textCenter}>{i18n(D().common.connectionError)}</Text>
          <Button title={i18n(D().common.retry)} onPress={() => this.load()} />
        </View>
      );
    } else if (quiz.length === 0) {
      return <Text style={GS.textCenter}>{i18n(D().common.nowLoading)}</Text>;
    }
  }

  renderPostQuiz() {
    const { quiz, answers } = this.state;
    if (this.props.post) {
      return (
        <View style={GS.flex}>
          <Text style={S.text}>{i18n(D().pretest.resultPage2.message1)}</Text>
          <DefaultScrollView>
            <ExamResultComponent quiz={quiz} answers={answers} />
          </DefaultScrollView>
          <Button title={i18n(D().pretest.resultPage2.startApp)} onPress={() => this.props.finish()} />
        </View>
      );
    }
    return (
      <View style={GS.flex}>
        <Text style={S.text}>{i18n(D().pretest.resultPage1.message1)}</Text>
        <DefaultScrollView>
          <ExamResultComponent quiz={quiz} answers={answers} />
          <Text style={S.text}>{i18n(D().pretest.resultPage1.message2)}</Text>
        </DefaultScrollView>
        <Button title={i18n(D().pretest.resultPage1.startApp)} onPress={() => this.props.finish()} />
      </View>
    );
  }

  renderPreQuiz1() {
    return (
      <View style={GS.flex} key={1}>
        <View style={GS.flex} />
        <Text style={S.text}>{i18n(D().pretest.firstPage.message)}</Text>
        <View style={GS.flex} />
        <Button title={i18n(D().pretest.firstPage.next)} onPress={() => this.goSecondPage()} />
        <View style={GS.flex} />
      </View>
    );
  }

  renderPreQuiz2() {
    const { quiz } = this.state;
    const disabled = quiz.length === 0;
    const descriptionText = i18n(this.props.post ? D().pretest.firstPost2.message : D().pretest.secondPage.message);
    return (
      <View style={GS.flex} key={2}>
        <View style={GS.flex} />
        <Text style={S.text}>{descriptionText}</Text>
        <View style={GS.flex} />
        <Button title={i18n(D().pretest.secondPage.yes)} onPress={() => this.startQuiz()} disabled={disabled} />
        <Button title={i18n(D().pretest.secondPage.skip)} onPress={() => this.props.finish()} />
        {__DEV__ && (
          <Button
            title={i18n(D().pretest.secondPage.random)}
            onPress={() => this.goResultWithoutAnswer()}
            disabled={disabled}
          />
        )}
        {this.renderLoading()}
        <View style={GS.flex} />
      </View>
    );
  }

  renderQuiz() {
    const items: QuizItem[] = [];
    this.state.quiz.forEach(x => items.push(...x.quizzes));
    const screenNav: any = null; // 不要のため
    return <QuizRunnerComponent screenNav={screenNav} items={items} onFinish={ans => this.goResult(ans)} />;
  }

  render() {
    return <View style={[GS.marginStatusBar, GS.flex]}>{this.renderContent()}</View>;
  }
}

type ButtonProps = {
  title: string,
  disabled?: boolean,
  onPress: () => any,
};
function Button(props: ButtonProps) {
  if (props.disabled) {
    return (
      <View style={[GS.mainButtonDisabled, S.button]}>
        <Text style={[GS.mainButtonDisabledText, S.buttonText]}>{props.title}</Text>
      </View>
    );
  }
  return (
    <TouchableOpacity style={[GS.mainButton, S.button]} onPress={props.onPress}>
      <Text style={[S.buttonText]}>{props.title}</Text>
    </TouchableOpacity>
  );
}

const S = StyleSheet.create({
  text: {
    fontSize: 20,
    lineHeight: 24,
    margin: 20,
  },
  button: {
    margin: 10,
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 10,
  },
});
