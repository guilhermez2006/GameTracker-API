const API_URL = 'http://localhost:3000';

// ── ESTADO LOCAL ──────────────────────────────────────────────
// Mantém os games em memória para filtrar sem nova requisição
const state = {
  games: [],
  activeFilter: 'ALL',
};

// ── HELPERS ──────────────────────────────────────────────────

const getToken = () => localStorage.getItem('token');

// Todas as chamadas à API passam por aqui — centraliza o header Authorization
const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // Token expirado ou inválido — redireciona para login
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  return res.json();
};

const showToast = (msg, type = '') => {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
};

// ── RENDERIZAÇÃO ──────────────────────────────────────────────

const STATUS_LABELS = {
  PLAYING: 'Jogando',
  COMPLETED: 'Zerado',
  DROPPED: 'Dropado',
  BACKLOG: 'Backlog',
  PAUSED: 'Pausado',
};

const renderCard = (game) => `
  <div class="game-card" data-status="${game.status}" data-id="${game._id || game.id}">
    <div class="card-body">
      <div class="card-title" title="${game.title}">${game.title}</div>
      <div class="card-meta">
        ${game.platform ? `<span class="tag">${game.platform}</span>` : ''}
        ${game.genre ? `<span class="tag">${game.genre}</span>` : ''}
      </div>
    </div>
    <div class="card-footer">
      <span class="status-badge ${game.status}">${STATUS_LABELS[game.status] || game.status}</span>
      <div class="card-rating">
        ${game.rating ? `<span>★</span> ${game.rating}/10` : '—'}
      </div>
      <div class="card-actions">
        <button class="btn-icon edit" onclick="openEditModal('${game._id || game.id}')">✎</button>
        <button class="btn-icon" onclick="deleteGame('${game._id || game.id}')">✕</button>
      </div>
    </div>
  </div>
`;

const renderGrid = (games) => {
  const grid = document.getElementById('games-grid');
  if (!games.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🕹️</div>
        <p>Nenhum game encontrado.</p>
      </div>`;
    return;
  }
  grid.innerHTML = games.map(renderCard).join('');
};

const updateStats = () => {
  document.getElementById('stat-total').textContent = state.games.length;
  document.getElementById('stat-playing').textContent =
    state.games.filter(g => g.status === 'PLAYING').length;
  document.getElementById('stat-completed').textContent =
    state.games.filter(g => g.status === 'COMPLETED').length;
};

// Aplica filtro de status + busca por texto sobre os dados em memória
const applyFilters = () => {
  const query = document.getElementById('search-input').value.toLowerCase();
  const filtered = state.games.filter(g => {
    const matchStatus = state.activeFilter === 'ALL' || g.status === state.activeFilter;
    const matchSearch = g.title.toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });
  renderGrid(filtered);
};

// ── API CALLS ─────────────────────────────────────────────────

const loadGames = async () => {
  const data = await apiFetch('/jogos');
  if (!data) return;
  state.games = Array.isArray(data) ? data : [];
  updateStats();
  applyFilters();
};

const saveGame = async (payload, id = null) => {
  const method = id ? 'PUT' : 'POST';
  const path = id ? `/jogos/${id}` : '/jogos';
  const data = await apiFetch(path, { method, body: JSON.stringify(payload) });
  if (data) {
    showToast(id ? 'Game atualizado!' : 'Game adicionado!', 'success');
    closeModal();
    await loadGames();
  }
};

window.deleteGame = async (id) => {
  if (!confirm('Remover esse game do backlog?')) return;
  await apiFetch(`/jogos/${id}`, { method: 'DELETE' });
  showToast('Game removido.', 'success');
  await loadGames();
};

// ── MODAL ─────────────────────────────────────────────────────

const openModal = () => {
  document.getElementById('modal-overlay').classList.add('active');
};

const closeModal = () => {
  document.getElementById('modal-overlay').classList.remove('active');
  document.getElementById('game-form').reset();
  document.getElementById('game-id').value = '';
  document.getElementById('modal-title').textContent = 'NOVO GAME';
};

window.openEditModal = async (id) => {
  const game = state.games.find(g => (g._id || g.id) === id);
  if (!game) return;

  document.getElementById('game-id').value = id;
  document.getElementById('input-title').value = game.title;
  document.getElementById('input-platform').value = game.platform || '';
  document.getElementById('input-genre').value = game.genre || '';
  document.getElementById('input-status').value = game.status;
  document.getElementById('input-rating').value = game.rating || '';
  document.getElementById('modal-title').textContent = 'EDITAR GAME';
  openModal();
};

// ── EVENTOS ──────────────────────────────────────────────────

document.getElementById('btn-add').addEventListener('click', openModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

document.getElementById('game-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('game-id').value;
  const payload = {
    title: document.getElementById('input-title').value,
    platform: document.getElementById('input-platform').value,
    genre: document.getElementById('input-genre').value,
    status: document.getElementById('input-status').value,
    rating: document.getElementById('input-rating').value
      ? Number(document.getElementById('input-rating').value)
      : null,
  };
  await saveGame(payload, id || null);
});

// Filtros de status
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

document.getElementById('search-input').addEventListener('input', applyFilters);

document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// ── INIT ──────────────────────────────────────────────────────

// Redireciona para login se não tiver token
if (!getToken()) {
  window.location.href = 'login.html';
} else {
  loadGames();
}