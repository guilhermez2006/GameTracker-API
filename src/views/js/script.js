const API_URL = "http://localhost:3000";

const state = {
  games: [],
  filter: "ALL",
};

const getToken = () => localStorage.getItem("token");

// ─── UTILS DA API ────────────────────────────────────────────────────────

const apiFetch = async (path, options = {}) => {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        ...options.headers,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return null;
    }

    return res.json();
  } catch {
    showToast("Erro ao conectar com o servidor.", "error");
    return null;
  }
};

const fetchGameCover = async (title) => {
  if (!title) return null;
  try {
    const data = await apiFetch(
      `/steam/search?name=${encodeURIComponent(title)}`,
    );
    return data && Array.isArray(data) && data.length > 0
      ? data[0].header_image
      : null;
  } catch {
    return null;
  }
};

const showToast = (msg, type = "") => {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => el.classList.remove("show"), 3000);
};

// ─── RENDERIZAÇÃO SEGURA ──────────────────────────────────────────────────

const renderCover = (game) => {
  const url =
    game.cover ||
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80";
  // Removi o uso de "/>" para evitar erros de parser do navegador
  return `<img src="${url}" alt="${game.title}" onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80';">`;
};

const renderCard = (game) => {
  const id = game._id || game.id;
  const labels = {
    BACKLOG: "Backlog",
    PLAYING: "Jogando",
    PAUSED: "Pausado",
    COMPLETED: "Zerado",
    DROPPED: "Dropado",
  };
  const currentLabel = labels[game.status] || "Status";

  return `
    <div class="game-card" data-status="${game.status}" data-id="${id}">
      <div class="card-cover">
        ${renderCover(game)}
        <div class="card-actions">
          <button class="btn-action edit" onclick="openEdit('${id}')" title="Editar">✏️</button>
          <button class="btn-action delete" onclick="removeGame('${id}')" title="Excluir">🗑️</button>
        </div>
      </div>
      <div class="card-info">
        <div class="card-title">${game.title}</div>
        <div class="custom-dropdown">
          <button class="dropdown-trigger" onclick="this.parentElement.classList.toggle('open')">${currentLabel}</button>
<div class="dropdown-menu">
  ${Object.keys(labels)
    .map(
      (s) => `
    <div class="dropdown-item ${s}" onclick="changeGameStatus('${id}', '${s}')">${labels[s]}</div>
  `,
    )
    .join("")}
</div>
        </div>
      </div>
    </div>`;
};

const renderGrid = () => {
  const grid = document.getElementById("games-grid");
  const filtered = state.games.filter(
    (g) => state.filter === "ALL" || g.status === state.filter,
  );
  grid.innerHTML = filtered.map(renderCard).join("");
};
const updateCounts = () => {
  const all = state.games;
  
  // Certifique-se de que esses IDs existem no seu HTML
  const elements = {
    "count-all": all.length,
    "count-playing": all.filter((g) => g.status === "PLAYING").length,
    "count-completed": all.filter((g) => g.status === "COMPLETED").length,
    "count-backlog": all.filter((g) => g.status === "BACKLOG").length,
    "count-paused": all.filter((g) => g.status === "PAUSED").length,
    "count-dropped": all.filter((g) => g.status === "DROPPED").length,
  };

  for (const id in elements) {
    const el = document.getElementById(id);
    if (el) el.textContent = elements[id];
  }
};
// ─── AÇÕES ──────────────────────────────────────────────────────────────

const loadGames = async () => {
  const data = await apiFetch("/games");
  state.games = Array.isArray(data) ? data : [];
  renderGrid();
  updateCounts(); 
};

const saveGame = async (payload, id = null) => {
  const method = id ? "PUT" : "POST";
  const path = id ? `/games/${id}` : "/games";

  // Limpeza do payload: garantir que só envia campos permitidos ao Prisma
  const cleanPayload = {
    title: payload.title,
    platform: payload.platform,
    genre: payload.genre,
    status: payload.status,
    rating: payload.rating,
    cover: payload.cover,
  };

  const data = await apiFetch(path, {
    method,
    body: JSON.stringify(cleanPayload),
  });
  if (data) {
    closeModal();
    loadGames();
  }
};

window.changeGameStatus = async (id, newStatus) => {
  await apiFetch(`/games/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status: newStatus }),
  });
  loadGames();
};

window.removeGame = async (id) => {
  await apiFetch(`/games/${id}`, { method: "DELETE" });
  loadGames();
};

// ─── INICIALIZAÇÃO ──────────────────────────────────────────────────────

document.getElementById("game-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("game-id").value;
  const payload = {
    title: document.getElementById("input-title").value,
    platform: document.getElementById("input-platform").value,
    genre: document.getElementById("input-genre").value,
    status: document.getElementById("input-status").value,
    rating: document.getElementById("input-rating").value
      ? Number(document.getElementById("input-rating").value)
      : null,
    cover: document.getElementById("input-cover").value || null,
  };
  await saveGame(payload, id || null);
});

if (!getToken()) window.location.href = "login.html";
else loadGames();
