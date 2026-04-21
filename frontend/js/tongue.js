// 舌苔图片分析模块

// 初始化上传功能
function initTongueUpload() {
    const uploadArea = document.getElementById('upload-area');
    const input = document.getElementById('tongue-input');

    uploadArea.onclick = () => input.click();

    // 拖拽上传
    uploadArea.ondragover = (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--secondary)';
    };

    uploadArea.ondragleave = () => {
        uploadArea.style.borderColor = 'var(--primary)';
    };

    uploadArea.ondrop = (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    };

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    };
}

// 处理图片上传
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const preview = document.getElementById('tongue-preview');
            preview.src = e.target.result;

            document.getElementById('upload-area').style.display = 'none';
            document.getElementById('preview-container').classList.remove('hidden');

            // 分析舌苔
            analyzeTongueImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 重新上传
function reupload() {
    document.getElementById('upload-area').style.display = 'block';
    document.getElementById('preview-container').classList.add('hidden');
    document.getElementById('tongue-analysis').classList.add('hidden');
    document.getElementById('btn-submit').disabled = true;
    document.getElementById('tongue-input').value = '';
}

// 分析舌苔图片（增强版 - 多区域采样）
function analyzeTongueImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = 500;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 多区域采样（中心、上、下、左、右）
    const samples = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const sampleSize = Math.min(canvas.width, canvas.height) * 0.15;

    // 采样5个区域
    const positions = [
        {x: centerX, y: centerY},           // 中心
        {x: centerX, y: centerY - sampleSize}, // 上
        {x: centerX, y: centerY + sampleSize}, // 下
        {x: centerX - sampleSize, y: centerY}, // 左
        {x: centerX + sampleSize, y: centerY}  // 右
    ];

    positions.forEach(pos => {
        const data = ctx.getImageData(pos.x - sampleSize/2, pos.y - sampleSize/2, sampleSize, sampleSize);
        samples.push(extractDominantColor(data.data));
    });

    // 综合分析
    const avgColor = averageColors(samples);
    const tongueColor = classifyTongueColor(avgColor, samples);
    const coatingColor = classifyCoatingColor(avgColor, samples);

    // 新增自动特征识别
    const hasCracks = detectCracks(ctx, canvas.width, canvas.height);
    const moisture = detectMoisture(ctx, canvas.width, canvas.height);

    document.getElementById('tongue-color').textContent = tongueColor;
    document.getElementById('coating-color').textContent = coatingColor;

    // 自动识别结果显示
    const crackHint = document.getElementById('tongue-cracks-auto');
    if (crackHint) crackHint.textContent = hasCracks ? '检出裂纹' : '未见明显裂纹';
    const moistHint = document.getElementById('tongue-moisture-auto');
    if (moistHint) moistHint.textContent =
        moisture === 'moist' ? '偏润/水滑' : moisture === 'dry' ? '偏燥/少津' : '正常';

    // 自动项初始同步到手动控件
    const cbCracks = document.getElementById('manual-cracks');
    if (cbCracks) cbCracks.checked = hasCracks;
    const moistRadio = document.querySelector(`input[name="tongue-moisture"][value="${moisture}"]`);
    if (moistRadio) moistRadio.checked = true;
    const cbTeeth = document.getElementById('manual-teeth');
    if (cbTeeth) cbTeeth.checked = false;
    const shapeRadio = document.querySelector('input[name="tongue-shape"][value="normal"]');
    if (shapeRadio) shapeRadio.checked = true;

    document.getElementById('tongue-analysis').classList.remove('hidden');

    userData.tongueData = {
        tongueColor,
        coatingColor,
        hasCracks,
        moisture,
        hasTeethMarks: false,
        tongueShape: 'normal'
    };

    bindManualTongueControls();
    document.getElementById('btn-submit').disabled = false;
}

// 绑定手动勾选/单选到 userData.tongueData
function bindManualTongueControls() {
    const sync = (id, key, isCheckbox) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.bound) return;
        el.addEventListener('change', () => {
            if (!userData.tongueData) return;
            userData.tongueData[key] = isCheckbox ? el.checked : el.value;
        });
        el.dataset.bound = '1';
    };
    sync('manual-cracks', 'hasCracks', true);
    sync('manual-teeth', 'hasTeethMarks', true);

    document.querySelectorAll('input[name="tongue-moisture"]').forEach(r => {
        if (r.dataset.bound) return;
        r.addEventListener('change', () => {
            if (userData.tongueData && r.checked) userData.tongueData.moisture = r.value;
        });
        r.dataset.bound = '1';
    });
    document.querySelectorAll('input[name="tongue-shape"]').forEach(r => {
        if (r.dataset.bound) return;
        r.addEventListener('change', () => {
            if (userData.tongueData && r.checked) userData.tongueData.tongueShape = r.value;
        });
        r.dataset.bound = '1';
    });
}

// 裂纹检测：舌面中心区域，统计"明显低于邻域均值且绝对偏暗"的像素密度
function detectCracks(ctx, w, h) {
    const size = Math.floor(Math.min(w, h) * 0.5);
    const left = Math.floor(w / 2 - size / 2);
    const top = Math.floor(h / 2 - size / 2);
    const img = ctx.getImageData(left, top, size, size);
    const data = img.data;

    // 灰度
    const gray = new Float32Array(size * size);
    for (let i = 0; i < gray.length; i++) {
        gray[i] = 0.299 * data[i*4] + 0.587 * data[i*4+1] + 0.114 * data[i*4+2];
    }

    let darkCount = 0, total = 0;
    for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
            const idx = y * size + x;
            const self = gray[idx];
            let sum = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    sum += gray[(y+dy) * size + (x+dx)];
                }
            }
            const avg = sum / 9;
            // 当前显著低于 3x3 邻域均值且绝对偏暗 → 疑似裂纹线
            if (self < avg * 0.85 && self < 150) darkCount++;
            total++;
        }
    }
    return (darkCount / total) > 0.04;
}

