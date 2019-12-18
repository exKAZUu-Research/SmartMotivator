// @flow
import _ from 'lodash';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { ARROW_COLOR, FLEX, GS } from '../style';
import { D, i18n } from '../../i18n/index';

type AlignSymbol = 'left' | 'center' | 'right';

type F<I, O> = (value: I, index: number) => O;

type Props<T> = {
  data: T[],
  labels?: string[],
  toValues: F<T, any>[],

  onPress?: ?F<T, any>,
  highlight?: F<T, boolean>,
  ranking?: T => number,
  rankStart?: ?number,
  hiddenTop?: ?number,
  noData?: any,
  flexes?: number[],
  aligns?: AlignSymbol[],
  bodyScrollable?: boolean,

  style?: any,
};

export function Table<T>(props: Props<T>) {
  const { labels, flexes = [] } = props;
  const offset = props.ranking ? 1 : 0;
  return (
    <View style={[props.bodyScrollable && GS.flex, props.style]}>
      {labels && (
        <View style={[GS.row, GS.tableHead]}>
          {props.ranking ? (
            <View style={S.cell}>
              <Text style={GS.textCenter}>{i18n(D().common.rank)}</Text>
            </View>
          ) : null}
          {props.toValues.map((_, index) => cell(index, labels[index], flexes[index + offset], 'center'))}
          {props.onPress ? <View key="onPress" style={S.arrowContainer} /> : null}
        </View>
      )}
      <TableBody {...props} />
    </View>
  );
}

function TableBody<T>(props: Props<T>) {
  if (props.data.length === 0 && props.noData) {
    return <AsElem style={[GS.textCenter, GS.margin10]}>{props.noData}</AsElem>;
  }

  const { highlight, flexes = [], aligns = [], onPress } = props;
  const offset = props.ranking ? 1 : 0;
  const elems = mapWithRanking(
    props.data,
    props.ranking,
    props.rankStart || 1,
    props.hiddenTop || 0,
    (datum, dataIndex, rank) => {
      const row = (
        <View
          style={[GS.row, GS.tableBody, highlight && highlight(datum, dataIndex) && GS.highlightRow]}
          key={dataIndex}
        >
          {props.ranking ? (
            <View style={S.cell}>
              <Text style={GS.textCenter}>
                {rank}
                {i18n(D().common.unit.rank)}
              </Text>
            </View>
          ) : null}
          {props.toValues.map((toValue, index) => {
            const value = toValue ? toValue(datum, index) : null;
            const flex = flexes[index + offset];
            const align = aligns[index + offset];
            return cell(index, value, flex, align);
          })}
          {!!onPress && (
            <View style={S.arrowContainer}>
              <Icon name="angle-right" style={S.arrow} />
            </View>
          )}
        </View>
      );
      if (onPress) {
        return (
          <TouchableOpacity onPress={() => onPress(datum, dataIndex)} key={dataIndex}>
            {row}
          </TouchableOpacity>
        );
      }
      return row;
    }
  );

  if (props.bodyScrollable) {
    return (
      <ScrollView alwaysBounceVertical={false} automaticallyAdjustContentInsets={false}>
        {elems}
      </ScrollView>
    );
  }
  return <View>{elems}</View>;
}

export function mapWithRanking<T, U>(
  list: T[],
  getScore?: ?(value: T) => number,
  rankStart: number,
  hiddenTop: number,
  callback: (value: T, index: number, rank: number) => U
): U[] {
  if (!getScore) {
    return list.map((item, index) => callback(item, index, 0));
  }

  const f = getScore;
  const tupleList: [T, number, number][] = list.map((item, index) => [item, index, f(item)]);
  const sortedList: [T, number, number][] = _.orderBy(tupleList, [([_item, _index, score]) => score], ['desc']);

  const ret = [];
  let lastScore = null;
  let rank = 0;
  sortedList.forEach(([item, originalIndex, score], sortedIndex) => {
    if (lastScore === null) {
      rank = sortedIndex + rankStart;
    } else if (lastScore > score) {
      rank = sortedIndex + rankStart + hiddenTop;
    }
    lastScore = score;
    ret.push(callback(item, originalIndex, rank));
  });
  return ret;
}

function cell(key: number | string, value: any, flex: ?number, align: ?AlignSymbol) {
  const boxFlex = flex ? FLEX[flex] : null;
  const boxAlign = align ? BOX_ALIGN[align] : null;
  const textAlign = align ? ALIGN[align] : null;
  return (
    <View key={key} style={[S.cell, boxFlex, boxAlign]}>
      <AsElem style={textAlign}>{value}</AsElem>
    </View>
  );
}

type AsElemProps = {|
  style?: any,
  children?: any,
|};

function AsElem({ style, children }: AsElemProps) {
  if (React.isValidElement(children)) {
    return children;
  }
  if (typeof children === 'string' || typeof children === 'number') {
    return <Text style={style}>{children}</Text>;
  }
  return null;
}

type IconNameProps = {
  name: string,
  icon: string,
  color: string,
  small?: boolean,
};

export function IconNameCell(props: IconNameProps) {
  const s = props.small ? S.smallUserIcon : S.userIcon;
  return (
    <View style={[GS.row, GS.flexCenterH]}>
      <Icon name={props.icon} style={[s, { color: props.color }]} />
      <Text>{props.name}</Text>
    </View>
  );
}

export function Ellipsis() {
  return (
    <View style={[GS.row, GS.tableSecondHead]}>
      <View style={GS.cell}>
        <Text style={GS.textCenter}>{'...'}</Text>
      </View>
      <View style={GS.flex3} />
    </View>
  );
}

const S = StyleSheet.create({
  cell: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  arrowContainer: {
    width: 30,
    justifyContent: 'center',
  },
  arrow: {
    marginVertical: 5,
    marginRight: 10,
    textAlign: 'center',
    fontSize: 30,
    color: ARROW_COLOR,
  },

  /* ---- ---- IconNameCell ---- ---- */
  userIcon: {
    fontSize: 32,
    margin: 8,
  },
  smallUserIcon: {
    fontSize: 20,
    marginRight: 4,
  },
});

const ALIGN = StyleSheet.create({
  left: { textAlign: 'left' },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
});

const BOX_ALIGN = StyleSheet.create({
  left: { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
  right: { alignItems: 'flex-end' },
});
