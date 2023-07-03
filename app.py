from flask import Flask, render_template, request, jsonify
from googleapiclient.discovery import build
from google.oauth2 import service_account
import helper
from pymongo import MongoClient
import json
import os
import statistics


app = Flask(__name__, static_folder='static', static_url_path='/static')
client = MongoClient(os.getenv('MONGODB_URI'))
database = client['spatial_reasoning']
collection = database['humanmap']
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

    # 插入或更新humanmap数据
    for item in humanmap_data:
        existing_pair = collection.find_one({
            'currscene': item[0],
            'currfloor': item[1],
            'startNode': item[2],
            'endNode': item[3]
        })

        if existing_pair:
            # 更新现有的pair的相似值
            collection.update_one(
                {
                    '_id': existing_pair['_id']
                },
                {
                    '$inc': {'similar': 1}
                }
            )
        else:
            # 插入新的pair数据
            collection.insert_one({
                'currscene': item[0],
                'currfloor': item[1],
                'startNode': item[2],
                'endNode': item[3],
                'similar': 1,
                'notsimilar': 0
            })

    return 'Humanmap updated successfully', 200

@app.route('/draw_from_mongodb')
def draw_from_mongodb():
    scene = request.args.get('scene')
    floor = request.args.get('floor')
    data = []

    matching_documents = list(collection.find({'currscene': scene, 'currfloor': int(floor)}))
    similar_values = [int(item['similar']) for item in matching_documents]
    median_value = statistics.median(similar_values)

    for item in matching_documents:
        similar = int(item['similar'])
        notsimilar = int(item['notsimilar'])

        if similar >= median_value and notsimilar < similar:
            startNode = item['startNode']
            endNode = item['endNode']
            data.append([startNode, endNode, similar, notsimilar])

    return jsonify(data)

if __name__ == '__main__':
    print("Starting Flask app")
    print("MongoDB URI: ", os.getenv('MONGODB_URI'))
    #connection_string =  "mongodb://jinli:humanmap@ac-s7qdv0r-shard-00-00.54g9dm5.mongodb.net:27017,ac-s7qdv0r-shard-00-01.54g9dm5.mongodb.net:27017,ac-s7qdv0r-shard-00-02.54g9dm5.mongodb.net:27017/?ssl=true&replicaSet=atlas-1372pk-shard-0&authSource=admin&retryWrites=true&w=majority"
    #replace jinli and humanmap with your user/password
    app.run(debug=True)
