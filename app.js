import express, { json } from 'express';
import { readFileSync } from 'fs';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

const app = express();

app.use(json()); // 为解析 POST 请求中的 JSON 添加中间件

// 读取 data.json 文件中的数据
const data = JSON.parse(readFileSync('data.json'));

// 显示日志
app.use(morgan('tiny'));

// 添加基于 IP 地址的速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 限制的时间窗口，这里是 15 分钟
  max: 100, // 在窗口期内允许的最大请求次数
  message: '请求过于频繁，请稍后再试。' // 超过请求次数限制时返回的错误消息
});

// 处理 GET 请求
app.get('/api', limiter, (req, res) => {
  handleRequest(req, res);
});

// 处理 POST 请求
app.post('/api', limiter, (req, res) => {
  handleRequest(req, res);
});

function handleRequest(req, res) {
  // 随机选择一条文本
  const randomIndex = Math.floor(Math.random() * data.messages.length);
  // 将文本中的 FCIP 字符串替换为请求中的参数或者默认值
  const text = data.messages[randomIndex].replace(/FCIP/g, req.query.name || req.body.name || 'FCIP');
  // 记录请求日志
  console.log(`[${new Date().toLocaleString()}] ${req.ip} ${req.method} ${req.url} - ${res.statusCode}`);
  // 返回处理后的结果
  res.send({ text });
}

// 启动服务器
app.listen(3000, () => {
  console.log('服务器已启动');
});
