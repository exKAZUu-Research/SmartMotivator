// @flow

import _ from 'lodash';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MissionRankingComponent } from './MissionRankingComponent';
import { MyModal } from './MyModal';
import { LevelBadge, LevelView } from './LevelView';
import {
  OUTSIDE_TEXT as HIGHSCORE_OUTSIDE_TEXT,
  RANKING_SIZE as HIGHSCORE_SIZE,
  MyRankingComponent,
} from './MyRankingComponent';
import { ANIMATION_TIME, MiniBar } from './MiniBar';
import { SplittedMiniBar } from './SplittedMiniBar';
import { BORDER_COLOR, GS } from '../style';
import {
  adjustedMissionReward,
  getApproximatePointText,
  getMissionProgress,
  getTextOfApproximateInteger,
  isAccumulatedType,
  missionProgressText,
  missionTitle,
} from './util';
import { receiveMissionRankingInfo } from '../../models/connection';
import { D, i18n } from '../../i18n/index';
import { CalendarComponent } from '../mission/CalendarComponent';
import { IS_NARROW_SCREEN } from '../util';

import type { Mission, MissionInfo } from './types';
import type { Navigator, ObservableData, PointRanking } from '../../types';

const MAX_VALUE = 1 << 30;

type Props = {|
  observableData: ObservableData,
  missionInfos: MissionInfo[],
  emphasizeMissions: boolean,
  screenNav: Navigator<*>,
  animation: boolean,
|};

type State = {|
  step: number,
  missionInfo: MissionInfo | null,
  isLevelUpModalVisible: boolean,
  isRankUpModalVisible: boolean,
  isHighScoreModalVisible: boolean,
  isCalendarModalVisible: boolean,
  rankers: PointRanking | null,
|};

export class MissionView extends React.Component {
  props: Props;
  timeout: any;
  /**
   * step
   * 0: missionInfoを表示
   * 1: ミッションのゲージを増加
   * 2: ミッションの表示を変化＋ポイントゲージを増加
   * 3: ポイントの表示を変化
   * MAX_VALUE: 最終的なミッションを表示
   */
  state: State = {
    step: 0,
    missionInfo: null,
    isLevelUpModalVisible: false,
    isRankUpModalVisible: false,
    isHighScoreModalVisible: false,
    isCalendarModalVisible: false,
    rankers: null,
  };

  constructor(props: Props) {
    super(props);

    this.timeout = null;
  }

  componentDidMount() {
    this.mounted = true;
    const { missionInfos } = this.props;
    if (missionInfos.length > 1) {
      this.animate();
    }
    // this.loadRankers();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.missionInfos.length === 1 && nextProps.missionInfos.length > 1) {
      this.animate();
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.mounted = false;
  }

  getMission(step: number, index: number): Mission {
    return this.selectCorrectMissionInfo(step).missions[index];
  }

  async animate() {
    await this.sleep(200);
    this.setState({ step: 1 });
    await this.sleep(ANIMATION_TIME);

    const { observableData, missionInfos } = this.props;
    const myInfo = observableData.myInfo.get();
    const originalMissionInfo = missionInfos[0];
    const nextMissionInfo = missionInfos[1];
    const finalMissionInfo = missionInfos[2];

    if (originalMissionInfo.point < nextMissionInfo.point) {
      this.setState({ step: 2 });
      await this.sleep(ANIMATION_TIME);
    }
    this.setState({ step: 3 });

    switch (myInfo.setting.pointType) {
      case 'absolute': {
        const beforeLevel = originalMissionInfo.level;
        const afterLevel = finalMissionInfo.level;
        const isLevelUpModalVisible = afterLevel > beforeLevel;
        this.setState({ isLevelUpModalVisible });
        break;
      }
      case 'self': {
        const beforeRank = originalMissionInfo.highscoreRank;
        const afterRank = finalMissionInfo.highscoreRank;
        // console.log({ beforeRank, afterRank });
        const isHighScoreModalVisible = afterRank <= HIGHSCORE_SIZE && afterRank < beforeRank;
        this.setState({ isHighScoreModalVisible });
        break;
      }
      case 'other': {
        const beforeRank = originalMissionInfo.rank;
        const afterRank = finalMissionInfo.rank;
        const isRankUpModalVisible = afterRank !== beforeRank;
        this.loadRankers();
        this.setState({ isRankUpModalVisible });
        break;
      }
    }

    const isCalendarModalVisible = !originalMissionInfo.missionClearedToday && finalMissionInfo.missionClearedToday;
    this.setState({ isCalendarModalVisible });

    if (nextMissionInfo !== finalMissionInfo) {
      await this.sleep(1000);
    }
    this.setState({ step: MAX_VALUE });
  }

