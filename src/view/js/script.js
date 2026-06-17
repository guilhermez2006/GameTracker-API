const API_URL = "https://gametracker-api-7uvv.onrender.com";

const state = {
  games: [],
  filter: "ALL",
  search: "",
};

const getToken = () => localStorage.getItem("token");

// ─── API UTILITIES ──────────────────────────────────────────────────────────

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
  if (!el) return;
  el.textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => el.classList.remove("show"), 3000);
};

// ─── HAMBURGER MENU ─────────────────────────────────────────────────────────

window.toggleSidebar = () => {
  const sidebar = document.querySelector(".sidebar");
  const hamburger = document.getElementById("hamburger-btn");
  if (sidebar) {
    sidebar.classList.toggle("active");
    hamburger.classList.toggle("active");
  }
};

const closeSidebar = () => {
  const sidebar = document.querySelector(".sidebar");
  const hamburger = document.getElementById("hamburger-btn");
  if (sidebar) {
    sidebar.classList.remove("active");
    hamburger.classList.remove("active");
  }
};

// ─── MODAL CONTROLS ─────────────────────────────────────────────────────────

window.openModal = () => {
  document.getElementById("game-form").reset();
  document.getElementById("game-id").value = "";
  document.getElementById("modal-title").textContent = "Novo Jogo";

  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.style.display = "flex";
    overlay.classList.add("show", "active");
  }
};

window.closeModal = () => {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.style.display = "none";
    overlay.classList.remove("show", "active");
  }
};

window.openEdit = (id) => {
  const game = state.games.find((g) => (g._id || g.id) === id);
  if (!game) return;

  document.getElementById("game-id").value = id;
  document.getElementById("input-title").value = game.title || "";
  document.getElementById("input-platform").value = game.platform || "";
  document.getElementById("input-genre").value = game.genre || "";
  document.getElementById("input-status").value = game.status || "";
  document.getElementById("input-rating").value = game.rating || "";
  document.getElementById("input-cover").value = game.cover || "";

  document.getElementById("modal-title").textContent = "Editar Jogo";

  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.style.display = "flex";
    overlay.classList.add("show", "active");
  }
};

// ─── RENDERING FUNCTIONS ────────────────────────────────────────────────────

const renderCover = (game) => {
  const url =
    game.cover ||
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80";
  return `<img src="${url}" alt="${game.title}" onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80';" />`;
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
                (s) =>
                  `<div class="dropdown-item ${s}" onclick="changeGameStatus('${id}', '${s}')">${labels[s]}</div>`,
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>`;
};

const renderGrid = () => {
  const grid = document.getElementById("games-grid");
  if (!grid) return;
  const filtered = state.games.filter((g) => {
    const matchStatus = state.filter === "ALL" || g.status === state.filter;
    const matchSearch = g.title
      .toLowerCase()
      .includes(state.search.toLowerCase());
    return matchStatus && matchSearch;
  });
  grid.innerHTML = filtered.map(renderCard).join("");
  updateCounts();
};

const updateCounts = () => {
  const all = state.games;
  const elements = {
    "count-all": all.length,
    "count-playing": all.filter(
      (g) => (g.status || "").toUpperCase() === "PLAYING",
    ).length,
    "count-completed": all.filter(
      (g) => (g.status || "").toUpperCase() === "COMPLETED",
    ).length,
    "count-backlog": all.filter(
      (g) => (g.status || "").toUpperCase() === "BACKLOG",
    ).length,
    "count-paused": all.filter(
      (g) => (g.status || "").toUpperCase() === "PAUSED",
    ).length,
    "count-dropped": all.filter(
      (g) => (g.status || "").toUpperCase() === "DROPPED",
    ).length,
  };

  for (const id in elements) {
    const el = document.getElementById(id);
    if (el) el.textContent = elements[id];
  }
};

// ─── CRUD OPERATIONS ────────────────────────────────────────────────────────

const loadGames = async () => {
  const data = await apiFetch("/games");
  state.games = Array.isArray(data) ? data : [];
  renderGrid();
};

const saveGame = async (payload, id = null) => {
  const method = id ? "PUT" : "POST";
  const path = id ? `/games/${id}` : "/games";

  if (!payload.cover && payload.title) {
    payload.cover = await fetchGameCover(payload.title);
  }

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
    window.closeModal();
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

// ─── EVENT LISTENERS ────────────────────────────────────────────────────────

document.querySelectorAll(".sidebar-nav .nav-item").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    document
      .querySelectorAll(".sidebar-nav .nav-item")
      .forEach((b) => b.classList.remove("active"));
    const target = e.currentTarget;
    target.classList.add("active");
    state.filter = target.getAttribute("data-filter");

    const titles = {
      ALL: "TODOS OS JOGOS",
      PLAYING: "JOGANDO",
      COMPLETED: "ZERADOS",
      BACKLOG: "BACKLOG",
      PAUSED: "PAUSADOS",
      DROPPED: "DROPADOS",
    };
    document.getElementById("page-title").textContent =
      titles[state.filter] || "JOGOS";

    renderGrid();
    closeSidebar();
  });
});

document.getElementById("btn-add")?.addEventListener("click", window.openModal);
document
  .getElementById("modal-close")
  ?.addEventListener("click", window.closeModal);

document.getElementById("modal-overlay")?.addEventListener("click", (e) => {
  if (e.target.id === "modal-overlay") window.closeModal();
});

document.getElementById("game-form")?.addEventListener("submit", async (e) => {
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

document.getElementById("search-input")?.addEventListener("input", (e) => {
  state.search = e.target.value;
  renderGrid();
});

document.getElementById("btn-logout")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

// ─── INITIALIZATION ─────────────────────────────────────────────────────────

if (!getToken()) window.location.href = "login.html";
else loadGames();
