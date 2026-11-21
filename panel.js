
import { db, auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ======================================
// CONFIGURACIÓN DE CLOUDINARY
// ======================================

const CLOUD_NAME = "xr0ededq";
const UPLOAD_PRESET = "aura_girls";

const URL_CLOUDINARY =
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;


// ======================================
// ELEMENTOS
// ======================================

const formulario =
    document.getElementById("formulario-producto");

const lista =
    document.getElementById("lista-productos-admin");

const buscadorAdmin =
    document.getElementById("buscador-admin");

let productoEditando = null;
let productosAdmin = [];
let imagenesActuales = [];


// ======================================
// MODELOS DE CELULAR
// ======================================

let modelosActuales = [];

const listaModelosAdmin =
    document.getElementById("lista-modelos-admin");

const nuevoModelo =
    document.getElementById("nuevo-modelo");

const disponibilidadModelo =
    document.getElementById("disponibilidad-modelo");

const botonAgregarModelo =
    document.getElementById("btn-agregar-modelo");


// ======================================
// MOSTRAR MODELOS EN EL PANEL
// ======================================

function mostrarModelosAdmin() {

    if (!listaModelosAdmin) return;

    listaModelosAdmin.innerHTML = "";

    modelosActuales.forEach((modelo, indice) => {

        const fila = document.createElement("div");

        fila.classList.add("modelo-admin");

        fila.innerHTML = `
            <span>${modelo.nombre}</span>

            <button
                type="button"
                class="btn-estado-modelo"
                data-indice="${indice}"
            >
                ${modelo.disponible ? "Disponible" : "Agotado"}
            </button>

            <button
                type="button"
                class="btn-eliminar-modelo"
                data-indice="${indice}"
            >
                🗑️
            </button>
        `;

        listaModelosAdmin.appendChild(fila);
    });


    document
        .querySelectorAll(".btn-estado-modelo")
        .forEach((boton) => {

            boton.addEventListener("click", () => {

                const indice =
                    Number(boton.dataset.indice);

                modelosActuales[indice].disponible =
                    !modelosActuales[indice].disponible;

                mostrarModelosAdmin();
            });
        });


    document
        .querySelectorAll(".btn-eliminar-modelo")
        .forEach((boton) => {

            boton.addEventListener("click", () => {

                const indice =
                    Number(boton.dataset.indice);

                modelosActuales.splice(indice, 1);

                mostrarModelosAdmin();
            });
        });
}


// ======================================
// AGREGAR MODELO
// ======================================

if (botonAgregarModelo) {

    botonAgregarModelo.addEventListener("click", () => {

        const nombre = nuevoModelo.value.trim();

        if (!nombre) {
            alert("Escribí el modelo del celular.");
            return;
        }

        const modeloExistente =
            modelosActuales.some(
                (modelo) =>
                    modelo.nombre.toLowerCase() ===
                    nombre.toLowerCase()
            );

        if (modeloExistente) {
            alert("Ese modelo ya está agregado.");
            return;
        }

        modelosActuales.push({
            nombre: nombre,
            disponible:
                disponibilidadModelo.value === "true"
        });

        nuevoModelo.value = "";
        disponibilidadModelo.value = "true";

        mostrarModelosAdmin();
    });
}


// ======================================
// SUBIR VARIAS IMÁGENES A CLOUDINARY
// ======================================

async function subirImagenes(archivos) {

    const urls = [];

    for (const archivo of archivos) {

        console.log("Subiendo imagen:", archivo.name);

        const formularioImagen = new FormData();

        formularioImagen.append("file", archivo);

        formularioImagen.append(
            "upload_preset",
            UPLOAD_PRESET
        );

        const respuesta =
            await fetch(URL_CLOUDINARY, {
                method: "POST",
                body: formularioImagen
            });

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.secure_url) {

            console.error(
                "Error de Cloudinary:",
                resultado
            );

            throw new Error(
                resultado.error?.message ||
                "No se pudo subir una de las imágenes a Cloudinary."
            );
        }

        console.log(
            "Imagen subida correctamente:",
            resultado.secure_url
        );

        urls.push(resultado.secure_url);
    }

    return urls;
}


// ======================================
// GUARDAR O MODIFICAR PRODUCTO
// ======================================

