/**
 * 共享线程
*/

let savePorts = [];
onconnect = function (e) {
  var port = e.ports[0];
  savePorts.push(port);
  port.addEventListener('message', function (e) {
    sendMessage(e.data);
  });
  port.start();
}


let sendMessage = (info) => {
  for (let p = 0; p < savePorts.length; p++) {
    savePorts[p].postMessage(`当前共享页面个数：${savePorts.length}，是第${p}个，收到了信息：${info}`)
  };
}