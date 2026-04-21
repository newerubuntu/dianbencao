// 我的药膳收藏
const FAV_KEY = 'favoritedRecipes';
const SEASONS = ['春季', '夏季', '长夏', '秋季', '冬季'];
const REGIONS = ['滇中', '滇东北', '滇东南', '滇南', '滇西', '滇西北'];

window._allRecipes = null;
let _recipesLoaded = false;

function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
    } catch (e) {
        return [];
    }
}

function setFavorites(arr) {
    localStorage.setItem(FAV_KEY, JSON.stringify(arr));
}

function isFavorited(name) {
    return getFavorites().includes(name);
}

function toggleFavorite(name) {
    const favs = getFavorites();
    const idx = favs.indexOf(name);
    if (idx >= 0) {
        favs.splice(idx, 1);
    } else {
        favs.push(name);
    }
    setFavorites(favs);
    refreshFavoriteIcons(name);
    if (typeof speak === 'function') {
        speak(idx >= 0 ? `已取消收藏${name}` : `已收藏${name}`);
    }
}

function refreshFavoriteIcons(name) {
    const favored = isFavorited(name);
    document.querySelectorAll(`.fav-btn[data-name="${CSS.escape(name)}"]`).forEach(btn => {
        btn.classList.toggle('favorited', favored);
        btn.textContent = favored ? '♥' : '♡';
    });
    const onlyFav = document.getElementById('filter-only-favorited');
    if (onlyFav && onlyFav.checked) {
        renderAllRecipes();
    }
}

async function loadAllRecipes() {
    if (_recipesLoaded) return window._allRecipes;
    try {
        const resp = await fetch('/api/recipes');
        window._allRecipes = await resp.json();
        _recipesLoaded = true;
    } catch (e) {
        console.error('加载药膳失败:', e);
        alert('无法加载药膳数据，请确认后端服务已启动');
        window._allRecipes = [];
    }
    return window._allRecipes;
}

function initFavoritesToolbar() {
    const seasonSel = document.getElementById('filter-solar-term');
    const regionSel = document.getElementById('filter-region');

    if (seasonSel && !seasonSel.dataset.init) {
        seasonSel.innerHTML = '<option value="">全部五季</option>' +
            SEASONS.map(s => `<option value="${s}">${s}</option>`).join('');
        seasonSel.dataset.init = '1';
    }
    if (regionSel && !regionSel.dataset.init) {
        regionSel.innerHTML = '<option value="">全部地域</option>' +
            REGIONS.map(r => `<option value="${r}">${r}</option>`).join('');
        regionSel.dataset.init = '1';
    }

    ['recipe-search', 'filter-solar-term', 'filter-region', 'filter-only-favorited'].forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.dataset.bound) {
            const evt = el.tagName === 'INPUT' && el.type !== 'checkbox' ? 'input' : 'change';
            el.addEventListener(evt, renderAllRecipes);
            el.dataset.bound = '1';
        }
    });
}

function renderAllRecipes() {
    const grid = document.getElementById('all-recipes-grid');
    if (!grid || !window._allRecipes) return;

    const q = (document.getElementById('recipe-search')?.value || '').trim().toLowerCase();
    const season = document.getElementById('filter-solar-term')?.value || '';
    const region = document.getElementById('filter-region')?.value || '';
    const onlyFav = document.getElementById('filter-only-favorited')?.checked;
    const favs = getFavorites();

    const filtered = window._allRecipes.filter(r => {
        if (season && r.season !== season) return false;
        if (region && r.region !== region) return false;
        if (onlyFav && !favs.includes(r.name)) return false;
        if (q) {
            const hay = `${r.name} ${r.constitution} ${r.method}`.toLowerCase();
            if (!hay.includes(q)) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-hint">没有找到符合条件的药膳</div>';
        return;
    }

    grid.innerHTML = filtered.map(r => {
        const faved = favs.includes(r.name);
        const safeName = r.name.replace(/'/g, "\\'");
        return `
            <div class="recipe-item">
                <button class="fav-btn ${faved ? 'favorited' : ''}" data-name="${r.name}"
                        onclick="toggleFavorite('${safeName}')">${faved ? '♥' : '♡'}</button>
                <h4>${r.name}</h4>
                <p class="recipe-tags"><span>${r.region}</span><span>${r.season}</span><span>${r.constitution}</span></p>
                <p><strong>详细做法：</strong>${r.method}</p>
            </div>
        `;
    }).join('');
}

async function openFavoritesPage() {
    if (typeof showStep === 'function') showStep('favorites');
    const pb = document.getElementById('progress-bar');
    if (pb) pb.classList.add('hidden');

    initFavoritesToolbar();
    if (!_recipesLoaded) {
        const grid = document.getElementById('all-recipes-grid');
        if (grid) grid.innerHTML = '<div class="empty-hint">加载中...</div>';
        await loadAllRecipes();
    }
    renderAllRecipes();
}

function backToWelcome() {
    if (typeof showStep === 'function') showStep('welcome');
    const pb = document.getElementById('progress-bar');
    if (pb) pb.classList.add('hidden');
    if (typeof currentStep !== 'undefined') currentStep = 0;
}
