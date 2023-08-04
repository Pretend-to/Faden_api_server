import express from 'express';
import { readFileSync } from 'fs';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(express.json()); // 使用内置的JSON中间件来解析POST请求中的JSON数据

// 从data.json文件中读取数据
const data = JSON.parse(readFileSync('data.json'));

// 启用日志记录
const getRealIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0];
  }
  return (req.ip); // 或者返回一个默认的IP地址
};

// 基于IP地址添加请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100,
  message: '请求过多，请稍后再试。',
  keyGenerator: getRealIp,
});

// 处理GET和POST请求
app.use('/', limiter); // 将请求限制中间件应用到以'/api'开头的所有路由

app.get('/', (req, res) => {
  handleRequest(req, res);
});

app.post('/', (req, res) => {
  handleRequest(req, res);
});

function handleRequest(req, res) {
  // 从data中随机选择一条消息
  const randomIndex = Math.floor(Math.random() * data.messages.length);
  // 将消息中的'FCIP'替换为查询参数或请求体中的'name'参数，如果不存在则使用默认值'FCIP'
  const text = data.messages[randomIndex].replace(/FCIP/g, req.query.name || req.body.name || 'FCIP');
  // 获取真实的IP地址
  const realIp = getRealIp(req);
  // 记录请求日志
  console.log(`[${new Date().toLocaleString()}] ${realIp} ${req.method} ${req.url} - ${res.statusCode}\n${text}`);
  // 发送处理后的结果
  res.send({ text });
}

// 启动服务器
app.listen(8848, () => {
  console.log('服务器已启动');
});
