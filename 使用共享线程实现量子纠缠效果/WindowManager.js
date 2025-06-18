// 定义一个 WindowManager 类，用于管理多个窗口的状态和数据
class WindowManager {
	#windows; // 私有属性，存储所有窗口的数据
	#id = uuid; // 私有属性，当前窗口的唯一标识符
	#winData; // 私有属性，当前窗口的具体数据
	#winShapeChangeCallback; // 私有属性，窗口形状变化时的回调函数
	#winChangeCallback; // 私有属性，窗口列表变化时的回调函数

	// 构造函数，初始化 WindowManager 实例
	constructor() {}

	// 检查窗口列表是否有变化
	#didWindowsChange(pWins, nWins) {
		if (pWins.length != nWins.length) {
			// 如果两个窗口列表长度不同，则认为有变化
			return true;
		} else {
			let c = false; // 标志位，表示是否有变化

			// 遍历窗口列表，检查每个窗口的 id 是否一致
			for (let i = 0; i < pWins.length; i++) {
				if (pWins[i].id != nWins[i].id) c = true; // 如果发现 id 不一致，则标记为有变化
			}

			return c; // 返回是否有变化的结果
		}
	}

	// 初始化当前窗口，添加元数据并存储到窗口列表中
	init(metaData) {
		this.#windows = global_data.map(t => t.data) || []; // 从 共享线程 中获取窗口列表，如果不存在则初始化为空数组
		let shape = this.getWinShape(); // 获取当前窗口的形状信息
		this.#winData = { id: this.#id, shape: shape, metaData: metaData }; // 创建当前窗口的数据对象
		this.#windows.push(this.#winData); // 将当前窗口的数据添加到窗口列表中
		this.updateWindowsLocalStorage(); // 更新 共享线程 中的窗口列表
	}

	// 获取当前窗口的形状信息
	getWinShape() {
		let shape = { x: window.screenLeft, y: window.screenTop, w: window.innerWidth, h: window.innerHeight }; // 获取窗口的位置和大小信息
		return shape; // 返回形状信息
	}

	// 更新 共享线程 中的窗口列表
	updateWindowsLocalStorage() {
		SharedWorkers.port.postMessage({ uuid, type: "window", msg: "共享窗口数据", data: this.#winData }); // 共享窗口数据
	}

	// 更新当前窗口的形状信息
	update() {
		let winShape = this.getWinShape(); // 获取当前窗口的形状信息

		// 检查当前窗口的形状是否发生变化
		if (winShape.x != this.#winData.shape.x || winShape.y != this.#winData.shape.y || winShape.w != this.#winData.shape.w || winShape.h != this.#winData.shape.h) {
			this.#winData.shape = winShape; // 更新当前窗口的形状信息
			if (this.#winShapeChangeCallback) this.#winShapeChangeCallback(); // 如果存在窗口形状变化回调函数，则调用它
			this.updateWindowsLocalStorage(); // 更新 共享线程 中的窗口列表
		}
	}

	// 其他窗口改变时触发
	windowsUpdated() {
		// 如果修改的 key 是 "windows"
		let newWindows = global_data.map(t => t.data); // 解析新的窗口数据
		let winChange = this.#didWindowsChange(this.#windows, newWindows); // 检查窗口列表是否有变化

		this.#windows = newWindows; // 更新当前窗口列表

		if (winChange) {
			// 如果窗口列表有变化
			if (this.#winChangeCallback) this.#winChangeCallback(); // 调用窗口变化回调函数
		}
	}

	// 设置窗口形状变化的回调函数
	setWinShapeChangeCallback(callback) {
		this.#winShapeChangeCallback = callback; // 将传入的回调函数赋值给私有属性
	}

	// 设置窗口列表变化的回调函数
	setWinChangeCallback(callback) {
		this.#winChangeCallback = callback; // 将传入的回调函数赋值给私有属性
	}

	// 获取所有窗口的数据
	getWindows() {
		return this.#windows; // 返回窗口列表
	}

	// 获取当前窗口的数据
	getThisWindowData() {
		return this.#winData; // 返回当前窗口的数据
	}

	// 获取当前窗口的唯一标识符
	getThisWindowID() {
		return this.#id; // 返回当前窗口的 id
	}
}

export default WindowManager; // 导出 WindowManager 类，供外部使用
