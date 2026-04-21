"""
诊断算法模块
综合症状、舌苔、地域、节气进行体质判定
"""

# 体质权重映射
CONSTITUTION_NAMES = {
    'pinghe': '平和质',
    'qixu': '气虚质',
    'yangxu': '阳虚质',
    'yinxu': '阴虚质',
    'tanshi': '痰湿质',
    'shire': '湿热质',
    'xueyu': '血瘀质',
    'qiyu': '气郁质',
    'tebing': '特禀质'
}

# 舌象到体质的映射（扩展版）
TONGUE_MAPPING = {
    # 舌色
    '淡白舌（气血两虚）': {'qixu': 40, 'yangxu': 30},
    '白舌（气虚血虚）': {'qixu': 35, 'yangxu': 25},
    '淡红舌（正常）': {'pinghe': 30},
    '红舌（热证）': {'shire': 35, 'yinxu': 25},
    '绛舌（热入营血）': {'yinxu': 40, 'shire': 30},
    '暗红舌（血瘀）': {'xueyu': 45, 'shire': 15},
    '紫舌（血瘀寒凝）': {'xueyu': 40, 'yangxu': 20},
    '青紫舌（寒凝血瘀）': {'xueyu': 45, 'yangxu': 25},

    # 苔色
    '薄白苔（正常）': {'pinghe': 20},
    '白苔（正常/寒证）': {'yangxu': 15, 'tanshi': 10},
    '白厚苔（寒湿）': {'yangxu': 25, 'tanshi': 20},
    '白厚腻苔（痰湿）': {'tanshi': 40, 'shire': 10},
    '黄苔（热证湿热）': {'shire': 40, 'tanshi': 15},
    '黄褐苔（湿热食积）': {'shire': 45, 'tanshi': 20},
    '灰苔（里证寒湿）': {'yangxu': 30, 'tanshi': 25},
    '黑苔（热极或寒极）': {'shire': 50, 'yangxu': 30},
    '少苔（阴虚）': {'yinxu': 35}
}

# 地域到体质的修正
REGION_ADJUSTMENT = {
    'dianzhong': {'shire': 10, 'yangxu': 5, 'qixu': 5},
    'diandongbei': {'yangxu': 15, 'tanshi': 10, 'qixu': 5},
    'diandongnan': {'shire': 15, 'tanshi': 10, 'xueyu': 5},
    'diannan': {'shire': 15, 'tanshi': 10, 'yinxu': 5},
    'dianxi': {'pinghe': 10, 'qixu': 5, 'yinxu': 5},
    'dianxibei': {'yangxu': 15, 'yinxu': 10, 'xueyu': 5}
}

# 舌苔形状/质感特征映射（与 TONGUE_MAPPING 同一加分空间，但由布尔/枚举触发）
TONGUE_FEATURE_MAPPING = {
    'cracks':     {'yinxu': 35, 'qixu': 15},              # 裂纹舌 → 阴虚为主，气虚次之
    'moist':      {'yangxu': 20, 'tanshi': 15},           # 润/水滑 → 阳虚/痰湿（水湿内停）
    'dry':        {'yinxu': 35, 'shire': 15},             # 燥/少津 → 阴虚/湿热
    'teethMarks': {'qixu': 30, 'tanshi': 25, 'yangxu': 15},  # 齿痕舌 → 气虚+痰湿+阳虚
    'plump':      {'tanshi': 35, 'yangxu': 20},           # 胖大舌 → 痰湿/阳虚
    'thin':       {'yinxu': 30, 'qixu': 20}               # 瘦薄舌 → 阴虚/血虚(气虚)
}

