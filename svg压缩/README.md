# 说明
### 1.使用命令行安装svg压缩依赖 
```javascript
npm install -g svgo
```
### 2.在控制台输入：
```javascript
//第一个路径是需要压缩文件路径；
//-o   OUTPUT 
//第二个是压缩后存放地址；
svgo E:\a.svg -o  E:\b.svg
```

### 3.多文件压缩
```javascript
svgo -f D:\WisdomStar\frontend-wx\static -o D:\static
```

### 4.配置项
```javascript
Options:
  -h, --help : Help 帮助
  -v, --version : Version版本
  -i INPUT, --input=INPUT : 输入的文件, "-" 为标准输入
  -s STRING, --string=STRING : 输入SVG数据字符串
  -f FOLDER, --folder=FOLDER : 输入的文件夹，会优化与重写所有的*.svg文件
  -o OUTPUT, --output=OUTPUT : 输入的文件或文件夹 (默认同输入), "-" 标准输出
  -p PRECISION, --precision=PRECISION : 设置数字的小数部分，重写插件参数
  --config=CONFIG : 配置文件扩展或替换默认设置
  --disable=DISABLE : 根据名字禁用插件
  --enable=ENABLE : 根据名字开启插件
  --datauri=DATAURI : 输入文件以Data URI字符串形式(base64, URI encoded or unencoded)
  -q, --quiet : 仅输出错误信息，不包括正常状态消息
  --pretty : 让SVG漂亮的打印
  --show-plugins : 显示可用和存在的插件
 
Arguments:
  INPUT : 别名 --input
  OUTPUT : 别名 --output
```