var cacheName = "hello-pwa";

// install 事件发生在: 浏览器安装并注册 Service Worker 时
self.addEventListener("install", (event) => {
  // event.waitUtil 用于在安装成功之前执行一些预装逻辑
  // 建议只做一些轻量级和非常重要资源的缓存，以减少安装失败的概率
  // 安装成功后 ServiceWorker 状态会从 installing 变为 installed
  event.waitUntil(
    // caches 是一个特殊的 CacheStorage 对象
    // 它能在 Service Worker 指定的范围内， 提供数据存储的能力
    caches
      .open(cacheName)
      .then((cache) =>
        cache.addAll(
          [
            "/", // 一定要包含整个目录，不然无法离线浏览
            "./index.html",
          ]
          // 如果所有的文件都成功缓存了，便会安装完成
          // 如果任何文件下载失败了，那么安装过程也会随之失败
        )
      )
      .then(() => self.skipWaiting())
  );
});

/**
 * 每次任何被 service worker 控制的资源被请求到时，都会触发 fetch 事件
 */
self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      if (response != null) {
        return response
      }
      return fetch(e.request.url)
    })
  )
})

/**
 * 在该事件中可以用来删除旧的缓存
 */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    //获取所有cache名称
    caches.keys().then(cacheNames => {
      return Promise.all(
        // 获取所有不同于当前版本名称cache下的内容
        cacheNames.filter(cacheNames => {
          return cacheNames !== cacheStorageKey
        }).map(cacheNames => {
          return caches.delete(cacheNames)
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})
