import csv
import json
import re

# 定义输入CSV文件和输出JS文件的路径
input_csv_files = ['./Auto_output.csv', './Auto_output.csv']
output_js_file = './static/pointmap.js'
variable_names = ['groundtruth_Auto', 'groundtruth_Manually']  # 对应变量名

# 读取JS文件的当前内容
with open(output_js_file, 'r', encoding='utf-8') as jsfile:
    js_content = jsfile.read()

# 处理每个CSV文件
for csv_file, var_name in zip(input_csv_files, variable_names):
    # 读取CSV文件
    with open(csv_file, mode='r', newline='', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        data_list = [row for row in reader]

    # 将数据列表转换为JSON字符串
    json_str = json.dumps(data_list)

    # 构造JavaScript变量声明字符串
    new_js_var_declaration = f"var {var_name} = JSON.parse('{json_str}');\n"

    # 检查变量是否存在
    var_pattern = re.compile(rf"var {var_name} = JSON\.parse\('.*?'\);", re.DOTALL)
    if var_pattern.search(js_content):
        # 如果存在，则替换
        js_content = var_pattern.sub(new_js_var_declaration, js_content)
    else:
        # 如果不存在，则追加
        js_content += new_js_var_declaration

# 将更新后的内容写回JS文件
with open(output_js_file, 'w', encoding='utf-8') as jsfile:
    jsfile.write(js_content)

print(f'JSON data has been updated in {output_js_file}')