formulario.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nombre =
        document.getElementById("nombre-producto").value;

    const descripcion =
        document.getElementById("descripcion-producto").value;

    const precio =
        Number(
            document.getElementById("precio-producto").value
        );

    const categoria =
        document.getElementById("categoria-producto").value;

    const campoImagen =
        document.getElementById("imagen-producto");

    const disponibilidad =
        document.getElementById("disponibilidad-producto").value === "true";


    // ==================================
    // VALIDAR TAMAÑO DE LAS IMÁGENES
    // ==================================

    if (campoImagen.files.length > 0) {

        for (const archivo of campoImagen.files) {

            const limite = 25 * 1024 * 1024;

            if (archivo.size > limite) {

                alert(
                    `La imagen "${archivo.name}" es demasiado pesada. ` +
                    "El máximo permitido es de 25 MB."
                );

                return;
            }
        }
    }


    try {

        // Conservamos todas las imágenes anteriores.

        let imagenes = [...imagenesActuales];


        // ==================================
        // SUBIR Y AGREGAR IMÁGENES NUEVAS
        // ==================================

        if (campoImagen.files.length > 0) {

            const imagenesNuevas =
                await subirImagenes(campoImagen.files);

            // IMPORTANTE:
            // Agregamos las nuevas sin borrar las anteriores.

            imagenes = [
                ...imagenesActuales,
                ...imagenesNuevas
            ];
        }


        // ==================================
        // DATOS DEL PRODUCTO
        // ==================================

        const datosProducto = {

            nombre,
            descripcion,
            precio,
            categoria,
            disponibilidad,

            imagenes,

            // Compatibilidad con el campo anterior.

            imagen:
                imagenes.length > 0
                    ? imagenes[0]
                    : "",

            modelos: modelosActuales
        };


        // ==================================
        // MODIFICAR PRODUCTO
        // ==================================

        if (productoEditando !== null) {

            await updateDoc(
                doc(db, "productos", productoEditando),
                datosProducto
            );

            alert("Producto modificado correctamente.");
        }


        // ==================================
        // AGREGAR PRODUCTO
        // ==================================

        else {

            await addDoc(
                collection(db, "productos"),
                datosProducto
            );

            alert("Producto agregado correctamente.");
        }


        // ==================================
        // LIMPIAR FORMULARIO
        // ==================================

        formulario.reset();

        document.getElementById(
            "indice-producto"
        ).value = "";

        document.querySelector(
            ".boton-guardar"
        ).textContent = "Guardar producto";

        productoEditando = null;
        imagenesActuales = [];
        modelosActuales = [];

        mostrarModelosAdmin();

        await cargarProductos();

    }

    catch (error) {

        console.error(
            "Error al guardar/modificar:",
            error
        );

        alert(
            "Error al guardar: " +
            (error.message || error)
        );
    }
});


// ======================================
// MOSTRAR PRODUCTOS
// ======================================

async function cargarProductos() {

    lista.innerHTML = "Cargando productos...";

    try {

        const consulta = await getDocs(
            collection(db, "productos")
        );

        lista.innerHTML = "";
        productosAdmin = [];

        if (consulta.empty) {

            lista.innerHTML =
                "<p>No hay productos registrados.</p>";

            return;
        }

        consulta.forEach((documento) => {

            const producto = documento.data();

            productosAdmin.push({
                id: documento.id,
                ...producto
            });
        });

        mostrarProductosAdmin(productosAdmin);

    }

    catch (error) {

        console.error(
            "Error al cargar productos:",
            error
        );

        lista.innerHTML =
            "<p>No se pudieron cargar los productos.</p>";
    }
}


// ======================================
// MOSTRAR PRODUCTOS ADMIN
// ======================================

function mostrarProductosAdmin(productosParaMostrar) {

    lista.innerHTML = "";

    if (productosParaMostrar.length === 0) {

        lista.innerHTML =
            "<p>No se encontraron productos.</p>";

        return;
    }

    productosParaMostrar.forEach((producto) => {

        // ==================================
        // IMÁGENES
        // ==================================

        let imagenes = [];

        if (Array.isArray(producto.imagenes)) {

            imagenes = producto.imagenes;

        } else if (producto.imagen) {

            imagenes = [producto.imagen];
        }


        // ==================================
        // CREAR TARJETA
        // ==================================

        const div = document.createElement("div");

        div.classList.add("producto-admin");


        // ==================================
        // MOSTRAR TODAS LAS IMÁGENES
        // ==================================

        let htmlImagenes = "";

        imagenes.forEach((imagen) => {

            htmlImagenes += `
                <img
                    src="${imagen}"
                    alt="${producto.nombre}"
                    width="120"
                >
            `;
        });


        // ==================================
        // INFORMACIÓN DEL PRODUCTO
        // ==================================

        div.innerHTML = `

            <h4>${producto.nombre}</h4>

            <p>${producto.descripcion}</p>

            <p>Precio: $${producto.precio}</p>

            <p>Categoría: ${producto.categoria}</p>

            <p>
                Estado:
                ${
                    producto.disponibilidad
                        ? "Disponible"
                        : "No disponible"
                }
            </p>

            ${
                Array.isArray(producto.modelos) &&
                producto.modelos.length > 0
                    ? `
                        <div class="opciones-producto-admin">

                            <strong>Opciones:</strong>

                            <ul>
                                ${
                                    producto.modelos.map((modelo) => `
                                        <li>
                                            ${modelo.nombre}
                                            -
                                            ${
                                                modelo.disponible
                                                    ? "Disponible"
                                                    : "Agotado"
                                            }
                                        </li>
                                    `).join("")
                                }
                            </ul>

                        </div>
                    `
                    : ""
            }

            <div class="imagenes-producto-admin">
                ${htmlImagenes}
            </div>

            <div class="acciones-producto">

                <button
                    class="btn-modificar"
                    data-id="${producto.id}"
                >
                    ✏️ Modificar
                </button>

                <button
                    class="btn-eliminar"
                    data-id="${producto.id}"
                >
                    🗑️ Eliminar
                </button>

            </div>
        `;

        lista.appendChild(div);
    });


    // ==================================
    // BOTONES MODIFICAR
    // ==================================

    document
        .querySelectorAll(".btn-modificar")
        .forEach((boton) => {

            boton.addEventListener("click", () => {

                modificarProducto(boton.dataset.id);
            });
        });


    // ==================================
    // BOTONES ELIMINAR
    // ==================================

    document
        .querySelectorAll(".btn-eliminar")
        .forEach((boton) => {

            boton.addEventListener("click", () => {

                eliminarProducto(boton.dataset.id);
            });
        });
}


