// 滇南本草特色药材库
window._allHerbs = null;
let _herbsLoaded = false;

async function loadAllHerbs() {
    if (_herbsLoaded) return window._allHerbs;
    try {
        const resp = await fetch('/api/herbs');
        window._allHerbs = await resp.json();
        _herbsLoaded = true;
    } catch (e) {
        console.error('加载药材失败:', e);
        alert('无法加载药材数据，请确认后端服务已启动');
        window._allHerbs = [];
    }
    return window._allHerbs;
}

function initHerbsToolbar() {
    const search = document.getElementById('herb-search');
    if (search && !search.dataset.bound) {
        search.addEventListener('input', renderAllHerbs);
        search.dataset.bound = '1';
    }
}

function renderAllHerbs() {
    const grid = document.getElementById('all-herbs-grid');
    if (!grid || !window._allHerbs) return;

    const q = (document.getElementById('herb-search')?.value || '').trim().toLowerCase();

    const filtered = window._allHerbs.filter(h => {
        if (!q) return true;
        const hay = `${h.name} ${h.alias} ${h.effect} ${h.caution} ${h.area}`.toLowerCase();
        return hay.includes(q);
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-hint">没有找到符合条件的药材</div>';
        return;
    }

    grid.innerHTML = filtered.map(h => `
        <div class="herb-item">
            <h4>${h.name}</h4>
            <p class="herb-meta">
                <span class="herb-tag">俗名：${h.alias || '—'}</span>
                <span class="herb-tag">产区：${h.area || '—'}</span>
            </p>
            <p class="herb-effect"><strong>核心功效：</strong>${h.effect || '—'}</p>
            <p><strong>安全用量：</strong>${h.dosage || '—'}</p>
            <p class="herb-caution"><strong>食用与孕妇禁忌：</strong>${h.caution || '—'}</p>
        </div>
    `).join('');
}

async function openHerbsPage() {
    if (typeof showStep === 'function') showStep('herbs');
    const pb = document.getElementById('progress-bar');
    if (pb) pb.classList.add('hidden');

    initHerbsToolbar();
    if (!_herbsLoaded) {
        const grid = document.getElementById('all-herbs-grid');
        if (grid) grid.innerHTML = '<div class="empty-hint">加载中...</div>';
        await loadAllHerbs();
    }
    renderAllHerbs();
}
