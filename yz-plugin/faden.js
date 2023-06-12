import plugin from '../../lib/plugins/plugin.js';
import https from 'https';

export class Mio extends plugin {
  constructor(e) {
    super({
      name: '澪',
      dsc: '自己做着玩的',
      event: 'message',
      priority: 1000,
      rule: [{
        reg: ".*[！!]$",
        fnc: 'show'
      }]
    });
  }

  async show(e) {
    console.log(e);
    let name;
    let raw = e.msg.replace(/^[！!]+|[！!]+$/g, "");
    console.log(raw);
    if (raw.length > 3 ) {
      return;
    }  
    if (e.message.filter(m => m.type === 'at').length === 1) {
      name = e.message.find(m => m.type === 'at').text.replace(/@/g, '');
    } else if (raw) {
      name = raw;
    } else {
      name = e.sender.title ? e.sender.title : e.sender.card;
    }
    let url = `https://api.fcip.xyz/faden/api?name=${name}`;
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        let json = JSON.parse(data);
        if (json.text) {
          this.reply(json.text, false);
        } else {
          e.reply('连接api接口失败！错误原因：' + json.toString());
        }
      });
    }).on('error', (err) => {
      logger.error('连接api接口失败！错误原因：', err);
      e.reply('连接api接口失败！错误原因：' + err);
    });
  }
}
