// @flow

import { Platform, StyleSheet } from 'react-native';

export const LINK_COLOR = '#00e';
export const DISABLED_COLOR = '#999';
export const ARROW_COLOR = 'rgba(0,0,0,0.125)';
export const BORDER_COLOR = '#eee';
export const HEADER_BG_COLOR = '#f7f7f7';
export const CORRECT_BG_COLOR = '#e9ffed'; // light green
export const WRONG_BG_COLOR = '#ffe9e9'; // light red

export const MAIN_BUTTON_BG_COLOR = '#ffba1a';
export const MAIN_BUTTON_BG_COLOR_W = '#ffc233'; // 背景色が白の時に使うこと
export const SUB_BUTTON_BG_COLOR = '#fffcf5';
export const SUB_BUTTON_BORDER_COLOR = '#ffb300';
export const THEME_BG_COLOR = '#fff7e5';

const statusBarHeight = 20;

// Global Style
export const GS = StyleSheet.create({
  /* common */
  marginStatusBar: {
    ...Platform.select({
      ios: {
        paddingTop: statusBarHeight,
      },
    }),
  },
  textLeft: { textAlign: 'left' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  bold: { fontWeight: 'bold' },
  hidden: { opacity: 0 },
  bgWhite: { backgroundColor: '#fff' },
  /* margin */
  margin5: { margin: 5 },
  margin10: { margin: 10 },
  marginV10: { marginVertical: 10 },
  marginH10: { marginHorizontal: 10 },
  marginBottom20: { marginBottom: 20 },
  padding5: { padding: 5 },
  padding10: { padding: 10 },
  /* flex */
  flex: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  flex4: { flex: 4 },
  flex5: { flex: 5 },
  flex6: { flex: 6 },
  flex7: { flex: 7 },
  flex8: { flex: 8 },
  flex9: { flex: 9 },
  flexStartV: { justifyContent: 'flex-start' },
  flexStartH: { alignItems: 'flex-start' },
  flexCenterV: { justifyContent: 'center' },
  flexCenterH: { alignItems: 'center' },
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexEndV: { justifyContent: 'flex-end' },
  flexEndH: { alignItems: 'flex-end' },
  flexSeparateV: { justifyContent: 'space-between' },
  row: { flexDirection: 'row' },
  column: { flexDirection: 'column' },
  /* table */
  highlightRow: { backgroundColor: '#ccfffd' },
  cell: { flex: 1, margin: 5 },
  tableHead: {
    borderColor: BORDER_COLOR,
    backgroundColor: HEADER_BG_COLOR,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableSecondHead: {
    borderColor: BORDER_COLOR,
    backgroundColor: HEADER_BG_COLOR,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableBody: {
    borderColor: BORDER_COLOR,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  /* components */
  errorBox: {
    backgroundColor: '#fee',
    borderColor: '#700',
    borderWidth: 1,
    color: '#700',
    fontSize: 16,
    padding: 10,
  },
  note: {
    backgroundColor: '#e7ffe7',
    borderColor: '#7a7',
    borderWidth: 2,
    fontSize: 16,
    padding: 10,
  },
  infoBox: {
    backgroundColor: '#f7f7ff',
    borderColor: '#77a',
    borderWidth: 1,
    padding: 10,
  },
  caution: {
    padding: 10,
    fontSize: 20,
    color: 'red',
    textAlign: 'center',
    borderColor: 'red',
    borderWidth: 1,
  },
  inverseColor: {
    color: '#fff',
    backgroundColor: '#333',
  },
  themeBackground: {
    backgroundColor: THEME_BG_COLOR,
  },
  linkText: {
    color: LINK_COLOR,
    textDecorationLine: 'underline',
  },
  disabledText: {
    color: DISABLED_COLOR,
  },
  textInput: Platform.select({
    android: {
      fontSize: 16,
    },
    ios: {
      fontSize: 16,
      padding: 5,
      height: 40,
      borderColor: BORDER_COLOR,
      borderWidth: 1,
    },
  }),
  modal: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalButton: {
    margin: 10,
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 40,
  },

  mainButton: {
    borderRadius: 4,
    backgroundColor: MAIN_BUTTON_BG_COLOR,
    borderColor: MAIN_BUTTON_BG_COLOR,
    borderWidth: 1,
  },
  mainButtonW: {
    borderRadius: 4,
    backgroundColor: MAIN_BUTTON_BG_COLOR_W,
    borderColor: MAIN_BUTTON_BG_COLOR_W,
    borderWidth: 1,
  },
  mainButtonDisabled: {
    borderRadius: 4,
    backgroundColor: '#ddd',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  mainButtonDisabledText: {
    color: '#666',
  },
  subButton: {
    borderRadius: 4,
    backgroundColor: SUB_BUTTON_BG_COLOR,
    borderColor: SUB_BUTTON_BORDER_COLOR,
    borderWidth: 1,
  },
});

export const FLEX = [null, GS.flex, GS.flex2, GS.flex3, GS.flex4, GS.flex5, GS.flex6, GS.flex7, GS.flex8, GS.flex9];
