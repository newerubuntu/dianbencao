"""
数据加载模块 - 从JSON文件加载药膳、药材等数据
"""
import json
import os

def load_json(filename):
    """加载JSON文件"""
    filepath = os.path.join(os.path.dirname(__file__), 'data', filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_recipes_by_region_constitution(region, constitution, season=None):
    """根据地域、体质（可选季节）获取推荐药膳"""
    try:
        recipes_all = load_json('recipes_raw.json')
        # 优先匹配：地域 + 体质 + 季节
        matched = []
        if season:
            matched = [r for r in recipes_all
                       if r.get('地域') == region
                       and r.get('体质') == constitution
                       and r.get('季节') == season]
        # 回退：地域 + 体质（任意季节）
        if not matched:
            matched = [r for r in recipes_all
                       if r.get('地域') == region
                       and r.get('体质') == constitution]
        return [{
            'name': r.get('药膳方案', ''),
            'method': r.get('详细做法', ''),
            'region': r.get('地域', ''),
            'season': r.get('季节', ''),
            'constitution': r.get('体质', '')
        } for r in matched[:3]]
    except Exception as e:
        print(f"加载药膳数据失败: {e}")
        return []

def get_region_name(region_code):
    """将区域代码转换为中文名称"""
    region_map = {
        'dianzhong': '滇中',
        'diandongbei': '滇东北',
        'diandongnan': '滇东南',
        'diannan': '滇南',
        'dianxi': '滇西',
        'dianxibei': '滇西北'
    }
    return region_map.get(region_code, '滇中')
