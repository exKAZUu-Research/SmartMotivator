// @flow

import { NavigationActions, StackNavigator } from 'react-navigation';

import { AboutScreen } from './components/AboutScreen';
import { AlarmConfigScreen } from './components/alarm/AlarmConfigScreen';
import { ConfigAvatarScreen } from './components/config/ConfigAvatarScreen';
import { ConfigMenuScreen } from './components/config/ConfigMenuScreen';
import { ConfigFeaturesScreen } from './components/config/ConfigFeaturesScreen';
import { CourseSelectScreen } from './components/config/CourseSelectScreen';
import { DateOffsetScreen } from './components/config/DateOffsetScreen';
import { DatePickerScreen } from './components/alarm/DatePickerScreen';
import { ExpModeSelectScreen } from './components/config/ExpModeSelectScreen';
import { LocaleSelectScreen } from './components/config/LocaleSelectScreen';
import { FollowMainScreen } from './components/follow/FollowMainScreen';
import { ImageViewScreen } from './components/quiz/it/ImageViewScreen';
import { IntroductionEditScreen } from './components/config/IntroductionEditScreen';
import { StudyHistoryResetScreen } from './components/config/StudyHistoryResetScreen';
import { ITQuizDetailScreen } from './components/quiz/it/ITQuizDetailScreen';
import { QuizListScreen } from './components/quiz/it/QuizListScreen';
import { QuizSubListScreen } from './components/quiz/it/QuizSubListScreen';
import { MCIIEditScreen } from './components/MCII/MCIIEditScreen';
import { MCIIListScreen } from './components/MCII/MCIIListScreen';
import { MemorizedQuizMenuScreen } from './components/quiz/memorized_quiz/MemorizedQuizMenuScreen';
import { NameEditScreen } from './components/config/NameEditScreen';
import { QuizMenuScreen } from './components/quiz/QuizMenuScreen';
import { QuizScreen } from './components/quiz/QuizScreen';
import { RootScreen } from './RootScreen';
import { StorageViewerScreen } from './components/StorageViewerScreen';
import { StudyHistoryScreen } from './components/study_history/StudyHistoryScreen';
import { TermsScreen } from './components/startup/registration/TermsScreen';
import { TopMenuScreen } from './components/top/TopMenuScreen';
import { UserDetailScreen } from './components/user_detail/UserDetailScreen';
import { MissionHistoryScreen } from './components/mission/MissionHistoryScreen';
import { MissionRankingScreen } from './components/mission/MissionRankingScreen';

import { D, i18n } from './i18n/index';

import type { Navigator } from './types';

const SCREENS = {
  RootScreen: {
    screen: RootScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      header: null,
    }),
  },

  QuizScreen: {
    screen: QuizScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().top.studyTitle),
    }),
  },

  QuizListScreen: {
    screen: QuizListScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().top.quizSetTitle),
    }),
  },

  ITQuizDetailScreen: {
    screen: ITQuizDetailScreen,
  },

  QuizSubListScreen: {
    screen: QuizSubListScreen,
  },

  QuizMenuScreen: {
    screen: QuizMenuScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().quiz.quizMenu.title),
    }),
  },

  MemorizedQuizMenuScreen: {
    screen: MemorizedQuizMenuScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().quiz.quizMenu.memorizedQuizList.title),
    }),
  },

  ImageViewScreen: {
    screen: ImageViewScreen,
  },

  TopMenuScreen: {
    screen: TopMenuScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().top.topTitle),
    }),
  },

  ConfigMenuScreen: {
    screen: ConfigMenuScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().top.configTitle),
    }),
  },

  NameEditScreen: {
    screen: NameEditScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().config.configMenu.changeName),
      headerBackTitle: i18n(D().common.cancel),
    }),
  },

  IntroductionEditScreen: {
    screen: IntroductionEditScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().config.configMenu.editIntroduction),
      headerBackTitle: i18n(D().common.cancel),
    }),
  },

  ConfigAvatarScreen: {
    screen: ConfigAvatarScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().config.configMenu.changeAvatar),
      headerBackTitle: i18n(D().common.cancel),
    }),
  },

  StudyHistoryResetScreen: {
    screen: StudyHistoryResetScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().config.configMenu.resetStudyHistory),
    }),
  },

  ConfigFeaturesScreen: {
    screen: ConfigFeaturesScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().config.configMenu.changeSettings),
      headerBackTitle: i18n(D().common.cancel),
    }),
  },

  StudyHistoryScreen: {
    screen: StudyHistoryScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().top.studyHistoryTitle),
    }),
  },

  UserDetailScreen: {
    screen: UserDetailScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().common.userDetail),
    }),
  },

  FollowMainScreen: {
    screen: FollowMainScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().top.followTitle),
    }),
  },

  MCIIListScreen: {
    screen: MCIIListScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().top.MCIITitle),
    }),
  },

  MCIIEditScreen: {
    screen: MCIIEditScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().mcii.mciiList.editMcii),
      headerBackTitle: i18n(D().common.cancel),
    }),
  },

  AlarmConfigScreen: {
    screen: AlarmConfigScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().top.reminderTitle),
    }),
  },

  DatePickerScreen: {
    screen: DatePickerScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().alarm.alarmConfig.pickerTitle),
      headerBackTitle: i18n(D().common.cancel),
    }),
  },

  CourseSelectScreen: {
    screen: CourseSelectScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().config.configMenu.changeCourse),
      headerBackTitle: i18n(D().common.cancel),
    }),
  },

  DateOffsetScreen: {
    screen: DateOffsetScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().config.configMenu.dateOffset),
      headerBackTitle: i18n(D().common.cancel),
    }),
  },

  ExpModeSelectScreen: {
    screen: ExpModeSelectScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().config.configMenu.changeExpMode),
      headerBackTitle: i18n(D().common.cancel),
    }),
  },

  LocaleSelectScreen: {
    screen: LocaleSelectScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().config.configMenu.changeExpMode),
      headerBackTitle: i18n(D().common.cancel),
    }),
  },

  AboutScreen: {
    screen: AboutScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().top.aboutTitle),
    }),
  },

  TermsScreen: {
    screen: TermsScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().about.terms),
      headerBackTitle: i18n(D().common.back),
    }),
  },

  StorageViewerScreen: {
    screen: StorageViewerScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().top.storageTitle),
    }),
  },

  MissionHistoryScreen: {
    screen: MissionHistoryScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().top.missionHistory),
    }),
  },

  MissionRankingScreen: {
    screen: MissionRankingScreen,
    navigationOptions: (navigation: Navigator<*>) => ({
      title: i18n(D().common.ranking),
    }),
  },
};

export type ScreenNames = $Keys<typeof SCREENS>;
export const WillingQuizApp = StackNavigator(SCREENS, {
  initialRouteName: 'RootScreen',
  headerMode: 'screen',
  cardStyle: {
    backgroundColor: 'white',
  },
});

const navigateOnce = getStateForAction => (action, state) => {
  const { type, routeName } = action;

  if (state && state.routes.length > 1 && action.type === NavigationActions.BACK && action.key === '_top') {
    action.key = state.routes[1].key;
  }

  return state && type === NavigationActions.NAVIGATE && routeName === state.routes[state.routes.length - 1].routeName
    ? null
    : getStateForAction(action, state);
};

WillingQuizApp.router.getStateForAction = navigateOnce(WillingQuizApp.router.getStateForAction);
