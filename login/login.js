// ======= CAMBIO DE MODO OSCURO / CLARO =======
const toggleTheme = document.getElementById('toggle-theme');
toggleTheme.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const icon = toggleTheme.querySelector('i');
  if (document.body.classList.contains('dark-mode')) {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  } else {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }
});

// ======= VALIDACIÓN DE LOGIN =======
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const user = document.getElementById('user').value.trim();
  const password = document.getElementById('password').value.trim();
  const role = document.getElementById('role').value;

  if (role === "admin" && user === "admin" && password === "1234") {
    showToast("✅ Bienvenido Administrador");
    setTimeout(() => window.location.href = "admin.html", 1200);
  } 
  else if (role === "usuario" && user === "usuario" && password === "1234") {
    showToast("✅ Bienvenido Usuario");
    setTimeout(() => window.location.href = "index.html", 1200);
  } 
  else {
    showToast("⚠️ Credenciales incorrectas para el rol seleccionado");
  }
});

// ======= NOTIFICACIÓN (TOAST) =======
function showToast(message) {
  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ======= ESTILO DEL TOAST =======
const style = document.createElement('style');
style.textContent = `
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) scale(0.8);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1000;
}
.toast.show {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}
`;
document.head.appendChild(style);
