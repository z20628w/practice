// 获取摄像机视频元素
const localVideo = document.querySelector('video');

// 当前视频流
let localStream;

// 摄像机调用成功
function gotLocalMediaStream (mediaStream) {
  console.log('摄像头调用成功');
  // 存储视频流
  localStream = mediaStream;
  // 将视频显示在页面上
  localVideo.srcObject = mediaStream;
}

// 摄像机调用失败
function handleLocalMediaStreamError (error) {
  console.log('navigator.getUserMedia error: ', error);
}

// 初始化摄像头
navigator.mediaDevices.getUserMedia({ video: true }).then(gotLocalMediaStream).catch(handleLocalMediaStreamError);