  goDetail(index: number) {
    const { observableData } = this.props;
    const myInfo = observableData.myInfo.get();
    const missionInfo = this.selectCorrectMissionInfo(0);
    this.props.screenNav.navigate('MissionDetailScreen', { index, myInfo, missionInfo });
  }

  goHistory() {
    const { observableData } = this.props;
    const myInfo = observableData.myInfo.get();
    this.props.screenNav.navigate('MissionHistoryScreen', { myInfo });
  }

  goRanking() {
    const { observableData } = this.props;
    const myInfo = observableData.myInfo.get();
    this.props.screenNav.navigate('MissionRankingScreen', { observableData, myInfo });
  }

  isAllAccumulatedType(): boolean {
    return _.every(this.props.missionInfos[0].missions, isAccumulatedType);
  }

  async loadRankers() {
    const { observableData } = this.props;
    const myInfo = observableData.myInfo.get();
    const response = await receiveMissionRankingInfo(myInfo.id, 0, 5);
    if (!this.mounted) return;
    if (response.success) {
      const rankers = response.data;
      this.setState({ rankers });
    }
  }

  mounted: boolean = false; // eslint-disable-line react/sort-comp

  selectCorrectMissionInfo(step: number): MissionInfo {
    const { missionInfo } = this.state;
    if (missionInfo) return missionInfo;

    const { missionInfos } = this.props;
    if (this.state.step === MAX_VALUE && missionInfos.length > 2) {
      return missionInfos[2];
    }
    if (this.state.step >= step && missionInfos.length > 1) {
      return missionInfos[1];
    }
    return missionInfos[0];
  }