def diagnose(region, symptoms, tongue_data, solar_term):
    """
    综合诊断：基于王琦《中医体质分类与判定》(ZYYXH/T157-2009) 的转化分公式
    + 舌诊 / 地域 / 节气 作为小幅修正
    """
    # 1. 问卷转化分（基础维度，0-100）
    scores = calculate_constitution_scores(symptoms)

    # 2. 舌苔修正（四诊中的"望诊"，权重较重；原始映射 15-90 × 0.6，封顶 +40）
    #    舌象显著指向某体质时，即使问卷处于 30-40 倾向区间，也能把该体质推到判定为"是"
    tongue_scores = analyze_tongue(tongue_data)
    for k, v in tongue_scores.items():
        if k in scores:
            scores[k] = min(100.0, scores[k] + min(40, v * 0.6))

    # 3. 地域修正（云南气候倾向，+2.5 ~ +7.5）
    region_scores = REGION_ADJUSTMENT.get(region, {})
    for k, v in region_scores.items():
        if k in scores:
            scores[k] = min(100.0, scores[k] + min(7.5, v * 0.5))

    # 4. 节气修正（时令倾向，+1.5 ~ +3）
    season_scores = adjust_by_season(solar_term)
    for k, v in season_scores.items():
        if k in scores:
            scores[k] = min(100.0, scores[k] + min(3, v * 0.3))

    # 保留一位小数
    scores = {k: round(v, 1) for k, v in scores.items()}

    # 5. 判定主/兼夹体质（按国标阈值：偏颇 ≥40 为"是"，≥30 为"倾向是"；平和 ≥60 且偏颇 <40）
    biased = {k: v for k, v in scores.items() if k != 'pinghe'}
    sorted_biased = sorted(biased.items(), key=lambda x: x[1], reverse=True)
    top_const, top_score = sorted_biased[0]
    second_const, second_score = sorted_biased[1]
    pinghe_score = scores['pinghe']

    if pinghe_score >= 60 and top_score < 40:
        primary = '平和质'
        secondary = CONSTITUTION_NAMES[top_const] if top_score >= 30 else None
    else:
        primary = CONSTITUTION_NAMES[top_const]
        secondary = CONSTITUTION_NAMES[second_const] if second_score >= 30 else None

    advice = generate_advice(primary, region, solar_term)
    recipes = recommend_recipes(primary, region, solar_term)

    return {
        'constitution': {
            'primary': primary,
            'secondary': secondary,
            'scores': {CONSTITUTION_NAMES[k]: v for k, v in scores.items()}
        },
        'advice': advice,
        'recipes': recipes
    }

# 每个体质对应的问卷题目索引（0-based），与前端 questions 数组对齐
# 与原 calculate_symptom_scores 的 weights 一致，仅改用标准公式计算
CONSTITUTION_QUESTIONS = {
    'qixu':   [2, 3, 9, 16],      # 易出汗、疲乏、胃口差、易感冒
    'yangxu': [0, 7],              # 怕冷、便溏
    'yinxu':  [1, 6, 10, 12],      # 手足心热、便秘、口干、眼干耳鸣
    'tanshi': [4, 9, 11, 13],      # 身重、胃口差、口苦黏腻、睡眠差
    'shire':  [8, 11, 15],         # 小便黄、口苦黏腻、面暗长痘
    'xueyu':  [5, 15],             # 刺痛淤青、面暗长痘
    'qiyu':   [13, 14],            # 睡眠差、情绪低落
    'tebing': [17]                 # 过敏
}

def calculate_constitution_scores(symptoms):
    """
    按王琦《中医体质量表》转化分公式计算每种体质得分（0-100）
    转化分 = ((原始分 - 条目数) / (条目数 × 4)) × 100
    前端 symptoms 值 0..4 对应题目答案 1..5 分
    """
    scores = {}
    n_total = len(symptoms)
    for const, idxs in CONSTITUTION_QUESTIONS.items():
        valid = [i for i in idxs if i < n_total]
        n = len(valid)
        if n == 0:
            scores[const] = 0.0
            continue
        raw = sum((symptoms[i] + 1) for i in valid)  # 1~5 分求和
        t = (raw - n) / (n * 4) * 100
        scores[const] = max(0.0, min(100.0, t))

    # 平和质：低分题越多 + 偏颇体质平均分越低 → 越"平和"
    # 低分题比例占 60%，偏颇反比占 40%
    low_count = sum(1 for s in symptoms if s <= 1)
    avg_biased = sum(scores.values()) / len(scores) if scores else 0
    pinghe = (low_count / n_total) * 60 + max(0.0, (50 - avg_biased)) * 0.8
    scores['pinghe'] = max(0.0, min(100.0, pinghe))
    return scores

def calculate_symptom_scores(symptoms):
    """兼容旧接口；内部转用 calculate_constitution_scores"""
    return calculate_constitution_scores(symptoms)

