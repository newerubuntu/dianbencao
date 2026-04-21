// 步骤控制器
let currentStep = 0;
const steps = ['welcome', 'profile', 'region', 'questionnaire', 'tongue', 'analyzing', 'result'];

// 用户数据
let userData = {
    profile: null,
    region: null,
    symptoms: [],
    tongueData: null,
    solarTerm: null
};

// 开始诊断
function startDiagnosis() {
    document.getElementById('disclaimer-modal').classList.remove('hidden');

    // 播报免责声明
    const disclaimerText = '问卷填写须知与免责声明。请如实填写您的信息。本问卷加舌诊仅用于中医体质初步辨识，为您匹配个性化药膳方案，不构成任何疾病诊断、治疗建议。药膳为日常食养调理，如有身体不适，请务必前往正规医院就诊。说"同意"继续。';
    setTimeout(() => speak(disclaimerText), 500);
}

// 同意免责声明
function acceptDisclaimer() {
    document.getElementById('disclaimer-modal').classList.add('hidden');
    currentStep = 1;
    showStep('profile');
    document.getElementById('progress-bar').classList.remove('hidden');
    updateProgress();
}

// 显示指定步骤
function showStep(stepName) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step-${stepName}`).classList.add('active');

    // 语音播报
    const messages = {
        'welcome': '欢迎使用滇南本草五季智膳系统，点击开始智能诊断按钮开始体质测评',
        'profile': '请填写您的个人信息：昵称、性别、年龄和基础病史',
        'region': '请选择您所在的地域。滇中、滇东北、滇东南、滇南、滇西、滇西北',
        'questionnaire': '现在开始问卷测评，请根据您的实际情况回答问题',
        'tongue': '请上传您的舌苔照片',
        'analyzing': '正在分析您的体质，请稍候',
        'result': '诊断完成',
        'favorites': '我的药膳收藏页，您可以浏览全部药膳并收藏喜欢的',
        'herbs': '滇南本草特色药材库，介绍云南特色药材的功效和用法'
    };

    if (messages[stepName]) {
        setTimeout(() => {
            if (stepName === 'questionnaire' && typeof showQuestion === 'function') {
                speak(messages[stepName], () => showQuestion());
            } else {
                speak(messages[stepName]);
            }
        }, 300);
    }
}

// 更新进度条
function updateProgress() {
    const progress = ((currentStep - 1) / 4) * 100;
    document.querySelector('.progress-fill').style.width = progress + '%';
    document.getElementById('current-step').textContent = currentStep;
}

// 下一步
function nextStep() {
    const active = steps[currentStep];
    if (active === 'profile') {
        currentStep = 2;
        showStep('region');
    } else if (active === 'region') {
        currentStep = 3;
        showStep('questionnaire');
        initQuestionnaire();
    } else if (active === 'questionnaire') {
        currentStep = 4;
        showStep('tongue');
    }
    updateProgress();
}

// 上一步
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(steps[currentStep]);
        updateProgress();
    }
}

// 重新开始
function restart() {
    currentStep = 0;
    userData = { region: null, symptoms: [], tongueData: null, solarTerm: null };
    questionIndex = 0;

    // 重新加载页面，确保完全重置
    location.reload();
}

// 下载报告
function downloadReport() {
    alert('PDF报告生成功能开发中...\n\n您可以截图保存当前诊断结果。');
}