  sleep(msec: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(resolve, msec);
    });
  }

  renderCalendarModal() {
    const { observableData } = this.props;
    const myInfo = observableData.myInfo.get();
    return (
      <MyModal
        visible={this.state.isCalendarModalVisible}
        hide={() => this.setState({ isCalendarModalVisible: false })}
      >
        <Text style={S.calendarModalDescription}>{i18n(D().mission.mission.calendarModal.description)}</Text>
        <View style={[GS.row, { height: 200 }]}>
          <CalendarComponent hideHeader={true} myInfo={myInfo} />
        </View>
      </MyModal>
    );
  }

  renderHighScoreModal() {
    const { observableData, missionInfos } = this.props;
    const myInfo = observableData.myInfo.get();
    const mi0 = missionInfos[0];
    const mi1 = missionInfos[missionInfos.length - 1];
    const rankText = rank => (rank <= HIGHSCORE_SIZE ? `${rank}${i18n(D().common.unit.rank)}` : HIGHSCORE_OUTSIDE_TEXT);
    return (
      <MyModal
        visible={this.state.isHighScoreModalVisible}
        hide={() => this.setState({ isHighScoreModalVisible: false })}
      >
        <Text style={MODAL_S.title}>{i18n(D().mission.mission.rankUpModal.title)}</Text>

        <View style={[GS.row, GS.margin10]}>
          <View>
            <Text style={[GS.textCenter, MODAL_S.levelText]}>{rankText(mi0.highscoreRank)}</Text>
            <Text style={MODAL_S.pointText}>{getApproximatePointText(mi0.point)}</Text>
          </View>
          <Text style={[GS.textCenter, MODAL_S.levelText]}>{' → '}</Text>
          <View>
            <Text style={[GS.textCenter, MODAL_S.levelText]}>{rankText(mi1.highscoreRank)}</Text>
            <Text style={MODAL_S.pointText}>{getApproximatePointText(mi1.point)}</Text>
          </View>
        </View>
        <View style={{ width: '100%' }}>
          <MyRankingComponent myInfo={myInfo} showTitle={false} small={false} wide={false} />
        </View>
      </MyModal>
    );
  }

  renderLevelUpModal() {
    const prevMissionInfo = this.props.missionInfos[0];
    const missionInfo = this.selectCorrectMissionInfo(3);
    const level = missionInfo ? missionInfo.level : 1;
    const pointRange = getApproximatePointText(missionInfo.levelPointRange.min);
    const msg = i18n(D().mission.mission.levelUpModal.point, { point: pointRange });
    return (
      <MyModal visible={this.state.isLevelUpModalVisible} hide={() => this.setState({ isLevelUpModalVisible: false })}>
        <Text style={MODAL_S.title}>{i18n(D().mission.mission.levelUpModal.title)}</Text>
        <LevelBadge level={level} small={false} />
        <Text style={MODAL_S.levelText}>{i18n(D().mission.mission.levelUpModal.level, { level })}</Text>
        <Text style={MODAL_S.pointText}>{msg}</Text>
        <Text style={MODAL_S.pointText}>
          {i18n(D().mission.mission.levelUpModal.bonus, {
            beforeBonus: prevMissionInfo.bonus,
            afterBonus: missionInfo.bonus,
          })}
        </Text>
      </MyModal>
    );
  }

  renderMainFeedback() {
    const { observableData, emphasizeMissions } = this.props;
    const myInfo = observableData.myInfo.get();
    const small = emphasizeMissions || IS_NARROW_SCREEN;
    const wide = !this.isAllAccumulatedType() && !emphasizeMissions;
    switch (myInfo.setting.pointType) {
      case 'absolute': {
        const missionInfo = this.selectCorrectMissionInfo(3);
        return <LevelView myInfo={myInfo} missionInfo={missionInfo} small={small} wide={wide} />;
      }
      case 'self':
        return <MyRankingComponent myInfo={myInfo} showTitle={true} small={small} wide={wide} />;
      case 'other': {
        const goRanking = () => this.goRanking();
        return (
          <MissionRankingComponent myInfo={myInfo} showMessage={true} small={small} wide={wide} goRanking={goRanking} />
        );
      }
    }
    return null;
  }

  renderMission(index: number, twoColumn: boolean) {
    const m1 = this.getMission(1, index);
    const m2 = this.getMission(2, index);
    if (!m1 || !m2) return null;
    const mi1 = this.selectCorrectMissionInfo(1);
    const mi2 = this.selectCorrectMissionInfo(2);
    const reward = adjustedMissionReward(m2.reward, mi2.bonus);
    // const unit = missionProgressUnit(m2);
    const barWidth = twoColumn ? POINT_BAR_WIDTH / 2 - 15 : POINT_BAR_WIDTH - 15;
    const style = twoColumn ? GS.flex : null;

    let progressText = '';
    let progressElement;
    if (isAccumulatedType(m1)) {
      progressElement = (
        <MiniBar
          width={barWidth}
          height={15}
          animation={this.props.animation}
          text={missionProgressText(m2, mi2)}
          progress={(getMissionProgress(mi1, m1) - m1.startValue) / (m1.goalValue - m1.startValue)}
        />
      );
    } else {
      const current = getMissionProgress(mi1, m1) - m1.startValue;
      const max = m1.goalValue - m1.startValue;
      progressText = ` (${current}/${max})`;
      progressElement = <SplittedMiniBar height={10} animation={this.props.animation} current={current} max={max} />;
    }
    const mTitle = missionTitle(m2, twoColumn) + progressText;
    const mPoint = '💎+' + getTextOfApproximateInteger(reward);

    if (IS_NARROW_SCREEN && !twoColumn) {
      return (
        <View key={m1.uuid} style={[S.missionBox, style]}>
          <View style={[GS.row, GS.flexCenterH, GS.flexSeparateV, { marginBottom: 5 }]}>
            <Text numberOfLines={1}>{mTitle}</Text>
            <Text style={[S.pointText, GS.textRight]}>{mPoint}</Text>
          </View>
          {progressElement}
        </View>
      );
    }
    return (
      <View key={m1.uuid} style={[S.missionBox, style]}>
        <View style={{ marginBottom: 5 }}>
          <Text numberOfLines={1}>{mTitle}</Text>
        </View>
        {progressElement}
        <View style={{ marginTop: 5 }}>
          <Text style={[S.pointText, GS.textRight]}>{mPoint}</Text>
        </View>
      </View>
    );
  }
  renderMissions() {
    const missionInfo = this.selectCorrectMissionInfo(0);
    const missions = missionInfo.missions;
    if (this.props.emphasizeMissions) {
      const ms = missions.map((_, i) => this.renderMission(i, false));
      return <View children={ms} />;
    }
    const nCols = 2;
    const label = (
      <View style={S.missionListLegend}>
        <View style={GS.flex} />
        <TouchableOpacity onPress={() => this.goHistory()}>
          <Text style={[GS.linkText, { fontSize: 12 }]}>{i18n(D().mission.mission.seeHistory)}</Text>
        </TouchableOpacity>
      </View>
    );
    if (_.every(missions, m => !isAccumulatedType(m))) {
      return label;
    }
    if (missions.length <= 2) {
      return (
        <View>
          {missions.map((_, i) => this.renderMission(i, false))}
          {label}
        </View>
      );
    }
    const table = [label];
    let row = [];
    for (let i = 0; i < missions.length; i++) {
      row.push(this.renderMission(i, true));
      if (row.length === nCols) {
        table.push(<View style={GS.row} children={row} />);
        row = [];
      }
    }
    if (row.length > 0) {
      const len = nCols - row.length;
      for (let i = 0; i < len; i++) {
        row.push(<View style={[S.missionBox, GS.flex]} />);
      }
      table.push(<View style={GS.row} children={row} />);
    }
    return <View children={table} />;
  }
  renderPoint() {
    const info2 = this.selectCorrectMissionInfo(2);
    const info3 = this.selectCorrectMissionInfo(3);
    const approxPoint = getApproximatePointText(info3.point);
    const progress = Math.min(
      (info2.point - info3.levelPointRange.min) / (info3.levelPointRange.max - info3.levelPointRange.min),
      1
    );
    return (
      <View style={S.pointBarContainer}>
        <View style={S.row}>
          <Text>
            {approxPoint}
            <Text style={S.pointUnitText}>{i18n(D().mission.mission.pointUnit)}</Text>
          </Text>
          <Text>
            {i18n(D().mission.mission.level, { level: info3.level })}
            <Text style={S.bonusText}>{i18n(D().mission.mission.bonus, { bonus: info3.bonus })}</Text>
          </Text>
        </View>
        <MiniBar animation={this.props.animation} width={POINT_BAR_WIDTH} height={5} color="blue" progress={progress} />
      </View>
    );
  }
  renderRankUpModal() {
    const { observableData } = this.props;
    const myInfo = observableData.myInfo.get();
    const { rankers } = this.state;
    const mi0 = this.props.missionInfos[0];
    const mi1 = this.selectCorrectMissionInfo(3);
    const groupChanged = mi0.rankingName !== mi1.rankingName;
    return (
      <MyModal visible={this.state.isRankUpModalVisible} hide={() => this.setState({ isRankUpModalVisible: false })}>
        <Text style={MODAL_S.title}>{i18n(D().mission.mission.rankUpModal.title)}</Text>
        {groupChanged && <Text style={[GS.margin5, GS.infoBox]}>次の対戦ステージに上がりました。</Text>}
        <View style={[GS.marginV10, GS.row, GS.flexCenter]}>
          <View style={GS.flex}>
            {groupChanged && (
              <Text style={[GS.textCenter, MODAL_S.pointText, MODAL_S.emphasis]}>{mi0.rankingName}</Text>
            )}
            <Text style={[GS.textCenter, MODAL_S.levelText]}>
              {mi0.rank}
              {i18n(D().common.unit.rank)}
            </Text>
          </View>
          <Text style={[GS.textCenter, MODAL_S.levelText]}>{'→'}</Text>
          <View style={GS.flex}>
            {groupChanged && (
              <Text style={[GS.textCenter, MODAL_S.pointText, MODAL_S.emphasis]}>{mi1.rankingName}</Text>
            )}
            <Text style={[GS.textCenter, MODAL_S.levelText]}>
              {mi1.rank}
              {i18n(D().common.unit.rank)}
            </Text>
          </View>
        </View>
        <View style={{ width: '100%' }}>
          {
            <MissionRankingComponent
              ranking={rankers}
              myInfo={myInfo}
              showMessage={false}
              small={false}
              wide={false}
              goRanking={null}
            />
          }
        </View>
      </MyModal>
    );
  }
  render() {
    return (
      <View style={[S.container]}>
        <View style={GS.flex2} />
        {this.renderMainFeedback()}
        <View style={GS.flex} />
        {this.renderPoint()}
        {this.renderMissions()}
        <View style={GS.flex2} />
        {this.renderLevelUpModal()}
        {this.renderRankUpModal()}
        {this.renderHighScoreModal()}
        {this.renderCalendarModal()}
      </View>
    );
  }
}
const POINT_BAR_WIDTH = Dimensions.get('window').width - (IS_NARROW_SCREEN ? 40 : 70);
const S = StyleSheet.create({
  container: {
    flex: 1,
    width: POINT_BAR_WIDTH,
  },
  pointBarContainer: {
    marginBottom: 10,
  },
  bonusText: {
    fontSize: 11,
  },
  pointText: {
    fontSize: 12,
  },
  pointUnitText: {
    fontSize: 10,
  },
  correctCount: {
    marginLeft: 5,
  },
  remainCount: {
    marginRight: 5,
  },
  missionListLegend: {
    padding: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  missionBox: {
    margin: 2,
    padding: 5,
    backgroundColor: 'white',
    borderColor: BORDER_COLOR,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowBottom: {
    alignItems: 'flex-end',
  },
  rowCenter: {
    alignItems: 'center',
  },
  clearedMission: {
    color: 'gray',
    textDecorationLine: 'line-through',
  },
  calendarModalDescription: {
    fontSize: 24,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 11,
    color: '#333',
  },
  largeCheck: {
    fontSize: 24,
    paddingLeft: 10,
    paddingRight: 10,
    fontWeight: 'bold',
    color: 'transparent',
  },
  largeCheckActive: {
    color: 'green',
  },
});
const MODAL_S = StyleSheet.create({
  title: {
    fontSize: 18,
  },
  levelText: {
    fontSize: 24,
  },
  pointText: {
    fontSize: 14,
  },
  emphasis: {
    color: 'red',
  },
});
