// 语音控制模块
let voiceEnabled = true;
let recognition = null;
let synthesis = window.speechSynthesis;
let isListening = false;

// 初始化语音识别
function initVoice() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
    }
}

// 语音播报
function speak(text, callback) {
    if (!voiceEnabled || !text) return;

    synthesis.cancel();

    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        const voices = synthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh'));
        if (zhVoice) utterance.voice = zhVoice;

        if (callback) utterance.onend = callback;

        synthesis.speak(utterance);
    }, 100);
}

// 开始语音识别
function startListening(callback) {
    if (!recognition) {
        alert('您的浏览器不支持语音识别，请使用Chrome或Edge浏览器');
        return;
    }

    if (isListening) return;

    recognition.onstart = () => {
        isListening = true;
        updateMicButton(true);
        console.log('开始识别...');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('识别结果:', transcript);
        isListening = false;
        updateMicButton(false);
        callback(transcript);
    };

    recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        isListening = false;
        updateMicButton(false);
        if (event.error === 'no-speech') {
            speak('未检测到语音，请重试');
        }
    };

    recognition.onend = () => {
        isListening = false;
        updateMicButton(false);
    };

    try {
        recognition.start();
    } catch (e) {
        console.error('启动识别失败:', e);
        isListening = false;
        updateMicButton(false);
    }
}

// 停止语音识别
function stopListening() {
    if (recognition && isListening) {
        recognition.stop();
        isListening = false;
        updateMicButton(false);
    }
}

// 切换语音播报
function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    const btn = document.getElementById('voice-toggle');
    btn.textContent = voiceEnabled ? '🔊' : '🔇';
    btn.title = voiceEnabled ? '关闭语音播报' : '开启语音播报';

    if (voiceEnabled) {
        speak('语音播报已开启');
    } else {
        synthesis.cancel();
    }
}

// 更新麦克风按钮状态
function updateMicButton(listening) {
    const btn = document.getElementById('mic-button');
    if (listening) {
        btn.classList.add('listening');
    } else {
        btn.classList.remove('listening');
    }
}

// 切换麦克风
function toggleMic() {
    if (isListening) {
        stopListening();
        return;
    }

    const activeStep = document.querySelector('.step.active');
    if (!activeStep) return;

    const stepId = activeStep.id;

    if (stepId === 'step-region') {
        speak('请说出地域名称');
        setTimeout(() => {
            startListening((text) => {
                const regionMap = {
                    '滇中': 'dianzhong', '滇东北': 'diandongbei',
                    '滇东南': 'diandongnan', '滇南': 'diannan',
                    '滇西': 'dianxi', '滇西北': 'dianxibei'
                };
                for (let [name, code] of Object.entries(regionMap)) {
                    if (text.includes(name)) {
                        selectRegion(code);
                        speak(`已选择${name}`);
                        return;
                    }
                }
                speak('未识别到地域');
            });
        }, 1000);
    } else if (stepId === 'step-questionnaire') {
        speak('请说出选项');
        setTimeout(() => {
            startListening((text) => {
                const optionMap = {
                    '没有': 0, '根本不': 0, '第一': 0,
                    '很少': 1, '有一点': 1, '第二': 1,
                    '有时': 2, '有些': 2, '第三': 2,
                    '经常': 3, '相当': 3, '第四': 3,
                    '总是': 4, '非常': 4, '第五': 4
                };
                for (let [keyword, index] of Object.entries(optionMap)) {
                    if (text.includes(keyword)) {
                        selectOption(index);
                        return;
                    }
                }
                speak('未识别到选项');
            });
        }, 1000);
    } else {
        startListening((text) => {
            if (text.includes('同意') || text.includes('开始')) {
                const modal = document.getElementById('disclaimer-modal');
                if (modal && !modal.classList.contains('hidden')) {
                    acceptDisclaimer();
                } else {
                    startDiagnosis();
                }
            }
        });
    }
}

// 初始化
initVoice();
