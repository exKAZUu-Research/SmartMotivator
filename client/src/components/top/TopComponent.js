// @flow

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal';

import { PreExamComponent } from '../exam/PreExamComponent';
import { PostExamComponent } from '../exam/PostExamComponent';
import { LoadingComponent } from '../LoadingComponent';
import { FirstConfigFeaturesComponent } from './FirstConfigFeaturesComponent';
import { QuizButtonsComponent } from './QuizButtonsComponent';
import { MissionComponent } from '../mission/MissionComponent';
import { PostSurveyComponent } from '../survey/PostSurveyComponent';
import { Observer } from '../Observer';
import { GS, SUB_BUTTON_BORDER_COLOR } from '../style';
import { D, i18n } from '../../i18n/index';
import { KINDS } from '../study_history/util';
import { tracker } from '../../models/Tracker';
import { receiveMissionHistory } from '../../models/connection';
import { CalendarComponent } from '../mission/CalendarComponent';
import { isInCurrectExperiment } from '../../models/experiment_util';
import * as storage from '../../models/typed_storage';

import type { Navigator, ObservableData, UserInfo } from '../../types';

type Props = {|
  screenNav: Navigator<*>,
  observableData: ObservableData,
  pretestFinished: boolean,
  posttestFinished: boolean,
|};

type State = {|
  myInfo: UserInfo,
  configurationFinished: boolean,
  isCalendarModalVisible: boolean,
  postSurveyRequired: boolean,
  showPretest: boolean,
  showPosttest: boolean,
  initialized: boolean,
|};

export const TABS = KINDS;

export class TopComponent extends React.Component {
  props: Props;
  state: State;

  static navigationOptions = {
    header: null,
  };

  constructor(props: Props) {
    super(props);

    const { observableData, pretestFinished, posttestFinished } = props;
    const myInfo = observableData.myInfo.get();
    const showPretest = determineToExam(myInfo) && !pretestFinished;
    const showPosttest = determineToExam(myInfo) && !posttestFinished;
    this.state = {
      myInfo,
      configurationFinished: observableData.configurationFinished.get(),
      isCalendarModalVisible: false,
      postSurveyRequired: false,
      showPretest,
      showPosttest,
      initialized: false,
    };
  }

  /* ---- ---- ---- ---- life cycle events ---- ---- ---- ---- */

