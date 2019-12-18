// @flow

import React from 'react';
import { shallow } from 'enzyme';
import { View } from 'react-native';

import { ErrorComponent } from './ErrorComponent';

describe('<ErrorComponent />', () => {
  it('should render one component', () => {
    expect(shallow(<ErrorComponent error={'error!'} />).find(View).length).toBe(1);
  });
});
