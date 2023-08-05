/**
/  由 秋山 澪 魔改自 ikechan8370 大佬的 memes 插件，原插件地址：https://github.com/ikechan8370/yunzai-meme
/  借用了Randommemes方法，触发方式改为戳一戳并融合了发电功能。
*/

import plugin from '../../lib/plugins/plugin.js'
import cfg from '../../lib/config/config.js'
import fetch, { FormData, File } from 'node-fetch'
import fs from 'fs'
import path from 'node:path'
import _ from 'lodash'
if (!global.segment) {
  global.segment = (await import('oicq')).segment
}

const meme_api = 'https://api.fcip.xyz/memes'
const faden_api = 'https://api.fcip.xyz/faden/api'

export class meme extends plugin {
  constructor() {
    let meme = {
      name: '戳一戳',
      dsc: '戳一戳机器人触发效果',
      event: 'notice.group.poke',
      priority: 3000,
      rule: [
        {
          fnc: 'poked'
        }
      ]
    }
    super(meme)
  }

  async poked(e) {
    if (e.target_id === cfg.qq) {
      if (Math.random() < 0.50) {
        return await this.memes(e);
      } else {
        return await this.faden(e);
      }
    }
    return;
  }

  async faden(e) {
    // console.log(e);
    const poker = await e.group.pickMember(e.operator_id, false).info
    const name = (poker.title || poker.card || poker.nickname)
    console.log(poker)
    console.log('[Mio戳一戳][当场发电][' + name + ']') // 输出群员的昵称
    let url = new URL('/', faden_api);
    url.searchParams.set('name', name);
    try {
      let response = await fetch(url.toString());
      if (response.status === 200) {
        let json = await response.json();
        await this.reply(json.text, true);
      }else {
        await e.reply('连接api接口失败！错误原因：' + response.statusText);
        return true;
      }}
    catch (err) {
    logger.error('连接api接口失败！错误原因：', err);
    await e.reply('连接api接口失败！错误原因：' + err);
    return false;
    }
  }

  async memes(e) {
    let keys = Object.keys(infos)
    let index = _.random(0, keys.length - 1, false)
    let targetCode = keys[index]
    //let userInfos
    let formData = new FormData()
    let info = infos[targetCode]
    let fileLoc
    let text

    const poker = await e.group.pickMember(e.operator_id, false).info
    const self = await e.group.pickMember(e.self_id, false).info
    const name = (poker.title || poker.card || poker.nickname)

    if (info.params.max_images > 0) {
      let imgUrls = [`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.operator_id}`]
      if (imgUrls.length < info.params.min_images) {
        // 如果数量不够，补上发送者头像，且放到最前面
        let me = [`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.self_id}`]
        imgUrls = me.concat(imgUrls)
      }
      imgUrls = imgUrls.slice(0, Math.min(info.params.max_images, imgUrls.length))
      for (let i = 0; i < imgUrls.length; i++) {
        let imgUrl = imgUrls[i]
        const imageResponse = await fetch(imgUrl)
        const fileType = imageResponse.headers.get('Content-Type').split('/')[1]
        fileLoc = `data/memes/original/${Date.now()}.${fileType}`
        mkdirs('data/memes/original')
        const blob = await imageResponse.blob()
        const arrayBuffer = await blob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        await fs.writeFileSync(fileLoc, buffer)
        formData.append('images', new File([buffer], `avatar_${i}.jpg`, { type: 'image/jpeg' }))
      }
    }
    if (!text && info.params.min_texts > 0) {
      text = (poker.title || poker.card || poker.nickname)
      formData.append('text', text)
    }

    if (info.params.max_images === 1) {
      console.log('[Mio戳一戳][为"' + name + '"生成[' + info.keywords + ']表情包]');
    } else if (info.params.max_images === 2) {
      console.log('[Mio戳一戳][为"' + name + '"&"' + (self.card || self.nickname) + '"生成[' + info.keywords + ']表情包]');
    }

    //console.log('input', { targetCode, images: formData.getAll('images'), texts: formData.getAll('texts') })
    let response = await fetch(meme_api + '/memes/' + targetCode + '/', {
      method: 'POST',
      body: formData
    })
    //console.log(response.status)
    if (response.status > 299) {
      let error = await response.text()
      console.error(error)
      await e.reply(error, true)
      return true
    }
    mkdirs('data/memes/result')
    let resultFileLoc = `data/memes/result/${Date.now()}.jpg`
    const resultBlob = await response.blob()
    const resultArrayBuffer = await resultBlob.arrayBuffer()
    const resultBuffer = Buffer.from(resultArrayBuffer)
    await fs.writeFileSync(resultFileLoc, resultBuffer)
    await e.reply(segment.image(fs.createReadStream(resultFileLoc)))
    fileLoc && await fs.unlinkSync(fileLoc)
    await fs.unlinkSync(resultFileLoc)
  }
}

