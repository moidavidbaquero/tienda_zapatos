function getUsers() { return readStorage(STORAGE.users, []); }
function setUsers(users) { writeStorage(STORAGE.users, users); }

function setMessage(text, type = "error") {
  const box = document.getElementById("auth-message");
  if (box) { box.textContent = text; box.className = `form-alert ${type}`; }
}

function clearFieldErrors(form) {
  form.querySelectorAll(".field-error").forEach(e => e.textContent = "");
  form.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));
}

document.addEventListener("DOMContentLoaded", () => {
  const login = document.getElementById("login-form");
  const register = document.getElementById("register-form");

  if (login) login.addEventListener("submit", e => {
    e.preventDefault();
    clearFieldErrors(login);
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!email || !password) return setMessage("Completa todos los campos.");
    if (!user) return setMessage("Correo o contraseña incorrectos.");
    writeStorage(STORAGE.session, {id:user.id,name:user.name,email:user.email});
    setMessage("Sesión iniciada correctamente.", "success");
    setTimeout(() => location.href = "index.html", 700);
  });

  if (register) register.addEventListener("submit", e => {
    e.preventDefault();
    clearFieldErrors(register);
    const name = document.getElementById("reg-name").value.trim();
    const lastname = document.getElementById("reg-lastname").value.trim();
    const email = document.getElementById("reg-email").value.trim().toLowerCase();
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm").value;
    if (!name || !lastname || !email || !password || !confirm) return setMessage("Completa todos los campos.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMessage("Ingresa un correo válido.");
    if (password.length < 6) return setMessage("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return setMessage("Las contraseñas no coinciden.");
    const users = getUsers();
    if (users.some(u => u.email === email)) return setMessage("Ya existe una cuenta con ese correo.");
    const user = {id: Date.now(), name, lastname, email, password};
    users.push(user);
    setUsers(users);
    writeStorage(STORAGE.session, {id:user.id,name:user.name,email:user.email});
    setMessage("Cuenta creada correctamente.", "success");
    setTimeout(() => location.href = "index.html", 700);
  });
});