// ======================================
// BUSCADOR DE PRODUCTOS DEL ADMIN
// ======================================

if (buscadorAdmin) {

    buscadorAdmin.addEventListener("input", () => {

        const texto =
            buscadorAdmin.value.toLowerCase().trim();

        const productosFiltrados =
            productosAdmin.filter((producto) => {

                const nombre =
                    (producto.nombre || "").toLowerCase();

                return nombre.includes(texto);
            });

        mostrarProductosAdmin(productosFiltrados);
    });
}


// ======================================
// MODIFICAR PRODUCTO
// ======================================

async function modificarProducto(id) {

    try {

        const consulta = await getDocs(
            collection(db, "productos")
        );

        let productoEncontrado = null;

        consulta.forEach((documento) => {

            if (documento.id === id) {

                productoEncontrado = {
                    id: documento.id,
                    ...documento.data()
                };
            }
        });


        if (!productoEncontrado) {

            alert("No se encontró el producto.");

            return;
        }


        document.getElementById(
            "nombre-producto"
        ).value = productoEncontrado.nombre || "";


        document.getElementById(
            "descripcion-producto"
        ).value = productoEncontrado.descripcion || "";


        document.getElementById(
            "precio-producto"
        ).value = productoEncontrado.precio ?? "";


        document.getElementById(
            "categoria-producto"
        ).value = productoEncontrado.categoria || "";


        document.getElementById(
            "disponibilidad-producto"
        ).value =
            productoEncontrado.disponibilidad
                ? "true"
                : "false";


        // ==================================
        // CARGAR MODELOS ACTUALES
        // ==================================

        if (Array.isArray(productoEncontrado.modelos)) {

            modelosActuales =
                productoEncontrado.modelos.map((modelo) => ({

                    nombre: modelo.nombre,

                    disponible:
                        modelo.disponible !== false
                }));

        } else {

            modelosActuales = [];
        }

        mostrarModelosAdmin();


        // ==================================
        // GUARDAR IMÁGENES ACTUALES
        // ==================================

        if (Array.isArray(productoEncontrado.imagenes)) {

            imagenesActuales =
                [...productoEncontrado.imagenes];

        } else if (productoEncontrado.imagen) {

            imagenesActuales = [
                productoEncontrado.imagen
            ];

        } else {

            imagenesActuales = [];
        }


        productoEditando = id;

        document.querySelector(
            ".boton-guardar"
        ).textContent = "Modificar producto";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

    catch (error) {

        console.error(
            "Error al modificar:",
            error
        );

        alert("No se pudo cargar el producto.");
    }
}


// ======================================
// ELIMINAR PRODUCTO
// ======================================

async function eliminarProducto(id) {

    const confirmar = confirm(
        "¿Seguro que querés eliminar este producto?"
    );

    if (!confirmar) return;

    try {

        await deleteDoc(
            doc(db, "productos", id)
        );

        alert("Producto eliminado correctamente.");

        await cargarProductos();

    }

    catch (error) {

        console.error(
            "Error al eliminar:",
            error
        );

        alert("No se pudo eliminar el producto.");
    }
}


// ======================================
// VERIFICAR SESIÓN DEL ADMINISTRADOR
// ======================================

onAuthStateChanged(auth, (usuario) => {

    if (usuario) {

        console.log(
            "Administrador autenticado:",
            usuario.email
        );

        cargarProductos();

    } else {

        console.log(
            "No hay una sesión de administrador."
        );

        window.location.href = "login.html";
    }
});