  componentDidMount() {
    tracker.trackScreenViewNoTabs('mainScreen');
    this.init();
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  /* ---- ---- ---- ---- custom actions ---- ---- ---- ---- */

  gotoAbout() {
    this.props.screenNav.navigate('AboutScreen', {
      myInfo: this.state.myInfo,
      observableData: this.props.observableData,
    });
  }

  gotoTopMenu() {
    this.props.screenNav.navigate('TopMenuScreen', {
      observableData: this.props.observableData,
    });
  }

  async init() {
    const { myInfo } = this.state;

    if (isInCurrectExperiment(myInfo.experimentMode) && myInfo.experimentEndDay) {
      if (moment(myInfo.experimentEndDay).isBefore(moment())) {
        const postSurveyRequired = !await this.isPostSurveySent();
        this.setState({ postSurveyRequired });
      }
    }

    const response = await receiveMissionHistory(myInfo.id);
    if (response.success) {
      const todaysFinishedMissions = _.filter(response.data, datum =>
        moment(datum.time).isAfter(moment().startOf('day'))
      );
      if (todaysFinishedMissions.length === 0) {
        this.setState({ isCalendarModalVisible: true });
      }
    }
    this.setState({ initialized: true });
  }

  isMinimalMode() {
    const { myInfo } = this.state;
    return myInfo.experimentMode === 'minimal';
  }

  async isPostSurveySent(): Promise<boolean> {
    const surveyAnswer = await storage.surveyAnswer2.get();
    return surveyAnswer ? surveyAnswer.isSent : false;
  }

  /* ---- ---- ---- ---- rendering ---- ---- ---- ---- */

  renderCalendarModal() {
    return (
      <Modal
        isVisible={this.state.isCalendarModalVisible}
        onBackdropPress={() => this.setState({ isCalendarModalVisible: false })}
      >
        <View style={GS.modal}>
          <Text style={S.calendarModalTitle}>{i18n(D().top.calendarModalTitle)}</Text>
          <Text style={S.calendarModalDescription}>{i18n(D().top.calendarModalDescription)}</Text>
          <View style={[GS.row, { height: 200 }]}>
            <CalendarComponent hideHeader={true} myInfo={this.state.myInfo} />
          </View>
          <TouchableOpacity onPress={() => this.setState({ isCalendarModalVisible: false })}>
            <View style={[GS.mainButton, GS.modalButton]}>
              <Text>{i18n(D().common.ok)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  renderMain() {
    const { observableData, screenNav } = this.props;
    const { myInfo, showPretest, showPosttest, postSurveyRequired, configurationFinished } = this.state;
    if (postSurveyRequired) {
      const onFinish = async () => {
        const sent = await this.isPostSurveySent();
        this.setState({ postSurveyRequired: !sent });
      };
      return <PostSurveyComponent myInfo={myInfo} onFinish={onFinish} />;
    }
    if (myInfo.experimentMode === 'minimal') {
      return this.renderMinimal();
    }
    if (!configurationFinished) {
      return <FirstConfigFeaturesComponent observableData={observableData} />;
    }
    if (showPretest) {
      const finish = async () => {
        await storage.pretestFinished.set(true);
        this.setState({ showPretest: false });
      };
      return <PreExamComponent myInfo={myInfo} finish={finish} />;
    }
    if (showPosttest) {
      const finish = async () => {
        await storage.posttestFinished.set(true);
        this.setState({ showPosttest: false });
      };
      return <PostExamComponent myInfo={myInfo} finish={finish} />;
    }
    return (
      <View style={[GS.flex, GS.marginStatusBar]}>
        {this.renderMenu()}
        <View style={[GS.flex, GS.flexCenterH]}>
          <MissionComponent observableData={observableData} screenNav={screenNav} />
        </View>
        <View style={S.quizButtonsContainer}>
          <QuizButtonsComponent minimalMode={false} screenNav={screenNav} observableData={observableData} />
        </View>
        {this.renderCalendarModal()}
      </View>
    );
  }

  renderMenu() {
    return (
      <View style={[GS.marginH10, GS.row]}>
        <View style={[GS.flex, GS.row, GS.flexStartV]} />
        <TouchableOpacity onPress={() => this.gotoTopMenu()} style={[GS.subButton, S.menuButton]}>
          <Icon name={'bars'} style={S.menuButtonText} />
        </TouchableOpacity>
      </View>
    );
  }

  renderMinimal() {
    const { observableData, screenNav } = this.props;
    const { myInfo } = this.state;

    return (
      <View style={[GS.flex, GS.marginStatusBar]}>
        <View style={GS.flex2} />
        <Text style={S.welcome}>{i18n(D().newTop.newTop.welcome, { name: myInfo.name })}</Text>
        <View style={GS.flex} />
        <View style={S.quizButtonsContainer}>
          <QuizButtonsComponent minimalMode={true} screenNav={screenNav} observableData={observableData} />
        </View>
        <View style={GS.flex} />
        <View style={GS.row}>
          <TouchableOpacity onPress={() => this.gotoAbout()} style={GS.flex}>
            <Text style={[GS.margin10, GS.textRight]}>{i18n(D().top.aboutTitle)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  render() {
    if (!this.state.initialized) {
      return <LoadingComponent />;
    }
    const { observableData } = this.props;
    return (
      <View style={[GS.flex, GS.themeBackground]}>
        <Observer
          data={observableData}
          onChangeMyInfo={myInfo => {
            this.setState({ myInfo });
          }}
          onChangeConfigurationFinished={configurationFinished => this.setState({ configurationFinished })}
        />
        {this.renderMain()}
      </View>
    );
  }
}

function determineToExam(myInfo: UserInfo): boolean {
  if (myInfo.course === 'english') {
    switch (myInfo.experimentMode) {
      case 'allEnabled':
      case 'oldMission':
        return true;
    }
  }
  return false;
}

// const BUTTON_ICON_COLOR = '#4d3c14'; // = BUTTON_BG_COLOR * 0.3

const S = StyleSheet.create({
  /* ---- ---- ---- ---- menu ---- ---- ---- ---- */
  menuContainer: {
    flexDirection: 'row',
    marginLeft: 10,
    marginRight: 10,
  },
  menuButton: {
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    paddingHorizontal: 15,
    justifyContent: 'center',
    height: 30,
  },
  menuButtonText: {
    fontSize: 20,
    color: SUB_BUTTON_BORDER_COLOR,
    textAlign: 'center',
  },

  /* ---- ---- ---- ---- quiz ---- ---- ---- ---- */
  quizButtonsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  /* ---- ---- ---- ---- minimalMode ---- ---- ---- ---- */
  welcome: {
    fontSize: 24,
    textAlign: 'center',
  },
  /* ---- ---- ---- ---- top temporary survey ---- ---- ---- ---- */
  survey: {
    backgroundColor: 'yellow',
    marginBottom: 10,
    marginHorizontal: 10,
    padding: 10,
    borderColor: 'black',
    borderWidth: 2,
  },
  surveyText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },

  /* ---- ---- ---- ---- calendar modal ---- ---- ---- ---- */
  calendarModalTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  calendarModalDescription: {
    fontSize: 17,
    marginBottom: 10,
  },
});
