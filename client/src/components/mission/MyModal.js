// @flow

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

import { GS } from '../style';
import { D, i18n } from '../../i18n/index';

type ModalProps = {
  visible: boolean,
  hide: () => any,
  children: any,
};

export function MyModal({ visible, hide, children }: ModalProps) {
  return (
    <Modal isVisible={visible} onBackdropPress={hide}>
      <View style={GS.modal}>
        {children}
        <TouchableOpacity onPress={hide}>
          <View style={[GS.mainButton, GS.modalButton]}>
            <Text>{i18n(D().common.ok)}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
