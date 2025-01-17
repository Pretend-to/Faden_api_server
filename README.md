# FCIP-Faden-Server

   ![VSCODE Logo](https://github.com/Pretend-to/Faden_api_server/blob/main/github/logo.gif?raw=true)

## 写在前前面

作者个人网站 [www.krumio.com](www.krumio,com)

推荐 [点击加入QQ群](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=BPVotGnSlCdy9AWXKSw4WlY6XjgJ2Z7O&authKey=4Obq%2FxNAuF7qL3z96uXMoV8KqxiSbtTCbEjYIer38ZW6%2F%2BERcJMTg90BhGRh2iQJ&noverify=0&group_code=798543340) 聊天吹水群**都是小白**。

## 写在前面
data.json是所有文案的来源，您可以参照原文件的格式为他添加您喜欢的内容，如果能提一个pr那更好了🤤
poken.js 大部分代码来源于 ikechan8370 大佬的 memes 插件，原插件地址：https://github.com/ikechan8370/yunzai-meme

## 环境准备
* nodejs
* ~~yunzai~~

## 云崽用户食用方法：

为云崽用户提供了两个插件，下载仓库里yz-plugin/faden.js或(cn_)poken.js文件,然后复制到云崽/plugins/example/就行了,不必要本地部署API


### 1. Faden.js--通过“！！”触发发电

***(为避免冲突已修改为通过两个连续！来发电)***

 使用示例：
![example.png](github/example.png)
### 2. poken.js--收到戳一戳会随机回复发电语录或随机表情包

~~(国内网络环境请下载`cn_poken.js`)~~(服务器已迁移至国内)

 使用示例：
![example2.png](github/example2.png) 

-----

## API 文档

### 1. 请求 URL

```http
http://localhost:3000
```

### 2. 请求方法

- GET
- POST

### 3. 请求参数

| 参数名 | 必选 | 类型   | 说明       |
| ------ | ---- | ------ | ---------- |
| name   | 否   | string | 用户的姓名 |

### 4. 返回参数

| 参数名 | 类型   | 说明                     |
| ------ | ------ | ------------------------ |
| text   | string | 随机生成的文本，含有姓名 |

### 5. 请求示例

- GET 请求示例：

```http
GET http://localhost:3000?name=Tom
```

- POST 请求示例：

```http
POST http://localhost:3000

{
  "name": "Tom"
}
```

### 6. 返回示例

```http
HTTP/1.1 200 OK

{
  "text": "你好，Tom，欢迎光临 FCIP 的网站！"
}
```

## API部署文档

### 第 1 步：下载项目

首，需要从 GitHub 仓库下载项目。可以使用以下命令将项目克隆到本地：

```bash
git clone https://github.com/Pretend-to/Faden_api_server.git
```

进入项目目录：

```bash
cd Faden_api_server
```

### 第 2 步：安装项目依赖

在项目根目录下运行以下命令安装项目的依赖：

```bash
pnpm install
```


### 第 3 步：指定监听端口

为了指定应用程序的监听端口，你可以修改app.js文件末尾

```JavaScript
app.listen(3000, () => {
  console.log('服务器已启动');
});
```
将3000修改为指定的端口即可。

### 第 4 步：安装 pm2

如果您还安装 pm2，可以使用以下命令进行全局安装：

```bash
pnpm install pm2 -g
```

### 第 5 步：使用 pm2 运行应用程序

现在您已经安了 pm2，可以运行以下命令启动您的应用程序：

```bash
pm2 start app.js --name="Faden_api_server"
```

运行该命令后，pm2 将启动应用程序并持续监控。您可以使用以下命令查看应用程序的状态：

```bash
pm2
```

如果需要停止应用程序，可以运行以下命令：

```bash
pm2 stop Faden_api_server
```

重应用程序：

```bash
pm2 restart Faden_api_server
```

查看应用程序日志：

```bash
pm2 logs Faden_api_server
```

### 完成
