// @flow

import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';

import { YMD } from '../../models/date_util';
import { ARROW_COLOR, GS } from '../style';
import { D, i18n } from '../../i18n/index';
import { loadStateWithPromises, reloadStateWithPromises, renderAfterCheckingState } from '../render_util';
import { receiveMissionHistory } from '../../models/connection';
import type { StateForChecking } from '../render_util';
import type { FinishedMission } from './types';
import type { UserInfo } from '../../types';

type Props = {|
  onSelectDate?: (moment, FinishedMission[]) => any,
  hideHeader?: boolean,
  myInfo: UserInfo,
|};

type State = {|
  finishedMissions: { [number]: FinishedMission[] },
  calendarFocusedDate: moment,
  selectedDate: moment,
  calendarDateRange: moment[],
|} & StateForChecking;

export class CalendarComponent extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    const today = moment().startOf('day');
    this.state = {
      finishedMissions: {},
      calendarFocusedDate: today,
      selectedDate: today,
      calendarDateRange: [today],
    };
  }

  componentDidMount() {
    loadStateWithPromises(this, this.fetchCalendarData(this.state.calendarFocusedDate));
  }

  getOpacity(date: moment): number {
    if (!this.state.finishedMissions) {
      return 0;
    }
    const missions = this.state.finishedMissions[date.valueOf()];
    // between 0.2 and 0.7, so that the green is not too strong or light
    return missions && missions.length > 0 ? (missions.length - 1) / 5 * 0.5 + 0.2 : 0;
  }

  getWeeksArray(dates: moment[]) {
    const weeksR = [];
    let sevenDays = [];
    dates.forEach(day => {
      sevenDays.push(day);
      if (sevenDays.length === 7) {
        weeksR.push(sevenDays);
        sevenDays = [];
      }
    });
    return weeksR;
  }

  /* ---- ---- ---- ---- custom actions ---- ---- ---- ---- */

  changeMonth(step: number) {
    const { calendarFocusedDate } = this.state;
    const newDate = moment(calendarFocusedDate).add(step, 'months');
    this.setState({ calendarFocusedDate: newDate });
    reloadStateWithPromises(this, this.fetchCalendarData(newDate));
  }

  clickDay(selectedDate: moment) {
    this.setState({ selectedDate, calendarFocusedDate: selectedDate });
    reloadStateWithPromises(this, this.fetchCalendarData(selectedDate));
  }

  async fetchCalendarData(calendarFocusedDate: moment) {
    const beginOfMonth = moment(calendarFocusedDate).startOf('month');
    const endOfMonth = moment(calendarFocusedDate).endOf('month');
    const beginOfCalender = moment(beginOfMonth).startOf('week');
    const endOfCalendar = moment(endOfMonth).endOf('week');
    const calendarDateRange = this.rangeMonthDays(beginOfCalender, endOfCalendar);

    const response = await receiveMissionHistory(this.props.myInfo.id);
    if (response.success) {
      const missions: FinishedMission[] = response.data.map(ud => ({
        mission: ud.value,
        finishedAt: new Date(ud.time).getTime(),
      }));
      const finishedMissions = _.groupBy(missions, mission =>
        moment(mission.finishedAt)
          .startOf('day')
          .valueOf()
      );

      const f = this.props.onSelectDate;
      if (f) {
        f(calendarFocusedDate, finishedMissions[calendarFocusedDate.valueOf()] || []);
      }
      return { finishedMissions, calendarDateRange };
    } else {
      // TODO error handling
      return { finishedMissions: {}, calendarDateRange };
    }
  }

  rangeMonthDays(startDate: moment, endDate: moment): moment[] {
    const rangeDates: moment[] = [];
    let checkDate = startDate;
    while (checkDate.isSameOrBefore(endDate)) {
      rangeDates.push(checkDate);
      checkDate = moment(checkDate).add(1, 'day');
    }
    return rangeDates;
  }

  /* ---- ---- ---- ---- rendering ---- ---- ---- ---- */

  renderContent() {
    return (
      <View style={GS.flex}>
        {!this.props.hideHeader && <View>{this.renderHeader()}</View>}
        <View style={S.calendarWeekdays}>{this.renderWeekDays()}</View>
        <View style={GS.flex}>{this.renderWeeks()}</View>
      </View>
    );
  }

  renderDay(date: moment, strToday: string, strSelected: string, numThisMonth: number) {
    const boxStyle = [GS.flexCenterV, S2.dateBox];
    const textStyle = [S2.dateText];

    const strDate = date.format(YMD);
    if (strDate === strToday) {
      boxStyle.push(S2.todayBox);
      textStyle.push(S2.todayText);
    }
    if (strDate === strSelected) {
      boxStyle.push(S2.selectedBox);
      textStyle.push(S2.selectedText);
    }
    const opacity = this.getOpacity(date);
    const doneBox = {
      backgroundColor: `rgba(0,128,0,${opacity})`,
    };
    boxStyle.push(doneBox);
    textStyle.push(S2.doneText);

    if (date.month() !== numThisMonth) {
      boxStyle.push(S2.differentMonthBox);
      textStyle.push(S2.differentMonthText);
    }
    if (this.props.onSelectDate) {
      const onPress = () => this.clickDay(date);
      return (
        <TouchableOpacity style={boxStyle} key={date} onPress={onPress}>
          <Text style={textStyle}>{date.date()}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={boxStyle} key={date}>
          <Text style={textStyle}>{date.date()}</Text>
        </View>
      );
    }
  }

  renderDays(weekDates: moment[]) {
    const { calendarFocusedDate, selectedDate } = this.state;

    const strToday = moment().format(YMD);
    const strSelected = moment(selectedDate).format(YMD);
    const numThisMonth = moment(calendarFocusedDate).month();

    return weekDates.map(date => this.renderDay(date, strToday, strSelected, numThisMonth));
  }

  renderHeader() {
    const { calendarFocusedDate } = this.state;
    return (
      <View style={S.calendarHeader}>
        <View style={S.calendarHeaderItem}>
          <TouchableOpacity onPress={() => this.changeMonth(-1)}>
            <Icon name="chevron-left" size={30} color={ARROW_COLOR} />
          </TouchableOpacity>
          <Text style={S.calendarHeaderText}>
            {moment(calendarFocusedDate).format(i18n(D().mission.calendar.yearMonth))}
          </Text>
          <TouchableOpacity onPress={() => this.changeMonth(1)}>
            <Icon name="chevron-right" size={30} color={ARROW_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderWeekDays() {
    return moment.weekdaysShort().map(day => {
      return (
        <Text key={day} style={S.calendarWeekdaysText}>
          {day.toUpperCase()}
        </Text>
      );
    });
  }

  renderWeeks() {
    const groupedDates = this.getWeeksArray(this.state.calendarDateRange);
    return groupedDates.map((weekDates, index) => {
      return (
        <View key={index} style={S.weekDays}>
          {this.renderDays(weekDates)}
        </View>
      );
    });
  }

  render() {
    const renderContent = () => <View style={GS.flex}>{this.renderContent()}</View>;
    return renderAfterCheckingState(this.state, renderContent);
  }
}

const S = StyleSheet.create({
  // Header
  calendarHeader: {
    flexDirection: 'row',
  },
  calendarHeaderItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginRight: 10,
    marginLeft: 10,
  },
  calendarHeaderText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
  // Weekdays
  calendarWeekdays: {
    flexDirection: 'row',
  },
  calendarWeekdaysText: {
    flex: 1,
    color: '#C0C0C0',
    textAlign: 'center',
  },
  weekDays: {
    flexDirection: 'row',
    flex: 1,
  },
});

const S2 = StyleSheet.create({
  dateBox: {
    flex: 1,
    margin: 3,
    borderWidth: 2,
    borderRadius: 2,
    backgroundColor: '#F5F5F5',
    borderColor: 'transparent',
  },
  dateText: {
    textAlign: 'center',
    color: 'rgba(0,0,0,0.5)',
    fontSize: 18,
  },
  smallDateText: {
    fontSize: 14,
  },
  todayBox: {},
  todayText: {
    fontWeight: 'bold',
  },
  selectedBox: {
    borderColor: 'orange',
  },
  selectedText: {},
  doneText: {
    opacity: 1,
  },
  differentMonthBox: {
    opacity: 0.5,
  },
  differentMonthText: {},
});
