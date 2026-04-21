from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
from diagnosis import diagnose

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend'))

app = Flask(__name__,
            static_folder=FRONTEND_DIR,
            static_url_path='')
CORS(app)

@app.route('/')
def index():
    return app.send_static_file('index.html')

# 数据目录（绝对路径，避免依赖启动时的 cwd）
DATA_DIR = os.path.join(BASE_DIR, 'data')
RECORDS_DIR = os.path.join(BASE_DIR, 'records')

# 确保目录存在
os.makedirs(RECORDS_DIR, exist_ok=True)

@app.route('/api/diagnose', methods=['POST'])
def api_diagnose():
    """诊断接口"""
    data = request.json

    profile = data.get('profile')
    region = data.get('region')
    symptoms = data.get('symptoms')
    tongue_data = data.get('tongueData')
    solar_term = data.get('solarTerm')
    season = data.get('season')

    # 调用诊断算法
    result = diagnose(region, symptoms, tongue_data, solar_term)

    # 保存记录
    save_record({
        'timestamp': datetime.now().isoformat(),
        'profile': profile,
        'region': region,
        'solarTerm': solar_term,
        'season': season,
        'tongueData': tongue_data,
        'result': result
    })

    return jsonify(result)

@app.route('/api/solar-term', methods=['GET'])
def get_solar_term():
    """获取当前节气"""
    # 简化实现，返回固定值
    return jsonify({'solarTerm': '春分'})

@app.route('/api/recipes', methods=['GET'])
def get_all_recipes():
    """返回个性化药膳（地域 × 五季 × 体质）"""
    recipes_file = os.path.join(DATA_DIR, 'recipes_raw.json')
    with open(recipes_file, 'r', encoding='utf-8') as f:
        raw = json.load(f)

    result = []
    for r in raw:
        result.append({
            'id': r.get('序号'),
            'name': r.get('药膳方案', ''),
            'region': r.get('地域', ''),
            'season': r.get('季节', ''),
            'constitution': r.get('体质', ''),
            'method': r.get('详细做法', '')
        })
    return jsonify(result)

@app.route('/api/herbs', methods=['GET'])
def get_all_herbs():
    """返回《滇南本草》特色药材库"""
    herbs_file = os.path.join(DATA_DIR, 'herbs_raw.json')
    with open(herbs_file, 'r', encoding='utf-8') as f:
        raw = json.load(f)

    result = []
    for r in raw:
        result.append({
            'id': r.get('序号'),
            'name': r.get('药材名称', ''),
            'alias': r.get('云南俗名', ''),
            'effect': r.get('核心功效', ''),
            'caution': r.get('食用与孕妇禁忌', ''),
            'dosage': r.get('安全用量', ''),
            'area': r.get('生长区域', '')
        })
    return jsonify(result)

def save_record(record):
    """保存诊断记录"""
    records_file = os.path.join(RECORDS_DIR, 'diagnoses.json')

    if os.path.exists(records_file):
        with open(records_file, 'r', encoding='utf-8') as f:
            records = json.load(f)
    else:
        records = []

    records.append(record)

    with open(records_file, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print('Flask服务器启动中...')
    print(f'访问地址: http://localhost:{port}')
    app.run(debug=False, host='0.0.0.0', port=port)
