# FCIP-Faden-Server

   ![VSCODE Logo](https://github.com/Pretend-to/Faden_api_server/blob/main/github/logo.gif?raw=true)

## 写在前前面

作者个人网站 [fcip.xyz](https://fcip.xyz) (欢迎关注博客，不定时分享些有趣的项目和工具)

推荐 [点击加入QQ群](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=BPVotGnSlCdy9AWXKSw4WlY6XjgJ2Z7O&authKey=4Obq%2FxNAuF7qL3z96uXMoV8KqxiSbtTCbEjYIer38ZW6%2F%2BERcJMTg90BhGRh2iQJ&noverify=0&group_code=798543340) (链接异常的话也可以搜索群号798543340)聊天吹水群都是**小白**。

## 写在前面
写这个的缘由就是看见群里有个发电机器人就搞了一个，适配云崽V3
data.json是所有文案的来源，您可以参照原文件的格式为他添加您喜欢的内容，如果能提一个pr那更好了🤤

## 环境准备
* nodejs
* ~~yunzai~~

## 云崽用户食用方法：

下载仓库里Faden!.js文件到云崽/plugins/example/就行了

使用示例：
 ![example](https://github.com/Pretend-to/Faden_api_server/blob/main/github/example.png?raw=true)
 
-----

## API食用方法

## GET 请求处理程序

### 说明

此处理程序用于处理 GET 请求，从 `data.json` 文件中读取文案并返回处理后的结果。如果请求中包含 `name` 参数，则会将文本中的 `FCIP` 字符串替换为 `name` 参数的值，否则会使用默认值 `FCIP`。

### 请求格式

```
GET /api?name=xxx
```

### 响应格式

```json
{
  "text": "返回的文本内容"
}
```

### 示例

#### 请求

```
GET /api?name=Tom
```

#### 响应

```json
{
  "text": "欢迎来到 FCIP 的个人主页，Tom！"
}
```


## POST 请求处理程序

### 说明

此处理程序用于处理 POST 请求，从 `data.json` 文件中读取文案并返回处理后的结果。

### 请求格式

```
POST /api
```

### 响应格式

```json
{
  "text": "返回的文本内容"
}
```

### 示例

#### 请求

```
POST /api
```

#### 响应

```json
{
  "text": "欢迎来到 FCIP 的个人主页！"
}
```
