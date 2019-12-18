// @flow

import React from 'react';
import { View } from 'react-native';

import { AlarmMessageComponent } from '../alarm/AlarmMessageComponent';
import { MCIIMessageComponent } from '../MCII/MCIIMessageComponent';
import { StudyHistoryMessageComponent } from '../study_history/StudyHistoryMessageComponent';

import { Observer } from '../Observer';
import { IconItem } from '../design/IconItem';
import { IconSet } from '../design/IconSet';
import { DefaultScrollView } from '../design/DefaultScrollView';
import { COURSE_IT, COURSE_ITPASS } from '../../quiz_data/courses';
import { GS } from '../style';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';

import type { Navigator, ObservableData, UserInfo } from '../../types';

type NavParams = {|
  observableData: ObservableData,
|};

type State = {|
  myInfo: UserInfo,
|};

export class TopMenuScreen extends React.Component {
  props: { navigation: Navigator<NavParams> };
  state: State = {
    myInfo: this.props.navigation.state.params.observableData.myInfo.get(),
  };

  componentDidMount() {
    tracker.trackScreenViewNoTabs('topMenu');
  }

  componentWillUnmount() {
    const { observableData } = this.props.navigation.state.params;
    observableData.myInfo.update(observableData.myInfo.get());
    tracker.trackScreenViewOnDismount();
  }

  gotoAbout() {
    this.props.navigation.navigate('AboutScreen', {
      observableData: this.props.navigation.state.params.observableData,
      myInfo: this.state.myInfo,
    });
  }

  gotoAlarmConfig() {
    this.props.navigation.navigate('AlarmConfigScreen', {
      observableData: this.props.navigation.state.params.observableData,
    });
  }

  gotoCalendar() {
    this.props.navigation.navigate('CalendarScreen', {
      observableData: this.props.navigation.state.params.observableData,
      myInfo: this.state.myInfo,
    });
  }

  gotoConfig() {
    this.props.navigation.navigate('ConfigMenuScreen', {
      observableData: this.props.navigation.state.params.observableData,
    });
  }

  gotoDebug() {
    this.props.navigation.navigate('StorageViewerScreen', {});
  }

  gotoFollow() {
    this.props.navigation.navigate('FollowMainScreen', {
      observableData: this.props.navigation.state.params.observableData,
      myInfo: this.state.myInfo,
    });
  }

  gotoITQuizList() {
    this.props.navigation.navigate('QuizListScreen', {
      observableData: this.props.navigation.state.params.observableData,
    });
  }

  gotoMCIIList() {
    this.props.navigation.navigate('MCIIListScreen', {
      observableData: this.props.navigation.state.params.observableData,
    });
  }

  gotoStudyHistory() {
    this.props.navigation.navigate('StudyHistoryScreen', {
      myInfo: this.state.myInfo,
      observableData: this.props.navigation.state.params.observableData,
    });
  }

  render() {
    const { myInfo } = this.state;
    const featureFixed = myInfo.experimentMode === 'fixed';
    const showQuizList = myInfo.course === COURSE_IT || myInfo.course === COURSE_ITPASS;

    return (
      <View style={GS.flex}>
        <DefaultScrollView alwaysBounceHorizontal={false} alwaysBounceVertical={false}>
          <Observer
            data={this.props.navigation.state.params.observableData}
            onChangeMyInfo={myInfo => this.setState({ myInfo })}
          />
          {!featureFixed && (
            <IconItem
              icon={IconSet.mcii.name}
              color={IconSet.mcii.color}
              title={i18n(D().top.MCIITitle)}
              action={() => this.gotoMCIIList()}
            >
              <MCIIMessageComponent defaultMessage={i18n(D().top.MCIIDefaultDescription)} />
            </IconItem>
          )}
          <IconItem
            icon={IconSet.reminder.name}
            color={IconSet.reminder.color}
            title={i18n(D().top.reminderTitle)}
            action={() => this.gotoAlarmConfig()}
          >
            <AlarmMessageComponent />
          </IconItem>
          <IconItem
            icon={IconSet.config.name}
            color={IconSet.config.color}
            title={i18n(D().top.configTitle)}
            action={() => this.gotoConfig()}
          />
          {showQuizList && (
            <IconItem
              icon={IconSet.pastTest.name}
              color={IconSet.pastTest.color}
              title={i18n(D().top.quizSetTitle)}
              action={() => this.gotoITQuizList()}
            />
          )}
          <IconItem
            icon={IconSet.weeklyStatus.name}
            color={IconSet.weeklyStatus.color}
            title={i18n(D().top.studyHistoryTitle)}
            action={() => this.gotoStudyHistory()}
          >
            <StudyHistoryMessageComponent myInfo={myInfo} defaultMessage={i18n(D().top.studyHistoryDescription)} />
          </IconItem>
          <IconItem
            icon={IconSet.follow.name}
            color={IconSet.follow.color}
            title={i18n(D().top.followTitle)}
            description={i18n(D().top.followDescription)}
            action={() => this.gotoFollow()}
          />
          <IconItem
            icon={IconSet.about.name}
            color={IconSet.about.color}
            title={i18n(D().top.aboutTitle)}
            action={() => this.gotoAbout()}
          />
          {__DEV__ && (
            <IconItem
              icon={IconSet.storage.name}
              color={IconSet.storage.color}
              title={i18n(D().top.storageTitle)}
              description={i18n(D().top.storageDescription)}
              action={() => this.gotoDebug()}
            />
          )}
        </DefaultScrollView>
      </View>
    );
  }
}
