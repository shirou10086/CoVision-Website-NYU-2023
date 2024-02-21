import csv
import json

# 定义输入CSV文件和输出JS文件的路径
input_csv_files = ['./Auto_output.csv', './Auto_output.csv']
output_js_file = './static/pointmap.js'
variable_names = ['groundtruth_Auto', 'groundtruth_Manually']  # 对应变量名

# 以追加模式打开JS文件
with open(output_js_file, 'a', encoding='utf-8') as jsfile:
    # 处理每个CSV文件
    for csv_file, var_name in zip(input_csv_files, variable_names):
        # 读取CSV文件
        with open(csv_file, mode='r', newline='', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            data_list = [row for row in reader]

        # 将数据列表转换为JSON字符串
        json_str = json.dumps(data_list)

        # 构造JavaScript变量声明字符串
        js_var_declaration = f"var {var_name} = JSON.parse('{json_str}');\n"

        # 以追加模式写入到JS文件
        jsfile.write(js_var_declaration)

print(f'JSON data has been appended to {output_js_file}')
