import plugin from '../../lib/plugins/plugin.js';
import { segment } from 'icqq';

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
    if (raw.length > 10 ) {
      return;
    }  
    if (e.message.filter(m => m.type === 'at').length === 1) {
      name = e.message.find(m => m.type === 'at').text.replace(/@/g, '');
    } else if (raw) {
      name = raw;
    } else {
      name = e.sender.title ? e.sender.title : e.sender.card;
    }
    let url = `http://love.fcip.xyz/api?name=${name}`;
    try {
      let response = await fetch(url);
      if (response.status === 200) {
        let json = await response.json();
        if (json.text) {
          await this.reply(json.text, true);
        } else {
          await e.reply('连接api接口失败！错误原因：' + json.toString());
          return true;
        }
      }
    } catch (err) {
      logger.error('连接api接口失败！错误原因：', err);
      await e.reply('连接api接口失败！错误原因：' + err);
      return false;
    }
  }
}