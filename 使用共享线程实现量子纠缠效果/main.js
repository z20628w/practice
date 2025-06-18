// 导入 WindowManager 模块，用于管理窗口
import WindowManager from "./WindowManager.js";

// 定义全局变量和常量
const t = THREE; // 引用 THREE.js 库
let camera, scene, renderer, world; // 3D 场景相关的对象
let near, far; // 相机的近裁剪面和远裁剪面
let pixR = window.devicePixelRatio ? window.devicePixelRatio : 1; // 获取设备像素比，默认为 1
let cubes = []; // 存储所有立方体的数组
let sceneOffsetTarget = { x: 0, y: 0 }; // 场景偏移目标位置
let sceneOffset = { x: 0, y: 0 }; // 当前场景偏移位置

// 计算当天的零点时间戳（毫秒）
let today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
today = today.getTime(); // 将日期转换为时间戳

// 获取从当天零点开始的时间（秒）
let internalTime = getTime();
let windowManager; // 窗口管理器实例
let initialized = false; // 标记是否已初始化

/**
 * 获取从当天零点开始的时间（秒）
 * @returns {number} - 返回从当天零点开始的时间（秒）
 */
function getTime() {
	return (new Date().getTime() - today) / 1000.0;
}

// 监听页面可见性变化事件，确保在页面可见时初始化
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState != "hidden" && !initialized) {
		init();
	}
});

// 页面加载完成后初始化
window.onload = () => {
	if (document.visibilityState != "hidden") {
		init();
	}
};

/**
 * 初始化函数，设置场景、窗口管理器并开始渲染
 */
function init() {
	initialized = true;
	setupScene(); // 设置 3D 场景
	setupWindowManager(); // 设置窗口管理器
	resize(); // 调整渲染器大小
	updateWindowShape(false); // 更新窗口形状，不使用平滑过渡
	render(); // 开始渲染循环
	window.addEventListener("resize", resize); // 监听窗口大小变化事件

	// 监听接收worker进程信息
	SharedWorkers.port.onmessage = e => {
		let query = e.data || {};
		console.log(query);
		console.log(`接收到共享worker传递的信息：`, query.msg);
		if (query.type == "data") {
			global_data = query.list;
			console.log("共享数据", global_data);
			windowManager.windowsUpdated();
		}
	};
}

/**
 * 设置 3D 场景
 */
function setupScene() {
	camera = new t.OrthographicCamera(0, 0, window.innerWidth, window.innerHeight, -10000, 10000); // 创建正交相机
	camera.position.z = 2.5; // 设置相机的 Z 轴位置
	near = camera.position.z - 0.5; // 设置近裁剪面
	far = camera.position.z + 0.5; // 设置远裁剪面

	scene = new t.Scene(); // 创建场景
	scene.background = new t.Color(0.0); // 设置背景颜色为黑色
	scene.add(camera); // 将相机添加到场景中

	renderer = new t.WebGLRenderer({ antialias: true, depthBuffer: true }); // 创建 WebGL 渲染器
	renderer.setPixelRatio(pixR); // 设置像素比例
	world = new t.Object3D(); // 创建世界对象
	scene.add(world); // 将世界对象添加到场景中

	renderer.domElement.setAttribute("id", "scene"); // 设置渲染器 DOM 元素的 ID
	document.body.appendChild(renderer.domElement); // 将渲染器添加到页面中
}

/**
 * 设置窗口管理器
 */
function setupWindowManager() {
	windowManager = new WindowManager(); // 创建窗口管理器实例
	windowManager.setWinShapeChangeCallback(updateWindowShape); // 设置窗口形状变化回调
	windowManager.setWinChangeCallback(windowsUpdated); // 设置窗口变化回调

	// 添加自定义元数据到每个窗口实例
	let metaData = { foo: "展示数据" };

	// 初始化窗口管理器并将当前窗口添加到集中式窗口池中
	windowManager.init(metaData);

	// 初始调用更新窗口逻辑
	windowsUpdated();
}

/**
 * 更新窗口数量对应的立方体
 */
function windowsUpdated() {
	updateNumberOfCubes(); // 更新立方体数量
}

/**
 * 根据窗口数量更新立方体
 */
function updateNumberOfCubes() {
	let wins = windowManager.getWindows(); // 获取所有窗口

	// 移除所有现有的立方体
	cubes.forEach(c => {
		world.remove(c);
	});

	cubes = []; // 清空立方体数组

	// 根据窗口数量创建新的立方体
	for (let i = 0; i < wins.length; i++) {
		let win = wins[i];

		let c = new t.Color(); // 创建颜色对象
		c.setHSL(i * 0.1, 1.0, 0.5); // 设置颜色的 HSL 值

		let s = 100 + i * 50; // 设置立方体的尺寸
		let cube = new t.Mesh(new t.BoxGeometry(s, s, s), new t.MeshBasicMaterial({ color: c, wireframe: true })); // 创建立方体
		cube.position.x = win.shape.x + win.shape.w * 0.5; // 设置立方体的 X 轴位置
		cube.position.y = win.shape.y + win.shape.h * 0.5; // 设置立方体的 Y 轴位置

		world.add(cube); // 将立方体添加到世界对象中
		cubes.push(cube); // 将立方体添加到数组中
	}
}

/**
 * 更新窗口形状
 * @param {boolean} easing - 是否启用平滑过渡
 */
function updateWindowShape(easing = true) {
	// 设置场景偏移目标位置
	sceneOffsetTarget = { x: -window.screenX, y: -window.screenY };
	if (!easing) sceneOffset = sceneOffsetTarget; // 如果禁用平滑过渡，则直接设置当前偏移
}

/**
 * 渲染循环
 */
function render() {
	let t = getTime(); // 获取当前时间

	windowManager.update(); // 更新窗口管理器

	// 计算场景偏移的平滑过渡效果
	let falloff = 0.05;
	sceneOffset.x = sceneOffset.x + (sceneOffsetTarget.x - sceneOffset.x) * falloff;
	sceneOffset.y = sceneOffset.y + (sceneOffsetTarget.y - sceneOffset.y) * falloff;

	// 设置世界对象的位置为当前偏移
	world.position.x = sceneOffset.x;
	world.position.y = sceneOffset.y;

	let wins = windowManager.getWindows(); // 获取所有窗口

	// 更新所有立方体的位置和旋转
	for (let i = 0; i < cubes.length; i++) {
		let cube = cubes[i];
		let win = wins[i];
		let _t = t;

		let posTarget = { x: win.shape.x + win.shape.w * 0.5, y: win.shape.y + win.shape.h * 0.5 };

		cube.position.x = cube.position.x + (posTarget.x - cube.position.x) * falloff;
		cube.position.y = cube.position.y + (posTarget.y - cube.position.y) * falloff;
		cube.rotation.x = _t * 0.5;
		cube.rotation.y = _t * 0.3;
	}

	renderer.render(scene, camera); // 渲染场景
	requestAnimationFrame(render); // 请求下一帧渲染
}

/**
 * 调整渲染器大小以适应窗口
 */
function resize() {
	let width = window.innerWidth; // 获取窗口宽度
	let height = window.innerHeight; // 获取窗口高度

	camera = new t.OrthographicCamera(0, width, 0, height, -10000, 10000); // 更新相机参数
	camera.updateProjectionMatrix(); // 更新相机投影矩阵
	renderer.setSize(width, height); // 设置渲染器大小
}
