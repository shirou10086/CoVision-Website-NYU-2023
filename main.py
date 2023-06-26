from flask import Flask, render_template, request, jsonify
import helper
import pymongo
import json

app = Flask(__name__, static_folder='static', static_url_path='/static')

helper.main()
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index')
def index_page():
    return render_template('index.html')

@app.route('/data')
def data():
    return render_template('data.html')

@app.route('/tutorial')
def tutorial():
    return render_template('tutorial.html')

@app.route('/methods')
def methods():
    return render_template('methods.html')

@app.route('/aboutus')
def aboutus():
    return render_template('aboutus.html')

@app.route('/visualize')
def visualize():
    return render_template('visualize.html')

@app.route('/reasoning')
def reasoning():
    return render_template('reasoning.html')


@app.route('/update_humanmap', methods=['POST'])
def update_humanmap():
    humanmap_data = request.get_json()  # 获取前端发送的humanmap数据

    # 读取已存在的 humanmap.js 文件内容
    with open('static/humanmap.js', 'r') as file:
        existing_data = file.read()

    # 提取 humanmap 变量的值
    existing_humanmap = ""
    if 'var humanmap =' in existing_data:
        existing_humanmap = existing_data.split('var humanmap =')[1].split(';')[0].strip()

    # 将新数据与已有数据合并
    updated_humanmap = []
    if existing_humanmap:
        existing_humanmap = existing_humanmap.rstrip(',')
        updated_humanmap = json.loads(existing_humanmap)

        # 去除已有数据中与新数据重复的部分
        updated_humanmap = [item for item in updated_humanmap if item not in humanmap_data]

        # 合并新数据
        updated_humanmap.extend(humanmap_data)
    else:
        updated_humanmap = humanmap_data

    # 将更新后的数据写入 humanmap.js 文件
    with open('static/humanmap.js', 'w') as file:
        file.write('var humanmap = ' + json.dumps(updated_humanmap) + ';\n')

    return 'Humanmap updated successfully'


if __name__ == '__main__':
    app.run(debug=True)
