// @flow

import _ from 'lodash';
import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { DefaultScrollView } from '../design/DefaultScrollView';
import { ButtonBox } from '../design/ButtonBox';
import { GS } from '../style';
import { tracker } from '../../models/Tracker';
import { D, i18n } from '../../i18n/index';

import type { MCII, Navigator, ObservableData } from '../../types';

function getEmptyIfThenPlan() {
  return { obstacle: null, behavior: null };
}

type NavParams = {|
  index: number,
  mciis: MCII[],
  onFinish: (mcii: MCII) => any,
  observableData: ObservableData,
|};

type Props = {|
  navigation: Navigator<NavParams>,
|};

type State = {|
  mcii: MCII,
  focusFirstInput: boolean,
  showOutcome: boolean,
  showIfThenPlansAndButtons: boolean,
|};

export class MCIIEditScreen extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);

    const { index, mciis } = props.navigation.state.params;
    let mcii;
    if (index === null) {
      mcii = {
        wish: null,
        outcome: null,
        ifThenPlans: [getEmptyIfThenPlan()],
      };
    } else {
      mcii = _.cloneDeep(mciis[index]);
    }

    const showAll = index !== null;
    this.state = {
      mcii,
      focusFirstInput: !mcii.wish,
      showOutcome: showAll,
      showIfThenPlansAndButtons: showAll,
    };
  }

  componentDidMount() {
    const { index } = this.props.navigation.state.params;
    tracker.trackScreenViewNoTabs(`mcii_edit/${index === null ? 'new' : 'edit'}`);
  }

  componentWillUnmount() {
    tracker.trackScreenViewOnDismount();
  }

  onChangeText(property: string, text: string) {
    const { mcii } = this.state;
    _.set(mcii, property, text);
    this.setState({ mcii });
  }

  addIfThenPlan() {
    const { mcii } = this.state;
    mcii.ifThenPlans.push(getEmptyIfThenPlan());
    this.setState({ mcii });
  }

  checkShouldTextInputBeDisabled(inputName: string): boolean {
    if (_.isEmpty(this.state.mcii.wish)) {
      return true;
    }
    if ((inputName === 'outcome' || inputName === 'ifThenPlans') && _.isEmpty(this.state.mcii.outcome)) {
      return true;
    }
    if (inputName === 'ifThenPlans') {
      for (let i = 0; i < this.state.mcii.ifThenPlans.length; i++) {
        if (_.isEmpty(this.state.mcii.ifThenPlans[i].behavior) || _.isEmpty(this.state.mcii.ifThenPlans[i].obstacle)) {
          return true;
        }
      }
    }
    return false;
  }

  async finish() {
    const { onFinish } = this.props.navigation.state.params;
    const { mcii } = this.state;
    this.props.navigation.goBack();
    onFinish(mcii);
  }

  renderContent() {
    return (
      <DefaultScrollView>
        {this.renderWish()}
        {this.renderOutcome()}
        {this.renderIfThenPlansAndButtons()}
      </DefaultScrollView>
    );
  }

  renderIfThenPlans() {
    return _.map(this.state.mcii.ifThenPlans, (ifThenPlan, i) => {
      return (
        <View key={i}>
          <View style={S.block}>
            <Text style={S.label}>{i18n(D().mcii.mciiEdit.obstacle)}</Text>
            {i === 0 && <Text style={S.description}>{i18n(D().mcii.mciiEdit.obstacleDescription)}</Text>}
            {this.renderTextInput(
              `ifThenPlans[${i}].obstacle`,
              i18n(D().mcii.mciiEdit.obstacleExample),
              i18n(D().mcii.common.obstacleSuffix),
              false
            )}
            <Text style={S.description}>{i18n(D().mcii.mciiEdit.imagineObstacle)}</Text>
          </View>
          <View style={S.block}>
            <Text style={S.label}>{i18n(D().mcii.mciiEdit.behavior)}</Text>
            {i === 0 && <Text style={S.description}>{i18n(D().mcii.mciiEdit.behaviorDescription)}</Text>}
            {this.renderTextInput(
              `ifThenPlans[${i}].behavior`,
              i18n(D().mcii.mciiEdit.behaviorExample),
              i18n(D().mcii.common.behaviorSuffix),
              false
            )}
          </View>
        </View>
      );
    });
  }

  renderIfThenPlansAndButtons() {
    if (!this.state.showIfThenPlansAndButtons) {
      return null;
    }
    return (
      <View>
        {this.renderIfThenPlans()}
        <ButtonBox>
          <Button
            title={i18n(D().common.enter)}
            onPress={() => this.finish()}
            disabled={this.checkShouldTextInputBeDisabled('ifThenPlans')}
          />
          <Button
            title={i18n(D().mcii.mciiEdit.addObstaclesAndBehaviors)}
            onPress={() => this.addIfThenPlan()}
            disabled={this.checkShouldTextInputBeDisabled('ifThenPlans')}
          />
        </ButtonBox>
      </View>
    );
  }

  renderOutcome() {
    if (!this.state.showOutcome) {
      return null;
    }
    const nextButton = this.state.showIfThenPlansAndButtons ? null : (
      <Button
        title={i18n(D().common.next)}
        onPress={() => this.setState({ showIfThenPlansAndButtons: true })}
        disabled={this.checkShouldTextInputBeDisabled('outcome')}
      />
    );
    return (
      <View style={S.block}>
        <Text style={S.label}>{i18n(D().mcii.mciiEdit.outcome)}</Text>
        <Text style={S.description}>{i18n(D().mcii.mciiEdit.outcomeDescription)}</Text>
        {this.renderTextInput(
          'outcome',
          i18n(D().mcii.mciiEdit.outcomeExample),
          i18n(D().mcii.common.outcomeSuffix),
          false
        )}
        <Text style={S.description}>{i18n(D().mcii.mciiEdit.imagineOutcome)}</Text>
        {nextButton}
      </View>
    );
  }

  renderTextInput(property: string, placeholder: string, suffixText: string, autofocus: boolean) {
    return (
      <View style={GS.row}>
        <TextInput
          autoFocus={autofocus}
          style={[GS.textInput, GS.flex]}
          placeholder={placeholder}
          value={_.get(this.state.mcii, property)}
          onChangeText={text => this.onChangeText(property, text)}
        />
        <View style={[GS.column, GS.flexCenterV]}>
          <Text style={S.suffixText}>{suffixText}</Text>
        </View>
      </View>
    );
  }

  renderWish() {
    const nextButton = this.state.showOutcome ? null : (
      <Button
        title={i18n(D().common.next)}
        onPress={() => this.setState({ showOutcome: true })}
        disabled={this.checkShouldTextInputBeDisabled('wish')}
      />
    );
    return (
      <View style={S.block}>
        <Text style={S.label}>{i18n(D().mcii.mciiEdit.wish)}</Text>
        <Text style={S.description}>{i18n(D().mcii.mciiEdit.wishDescription)}</Text>
        {this.renderTextInput(
          'wish',
          i18n(D().mcii.mciiEdit.wishExample),
          i18n(D().mcii.mciiEdit.wishSuffix),
          this.state.focusFirstInput
        )}
        {nextButton}
      </View>
    );
  }

  render() {
    return <View style={GS.flex}>{this.renderContent()}</View>;
  }
}

const S = StyleSheet.create({
  block: {
    marginVertical: 10,
    marginHorizontal: 20,
  },
  label: {
    fontSize: 20,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  suffixText: {
    fontSize: 16,
  },
});
