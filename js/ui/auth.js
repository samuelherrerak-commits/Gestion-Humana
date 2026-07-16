import { api } from '../utils/api-client.js';
import { store } from '../engine/store.js';

const overlay = document.getElementById('auth-overlay');
const loginForm = document.getElementById('login-form');
const adminForm = document.getElementById('admin-login-form');
const loginError = document.getElementById('login-error');
const adminError = document.getElementById('admin-error');
const tabEmpleado = document.getElementById('tab-empleado');
const tabAdmin = document.getElementById('tab-admin');

let onAuthCallback = null;

export function onAuthenticated(cb) {
  onAuthCallback = cb;
}

export function checkAuth() {
  if (api.isAuthenticated()) {
    return true;
  }
  overlay.style.display = 'flex';
  return false;
}

export function logout() {
  api.setToken(null);
  localStorage.removeItem('sistema-rrhh-state');
  overlay.style.display = 'flex';
  showEmpleadoTab();
  loginError.textContent = '';
  adminError.textContent = '';
}

function showEmpleadoTab() {
  loginForm.style.display = 'block';
  adminForm.style.display = 'none';
  tabEmpleado.classList.add('auth-tab--active');
  tabAdmin.classList.remove('auth-tab--active');
}

function showAdminTab() {
  loginForm.style.display = 'none';
  adminForm.style.display = 'block';
  tabAdmin.classList.add('auth-tab--active');
  tabEmpleado.classList.remove('auth-tab--active');
}

tabEmpleado?.addEventListener('click', showEmpleadoTab);
tabAdmin?.addEventListener('click', showAdminTab);

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const cedula = document.getElementById('login-cedula').value.trim();
  if (!cedula) { loginError.textContent = 'Ingresa tu cédula'; return; }
  try {
    loginForm.querySelector('button').disabled = true;
    const data = await api.loginCedula(cedula);
    api.setToken(data.token);
    if (data.user) store.state.authUser = data.user;
    overlay.style.display = 'none';
    if (onAuthCallback) onAuthCallback();
  } catch (err) {
    loginError.textContent = err.message;
  } finally {
    loginForm.querySelector('button').disabled = false;
  }
});

adminForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  adminError.textContent = '';
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  if (!email || !password) { adminError.textContent = 'Completa todos los campos'; return; }
  try {
    adminForm.querySelector('button').disabled = true;
    const data = await api.login({ email, password });
    api.setToken(data.token);
    if (data.user) store.state.authUser = data.user;
    overlay.style.display = 'none';
    if (onAuthCallback) onAuthCallback();
  } catch (err) {
    adminError.textContent = err.message;
  } finally {
    adminForm.querySelector('button').disabled = false;
  }
});
