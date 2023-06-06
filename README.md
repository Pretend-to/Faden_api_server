# FCIP-Faden-Server

   ![VSCODE Logo](https://github.com/Pretend-to/Faden_api_server/blob/main/github/logo.gif?raw=true)

## 写在前前面

作者个人网站 [fcip.xyz](https://fcip.xyz) (欢迎关注博客，不定时分享些有趣的项目和工具)

推荐 [点击加入QQ群](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=BPVotGnSlCdy9AWXKSw4WlY6XjgJ2Z7O&authKey=4Obq%2FxNAuF7qL3z96uXMoV8KqxiSbtTCbEjYIer38ZW6%2F%2BERcJMTg90BhGRh2iQJ&noverify=0&group_code=798543340) (链接异常的话也可以搜索群号798543340)群里也有些类似chatgpt机器人什么别的项目。
## 写在前面
写这个的缘由就是看见群里有个发电机器人就搞了一个，适配云崽V3


## 环境准备
* nodejs
* yunzai

## 云崽用户食用方法：

下载仓库里Faden!文件到云崽/plugins/example/就行了

使用示例：
 ![example](https://github.com/Pretend-to/Faden_api_server/blob/main/github/example.png?raw=true)
 
-----

## API 文档

### 1. 请求 URL

```http
http://localhost:3000/api
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
GET http://localhost:3000/api?name=Tom
```

- POST 请求示例：

```http
POST http://localhost:3000/api

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