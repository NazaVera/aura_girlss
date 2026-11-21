import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const EMAIL_ADMIN =  "perniniyesica@gmail.com";

// ELEMENTOS DEL HTML
const formulario = document.getElementById("formulario-comentario");
const listaComentarios = document.getElementById("lista-comentarios");


// COLECCIÓN
const comentariosRef = collection(db, "comentarios");


// USUARIO ACTUAL
let usuarioActual = null;


// ===============================
// AUTENTICACIÓN
// ===============================

onAuthStateChanged(auth, async (usuario) => {

    if (usuario) {

        usuarioActual = usuario;

        console.log(
            "Usuario identificado:",
            usuario.uid,
            usuario.email || "anónimo"
        );

        return;
    }

    // Si no hay usuario, iniciar sesión anónima
    try {

        await signInAnonymously(auth);

    } catch (error) {

        console.error(
            "Error al iniciar sesión:",
            error
        );

    }

});


// MOSTRAR COMENTARIOS EN TIEMPO REAL
onSnapshot(
    comentariosRef,

    (resultado) => {

        listaComentarios.innerHTML = "";


        if (resultado.empty) {

            listaComentarios.innerHTML = `
                <p>Todavía no hay comentarios publicados.</p>
            `;

            return;
        }


        resultado.forEach((documento) => {

            const comentario = documento.data();


            // TARJETA
            const tarjeta = document.createElement("div");

            tarjeta.classList.add("tarjeta-comentario");


            // NOMBRE
            const nombre = document.createElement("h4");

            nombre.textContent =
                comentario.nombre || "Usuario";


            // CALIFICACIÓN
            const calificacion =
                document.createElement("p");

            calificacion.classList.add(
                "calificacion"
            );

            calificacion.textContent =
                "⭐".repeat(
                    Number(comentario.calificacion) || 0
                );


            // TEXTO
            const texto =
                document.createElement("p");

            texto.textContent =
                comentario.texto || "";


            tarjeta.appendChild(nombre);

            tarjeta.appendChild(calificacion);

            tarjeta.appendChild(texto);


          // ===============================
// BOTÓN ELIMINAR
// ADMINISTRADOR O DUEÑO
// ===============================

if (usuarioActual) {

    const esAdministrador =
        usuarioActual.email === EMAIL_ADMIN;

    const esDuenio =
        comentario.uid === usuarioActual.uid;

    if (esAdministrador || esDuenio) {

        const botonEliminar =
            document.createElement("button");

        botonEliminar.classList.add(
            "boton-eliminar"
        );

        botonEliminar.textContent =
            esAdministrador
                ? "🗑️ Eliminar comentario"
                : "Eliminar comentario";

        botonEliminar.addEventListener(
            "click",
            async () => {

                const confirmar =
                    confirm(
                        esAdministrador
                            ? "¿Querés eliminar este comentario?"
                            : "¿Querés eliminar tu comentario?"
                    );

                if (!confirmar) {
                    return;
                }

                try {

                    await deleteDoc(
                        doc(
                            db,
                            "comentarios",
                            documento.id
                        )
                    );

                } catch (error) {

                    console.error(
                        "Error al eliminar:",
                        error
                    );

                    alert(
                        "No se pudo eliminar el comentario."
                    );

                }

            }
        );

        tarjeta.appendChild(
            botonEliminar
        );

    }

}
          


            listaComentarios.appendChild(
                tarjeta
            );

        });

    },

    (error) => {

        console.error(
            "Error al cargar comentarios:",
            error
        );


        listaComentarios.innerHTML = `
            <p>
                No se pudieron cargar los comentarios.
            </p>
        `;

    }
);


// PUBLICAR COMENTARIO
formulario.addEventListener(
    "submit",
    async (evento) => {

        evento.preventDefault();


        if (!usuarioActual) {

            alert(
                "Esperá unos segundos e intentá nuevamente."
            );

            return;
        }


        const nombre =
            document
                .getElementById("nombre-comentario")
                .value
                .trim();


        const calificacion =
            document
                .getElementById("calificacion")
                .value;


        const texto =
            document
                .getElementById("texto-comentario")
                .value
                .trim();


        if (
            !nombre ||
            !calificacion ||
            !texto
        ) {

            alert(
                "Completá todos los campos."
            );

            return;
        }


        try {

            await addDoc(
                comentariosRef,
                {

                    nombre: nombre,

                    calificacion:
                        Number(calificacion),

                    texto: texto,

                    uid: usuarioActual.uid,

                    fecha: serverTimestamp()

                }
            );


            formulario.reset();


            alert(
                "¡Tu comentario fue publicado!"
            );


        } catch (error) {

            console.error(
                "Error al publicar:",
                error
            );


            alert(
                "No se pudo publicar el comentario."
            );

        }

    }
);