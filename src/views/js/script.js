const API_URL = 'http://localhost:3000';

// ── ESTADO ───────────────────────────────────────────────────
const state = {
  games: [],
  filter: 'ALL',
};

const getToken = () => localStorage.getItem('token');

// Centraliza todas as chamadas à API com o token JWT
const apiFetch = async (path, options = {}) => {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
        ...options.headers,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return null;
    }

    return res.json();
  } catch {
    showToast('Erro ao conectar com o servidor.', 'error');
    return null;
  }
};

// ── INTEGRAÇÃO DE API DE IMAGENS ─────────────────────────────
// Quando tiver a chave da API (RAWG, IGDB etc), implemente aqui.
// A função recebe o título e deve retornar a URL da capa.
const fetchGameCover = async (title) => {
  // RAWG (rawg.io) — descomenta quando tiver a chave:
  // const key = 'SUA_CHAVE_AQUI';
  // const res = await fetch(`https://api.rawg.io/api/games?key=${key}&search=${encodeURIComponent(title)}&page_size=1`);
  // const data = await res.json();
  // return data.results?.[0]?.background_image || null;

  return null; // Retorna null enquanto sem API
};

// ── HELPERS ──────────────────────────────────────────────────
const showToast = (msg, type = '') => {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 3000);
};

const STATUS_LABELS = {
  PLAYING: 'Jogando',
  COMPLETED: 'Zerado',
  DROPPED: 'Dropado',
  BACKLOG: 'Backlog',
  PAUSED: 'Pausado',
};

// ── RENDERIZAÇÃO ──────────────────────────────────────────────
const renderCover = (game) => {
  const cover = game.cover || game.coverUrl || null;

  if (cover) {
    return `<img src="${cover}" alt="${game.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-cover-placeholder\\'><span class=\\'placeholder-icon\\'>🎮</span><span class=\\'placeholder-title\\'>${game.title}</span></div>'" />`;
  }

  return `
    <div class="card-cover-placeholder">
      <span class="placeholder-icon">🎮</span>
      <span class="placeholder-title">${game.title}</span>
    </div>`;
};

const renderCard = (game) => {
  const id = game._id || game.id;
  const rating = game.rating ? `★ ${game.rating}` : '';

  return `
    <div class="game-card" data-status="${game.status}" data-id="${id}">
      <div class="card-cover">
        ${renderCover(game)}
        <span class="status-dot ${game.status}"></span>
        <div class="card-actions">
          <button class="btn-action edit" onclick="openEdit('${id}')">✎</button>
          <button class="btn-action delete" onclick="removeGame('${id}')">✕</button>
        </div>
      </div>
      <div class="card-info">
        <div class="card-title" title="${game.title}">${game.title}</div>
        <div class="card-meta">
          <span class="card-platform">${game.platform || '—'}</span>
          ${rating ? `<span class="card-rating">${rating}</span>` : ''}
        </div>
      </div>
    </div>`;
};

const updateCounts = () => {
  const all = state.games;
  document.getElementById('count-all').textContent = all.length;
  document.getElementById('count-playing').textContent = all.filter(g => g.status === 'PLAYING').length;
  document.getElementById('count-completed').textContent = all.filter(g => g.status === 'COMPLETED').length;
  document.getElementById('count-backlog').textContent = all.filter(g => g.status === 'BACKLOG').length;
  document.getElementById('count-paused').textContent = all.filter(g => g.status === 'PAUSED').length;
  document.getElementById('count-dropped').textContent = all.filter(g => g.status === 'DROPPED').length;
};

const renderGrid = () => {
  const query = document.getElementById('search-input').value.toLowerCase();
  const filtered = state.games.filter(g => {
    const matchFilter = state.filter === 'ALL' || g.status === state.filter;
    const matchSearch = g.title.toLowerCase().includes(query);
    return matchFilter && matchSearch;
  });

  const grid = document.getElementById('games-grid');

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🕹️</div>
        <p>Nenhum jogo encontrado.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(renderCard).join('');
};

// ── API CALLS ─────────────────────────────────────────────────
const loadGames = async () => {
  const data = await apiFetch('/games');
  if (!data) return;
  state.games = Array.isArray(data) ? data : [];
  updateCounts();
  renderGrid();
};

const saveGame = async (payload, id = null) => {
  // Tenta buscar capa via API se não tiver uma URL fornecida
  if (!payload.cover && payload.title) {
    payload.cover = await fetchGameCover(payload.title);
  }

  const method = id ? 'PUT' : 'POST';
  const path = id ? `/games/${id}` : '/games';
  const data = await apiFetch(path, { method, body: JSON.stringify(payload) });

  if (data) {
    showToast(id ? 'Jogo atualizado!' : 'Jogo adicionado!', 'success');
    closeModal();
    await loadGames();
  }
};

window.removeGame = async (id) => {
  if (!confirm('Remover esse jogo do backlog?')) return;
  await apiFetch(`/games/${id}`, { method: 'DELETE' });
  showToast('Jogo removido.', 'success');
  state.games = state.games.filter(g => (g._id || g.id) !== id);
  updateCounts();
  renderGrid();
};

// ── MODAL ─────────────────────────────────────────────────────
const openModal = () => document.getElementById('modal-overlay').classList.add('active');

const closeModal = () => {
  document.getElementById('modal-overlay').classList.remove('active');
  document.getElementById('game-form').reset();
  document.getElementById('game-id').value = '';
  document.getElementById('modal-title').textContent = 'Novo Jogo';
};

window.openEdit = (id) => {
  const game = state.games.find(g => (g._id || g.id) === id);
  if (!game) return;

  document.getElementById('game-id').value = id;
  document.getElementById('input-title').value = game.title;
  document.getElementById('input-platform').value = game.platform || '';
  document.getElementById('input-genre').value = game.genre || '';
  document.getElementById('input-status').value = game.status;
  document.getElementById('input-rating').value = game.rating || '';
  document.getElementById('input-cover').value = game.cover || game.coverUrl || '';
  document.getElementById('modal-title').textContent = 'Editar Jogo';
  openModal();
};

// ── EVENTOS ──────────────────────────────────────────────────
document.getElementById('btn-add').addEventListener('click', openModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

document.getElementById('game-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('game-form').querySelector('.btn-submit');
  btn.disabled = true;
  btn.textContent = 'SALVANDO...';

  const id = document.getElementById('game-id').value;
  await saveGame({
    title: document.getElementById('input-title').value,
    platform: document.getElementById('input-platform').value,
    genre: document.getElementById('input-genre').value,
    status: document.getElementById('input-status').value,
    rating: document.getElementById('input-rating').value ? Number(document.getElementById('input-rating').value) : null,
    cover: document.getElementById('input-cover').value || null,
  }, id || null);

  btn.disabled = false;
  btn.textContent = 'SALVAR JOGO';
});

// Sidebar — filtros
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.filter = btn.dataset.filter;

    const labels = { ALL: 'Todos os Jogos', PLAYING: 'Jogando', COMPLETED: 'Zerados', BACKLOG: 'Backlog', PAUSED: 'Pausados', DROPPED: 'Dropados' };
    document.getElementById('page-title').textContent = labels[state.filter] || 'Jogos';

    renderGrid();
  });
});

document.getElementById('search-input').addEventListener('input', renderGrid);

document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// ── INIT ──────────────────────────────────────────────────────
if (!getToken()) {
  window.location.href = 'login.html';
} else {
  loadGames();
}