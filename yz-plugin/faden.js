import plugin from '../../lib/plugins/plugin.js';
import fetch from 'node-fetch'

export class Mio extends plugin {
  constructor(e) {
    super({
      name: '澪',
      dsc: '自己做着玩的',
      event: 'message',
      priority: 1000,
      rule: [{
        reg: ".*[！!]{2}$",
        fnc: 'faden'
      }]
    });
  }

  async faden(e) {
    let name;
    let raw = e.msg.replace(/^[！!]+|[！!]+$/g, "");
    console.log("[尝试为" + raw + "发电中，长度" + raw.length + "字符]");

    if (raw.length > 4) {
      console.log("[发电失败！][文本长度过长自动取消]");
      return;
    }

    if (e.message.filter(m => m.type === 'at').length === 1) {
      name = e.message.find(m => m.type === 'at').text.replace(/@/g, '');
    } else if (raw) {
      name = raw;
    } else {
      name = e.sender.title ? e.sender.title : e.sender.card;
    }

    let url = `https://api.krumio.com/faden?name=${name}`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      if (json.text) {
        this.reply(json.text, false);
      } else {
        e.reply('连接api接口失败！错误原因：' + json.toString());
      }
    } catch (err) {
      console.error('连接api接口失败！错误原因：', err);
      e.reply('连接api接口失败！错误原因：' + err);
    }
  }
}
