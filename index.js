/**
 * Created by juanjimenez on 07/12/2016.
 * Otomogroove ltd 2017
 */

"use strict";
import React, { PureComponent } from "react";
import {
  Platform,
  processColor,
  DeviceEventEmitter,
  requireNativeComponent,
  NativeModules
} from "react-native";

import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";

type StateType = { componentID: string };

export const { OGWaveManager } = NativeModules;

export default class WaveForm extends PureComponent<
  WaveObjectPropsType,
  StateType
> {
  constructor(props) {
    super(props);
    this._onPress = this._onPress.bind(this);
    this._onFinishPlay = this._onFinishPlay.bind(this);
  }

  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  seek = time => {
    // if (typeof time == "string") {
    time = Number(time);
    // alert(`Value being passed ${time} of type ${typeof time} `);
    // }

    if (isNaN(time)) throw new Error("Specified time is not a number");
    this.setNativeProps({ seek: time });
  };

  setPlaybackRate = playbackRate => {
    playbackRate = Number(playbackRate);
    // alert(`Value being passed ${time} of type ${typeof time} `);
    // }

    if (isNaN(playbackRate)) throw new Error("Specified Rate is not a number");
    this.setNativeProps({ playbackRate: playbackRate });
  };

  // setStartOffset = time => {
  //     // if (typeof time == "string") {
  //     time = Number(time);
  //     // alert(`Value being passed ${time} of type ${typeof time} `);
  //     // }

  //     // if (isNaN(time)) throw new Error("Specified time is not a number");
  //     this.setNativeProps({ offsetStart: time });
  // };

  // setEndOffset = time => {
  //     // if (typeof time == "string") {
  //     time = Number(time);
  //     // alert(`Value being passed ${time} of type ${typeof time} `);
  //     // }
  //     // if (isNaN(time)) throw new Error("Specified time is not a number");
  //     this.setNativeProps({ offsetEnd: time });
  // };

  play() {
    this.setNativeProps({ play: true });
  }

  _makeid() {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  _onPress(e) {
    const event = Platform.OS === "ios" ? e.nativeEvent : e;
    if (event.componentID === this.state.componentID && this.props.onPress) {
      this.props.onPress(event);
    }
  }

  _onFinishPlay(e) {
    const event = Platform.OS === "ios" ? e.nativeEvent : e;
    if (
      event.componentID === this.state.componentID &&
      this.props.onFinishPlay
    ) {
      this.props.onFinishPlay(event);
    }
  }

  componentWillMount() {
    DeviceEventEmitter.addListener("OGOnPress", this._onPress);
    DeviceEventEmitter.addListener("OGFinishPlay", this._onFinishPlay);
    const componentID = this._makeid();
    this.setState({ componentID });
  }

  // componentDidMount() {
  //     const { source } = this.props;
  //     const assetResoved = resolveAssetSource(source) || {};

  //     let uri = assetResoved.uri;
  //     if (uri && uri.match(/^\//)) {
  //         uri = `file://${uri}`;
  //     }

  //     const isNetwork = !!(uri && uri.match(/^https?:/));
  //     const isAsset = !!(uri && uri.match(/^(assets-library|file|content|ms-appx|ms-appdata):/));

  //     const sourceObject = {
  //         src: {
  //             uri,
  //             isNetwork,
  //             isAsset,
  //             type: source.type,
  //             mainVer: source.mainVer || 0,
  //             patchVer: source.patchVer || 0
  //         }
  //     };
  //     this.setNativeProps(sourceObject);
  // }

  _assignRoot = component => {
    this._root = component;
  };

  render() {
    const { componentID } = this.state;
    const { source } = this.props;
    const assetResoved = resolveAssetSource(source) || {};

    let uri = assetResoved.uri;
    if (uri && uri.match(/^\//)) {
      uri = `file://${uri}`;
    }

    const isNetwork = !!(uri && uri.match(/^https?:/));
    const isAsset = !!(
      uri && uri.match(/^(assets-library|file|content|ms-appx|ms-appdata):/)
    );

    const nativeProps = {
      ...this.props,
      waveFormStyle: {
        ogWaveColor: processColor(this.props.waveFormStyle.waveColor),
        ogScrubColor: processColor(this.props.waveFormStyle.scrubColor),
        ogTimeOffsetStart: this.props.waveFormStyle.offsetStart,
        ogTimeOffsetEnd: this.props.waveFormStyle.offsetEnd
      },
      src: {
        uri,
        isNetwork,
        isAsset,
        type: source.type,
        mainVer: source.mainVer || 0,
        patchVer: source.patchVer || 0
      },
      componentID
    };

    return (
      <OGWaverformView
        ref={this._assignRoot}
        onPress={this._onPress}
        onFinishPlay={this._onFinishPlay}
        {...nativeProps}
      />
    );
  }
}

const OGWaverformView =
  Platform.OS === "ios"
    ? requireNativeComponent("OGWave", WaveForm)
    : requireNativeComponent("OGWaveManager");
