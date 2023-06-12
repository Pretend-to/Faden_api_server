import os
import json
import re

# 获取当前脚本文件所在的目录
script_dir = os.path.dirname(os.path.abspath(__file__))

# 读取父文件夹中的 data.json 文件
with open(os.path.join(script_dir, '..', 'data.json'), 'r', encoding='utf-8') as f:
    data = json.load(f)

# 打印当前 data.json 中的 messages 列表
print('当前 data.json 中的 messages 列表：')
for i, message in enumerate(data['messages']):
    print(f'{i+1}. {message}')
print()

while True:
    # 获取用户输入的 message 和关键字
    message = input('请输入 message 的值：')
    keyword = input('请输入 message 中的关键字：')

    # 检查用户输入是否合法
    if keyword in message:
        # 将 message 中的所有关键字替换成 FCIP
        message = re.sub(keyword, 'FCIP', message)
        # 将新的 message 添加到 messages 列表中
        data['messages'].append(message)
        # 将更新后的 data.json 保存到父文件夹中
        with open(os.path.join(script_dir, '..', 'data.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print('添加成功！')
    else:
        print('输入不合法，请重新输入。')

    # 询问用户是否继续添加
    choice = input('是否继续添加？（Y/N）（直接回车表示继续添加）')
    if choice.lower() == 'n':
        break
