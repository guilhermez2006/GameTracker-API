const API_URL =
  location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://gametracker-api-7uvv.onrender.com";

// Seletores do DOM
const toastEl = document.getElementById("toast");
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");

const loginBtn = document.getElementById("btn-login");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

const registerBtn = document.getElementById("btn-register");
const regName = document.getElementById("reg-name");
const regEmail = document.getElementById("reg-email");
const regPassword = document.getElementById("reg-password");

// Sistema de Toast
const showToast = (msg, type = "") => {
  toastEl.textContent = msg;
  toastEl.className = `toast ${type} show`;
  setTimeout(() => toastEl.classList.remove("show"), 3000);
};

// Alternância entre as abas de Login e Cadastro
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  formLogin.style.display = "block";
  formRegister.style.display = "none";
});

tabRegister.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  formRegister.style.display = "block";
  formLogin.style.display = "none";
});

// Envio do formulário de Login
formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginBtn.innerHTML = '<span class="loader"></span>';
  loginBtn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Erro ao fazer login.", "error");
      return;
    }

    localStorage.setItem("token", data.token);
    window.location.href = "index.html";
  } catch {
    showToast("Servidor indisponível.", "error");
  } finally {
    if (!window.location.href.includes("index.html")) {
      loginBtn.innerHTML = "ENTRAR";
      loginBtn.disabled = false;
    }
  }
});

// Envio do formulário de Cadastro
formRegister.addEventListener("submit", async (e) => {
  e.preventDefault();
  registerBtn.innerHTML = '<span class="loader"></span>';
  registerBtn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/cadastro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: regName.value,
        email: regEmail.value,
        password: regPassword.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Erro ao criar conta.", "error");
      return;
    }

    showToast("Conta criada! Faça login.", "success");
    tabLogin.click();
  } catch {
    showToast("Servidor indisponível.", "error");
  } finally {
    registerBtn.textContent = "CRIAR CONTA";
    registerBtn.disabled = false;
  }
});

// Proteção simples de rota no Client-side
if (localStorage.getItem("token")) {
  window.location.href = "index.html";
}