const infos =
{
  "capoo_strike": {
    "key": "capoo_strike",
    "keywords": [
      "咖波撞",
      "咖波头槌"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "fencing": {
    "key": "fencing",
    "keywords": [
      "击剑",
      "🤺"
    ],
    "patterns": [],
    "params": {
      "min_images": 2,
      "max_images": 2,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "suck": {
    "key": "suck",
    "keywords": [
      "吸",
      "嗦"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "thump_wildly": {
    "key": "thump_wildly",
    "keywords": [
      "捶爆",
      "爆捶"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "kaleidoscope": {
    "key": "kaleidoscope",
    "keywords": [
      "万花筒",
      "万花镜"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": [
        {
          "name": "circle",
          "type": "boolean",
          "description": "是否将图片变为圆形",
          "default": false,
          "enum": null
        }
      ]
    }
  },
  "gun": {
    "key": "gun",
    "keywords": [
      "手枪"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": [
        {
          "name": "position",
          "type": "string",
          "description": "枪的位置",
          "default": "left",
          "enum": [
            "left",
            "right",
            "both"
          ]
        }
      ]
    }
  },
  "dinosaur": {
    "key": "dinosaur",
    "keywords": [
      "恐龙",
      "小恐龙"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "kirby_hammer": {
    "key": "kirby_hammer",
    "keywords": [
      "卡比锤",
      "卡比重锤"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": [
        {
          "name": "circle",
          "type": "boolean",
          "description": "是否将图片变为圆形",
          "default": false,
          "enum": null
        }
      ]
    }
  },
  "police": {
    "key": "police",
    "keywords": [
      "出警"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "police1": {
    "key": "police1",
    "keywords": [
      "警察"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "overtime": {
    "key": "overtime",
    "keywords": [
      "加班"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "acg_entrance": {
    "key": "acg_entrance",
    "keywords": [
      "二次元入口"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [
        "走，跟我去二次元吧"
      ],
      "args": []
    }
  },
  "together": {
    "key": "together",
    "keywords": [
      "一起"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [],
      "args": []
    }
  },
  "look_this_icon": {
    "key": "look_this_icon",
    "keywords": [
      "看图标"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [
        "朋友\n先看看这个图标再说话"
      ],
      "args": []
    }
  },
  "smash": {
    "key": "smash",
    "keywords": [
      "砸"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "distracted": {
    "key": "distracted",
    "keywords": [
      "注意力涣散"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "safe_sense": {
    "key": "safe_sense",
    "keywords": [
      "安全感"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [
        "你给我的安全感\n远不及它的万分之一"
      ],
      "args": []
    }
  },
  "blood_pressure": {
    "key": "blood_pressure",
    "keywords": [
      "高血压"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "hutao_bite": {
    "key": "hutao_bite",
    "keywords": [
      "胡桃啃"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "need": {
    "key": "need",
    "keywords": [
      "需要",
      "你可能需要"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "always": {
    "key": "always",
    "keywords": [
      "一直"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": [
        {
          "name": "mode",
          "type": "string",
          "description": "生成模式",
          "default": "normal",
          "enum": [
            "normal",
            "loop",
            "circle"
          ]
        }
      ]
    }
  },
  "decent_kiss": {
    "key": "decent_kiss",
    "keywords": [
      "像样的亲亲"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "scratch_head": {
    "key": "scratch_head",
    "keywords": [
      "挠头"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "anti_kidnap": {
    "key": "anti_kidnap",
    "keywords": [
      "防诱拐"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "pat": {
    "key": "pat",
    "keywords": [
      "拍"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "name_generator": {
    "key": "name_generator",
    "keywords": [
      "亚文化取名机",
      "亚名"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "trance": {
    "key": "trance",
    "keywords": [
      "恍惚"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "back_to_work": {
    "key": "back_to_work",
    "keywords": [
      "继续干活",
      "打工人"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "rub": {
    "key": "rub",
    "keywords": [
      "贴",
      "贴贴",
      "蹭",
      "蹭蹭"
    ],
    "patterns": [],
    "params": {
      "min_images": 2,
      "max_images": 2,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "lim_x_0": {
    "key": "lim_x_0",
    "keywords": [
      "等价无穷小"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "walnut_pad": {
    "key": "walnut_pad",
    "keywords": [
      "胡桃平板"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "call_110": {
    "key": "call_110",
    "keywords": [
      "遇到困难请拨打"
    ],
    "patterns": [],
    "params": {
      "min_images": 2,
      "max_images": 2,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "cover_face": {
    "key": "cover_face",
    "keywords": [
      "捂脸"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "dianzhongdian": {
    "key": "dianzhongdian",
    "keywords": [
      "入典",
      "典中典",
      "黑白草图"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 1,
      "max_texts": 2,
      "default_texts": [
        "救命啊"
      ],
      "args": []
    }
  },
  "painter": {
    "key": "painter",
    "keywords": [
      "小画家"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "china_flag": {
    "key": "china_flag",
    "keywords": [
      "国旗"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "throw": {
    "key": "throw",
    "keywords": [
      "丢",
      "扔"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "symmetric": {
    "key": "symmetric",
    "keywords": [
      "对称"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": [
        {
          "name": "direction",
          "type": "string",
          "description": "对称方向",
          "default": "left",
          "enum": [
            "left",
            "right",
            "top",
            "bottom"
          ]
        }
      ]
    }
  },
  "divorce": {
    "key": "divorce",
    "keywords": [
      "离婚协议",
      "离婚申请"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "worship": {
    "key": "worship",
    "keywords": [
      "膜",
      "膜拜"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "wave": {
    "key": "wave",
    "keywords": [
      "波纹"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "listen_music": {
    "key": "listen_music",
    "keywords": [
      "听音乐"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "look_flat": {
    "key": "look_flat",
    "keywords": [
      "看扁"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [
        "可恶...被人看扁了"
      ],
      "args": [
        {
          "name": "ratio",
          "type": "integer",
          "description": "图片“压扁”比例",
          "default": 2,
          "enum": null
        }
      ]
    }
  },
  "shock": {
    "key": "shock",
    "keywords": [
      "震惊"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "klee_eat": {
    "key": "klee_eat",
    "keywords": [
      "可莉吃"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "charpic": {
    "key": "charpic",
    "keywords": [
      "字符画"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "bubble_tea": {
    "key": "bubble_tea",
    "keywords": [
      "奶茶"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": [
        {
          "name": "position",
          "type": "string",
          "description": "奶茶的位置",
          "default": "right",
          "enum": [
            "right",
            "left",
            "both"
          ]
        }
      ]
    }
  },
  "my_wife": {
    "key": "my_wife",
    "keywords": [
      "我老婆",
      "这是我老婆"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "read_book": {
    "key": "read_book",
    "keywords": [
      "看书"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "hold_tight": {
    "key": "hold_tight",
    "keywords": [
      "抱紧"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "eat": {
    "key": "eat",
    "keywords": [
      "吃"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "anya_suki": {
    "key": "anya_suki",
    "keywords": [
      "阿尼亚喜欢"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [
        "阿尼亚喜欢这个"
      ],
      "args": []
    }
  },
  "hammer": {
    "key": "hammer",
    "keywords": [
      "锤"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "capoo_draw": {
    "key": "capoo_draw",
    "keywords": [
      "咖波画"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "sit_still": {
    "key": "sit_still",
    "keywords": [
      "坐得住",
      "坐的住"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [],
      "args": []
    }
  },
  "make_friend": {
    "key": "make_friend",
    "keywords": [
      "交个朋友"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [],
      "args": []
    }
  },
  "capoo_rub": {
    "key": "capoo_rub",
    "keywords": [
      "咖波蹭",
      "咖波贴"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "paint": {
    "key": "paint",
    "keywords": [
      "这像画吗"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "interview": {
    "key": "interview",
    "keywords": [
      "采访"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 2,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [
        "采访大佬经验"
      ],
      "args": []
    }
  },
  "hit_screen": {
    "key": "hit_screen",
    "keywords": [
      "打穿",
      "打穿屏幕"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "bite": {
    "key": "bite",
    "keywords": [
      "啃"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "prpr": {
    "key": "prpr",
    "keywords": [
      "舔",
      "舔屏",
      "prpr"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "applaud": {
    "key": "applaud",
    "keywords": [
      "鼓掌"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "play": {
    "key": "play",
    "keywords": [
      "顶",
      "玩"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "printing": {
    "key": "printing",
    "keywords": [
      "打印"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "kick_ball": {
    "key": "kick_ball",
    "keywords": [
      "踢球"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "punch": {
    "key": "punch",
    "keywords": [
      "打拳"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "roll": {
    "key": "roll",
    "keywords": [
      "滚"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "addiction": {
    "key": "addiction",
    "keywords": [
      "上瘾",
      "毒瘾发作"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [],
      "args": []
    }
  },
  "cyan": {
    "key": "cyan",
    "keywords": [
      "群青"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "think_what": {
    "key": "think_what",
    "keywords": [
      "想什么"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "jiujiu": {
    "key": "jiujiu",
    "keywords": [
      "啾啾"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "potato": {
    "key": "potato",
    "keywords": [
      "土豆"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "pound": {
    "key": "pound",
    "keywords": [
      "捣"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "rip": {
    "key": "rip",
    "keywords": [
      "撕"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 2,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "beat_head": {
    "key": "beat_head",
    "keywords": [
      "拍头"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [],
      "args": []
    }
  },
  "perfect": {
    "key": "perfect",
    "keywords": [
      "完美"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "crawl": {
    "key": "crawl",
    "keywords": [
      "爬"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": [
        {
          "name": "number",
          "type": "integer",
          "description": "图片编号，范围为 1~92",
          "default": 0,
          "enum": null
        }
      ]
    }
  },
  "turn": {
    "key": "turn",
    "keywords": [
      "转"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "coupon": {
    "key": "coupon",
    "keywords": [
      "兑换券"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [],
      "args": []
    }
  },
  "loading": {
    "key": "loading",
    "keywords": [
      "加载中"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "incivilization": {
    "key": "incivilization",
    "keywords": [
      "不文明"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [
        "你刚才说的话不是很礼貌！"
      ],
      "args": []
    }
  },
  "my_friend": {
    "key": "my_friend",
    "keywords": [
      "我朋友说"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 1,
      "max_texts": 10,
      "default_texts": [
        "让我康康"
      ],
      "args": [
        {
          "name": "name",
          "type": "string",
          "description": "指定名字",
          "default": "",
          "enum": null
        }
      ]
    }
  },
  "alike": {
    "key": "alike",
    "keywords": [
      "一样"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "tightly": {
    "key": "tightly",
    "keywords": [
      "紧贴",
      "紧紧贴着"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "kiss": {
    "key": "kiss",
    "keywords": [
      "亲",
      "亲亲"
    ],
    "patterns": [],
    "params": {
      "min_images": 2,
      "max_images": 2,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "why_at_me": {
    "key": "why_at_me",
    "keywords": [
      "为什么@我"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "marriage": {
    "key": "marriage",
    "keywords": [
      "结婚申请",
      "结婚登记"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "chase_train": {
    "key": "chase_train",
    "keywords": [
      "追列车",
      "追火车"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "wooden_fish": {
    "key": "wooden_fish",
    "keywords": [
      "木鱼"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "karyl_point": {
    "key": "karyl_point",
    "keywords": [
      "凯露指"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "rise_dead": {
    "key": "rise_dead",
    "keywords": [
      "诈尸",
      "秽土转生"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "tankuku_raisesign": {
    "key": "tankuku_raisesign",
    "keywords": [
      "唐可可举牌"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "universal": {
    "key": "universal",
    "keywords": [
      "万能表情",
      "空白表情"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 1,
      "max_texts": 10,
      "default_texts": [
        "在此处添加文字"
      ],
      "args": []
    }
  },
  "petpet": {
    "key": "petpet",
    "keywords": [
      "摸",
      "摸摸",
      "摸头",
      "rua"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": [
        {
          "name": "circle",
          "type": "boolean",
          "description": "是否将图片变为圆形",
          "default": false,
          "enum": null
        }
      ]
    }
  },
  "support": {
    "key": "support",
    "keywords": [
      "精神支柱"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "pass_the_buck": {
    "key": "pass_the_buck",
    "keywords": [
      "推锅",
      "甩锅"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [
        "你写!"
      ],
      "args": []
    }
  },
  "love_you": {
    "key": "love_you",
    "keywords": [
      "永远爱你"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "garbage": {
    "key": "garbage",
    "keywords": [
      "垃圾",
      "垃圾桶"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "little_angel": {
    "key": "little_angel",
    "keywords": [
      "小天使"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [],
      "args": []
    }
  },
  "wallpaper": {
    "key": "wallpaper",
    "keywords": [
      "墙纸"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "knock": {
    "key": "knock",
    "keywords": [
      "敲"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "walnut_zoom": {
    "key": "walnut_zoom",
    "keywords": [
      "胡桃放大"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "funny_mirror": {
    "key": "funny_mirror",
    "keywords": [
      "哈哈镜"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "play_game": {
    "key": "play_game",
    "keywords": [
      "玩游戏"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [
        "来玩休闲游戏啊"
      ],
      "args": []
    }
  },
  "thump": {
    "key": "thump",
    "keywords": [
      "捶"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "no_response": {
    "key": "no_response",
    "keywords": [
      "无响应"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "step_on": {
    "key": "step_on",
    "keywords": [
      "踩"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "confuse": {
    "key": "confuse",
    "keywords": [
      "迷惑"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "bocchi_draft": {
    "key": "bocchi_draft",
    "keywords": [
      "波奇手稿"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "rip_angrily": {
    "key": "rip_angrily",
    "keywords": [
      "怒撕"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "throw_gif": {
    "key": "throw_gif",
    "keywords": [
      "抛",
      "掷"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "windmill_turn": {
    "key": "windmill_turn",
    "keywords": [
      "风车转"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "dont_touch": {
    "key": "dont_touch",
    "keywords": [
      "不要靠近"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "teach": {
    "key": "teach",
    "keywords": [
      "讲课",
      "敲黑板"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [
        "我老婆"
      ],
      "args": []
    }
  },
  "follow": {
    "key": "follow",
    "keywords": [
      "关注"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [],
      "args": []
    }
  },
  "twist": {
    "key": "twist",
    "keywords": [
      "搓"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "hug_leg": {
    "key": "hug_leg",
    "keywords": [
      "抱大腿"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "learn": {
    "key": "learn",
    "keywords": [
      "偷学"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [
        "偷学群友数理基础"
      ],
      "args": []
    }
  },
  "can_can_need": {
    "key": "can_can_need",
    "keywords": [
      "看看你的"
    ],
    "patterns": [],
    "params": {
      "min_images": 2,
      "max_images": 2,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "do": {
    "key": "do",
    "keywords": [
      "撅",
      "狠狠地撅"
    ],
    "patterns": [],
    "params": {
      "min_images": 2,
      "max_images": 2,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "forbid": {
    "key": "forbid",
    "keywords": [
      "禁止",
      "禁"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "grab": {
    "key": "grab",
    "keywords": [
      "抓"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  },
  "operator_generator": {
    "key": "operator_generator",
    "keywords": [
      "合成大干员"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 1,
      "default_texts": [],
      "args": []
    }
  },
  "stretch": {
    "key": "stretch",
    "keywords": [
      "双手",
      "伸展"
    ],
    "patterns": [],
    "params": {
      "min_images": 1,
      "max_images": 1,
      "min_texts": 0,
      "max_texts": 0,
      "default_texts": [],
      "args": []
    }
  }
}

function mkdirs(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirs(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}