'use strict';

// 设置仅交换视频选项
// Set up to exchange only video.
const offerOptions = {
  offerToReceiveVideo: 1,
};

// 定义初始通话开始时间
// Define initial start time of the call (defined as connection between peers).
let startTime = null;

// 获取本地和远程视频元素
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

// 存储本地和远程流
let localStream;
let remoteStream;

// 初始化本地和远程peer连接
let localPeerConnection;
let remotePeerConnection;

/**
 * 处理接收到的远程媒体流
 * @param {Event} event - 包含流信息的事件
 */
// Handles remote MediaStream success by adding it as the remoteVideo src.
function gotRemoteMediaStream (event) {
  const mediaStream = event.stream;
  remoteVideo.srcObject = mediaStream;
  remoteStream = mediaStream;
  trace('远程对等连接接收到远程流。');
}

/**
 * 当视频加载元数据时记录视频尺寸
 * @param {Event} event - 视频加载元数据事件
 */
// Logs a message with the id and size of a video element.
function logVideoLoaded (event) {
  const video = event.target;
  trace(`${video.id} videoWidth: ${video.videoWidth}px, ` +
    `videoHeight: ${video.videoHeight}px.`);
}

/**
 * 当视频大小改变时记录视频尺寸和设置开始时间
 * @param {Event} event - 视频大小改变事件
 */
// Logs a message with the id and size of a video element.
// This event is fired when video begins streaming.
function logResizedVideo (event) {
  logVideoLoaded(event);

  if (startTime) {
    const elapsedTime = window.performance.now() - startTime;
    startTime = null;
    trace(`Setup time: ${elapsedTime.toFixed(3)}ms.`);
  }
}

// 添加事件监听器以记录视频加载和大小改变事件
localVideo.addEventListener('loadedmetadata', logVideoLoaded);
remoteVideo.addEventListener('loadedmetadata', logVideoLoaded);
remoteVideo.addEventListener('onresize', logResizedVideo);

/**
 * 处理peer连接事件
 * @param {Event} event - 包含连接信息的事件
 */
// Define RTC peer connection behavior.
// 与新的对等候选人连接。
function handleConnection (event) {
  const peerConnection = event.target;
  const iceCandidate = event.candidate;

  // 只处理包含ICE候选人的事件
  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    const otherPeer = getOtherPeer(peerConnection);

    otherPeer.addIceCandidate(newIceCandidate)
      .then(() => {
        handleConnectionSuccess(peerConnection);
      }).catch((error) => {
        handleConnectionFailure(peerConnection, error);
      });

    trace(`${getPeerName(peerConnection)} ICE候选人:\n${event.candidate.candidate}.`);
  }
}

/**
 * 记录连接成功日志
 * @param {RTCPeerConnection} peerConnection - 连接对象
 */
// Logs that the connection succeeded.
function handleConnectionSuccess (peerConnection) {
  trace(`${getPeerName(peerConnection)} 添加ICE候选人成功。`);
};

/**
 * 记录连接失败日志
 * @param {RTCPeerConnection} peerConnection - 连接对象
 * @param {Error} error - 错误对象
 */
// Logs that the connection failed.
function handleConnectionFailure (peerConnection, error) {
  trace(`${getPeerName(peerConnection)} 添加候选人失败:\n${error.toString()}.`);
}

/**
 * 处理peer连接状态改变事件
 * @param {Event} event - 包含连接状态信息的事件
 */
// Logs changes to the connection state.
function handleConnectionChange (event) {
  const peerConnection = event.target;
  console.log('ICE状态更改事件: ', event);
  trace(`${getPeerName(peerConnection)} ICE 状态: ${peerConnection.iceConnectionState}.`);
}

/**
 * 设置会话描述失败时记录错误日志
 * @param {Error} error - 错误对象
 */
// Logs error when setting session description fails.
function setSessionDescriptionError (error) {
  trace(`无法创建会话描述: ${error.toString()}.`);
}

/**
 * 设置会话描述成功时记录日志
 * @param {RTCPeerConnection} peerConnection - 连接对象
 * @param {string} functionName - 函数名
 */
// Logs success when setting session description.
function setDescriptionSuccess (peerConnection, functionName) {
  const peerName = getPeerName(peerConnection);
  trace(`${peerName} ${functionName} complete.`);
}

/**
 * 创建一个offer。
 * 这个函数负责初始化本地和远程peer连接的描述，并创建一个answer。
 * 它是建立WebRTC连接的关键步骤之一。
 * 
 * @param {Object} description - 包含SDP（会话描述协议）信息的对象，用于初始化peer连接。
 */
function createdOffer (description) {
  // 跟踪本地peer连接的offer信息。
  trace(`本地对等连接的offer:\n${description.sdp}`);

  // 开始设置本地peer连接的描述。
  trace('开始保存本地对等连接的信息');
  // 设置本地描述，并处理成功或失败的情况。
  localPeerConnection.setLocalDescription(description)
    .then(() => {
      setLocalDescriptionSuccess(localPeerConnection);
    }).catch(setSessionDescriptionError);

  // 开始设置远程peer连接的描述。
  trace('开始保存远程对等连接的信息');
  // 设置远程描述，并处理成功或失败的情况。
  remotePeerConnection.setRemoteDescription(description)
    .then(() => {
      setRemoteDescriptionSuccess(remotePeerConnection);
    }).catch(setSessionDescriptionError);

  // 开始在远程peer连接上创建一个answer。
  trace('开始在远程对等连接上创建一个answer。');
  // 创建answer，并处理成功或失败的情况。
  remotePeerConnection.createAnswer()
    .then(createdAnswer)
    .catch(setSessionDescriptionError);
}

