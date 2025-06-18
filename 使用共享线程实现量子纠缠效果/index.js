// 生成唯一编码
function $guid() {
	return "xxxxxxxx-date-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
		.replace(/[xy]/g, function (c) {
			var r = (Math.random() * 16) | 0,
				v = c == "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		})
		.replace(/date/g, function (c) {
			return Date.parse(new Date());
		});
}

// 当前页面唯一标志
let uuid = $guid();

// 全局共享数据
let global_data = [];

/**
 * 共享线程
 */
let SharedWorkers = new SharedWorker("./SharedWorker.js");
// SharedWorkers.port.start();
// 发送信息到worker进程
SharedWorkers.port.postMessage({ uuid, type: "start", msg: "页面加载完成，已连接共享线程" });

// 监听接收worker进程信息
SharedWorkers.port.onmessage = e => {};

// 页面卸载监听
window.addEventListener("beforeunload", function (e) {
	e.preventDefault();
	SharedWorkers.port.postMessage({ uuid, type: "end", msg: "页面即将卸载,退出共享线程" });
});
