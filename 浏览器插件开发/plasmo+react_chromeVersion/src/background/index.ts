const color = "#3aa757";

chrome.runtime.onInstalled.addListener(() => {
  console.log("插件已被安装");
  chrome.storage.sync.set({ color });
  console.log(`[Coloring] default background color is set to: ${color}`);
});