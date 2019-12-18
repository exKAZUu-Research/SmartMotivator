// @flow

import React from 'react';
import { Alert, Button, View } from 'react-native';

import { Select } from '../design/Select';
import { ButtonBox } from '../design/ButtonBox';
import { receiveQuizCourseEx, updateMyInfoEx } from '../../models/connection';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';

import type { Navigator, ObservableData, UserInfo } from '../../types';
import type { CourseInfo } from '../quiz/types';

type NavParams = {|
  observableData: ObservableData,
|};

type State = {|
  myInfo: UserInfo,
  courseKey: string,
  courses: CourseInfo[],
|};

export class CourseSelectScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State;

  constructor(props: *) {
    super(props);
    const myInfo = this.props.navigation.state.params.observableData.myInfo.get();
    this.state = {
      myInfo,
      courseKey: myInfo.course,
      courses: [],
    };
  }

  componentDidMount() {
    this.init();
    tracker.trackScreenViewNoTabs('course_selection');
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  buildKeyToLabel() {
    const ret = {};
    for (const c of this.state.courses) {
      ret[c.key] = c.label;
    }
    return ret;
  }

  async init() {
    const result = await receiveQuizCourseEx(this.state.myInfo.id);
    if (result.success) {
      this.setState({ courses: result.data });
    }
  }

  async save() {
    const { observableData } = this.props.navigation.state.params;
    const { myInfo, courseKey } = this.state;
    if (myInfo.course === courseKey) {
      this.props.navigation.goBack();
      return;
    }

    const response = await updateMyInfoEx(myInfo.id, { course: courseKey });
    if (response.success) {
      const myInfo = response.data;
      observableData.myInfo.update(myInfo);
      this.props.navigation.goBack();
    } else {
      Alert.alert(i18n(D().common.connectionErrorTitle), i18n(D().common.saveError));
    }
  }

  render() {
    return (
      <View>
        <Select
          options={this.state.courses.map(c => c.key)}
          valueToLabel={this.buildKeyToLabel()}
          value={this.state.courseKey}
          onValueChange={courseKey => this.setState({ courseKey })}
        />
        <ButtonBox>
          <Button title={i18n(D().common.save)} onPress={() => this.save()} />
        </ButtonBox>
      </View>
    );
  }
}