// 润燥检测：中心大区域的高光像素比例
function detectMoisture(ctx, w, h) {
    const size = Math.floor(Math.min(w, h) * 0.6);
    const left = Math.floor(w / 2 - size / 2);
    const top = Math.floor(h / 2 - size / 2);
    const img = ctx.getImageData(left, top, size, size);
    const data = img.data;

    let highlight = 0, total = 0;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const v = max / 255;
        const s = max === 0 ? 0 : (max - min) / max;
        if (v > 0.92 && s < 0.15) highlight++;
        total++;
    }
    const ratio = highlight / total;
    if (ratio > 0.08) return 'moist';
    if (ratio < 0.015) return 'dry';
    return 'normal';
}

// 提取主色调（改进版）
function extractDominantColor(data) {
    let r = 0, g = 0, b = 0, count = 0;

    // 跳过过暗和过亮的像素（可能是阴影或高光）
    for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > 30 && brightness < 240) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }
    }

    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

// 计算多个颜色样本的平均值
function averageColors(samples) {
    let r = 0, g = 0, b = 0;
    samples.forEach(s => {
        r += s.r;
        g += s.g;
        b += s.b;
    });
    return {
        r: Math.round(r / samples.length),
        g: Math.round(g / samples.length),
        b: Math.round(b / samples.length)
    };
}

// 判断舌色（增强版 - 基于HSV色彩空间）
function classifyTongueColor(avgColor, samples) {
    const { r, g, b } = avgColor;
    const hsv = rgbToHsv(r, g, b);
    const brightness = (r + g + b) / 3;
    const redness = r - (g + b) / 2;

    // 淡白舌：极高亮度 + 极低饱和度（气血两虚、阳虚）
    if (brightness > 200 && hsv.s < 0.1) {
        return '淡白舌（气血两虚）';
    }

    // 白舌：高亮度 + 低饱和度（气虚、血虚）
    if (brightness > 170 && hsv.s < 0.2) {
        return '白舌（气虚血虚）';
    }

    // 绛舌：深红色（热入营血、阴虚火旺）
    if (r > 180 && redness > 60 && brightness < 150) {
        return '绛舌（热入营血）';
    }

    // 红舌：鲜红色（热证、阴虚）
    if (r > 160 && redness > 40 && hsv.s > 0.3 && brightness > 100) {
        return '红舌（热证）';
    }

    // 紫舌：紫色调（血瘀、寒凝）
    if ((hsv.h > 280 || hsv.h < 20) && b > 100) {
        return '紫舌（血瘀寒凝）';
    }

    // 青紫舌：青紫色（寒凝血瘀、气血瘀滞）
    if (b > r && hsv.h > 200 && hsv.h < 280) {
        return '青紫舌（寒凝血瘀）';
    }

    // 暗红舌：暗红色（血瘀）
    if (brightness < 100 && redness > 20) {
        return '暗红舌（血瘀）';
    }

    // 淡红舌：正常舌色
    return '淡红舌（正常）';
}

// 判断苔色（增强版 - 更多分类）
function classifyCoatingColor(avgColor, samples) {
    const { r, g, b } = avgColor;
    const hsv = rgbToHsv(r, g, b);
    const brightness = (r + g + b) / 3;

    // 黑苔：极暗（热极、寒极）
    if (brightness < 50) {
        return '黑苔（热极或寒极）';
    }

    // 灰苔：暗灰色（里证、寒湿）
    if (brightness >= 50 && brightness < 90 && hsv.s < 0.2) {
        return '灰苔（里证寒湿）';
    }

    // 黄褐苔：深黄褐色（湿热、食积）
    if (hsv.h >= 30 && hsv.h <= 50 && brightness < 120) {
        return '黄褐苔（湿热食积）';
    }

    // 黄苔：黄色（热证、湿热）
    if (hsv.h >= 40 && hsv.h <= 70 && hsv.s > 0.25) {
        return '黄苔（热证湿热）';
    }

    // 白厚腻苔：高饱和 + 中等亮度（痰湿、湿浊）
    if (hsv.s > 0.35 && brightness > 100 && brightness < 160) {
        return '白厚腻苔（痰湿）';
    }

    // 白厚苔：亮度中等 + 低饱和（寒湿、痰饮）
    if (brightness > 130 && brightness < 180 && hsv.s < 0.25) {
        return '白厚苔（寒湿）';
    }

    // 薄白苔：正常或表证
    if (brightness > 180 && hsv.s < 0.2) {
        return '薄白苔（正常）';
    }

    // 少苔/无苔：极高亮度（阴虚、气血两虚）
    if (brightness > 210) {
        return '少苔（阴虚）';
    }

    // 默认白苔
    return '白苔（正常/寒证）';
}

// RGB转HSV
function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0, s = 0, v = max;

    if (delta !== 0) {
        s = delta / max;
        if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / delta + 2) / 6;
        else h = ((r - g) / delta + 4) / 6;
    }

    return { h: h * 360, s: s, v: v };
}

