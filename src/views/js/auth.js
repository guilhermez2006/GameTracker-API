const API_URL = 'http://localhost:3000';

const showToast = (msg, type = '') => {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
};

// ── TABS LOGIN / CADASTRO ────────────────────────────────────

document.getElementById('tab-login').addEventListener('click', () => {
  document.getElementById('tab-login').classList.add('active');
  document.getElementById('tab-register').classList.remove('active');
  document.getElementById('form-login').style.display = 'block';
  document.getElementById('form-register').style.display = 'none';
});

document.getElementById('tab-register').addEventListener('click', () => {
  document.getElementById('tab-register').classList.add('active');
  document.getElementById('tab-login').classList.remove('active');
  document.getElementById('form-register').style.display = 'block';
  document.getElementById('form-login').style.display = 'none';
});

// ── LOGIN ────────────────────────────────────────────────────

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-login');
  btn.innerHTML = '<span class="loader"></span>';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || 'Erro ao fazer login.', 'error');
      return;
    }

    // Token salvo no localStorage — usado em todas as requisições protegidas
    localStorage.setItem('token', data.token);
    window.location.href = 'index.html';
  } catch {
    showToast('Servidor indisponível.', 'error');
  } finally {
    btn.textContent = 'ENTRAR';
    btn.disabled = false;
  }
});

// ── CADASTRO ─────────────────────────────────────────────────

document.getElementById('form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-register');
  btn.innerHTML = '<span class="loader"></span>';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || 'Erro ao criar conta.', 'error');
      return;
    }

    showToast('Conta criada! Faça login.', 'success');
    document.getElementById('tab-login').click();
  } catch {
    showToast('Servidor indisponível.', 'error');
  } finally {
    btn.textContent = 'CRIAR CONTA';
    btn.disabled = false;
  }
});

// Redireciona se já estiver logado
if (localStorage.getItem('token')) {
  window.location.href = 'index.html';
}
