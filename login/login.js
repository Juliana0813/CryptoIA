/* BASE DE DATOS FALSA (solo para pruebas) */
const fakeDB = [
    {
        usuario: "juliana",
        password: "1234",
        nombre: "Juliana C.",
        saldo: 50000,
        rol: "admin"
    },
    {
        usuario: "edgar",
        password: "789",
        nombre: "Edgar P.",
        saldo: 100000,
        rol: "usuario"
    }
];

/* PROCESAR LOGIN */
document.getElementById("loginBtn").addEventListener("click", () => {
    const userInput = document.getElementById("userInput").value.trim();
    const passInput = document.getElementById("passInput").value.trim();
    const errorBox = document.getElementById("loginError");

    const foundUser = fakeDB.find(u => 
        u.usuario === userInput && u.password === passInput
    );

    if (!foundUser) {
        errorBox.textContent = "Usuario o contraseña incorrectos.";
        return;
    }

    // Guardar usuario en localStorage
    localStorage.setItem("loggedUser", JSON.stringify(foundUser));

    //   REDIRECCIÓN SEGÚN ROL
    
    if (foundUser.rol === "admin") {
        window.location.href = "../admin/admin.html";

    } else {
        window.location.href = "../index.html";
    }
});
