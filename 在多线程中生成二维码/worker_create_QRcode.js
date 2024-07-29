/**
 * 在多线程中生成二维码
*/
// 在Worker脚本中，可以使用内置的importScripts()函数来加载外部JavaScript文件。这是一个同步方法，它会阻塞Worker线程直到所有指定的脚本加载并执行完毕。
importScripts("./qrcode-generator/index.js");

// 如果有多个插件
// importScripts('plugin1.js', 'plugin2.js', 'plugin3.js');

// 监听接收主进程信息
self.onmessage = async (e) => {
  console.log(`接收到主进程发送的信息：${e.data}`);
  let data = e.data;

  if (data.type == "createQRcode") {
    // 创建十万张二维码
    let list = await createCode(data.total || 0);

    // 发送信息到主进程
    self.postMessage({ text: '二维码创建成功', type: data.endKey || 'ok', data: list });
  }
}
// 批量创建二维码，使用异步，避免爆栈
async function createCode (total = 100, arr = [], index = 1) {

  self.postMessage({ text: `正在创建第${index}张二维码` });

  // 关键代码使用异步
  arr.push(await setQRCode(index));

  if (index < total) {
    return createCode(total, arr, index + 1);
  } else {
    self.postMessage({ text: `${total}张二维码已全部生成完成` });
    return arr;
  }
}

// 生成二维码
function setQRCode (text = '', typeNumber = 1, errorCorrectionLevel = "L") {
  var qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(Number(text));
  qr.make();

  return {
    ImgTag: qr.createImgTag(),
    ASCII: qr.createASCII(),
    SvgTag: qr.createSvgTag(),
    DataURL: qr.createDataURL(),
    TableTag: qr.createTableTag(),
  }

}