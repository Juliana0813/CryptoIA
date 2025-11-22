// ============================
//  Protegemos acceso del admin
// ============================

document.addEventListener("DOMContentLoaded", () => {

    const stored = localStorage.getItem("loggedUser");

    // Si no hay sesión → login
    if (!stored) {
        window.location.href = "../login/login.html";
        return;
    }

    const user = JSON.parse(stored);

    // Si NO es administrador → lo regresamos al index
    if (user.rol !== "admin") {
        window.location.href = "../index.html";
        return;
    }

    // Mostrar datos del administrador
    document.getElementById("adminName").textContent = user.nombre;
    document.getElementById("adminBalance").textContent = `$${Number(user.saldo).toLocaleString()}`;

    // ============================
    //  BOTÓN DE CERRAR SESIÓN
    // ============================
    const logoutBtn = document.getElementById("logoutBtn");

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedUser");
        window.location.href = "../login/login.html";
    });

});
