import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const formulario =
    document.getElementById("formulario-login");

const mensaje =
    document.getElementById("mensaje-login");


formulario.addEventListener("submit", async (event) => {

    event.preventDefault();


    const usuario =
        document.getElementById("usuario").value.trim();

    const contrasena =
        document.getElementById("contrasena").value;


    mensaje.textContent = "";


    try {

        await signInWithEmailAndPassword(
            auth,
            usuario,
            contrasena
        );


        window.location.href =
            "inicio.html";


    } catch (error) {

        console.error(
            "Error al iniciar sesión:",
            error
        );


        mensaje.textContent =
            "Usuario o contraseña incorrectos.";

    }

});

const botonMostrarContrasena =
document.getElementById("mostrar-contrasena");

const campoContrasena =
document.getElementById("contrasena");

botonMostrarContrasena.addEventListener(
"click",
() => {

    if (campoContrasena.type === "password") {

        campoContrasena.type = "text";

        botonMostrarContrasena.textContent = "🙈";

    } else {

        campoContrasena.type = "password";

        botonMostrarContrasena.textContent = "👁️";

    }

}

);