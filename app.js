import express, { json } from 'express';
import { readFileSync } from 'fs';
const app = express();

app.use(json()); // 为解析 POST 请求中的 JSON 添加中间件

// 读取 data.json 文件中的数据
const data = JSON.parse(readFileSync('data.json'));

// 处理 GET 请求
app.get('/api', (req, res) => {
  handleRequest(req, res);
});

// 处理 POST 请求
app.post('/api', (req, res) => {
  handleRequest(req, res);
});

function handleRequest(req, res) {
  // 随机选择一条文本
  const randomIndex = Math.floor(Math.random() * data.messages.length);
  // 将文本中的 FCIP 字符串替换为请求中的参数或者默认值
  const text = data.messages[randomIndex].replace(/FCIP/g, req.query.name || req.body.name || 'FCIP');
  // 返回处理后的结果
  res.send({ text });
}

// 启动服务器
app.listen(3000, () => {
  console.log('服务器已启动');
});