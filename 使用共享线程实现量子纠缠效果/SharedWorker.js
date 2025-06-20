/**
 * 共享线程
 */
// 共享线程页面列表
let savePorts = [];
// 每个共享线程的唯一id
let pageIds = [];

onconnect = function (e) {
	var port = e.ports[0];
	port.addEventListener("message", function (e) {
		let query = e.data || {};
		// 是否为加入线程
		if (query.type == "start" && !pageIds.includes(query.uuid)) {
			savePorts.push({ uuid: query.uuid, port, windows: null });
			pageIds.push(query.uuid);
		} else if (query.type == "end" && pageIds.includes(query.uuid)) {
			// 是否为退出线程
			savePorts = savePorts.filter(t => t.uuid != query.uuid);
			pageIds = pageIds.filter(t => t != query.uuid);
		} else if (query.type == "window" && pageIds.includes(query.uuid)) {
			// 是否为窗口信息变更
			for (let p = 0; p < savePorts.length; p++) {
				let item = savePorts[p];
				// 将数据传递给其他页面
				if (item.uuid == query.uuid) {
					item.windows = query;
					break;
				}
			}
		}

		// 数据消息发送
		sendMessage(query);
	});
	port.start();
};

let sendMessage = info => {
	for (let p = 0; p < savePorts.length; p++) {
		let item = savePorts[p];
		// 将数据传递给其他页面
		// if (item.uuid != info.uuid) {
		// item.port.postMessage({ type: "info", msg: `当前共享页面个数：${savePorts.length}，是第${p + 1}个` });
		item.port.postMessage({ type: "data", msg: "数据共享", data: info, list: savePorts.map(t => t.windows).filter(t => t) });
		// }
	}
};
