// 主应用逻辑

// 问卷数据（来自中医体质辨识精简问卷）
const questions = [
    { q: '您平时怕冷、手脚冰凉吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { yangxu: [1,2,3,4,5] } },
    { q: '您经常手足心热、潮热盗汗吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { yinxu: [1,2,3,4,5] } },
    { q: '您不活动也容易出汗吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { qixu: [1,2,3,4,5] } },
    { q: '您经常疲乏无力、懒得说话吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { qixu: [1,2,3,4,5] } },
    { q: '您身体沉重、胸闷腹胀吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { tanshi: [1,2,3,4,5] } },
    { q: '您身体有固定刺痛、皮肤易淤青吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { xueyu: [1,2,3,4,5] } },
    { q: '您大便干燥、便秘吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { yinxu: [1,2,3,4,5] } },
    { q: '您大便稀溏、吃凉就泻吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { yangxu: [1,2,3,4,5] } },
    { q: '您小便黄、短少或夜尿多吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { shire: [1,2,3,4,5] } },
    { q: '您胃口差、易腹胀吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { qixu: [1,2,3,4,5], tanshi: [1,2,3,4,5] } },
    { q: '您口干咽燥、总想喝水吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { yinxu: [1,2,3,4,5] } },
    { q: '您口苦、口中黏腻、有异味吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { shire: [1,2,3,4,5], tanshi: [1,2,3,4,5] } },
    { q: '您眼干、耳鸣吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { yinxu: [1,2,3,4,5] } },
    { q: '您入睡难、多梦或嗜睡吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { qiyu: [1,2,3,4,5], tanshi: [1,2,3,4,5] } },
    { q: '您情绪低落、胸闷爱叹气吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { qiyu: [1,2,3,4,5] } },
    { q: '您面色晦暗、长斑、皮肤油、易长痘吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { xueyu: [1,2,3,4,5], shire: [1,2,3,4,5] } },
    { q: '您容易感冒、抵抗力差吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { qixu: [1,2,3,4,5] } },
    { q: '您容易过敏、鼻炎、皮肤痒吗？', options: ['没有/根本不', '很少/有一点', '有时/有些', '经常/相当', '总是/非常'], weights: { tebing: [1,2,3,4,5] } }
];


// 体质数据
const constitutions = {
    pinghe: { name: '平和质', desc: '阴阳气血调和，体态适中，面色红润，精力充沛' },
    qixu: { name: '气虚质', desc: '元气不足，易疲乏，气短懒言' },
    yangxu: { name: '阳虚质', desc: '阳气不足，畏寒怕冷，手足不温' },
    yinxu: { name: '阴虚质', desc: '阴液亏少，口燥咽干，手足心热' },
    tanshi: { name: '痰湿质', desc: '痰湿凝聚，体形肥胖，腹部松软' },
    shire: { name: '湿热质', desc: '湿热内蕴，面垢油光，易生痤疮' },
    xueyu: { name: '血瘀质', desc: '血行不畅，肤色晦暗，易生瘀斑' },
    qiyu: { name: '气郁质', desc: '气机郁滞，神情抑郁，情绪不稳' },
    tebing: { name: '特禀质', desc: '先天禀赋不足，易过敏' }
};

// 地域数据
const regions = {
    dianzhong: { name: '滇中', climate: '亚热带高原季风气候，多风干燥、四季如春', constitutions: ['湿热质', '阳虚质', '气虚质'] },
    diandongbei: { name: '滇东北', climate: '亚热带山地季风气候，阴冷潮湿', constitutions: ['阳虚质', '痰湿质', '气虚质'] },
    diandongnan: { name: '滇东南', climate: '亚热带季风气候，干湿分明、夏季湿热', constitutions: ['湿热质', '痰湿质', '血瘀质'] },
    diannan: { name: '滇南', climate: '热带季风气候，高温高湿、长夏无冬', constitutions: ['湿热质', '痰湿质', '阴虚质'] },
    dianxi: { name: '滇西', climate: '亚热带季风气候，温暖湿润', constitutions: ['平和质', '气虚质', '阴虚质'] },
    dianxibei: { name: '滇西北', climate: '高原山地气候，高寒干燥', constitutions: ['阳虚质', '阴虚质', '血瘀质'] }
};

// 药膳数据
const recipes = [
    { name: '茯苓薏米粥', constitution: ['痰湿质', '湿热质'], effect: '健脾祛湿', ingredients: '云茯苓15g、薏米30g、大米50g' },
    { name: '黄精炖鸡汤', constitution: ['气虚质', '阴虚质'], effect: '补气养阴', ingredients: '滇黄精20g、鸡肉300g、红枣5枚' },
    { name: '石斛麦冬茶', constitution: ['阴虚质', '湿热质'], effect: '养阴清热', ingredients: '石斛10g、麦冬10g、枸杞5g' },
    { name: '当归生姜羊肉汤', constitution: ['阳虚质', '血瘀质'], effect: '温阳散寒', ingredients: '当归15g、生姜30g、羊肉500g' },
    { name: '鱼腥草绿豆汤', constitution: ['湿热质', '痰湿质'], effect: '清热解毒', ingredients: '鱼腥草30g、绿豆50g' },
    { name: '薄荷菊花茶', constitution: ['气郁质', '湿热质'], effect: '疏肝解郁', ingredients: '薄荷5g、菊花10g' }
];

// 问卷相关
let questionIndex = 0;

function initQuestionnaire() {
    userData.symptoms = new Array(questions.length);
    questionIndex = 0;
    showQuestion(true);
}

function showQuestion(skipSpeak) {
    const q = questions[questionIndex];

    // 确保问题卡片存在
    const questionCard = document.getElementById('question-card');
    if (!questionCard) {
        console.error('Question card not found');
        return;
    }

    const qNum = document.getElementById('q-num');
    const qText = document.getElementById('q-text');

    if (qNum) qNum.textContent = questionIndex + 1;
    if (qText) qText.textContent = q.q;

    const optionsDiv = document.getElementById('q-options');
    if (optionsDiv) {
        optionsDiv.innerHTML = q.options.map((opt, i) =>
            `<div class="option" onclick="selectOption(${i})">${opt}</div>`
        ).join('');
    }

    // 恢复之前的选择
    if (userData.symptoms[questionIndex] !== undefined && optionsDiv) {
        optionsDiv.children[userData.symptoms[questionIndex]].classList.add('selected');
        const btnNext = document.getElementById('btn-next-q');
        if (btnNext) btnNext.disabled = false;
    } else {
        const btnNext = document.getElementById('btn-next-q');
        if (btnNext) btnNext.disabled = true;
    }

    // 语音播报
    if (!skipSpeak) {
        const optionsText = q.options.join('，');
        speak(`第${questionIndex + 1}题，${q.q}。选项有：${optionsText}`);
    }

    // 更新按钮状态
    const btnPrev = document.getElementById('btn-prev-q');
    const btnNext = document.getElementById('btn-next-q');

    if (btnPrev) btnPrev.disabled = questionIndex === 0;
    if (btnNext) btnNext.textContent = questionIndex === questions.length - 1 ? '完成' : '下一题';

    // 更新问题编号显示
    const questionNumber = document.querySelector('.question-number');
    if (questionNumber) {
        questionNumber.textContent = `问题 ${questionIndex + 1} / ${questions.length}`;
    }
}

function selectOption(index) {
    userData.symptoms[questionIndex] = index;
    document.querySelectorAll('#q-options .option').forEach((el, i) => {
        el.classList.toggle('selected', i === index);
    });
    document.getElementById('btn-next-q').disabled = false;

    // 语音播报选择
    const selectedText = questions[questionIndex].options[index];
    speak(`已选择：${selectedText}`);
}

function nextQuestion() {
    if (questionIndex < questions.length - 1) {
        questionIndex++;
        showQuestion();
    } else {
        // 问卷完成，显示初步诊断
        showPreliminaryDiagnosis();
    }
}

// 显示初步诊断
function showPreliminaryDiagnosis() {
    const scores = calculatePreliminaryScores();
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = constitutions[sorted[0][0]].name;

    // 在问卷页面显示初步结果
    const container = document.querySelector('#step-questionnaire .container');
    container.innerHTML = `
        <h2 class="step-title">初步诊断结果</h2>
        <p class="step-desc">基于您的症状问卷分析</p>

        <div class="card" style="max-width: 600px; margin: 2rem auto; padding: 2rem;">
            <h3 style="color: var(--primary); margin-bottom: 1rem;">初步体质判定</h3>
            <div style="font-size: 1.5rem; color: var(--secondary); margin: 1.5rem 0;">
                <strong>${primary}</strong>
            </div>
            <p style="color: #666; margin-bottom: 2rem;">
                ${constitutions[sorted[0][0]].desc}
            </p>
            <p style="background: var(--bg-light); padding: 1rem; border-radius: 8px; font-size: 0.95rem;">
                💡 接下来请上传舌苔照片，系统将结合舌象进行更精准的综合诊断
            </p>
        </div>

        <div class="step-actions">
            <button class="btn-secondary" onclick="location.reload()">重新测评</button>
            <button class="btn-primary" onclick="nextStep()">继续上传舌苔</button>
        </div>
    `;
}

// 计算初步评分（仅基于问卷；与后端 calculate_constitution_scores 保持一致）
function calculatePreliminaryScores() {
    // 每个体质对应的问题索引（与后端 CONSTITUTION_QUESTIONS 对齐）
    const CONST_Q = {
        qixu:   [2, 3, 9, 16],
        yangxu: [0, 7],
        yinxu:  [1, 6, 10, 12],
        tanshi: [4, 9, 11, 13],
        shire:  [8, 11, 15],
        xueyu:  [5, 15],
        qiyu:   [13, 14],
        tebing: [17]
    };

    const scores = {};
    for (const [name, idxs] of Object.entries(CONST_Q)) {
        const valid = idxs.filter(i => i < userData.symptoms.length);
        const n = valid.length;
        if (n === 0) { scores[name] = 0; continue; }
        const raw = valid.reduce((s, i) => s + ((userData.symptoms[i] || 0) + 1), 0);
        const t = ((raw - n) / (n * 4)) * 100;
        scores[name] = Math.max(0, Math.min(100, t));
    }

    // 平和质
    const nTotal = userData.symptoms.length;
    const lowCount = userData.symptoms.filter(s => s <= 1).length;
    const avgBiased = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
    scores.pinghe = Math.max(0, Math.min(100,
        (lowCount / nTotal) * 60 + Math.max(0, 50 - avgBiased) * 0.8
    ));

    return scores;
}

function prevQuestion() {
    if (questionIndex > 0) {
        questionIndex--;
        showQuestion();
    }
}

// 地域选择（语音和点击通用）
function selectRegion(regionCode) {
    document.querySelectorAll('.region-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`.region-card[data-region="${regionCode}"]`);
    if (card) {
        card.classList.add('selected');
    }
    userData.region = regionCode;

    const region = regions[regionCode];
    document.getElementById('region-info').innerHTML = `
        <h3>${region.name}</h3>
        <p><strong>气候特征：</strong>${region.climate}</p>
        <p><strong>高发体质：</strong>${region.constitutions.join('、')}</p>
    `;
    document.getElementById('region-info').classList.remove('hidden');
    document.getElementById('btn-next-region').disabled = false;
}

// 地域选择
document.addEventListener('DOMContentLoaded', function() {
    // 初始化粒子效果
    if (window.particlesJS) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80 },
                color: { value: '#d4a574' },
                shape: { type: 'circle' },
                opacity: { value: 0.5 },
                size: { value: 3 },
                move: { enable: true, speed: 2 }
            }
        });
    }

    // 获取当前节气
    userData.solarTerm = getCurrentSolarTerm();
    const season = getSeasonByTerm(userData.solarTerm);
    userData.season = season;
    document.getElementById('current-season').textContent =
        `归属五季：${season.name}（${season.element} · ${season.organ}）`;

    // 地域选择点击
    document.querySelectorAll('.region-card').forEach(card => {
        card.onclick = function() {
            selectRegion(this.dataset.region);
        };
    });

    // 初始化舌苔上传
    initTongueUpload();

    // 初始化个人信息页的病史互斥逻辑
    initProfilePageLogic();
});

// 个人信息表单：勾"无"和勾其他病史互斥
function initProfilePageLogic() {
    const group = document.getElementById('history-checkbox-group');
    if (!group) return;
    group.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked && cb.dataset.exclusive) {
                group.querySelectorAll('input[type="checkbox"]').forEach(other => {
                    if (other !== cb) other.checked = false;
                });
            } else if (cb.checked) {
                group.querySelectorAll('input[data-exclusive="1"]').forEach(ex => {
                    ex.checked = false;
                });
            }
        });
    });
}

// 提交个人信息
function submitProfile() {
    const nickname = document.getElementById('profile-nickname').value.trim();
    const genderInput = document.querySelector('input[name="gender"]:checked');
    const gender = genderInput ? genderInput.value : '';
    const ageRaw = document.getElementById('profile-age').value;
    const age = parseInt(ageRaw, 10);
    const historyBoxes = document.querySelectorAll('#history-checkbox-group input[type="checkbox"]:checked');
    const history = Array.from(historyBoxes).map(c => c.value);
    const historyOther = document.getElementById('profile-history-other').value.trim();

    if (!gender) {
        alert('请选择性别');
        return;
    }
    if (!age || age < 1 || age > 120) {
        alert('请输入有效年龄（1-120）');
        document.getElementById('profile-age').focus();
        return;
    }
    if (history.length === 0 && !historyOther) {
        alert('请勾选基础病史，若无请勾"无"');
        return;
    }

    userData.profile = {
        nickname: nickname || `匿名用户_${Date.now().toString().slice(-6)}`,
        gender,
        age,
        history,
        historyOther
    };

    speak(`已记录，${userData.profile.nickname}，${gender}，${age}岁`);
    nextStep();
}

// 获取当前节气
function getCurrentSolarTerm() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const terms = [
        { name: '立春', m: 2, d: [3,5] }, { name: '雨水', m: 2, d: [18,20] },
        { name: '惊蛰', m: 3, d: [5,7] }, { name: '春分', m: 3, d: [20,22] },
        { name: '清明', m: 4, d: [4,6] }, { name: '谷雨', m: 4, d: [19,21] },
        { name: '立夏', m: 5, d: [5,7] }, { name: '小满', m: 5, d: [20,22] },
        { name: '芒种', m: 6, d: [5,7] }, { name: '夏至', m: 6, d: [21,22] },
        { name: '小暑', m: 7, d: [6,8] }, { name: '大暑', m: 7, d: [22,24] },
        { name: '立秋', m: 8, d: [7,9] }, { name: '处暑', m: 8, d: [22,24] },
        { name: '白露', m: 9, d: [7,9] }, { name: '秋分', m: 9, d: [22,24] },
        { name: '寒露', m: 10, d: [8,9] }, { name: '霜降', m: 10, d: [23,24] },
        { name: '立冬', m: 11, d: [7,8] }, { name: '小雪', m: 11, d: [22,23] },
        { name: '大雪', m: 12, d: [6,8] }, { name: '冬至', m: 12, d: [21,23] },
        { name: '小寒', m: 1, d: [5,7] }, { name: '大寒', m: 1, d: [20,21] }
    ];

    for (let term of terms) {
        if (month === term.m && day >= term.d[0] && day <= term.d[1]) {
            return term.name;
        }
    }
    return '春分';
}

// 节气到五季（五行·五脏）映射
// 春(木·肝) / 夏(火·心) / 长夏(土·脾) / 秋(金·肺) / 冬(水·肾)
// 长夏按"立秋前18天"的常见取法，对应大暑节气
function getSeasonByTerm(term) {
    const seasonMap = {
        '春': ['立春','雨水','惊蛰','春分','清明','谷雨'],
        '夏': ['立夏','小满','芒种','夏至','小暑'],
        '长夏': ['大暑'],
        '秋': ['立秋','处暑','白露','秋分','寒露','霜降'],
        '冬': ['立冬','小雪','大雪','冬至','小寒','大寒']
    };
    const attrs = {
        '春':   { element: '木', organ: '肝' },
        '夏':   { element: '火', organ: '心' },
        '长夏': { element: '土', organ: '脾' },
        '秋':   { element: '金', organ: '肺' },
        '冬':   { element: '水', organ: '肾' }
    };

    for (const [name, list] of Object.entries(seasonMap)) {
        if (list.includes(term)) {
            return { name, ...attrs[name] };
        }
    }
    return { name: '春', element: '木', organ: '肝' };
}

// 提交诊断
async function submitDiagnosis() {
    showStep('analyzing');

    // 模拟3秒分析
    setTimeout(async () => {
        try {
            const response = await fetch('/api/diagnose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile: userData.profile,
                    region: userData.region,
                    symptoms: userData.symptoms,
                    tongueData: userData.tongueData,
                    solarTerm: userData.solarTerm,
                    season: userData.season
                })
            });

            const result = await response.json();
            displayResult(result);
        } catch (error) {
            console.error('诊断失败:', error);
            alert('后端服务未启动，请先启动Flask服务器');
        }
    }, 3000);
}

// 显示结果
function displayResult(result) {
    showStep('result');

    // 显示体质
    document.getElementById('primary-const').textContent = result.constitution.primary;
    if (result.constitution.secondary) {
        document.getElementById('secondary-const').textContent = result.constitution.secondary;
    } else {
        document.getElementById('secondary-const-container').style.display = 'none';
    }

    // 绘制雷达图
    drawRadarChart(result.constitution.scores);

    // 显示养生建议
    document.getElementById('advice-content').innerHTML = `<p>${result.advice}</p>`;

    // 显示推荐药膳
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = result.recipes.map(r => {
        const faved = typeof isFavorited === 'function' && isFavorited(r.name);
        const safeName = r.name.replace(/'/g, "\\'");
        const tags = [r.region, r.season, r.constitution].filter(Boolean).map(t => `<span>${t}</span>`).join('');
        return `
        <div class="recipe-item">
            <button class="fav-btn ${faved ? 'favorited' : ''}" data-name="${r.name}"
                    onclick="toggleFavorite('${safeName}')">${faved ? '♥' : '♡'}</button>
            <h4>${r.name}</h4>
            ${tags ? `<p class="recipe-tags">${tags}</p>` : ''}
            <p><strong>详细做法：</strong>${r.method}</p>
        </div>
    `;
    }).join('');

    // 语音播报结果
    let resultText = `诊断完成。您的体质类型是${result.constitution.primary}`;
    if (result.constitution.secondary) {
        resultText += `，兼有${result.constitution.secondary}`;
    }
    resultText += `。养生建议：${result.advice}。推荐药膳：`;
    resultText += result.recipes.map(r => r.name).join('、');

    speak(resultText);
}

// 绘制雷达图（修复版）
function drawRadarChart(scores) {
    const canvas = document.getElementById('radar-chart');
    const ctx = canvas.getContext('2d');
    const centerX = 200, centerY = 200, radius = 140;

    ctx.clearRect(0, 0, 400, 400);

    const constKeys = Object.keys(constitutions);
    const angleStep = (Math.PI * 2) / constKeys.length;

    // 绘制背景网格
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        const r = radius * i / 5;
        for (let j = 0; j < constKeys.length; j++) {
            const angle = angleStep * j - Math.PI / 2;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // 绘制轴线
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    constKeys.forEach((key, i) => {
        const angle = angleStep * i - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
        ctx.stroke();
    });

    // 绘制标签
    ctx.fillStyle = '#333';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    constKeys.forEach((key, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const labelDist = radius + 35;
        const x = centerX + labelDist * Math.cos(angle);
        const y = centerY + labelDist * Math.sin(angle);

        const name = constitutions[key].name;
        const scoreValue = scores[name] || 0;

        // 绘制体质名称
        ctx.fillStyle = '#1a3a1a';
        ctx.fillText(name, x, y - 8);

        // 绘制分数
        ctx.fillStyle = '#d4a574';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(scoreValue.toFixed(0), x, y + 8);
        ctx.font = 'bold 13px sans-serif';
    });

    // 绘制数据区域
    ctx.beginPath();
    ctx.fillStyle = 'rgba(26, 58, 26, 0.25)';
    ctx.strokeStyle = '#1a3a1a';
    ctx.lineWidth = 2.5;

    constKeys.forEach((key, i) => {
        const name = constitutions[key].name;
        const score = scores[name] || 0;
        const angle = angleStep * i - Math.PI / 2;
        const r = radius * score / 100;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