def analyze_tongue(tongue_data):
    """分析舌象（颜色分类 + 形状质感特征）"""
    scores = {k: 0 for k in CONSTITUTION_NAMES.keys()}

    if not tongue_data:
        return scores

    tongue_color = tongue_data.get('tongueColor', '')
    coating_color = tongue_data.get('coatingColor', '')

    # 1. 舌色 / 苔色映射
    for color in [tongue_color, coating_color]:
        if color in TONGUE_MAPPING:
            for const, score in TONGUE_MAPPING[color].items():
                scores[const] += score

    # 2. 形状/质感特征映射
    def add_feature(key):
        for const, score in TONGUE_FEATURE_MAPPING[key].items():
            scores[const] += score

    if tongue_data.get('hasCracks'):
        add_feature('cracks')
    if tongue_data.get('hasTeethMarks'):
        add_feature('teethMarks')

    moisture = tongue_data.get('moisture', 'normal')
    if moisture == 'moist':
        add_feature('moist')
    elif moisture == 'dry':
        add_feature('dry')

    shape = tongue_data.get('tongueShape', 'normal')
    if shape == 'plump':
        add_feature('plump')
    elif shape == 'thin':
        add_feature('thin')

    return scores

def adjust_by_season(solar_term):
    """根据节气调整"""
    # 简化实现
    season_map = {
        '春分': {'qiyu': 5, 'yangxu': 5},
        '夏至': {'shire': 10, 'yinxu': 5},
        '秋分': {'yinxu': 10, 'qixu': 5},
        '冬至': {'yangxu': 10, 'qixu': 5}
    }
    return season_map.get(solar_term, {})

def generate_advice(constitution, region, solar_term):
    """生成养生建议"""
    advice_map = {
        '平和质': '保持规律作息，适度运动，饮食均衡，顺应四时变化。',
        '气虚质': '补气健脾为主，避免过劳，适量运动，多食山药、黄芪等补气食材。',
        '阳虚质': '温阳散寒，忌食生冷，注意保暖，可食用羊肉、生姜等温性食物。',
        '阴虚质': '滋阴润燥，少食辛辣，保证睡眠，多食百合、银耳等滋阴食材。',
        '痰湿质': '健脾化湿，清淡饮食，加强运动，多食茯苓、薏米等祛湿食材。',
        '湿热质': '清热利湿，忌辛辣油腻，规律作息，多食绿豆、鱼腥草等清热食材。',
        '血瘀质': '活血化瘀，适度运动，保持心情舒畅，可食用三七、当归等活血食材。',
        '气郁质': '疏肝理气，调畅情志，多与人交流，可饮用薄荷茶、玫瑰花茶。',
        '特禀质': '避免过敏原，增强体质，谨慎用药，注意饮食卫生。'
    }
    return advice_map.get(constitution, '请咨询专业中医师获取个性化建议。')

SOLAR_TERM_TO_SEASON = {
    '立春': '春季', '雨水': '春季', '惊蛰': '春季', '春分': '春季', '清明': '春季', '谷雨': '春季',
    '立夏': '夏季', '小满': '夏季', '芒种': '夏季', '夏至': '夏季', '小暑': '夏季',
    '大暑': '长夏',
    '立秋': '秋季', '处暑': '秋季', '白露': '秋季', '秋分': '秋季', '寒露': '秋季', '霜降': '秋季',
    '立冬': '冬季', '小雪': '冬季', '大雪': '冬季', '冬至': '冬季', '小寒': '冬季', '大寒': '冬季'
}


def recommend_recipes(constitution, region='dianzhong', solar_term=None):
    """推荐药膳 - 基于地域、体质、五季匹配"""
    from data_loader import get_recipes_by_region_constitution, get_region_name

    region_name = get_region_name(region)
    season = SOLAR_TERM_TO_SEASON.get(solar_term)
    recipes = get_recipes_by_region_constitution(region_name, constitution, season)

    # 数据缺失时的兜底
    if not recipes:
        fallback_season = season or ''
        recipes = [
            {'name': '山药小米粥',   'method': '山药30g、小米15g 一起煮粥30分钟',
             'region': region_name, 'season': fallback_season, 'constitution': constitution},
            {'name': '百合莲子粥',   'method': '百合20g、莲子30g 一起煮粥40分钟',
             'region': region_name, 'season': fallback_season, 'constitution': constitution},
            {'name': '石斛麦冬茶',   'method': '石斛10g、麦冬10g 热水泡茶饮用',
             'region': region_name, 'season': fallback_season, 'constitution': constitution}
        ]

    return recipes[:3]
