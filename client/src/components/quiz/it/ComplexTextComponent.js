// @flow

import React from 'react';
import { Dimensions, Image, PixelRatio, Platform, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { LINK_COLOR } from '../../style';

import type { Navigator } from '../../../types';

type Img = {
  url: string,
  width: number,
  height: number,
};

type ImageMap = {
  [key: string]: Img,
};

type Props = {|
  text: string,
  imageMap: ImageMap,
  screenNav: Navigator<*>,
|};

export class ComplexTextComponent extends React.PureComponent {
  props: Props;
  state: void;

  gotoImageView(source: any) {
    this.props.screenNav.navigate('ImageViewScreen', { source });
  }

  render() {
    const linkImage = Platform.OS !== 'ios';
    let containsImage = false;
    let key = 0;
    const list = [];
    for (const node of parseText(this.props.text, this.props.imageMap)) {
      if (node.type === 'text') {
        const e = (
          <Text key={key++} style={[S.problem, node.error ? S.error : null]}>
            {node.text}
          </Text>
        );
        list.push(e);
      } else if (node.type === 'image') {
        containsImage = true;
        const { url, width, height } = node.image;
        const size = resizeForBlock(width, height);
        if (linkImage) {
          const e = (
            <TouchableOpacity key={key++} onPress={() => this.gotoImageView({ uri: url })}>
              <Image style={[S.image, S.linkImage, size]} source={{ uri: url }} cache={true} />
            </TouchableOpacity>
          );
          list.push(e);
        } else {
          const e = <Image key={key++} style={[S.image, size]} source={{ uri: url }} cache={true} />;
          list.push(e);
        }
      } else {
        const innerList = [];
        let innerKey = 0;
        for (const childNode of node.children) {
          if (childNode.type === 'image') {
            const { url, width, height } = childNode.image;
            const size = resizeForInline(width, height);
            const e = <Image key={innerKey++} source={{ uri: url }} cache={true} style={[S.inlineImage, size]} />;
            innerList.push(e);
          } else {
            const s = [childNode.error ? S.error : null];
            const e = (
              <Text key={innerKey++} style={s}>
                {childNode.text}
              </Text>
            );
            innerList.push(e);
          }
        }
        list.push(
          <Text key={key++} style={S.problemWithImage}>
            {innerList}
          </Text>
        );
      }
    }

    const props = !linkImage && containsImage ? { maximumZoomScale: 3.0 } : {};
    return (
      <ScrollView
        style={S.container}
        automaticallyAdjustContentInsets={false}
        alwaysBounceHorizontal={false}
        alwaysBounceVertical={false}
        {...props}
      >
        {list}
      </ScrollView>
    );
  }
}

type Size = {| width: number, height: number |};
const RATIO = PixelRatio.get();
const MAX_WIDTH = Dimensions.get('window').width - 20;

function resizeForBlock(width: number, height: number): Size {
  if (width <= MAX_WIDTH) {
    return { width, height };
  }
  return { width: MAX_WIDTH, height: height * MAX_WIDTH / width };
}

function resizeForInline(width: number, height: number): Size {
  if (Platform.OS === 'android') {
    const rWidth = height * RATIO; // NOTE: need swap!; target = react-native 0.40.0 android
    const rHeight = width * RATIO;
    if (rWidth <= MAX_WIDTH) {
      return { width: rWidth, height: rHeight };
    }
    return { width: MAX_WIDTH, height: rHeight * MAX_WIDTH / rWidth };
  }
  if (width <= MAX_WIDTH) {
    return { width, height };
  }
  return { width: MAX_WIDTH, height: height * MAX_WIDTH / width };
}

type ImageNode = {| type: 'image', image: Img |};
type TextNode = {| type: 'text', text: string, error?: true |};
type ComplexNode = {| type: 'complex', children: (ImageNode | TextNode)[] |};
type Node = ImageNode | TextNode | ComplexNode;

function parseText(text: string, imageMap: ImageMap): Node[] {
  const nodes = [];
  const blocks = text.split(/\r?\n/);
  for (const block of blocks) {
    const pattern = /\s*\[img:([^\]]+)\]\s*/g;
    const children: (ImageNode | TextNode)[] = [];
    let startIndex = 0;
    while (true) {
      startIndex = pattern.lastIndex;
      const result = pattern.exec(block);
      if (!result) break;
      const prevText = result.input.substring(startIndex, result.index);
      if (prevText) {
        children.push({ type: 'text', text: prevText });
      }
      const imgName = result[1];
      const image = imageMap[imgName];
      if (image) {
        children.push({ type: 'image', image });
      } else {
        children.push({ type: 'text', text: `[img:${imgName}]`, error: true });
      }
    }
    if (startIndex < block.length) {
      children.push({ type: 'text', text: block.substring(startIndex) });
    }
    if (children.length > 2) {
      nodes.push({ type: 'complex', children });
    } else if (children.length === 1) {
      nodes.push(children[0]);
    }
  }
  return nodes;
}

const S = StyleSheet.create({
  container: {},
  problem: {
    fontSize: 16,
    lineHeight: 20,
  },
  problemWithImage: {
    fontSize: 16,
  },
  image: {
    resizeMode: 'contain',
  },
  error: {
    color: 'red',
  },
  linkImage: {
    borderWidth: 1,
    borderColor: LINK_COLOR,
    marginBottom: 5,
    marginTop: 5,
  },
  inlineImage: {
    // resizeMode: 'contain',
    // borderWidth: 1,
    // marginBottom: -3,
  },
});
