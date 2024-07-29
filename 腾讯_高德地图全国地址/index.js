// 数组公共递归事件
function commonRecursionFn(
  arr = [],
  fn = () => {},
  parentItem = {},
  level = 1
) {
  /**
     * arr : 需要递归的数组
     *
     * fn : 递归操作函数
     *      参数:
     *            item:当前对象 index:当前下标 list:当前所属数组 parentItem:当前所属数组的父级 level:当前递归层级
     *
     * parentItem：当前所属数组的父级

     * level : 当前层级
     */
  let data = arr;
  data = data.filter((item, index, list) => {
    item = fn(item, index, list, parentItem, level) || undefined;
    if (item && item.children && item.children.length) {
      item.children = commonRecursionFn(item.children, fn, item, level + 1);
    } else {
      item && (item.children = undefined);
    }

    return !!item;
  });

  return data;
}