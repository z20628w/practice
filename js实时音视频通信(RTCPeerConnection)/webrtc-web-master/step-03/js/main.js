// 使用严格模式以增强JavaScript的错误检查
'use strict';

// 声明局部变量，用于存储本地和远程的RTCPeerConnection实例以及数据通道
var localConnection;
var remoteConnection;
var sendChannel;
var receiveChannel;
// 声明约束条件变量
var pcConstraint;
var dataConstraint;
// 获取页面上的DOM元素，用于发送和接收数据通道消息的文本区域，以及控制按钮
var dataChannelSend = document.querySelector('textarea#dataChannelSend');
var dataChannelReceive = document.querySelector('textarea#dataChannelReceive');
var startButton = document.querySelector('button#startButton');
var sendButton = document.querySelector('button#sendButton');
var closeButton = document.querySelector('button#closeButton');


startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;

// 启用开始按钮
function enableStartButton () {
  startButton.disabled = false; // 设置按钮为可用状态
}

// 禁用发送按钮
function disableSendButton () {
  sendButton.disabled = true; // 设置按钮为不可用状态
}

// 创建连接的处理函数，绑定至开始按钮的点击事件
function createConnection () {
  // 清空发送消息框的占位符
  dataChannelSend.placeholder = '';
  // 初始化服务器配置和约束条件
  var servers = null;
  pcConstraint = null;
  dataConstraint = null;
  // 打印日志，表示使用SCTP作为数据通道的基础
  trace('Using SCTP based data channels');
  // 创建本地的RTCPeerConnection实例
  window.localConnection = localConnection = new RTCPeerConnection(servers, pcConstraint);
  // 打印日志，表明本地连接已创建
  trace('Created local peer connection object localConnection');

  // 在本地连接上创建一个发送数据通道
  sendChannel = localConnection.createDataChannel('sendDataChannel', dataConstraint);
  // 打印日志，发送数据通道创建成功
  trace('Created send data channel');

  // 设置本地连接的ICE候选收集回调
  localConnection.onicecandidate = iceCallback1;
  // 设置发送通道的状态变更回调
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  // 同样地，创建远程的RTCPeerConnection实例，并设置相关回调
  window.remoteConnection = remoteConnection = new RTCPeerConnection(servers, pcConstraint);
  remoteConnection.onicecandidate = iceCallback2;
  remoteConnection.ondatachannel = receiveChannelCallback;

  // 创建并设置本地SDP（会话描述协议）提议
  localConnection.createOffer().then(gotDescription1, onCreateSessionDescriptionError);
  // 禁用开始按钮，启用关闭按钮
  startButton.disabled = true;
  closeButton.disabled = false;
}

// 创建会话描述失败时的错误处理函数
function onCreateSessionDescriptionError (error) {
  trace('Failed to create session description: ' + error.toString()); // 打印错误信息
}

// 发送数据的处理函数，绑定至发送按钮的点击事件
function sendData () {
  var data = dataChannelSend.value; // 获取要发送的数据
  sendChannel.send(data); // 通过数据通道发送数据
  trace('Sent Data: ' + data); // 打印发送的数据
}

// 关闭数据通道的处理函数，绑定至关闭按钮的点击事件
function closeDataChannels () {
  trace('Closing data channels'); // 打印关闭通道的日志
  sendChannel.close(); // 关闭发送通道
  receiveChannel.close(); // 关闭接收通道
  localConnection.close(); // 关闭本地连接
  remoteConnection.close(); // 关闭远程连接
  // 重置连接对象为null，清空输入框和按钮状态
  localConnection = remoteConnection = null;
  startButton.disabled = false;
  sendButton.disabled = true;
  closeButton.disabled = true;
  dataChannelSend.value = '';
  dataChannelReceive.value = '';
  dataChannelSend.disabled = true;
  disableSendButton();
  enableStartButton();
}

// 处理从本地连接接收到的SDP提议的函数
function gotDescription1 (desc) {
  localConnection.setLocalDescription(desc); // 设置本地描述
  trace('Offer from localConnection \n' + desc.sdp); // 打印提议详情
  remoteConnection.setRemoteDescription(desc); // 设置远程描述
  remoteConnection.createAnswer().then(gotDescription2, onCreateSessionDescriptionError); // 创建并处理回答
}

// 处理从远程连接接收到的SDP回答的函数
function gotDescription2 (desc) {
  remoteConnection.setLocalDescription(desc); // 设置本地描述为回答
  trace('Answer from remoteConnection \n' + desc.sdp); // 打印回答详情
  localConnection.setRemoteDescription(desc); // 设置远程描述为回答
}

// 处理本地ICE候选的回调函数
function iceCallback1 (event) {
  trace('local ice callback'); // 打印日志
  if (event.candidate) {
    remoteConnection.addIceCandidate(event.candidate)
      .then(onAddIceCandidateSuccess, onAddIceCandidateError); // 添加ICE候选并处理结果
    trace('Local ICE candidate: \n' + event.candidate.candidate); // 打印ICE候选信息
  }
}

// 处理远程ICE候选的回调函数，逻辑与iceCallback1相似
function iceCallback2 (event) {
  trace('remote ice callback');
  if (event.candidate) {
    localConnection.addIceCandidate(event.candidate)
      .then(onAddIceCandidateSuccess, onAddIceCandidateError);
    trace('Remote ICE candidate: \n ' + event.candidate.candidate);
  }
}

// 成功添加ICE候选的处理函数
function onAddIceCandidateSuccess () {
  trace('AddIceCandidate success.'); // 打印成功日志
}

// 添加ICE候选失败的处理函数
function onAddIceCandidateError (error) {
  trace('Failed to add Ice Candidate: ' + error.toString()); // 打印错误信息
}

// 接收通道回调函数，当远程端创建数据通道时被调用
function receiveChannelCallback (event) {
  trace('Receive Channel Callback'); // 打印日志
  receiveChannel = event.channel; // 获取通道实例
  receiveChannel.onmessage = onReceiveMessageCallback; // 设置消息接收回调
  receiveChannel.onopen = onReceiveChannelStateChange; // 设置通道打开回调
  receiveChannel.onclose = onReceiveChannelStateChange; // 设置通道关闭回调
}

// 消息接收回调函数
function onReceiveMessageCallback (event) {
  trace('Received Message'); // 打印日志
  dataChannelReceive.value = event.data; // 显示接收到的消息
}

// 发送通道状态变更回调函数
function onSendChannelStateChange () {
  var readyState = sendChannel.readyState; // 获取通道状态
  trace('Send channel state is: ' + readyState); // 打印状态
  // 根据通道状态更新界面控件的可用性
  if (readyState === 'open') {
    dataChannelSend.disabled = false;
    dataChannelSend.focus();
    sendButton.disabled = false;
    closeButton.disabled = false;
  } else {
    dataChannelSend.disabled = true;
    sendButton.disabled = true;
    closeButton.disabled = true;
  }
}

// 接收通道状态变更回调函数，逻辑与onSendChannelStateChange相似
function onReceiveChannelStateChange () {
  var readyState = receiveChannel.readyState;
  trace('Receive channel state is: ' + readyState);
}

// 日志打印函数，支持性能计时输出
function trace (text) {
  if (text[text.length - 1] === '\n') {
    text = text.substring(0, text.length - 1);
  }
  if (window.performance) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ' + text);
  } else {
    console.log(text);
  }
}