/**
 * 创建答案函数。
 * 该函数用于处理与远程peer连接相关的描述设置，包括设置本地描述和远程描述。
 * 它首先将远程peer的描述应用于本地peer的本地描述，然后将相同的描述应用于远程peer的远程描述。
 * 这个过程对于建立WebRTC连接是必要的。
 * 
 * @param {Object} description - 包含SDP（会话描述协议）信息的对象，用于设置描述。
 */
function createdAnswer (description) {
  // 跟踪来自remotePeerConnection的答案描述。
  trace(`来自远程对等连接的应答:\n${description.sdp}.`);

  // 开始设置remotePeerConnection的本地描述。
  trace('开始保存远程对等连接的信息');
  // 设置本地描述，并处理成功或错误的情况。
  remotePeerConnection.setLocalDescription(description)
    .then(() => {
      setLocalDescriptionSuccess(remotePeerConnection);
    }).catch(setSessionDescriptionError);

  // 开始设置localPeerConnection的远程描述。
  trace('开始保存本地对等连接的信息');
  // 设置远程描述，并处理成功或错误的情况。
  localPeerConnection.setRemoteDescription(description)
    .then(() => {
      setRemoteDescriptionSuccess(localPeerConnection);
    }).catch(setSessionDescriptionError);
}

// 定义并获取操作按钮
// Define action buttons.
const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');

// 初始化按钮状态
// Set up initial action buttons status: disable call and hangup.
callButton.disabled = true;
hangupButton.disabled = true;

/**
 * 开始动作：启用摄像头并获取媒体流
 */
// 开启摄像头
function startAction () {
  startButton.disabled = true;
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(mediaStream => {
      localVideo.srcObject = mediaStream;
      localStream = mediaStream;
      trace('接收到本地流。');
      callButton.disabled = false;
    })
    .catch(error => {
      trace(`摄像头开启失败: ${error.toString()}.`);
    });
  trace('正在请求本地流。');
}

/**
 * 建立对等连接
 * 挂断按钮被启用，呼叫按钮被禁用。
 * 开始追踪通话时间，并获取本地音频和视频轨道。
 * 创建本地和远程的RTCPeerConnection对象，并添加相应的事件监听器。
 * 将本地流添加到本地RTCPeerConnection对象，并创建offer。
 */
function callAction () {
  // 禁用呼叫按钮，启用挂断按钮
  callButton.disabled = true;
  hangupButton.disabled = false;

  // 获取本地视频和音频轨道
  const videoTracks = localStream.getVideoTracks();
  const audioTracks = localStream.getAudioTracks();
  // 如果存在视频轨道，输出使用中的视频设备
  if (videoTracks.length > 0) {
    trace(`使用视频设备: ${videoTracks[0].label}.`);
  }
  // 如果存在音频轨道，输出使用中的音频设备
  if (audioTracks.length > 0) {
    trace(`使用音频设备: ${audioTracks[0].label}.`);
  }

  // 开始追踪通话时间
  trace('开始对等连接');
  startTime = window.performance.now();

  // 初始化服务器配置为null
  const servers = null;

  // 创建本地和远程的RTCPeerConnection对象
  localPeerConnection = new RTCPeerConnection(servers);
  trace('已创建本地对等连接对象localPeerConnection。');

  // 为本地RTCPeerConnection对象添加icecandidate和iceconnectionstatechange事件监听器
  localPeerConnection.addEventListener('icecandidate', handleConnection);
  localPeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange);

  remotePeerConnection = new RTCPeerConnection(servers);
  trace('已创建远程对等连接对象remotePeerConnection。');

  // 为远程RTCPeerConnection对象添加icecandidate，iceconnectionstatechange和addstream事件监听器
  remotePeerConnection.addEventListener('icecandidate', handleConnection);
  remotePeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange);
  remotePeerConnection.addEventListener('addstream', gotRemoteMediaStream);

  // 将本地流添加到本地RTCPeerConnection对象
  localPeerConnection.addStream(localStream);

  trace('已将本地流添加到localPeerConnection。');

  // 创建offer，并处理创建结果
  localPeerConnection.createOffer(offerOptions).then(createdOffer).catch(setSessionDescriptionError);
}

/**
 * 结束动作：挂断电话，关闭peer连接
 */
function hangupAction () {
  localPeerConnection.close();
  remotePeerConnection.close();
  localPeerConnection = null;
  remotePeerConnection = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
  trace('关闭连接');
}

// 绑定按钮点击事件
startButton.addEventListener('click', startAction);
callButton.addEventListener('click', callAction);
hangupButton.addEventListener('click', hangupAction);

/**
 * 获取另一个peer连接对象
 * @param {RTCPeerConnection} peerConnection - 当前peer连接对象
 * @returns {RTCPeerConnection} - 另一个peer连接对象
 */
function getOtherPeer (peerConnection) {
  return (peerConnection === localPeerConnection) ? remotePeerConnection : localPeerConnection;
}

/**
 * 获取peer连接名称
 * @param {RTCPeerConnection} peerConnection - peer连接对象
 * @returns {string} - peer连接名称
 */
// Gets the name of a certain peer connection.
function getPeerName (peerConnection) {
  return (peerConnection === localPeerConnection) ? 'localPeerConnection' : 'remotePeerConnection';
}

/**
 * 记录日志信息和时间
 * @param {string} text - 日志信息
 */
// Logs an action (text) and the time when it happened on the console.
function trace (text) {
  text = text.trim();
  const now = (window.performance.now() / 1000).toFixed(3);
  console.log(now, text);
}