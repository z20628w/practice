/**
 * 单个内容脚本(在contents文件夹下的脚本都会运行)
*/
import type { PlasmoCSConfig } from 'plasmo'

// 可以匹配多个网址
export const config: PlasmoCSConfig = {
  // 只想给指定的网页注入
  matches: ['*://*.edu-edu.com/*']
}

setTimeout(() => {
  console.log("页面加载完成");
  let iframeDom = document?.body?.getElementsByTagName("iframe")[0];
  console.log("iframeDom", iframeDom);
  let bodyDom = iframeDom?.contentWindow?.document?.getElementsByTagName("body")[0];
  if (!bodyDom) {
    console.log("body页面不存在");
    return;
  }
  let getDa = function () {
    let da = Array.from(bodyDom.querySelectorAll(".ui-question-options")).map(t => {
      console.log("t", t);
      return Array.from(t.querySelectorAll(".ui-correct-answer")).map(c => c.getAttribute("code"));
    });
    console.log(da);
    localStorage.setItem("da", JSON.stringify(da));
    alert(da.length ? "答案获取成功" : "答案获取失败");
  };
  let fillDa = function () {
    console.log("填充答案");
    let da = JSON.parse(localStorage.getItem("da") || "[]");
    console.log("获取到的答案为：", da);
    let domList = Array.from(bodyDom.querySelectorAll(".ui-question-options"));
    console.log("获取到的题目：", domList, bodyDom);
    let fn = (list, index = 0) => {
      console.log("开始填充答案", list, index);
      let t = list[index];
      if (!t) return;
      console.log(`填充第${index + 1}道题`);
      let d = da[index] || [];
      console.log("答案为：", d);
      let fn1 = (arr, i = 0) => {
        if (!arr[i]) {
					/** 下一题事件 */ document.body.querySelector("#next-btn").click();
          fn(list, index + 1);
          return;
        }
        console.log(`点击答案${d[i]}`, d, i);
        t.querySelector(`li[code=${d[i]}] > span.ui-question-options-order`).click();
        setTimeout(() => {
          fn1(d, i + 1);
        }, 500);
      };
      fn1(d);
    };
    fn(domList);
  };
  let getDaDom = document.createElement("button");
  getDaDom.style = "padding:10px;position:fixed;right:100px;top:0px;z-index:10000;background:blue;color:red;font-size:28px;";
  getDaDom.innerText = "获取答案";
  let fillDaDom = document.createElement("button");
  fillDaDom.style = "padding:10px;position:fixed;right:100px;top:100px;z-index:10000;background:blue;color:red;font-size:28px;";
  fillDaDom.innerText = "填写答案";
  getDaDom.onclick = getDa;
  fillDaDom.onclick = fillDa;
  document.body.appendChild(getDaDom);
  document.body.appendChild(fillDaDom);
}, 3000);
