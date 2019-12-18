// @flow

import React from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import { DefaultScrollView } from '../../design/DefaultScrollView';
import { ButtonBox } from '../../design/ButtonBox';
import { Select } from '../../design/Select';
import { GS } from '../../style';
import { LS } from './style';
import { COURSES_NAMES, INITIAL_COURSES } from './courses';
import { MAX_NAME_LENGTH } from '../../config/utils';
import { D, i18n } from '../../../i18n/index';

type Props = {|
  initialName: string,
  initialCourse: string,
  fixedCourse: string | null,
  back: () => void,
  next: (email: string, course: string) => Promise<void>,
|};

type State = {|
  name: string,
  course: string,
  error: string | null,
|};

export class InputNameComponent extends React.PureComponent {
  props: Props;
  state: State = {
    name: this.props.initialName,
    course: this.props.fixedCourse || this.props.initialCourse || '',
    error: null,
  };

  async gotoConfirm() {
    const { name, course } = this.state;
    if (!name) return;
    if (name.length > MAX_NAME_LENGTH) {
      const error = i18n(D().validation.tooLong, {
        field: i18n(D().userModel.name),
        count: MAX_NAME_LENGTH,
      });
      this.setState({ error });
      return;
    }
    this.setState({ error: null });
    this.props.next(name, course);
  }

  renderInputName() {
    return (
      <View style={LS.formBlock}>
        <Text style={LS.label}>{i18n(D().userModel.name)}</Text>
        <TextInput
          style={[GS.textInput, LS.textInput]}
          value={this.state.name}
          onChangeText={name => this.setState({ name })}
        />
        <Text style={[GS.caution]}>{i18n(D().common.inputCaution)}</Text>
      </View>
    );
  }

  renderSelectCourse() {
    if (this.props.fixedCourse) {
      const courseName = COURSES_NAMES[this.props.fixedCourse];
      return (
        <View style={LS.formBlock}>
          <Text style={LS.label}>{i18n(D().userModel.course)}</Text>
          <Text style={LS.value}>{courseName}</Text>
        </View>
      );
    }

    return (
      <View style={LS.formBlock}>
        <Text style={LS.label}>{i18n(D().userModel.course)}</Text>
        <Select
          options={INITIAL_COURSES}
          valueToLabel={COURSES_NAMES}
          value={this.state.course}
          onValueChange={course => this.setState({ course })}
        />
      </View>
    );
  }

  render() {
    return (
      <DefaultScrollView>
        {this.renderInputName()}
        {this.renderSelectCourse()}
        <ButtonBox direction="horizontal">
          <Button onPress={this.props.back} title={i18n(D().common.back)} />
          <Button
            title={i18n(D().common.enter)}
            onPress={() => this.gotoConfirm()}
            disabled={this.state.name.length === 0 || !this.state.course}
          />
        </ButtonBox>
        {this.state.error && <Text style={[LS.formBlock, GS.errorBox]}>{this.state.error}</Text>}
        <KeyboardSpacer />
      </DefaultScrollView>
    );
  }
}
