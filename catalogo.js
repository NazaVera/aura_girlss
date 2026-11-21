import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ===============================
// IMAGEKIT
// ===============================

const URL_AUTORIZACION =
    "https://script.google.com/macros/s/AKfycbyzttntWrKPUeuJNQ6vEcxMgPixY64WQSCkUd_G2nb_qv4YXklhrJ0mnmR5C3ik3Dms/exec";

const PUBLIC_KEY =
    "public_pIBGU7nohs4l1UgIfbnbXeerCwc=";


// ===============================
// VARIABLES
// ===============================

const contenedorProductos =
    document.getElementById("productos");

const buscador =
    document.getElementById("buscador");

const botonesFiltro =
    document.querySelectorAll(".filtro");

const listaCarrito =
    document.getElementById("lista-carrito");

const totalElemento =
    document.getElementById("total");

    const botonCarritoFlotante =
    document.getElementById("btn-carrito-flotante");

const contadorCarrito =
    document.getElementById("contador-carrito");

const formularioPedido =
    document.getElementById("formulario-pedido");

const tipoEntrega =
    document.getElementById("tipo-entrega");

const botonContinuarEnvio =
    document.getElementById("btn-continuar-envio");

const selectorPago =
    document.getElementById("pago");

const datosTransferencia =
    document.getElementById("datos-transferencia");

const comprobante =
    document.getElementById("comprobante");


let productos = [];

let carrito = [];

let categoriaActual = "todos";

// ===============================
// MODAL DEL PRODUCTO
// ===============================

const modalProducto =
    document.getElementById("modal-producto");

const cerrarModal =
    document.getElementById("cerrar-modal");

const modalImagen =
    document.getElementById("modal-imagen");

    const modalMiniaturas =
    document.getElementById("modal-miniaturas");

const modalNombre =
    document.getElementById("modal-nombre");

const modalDescripcion =
    document.getElementById("modal-descripcion");

const modalPrecio =
    document.getElementById("modal-precio");

const modalDisponibilidad =
    document.getElementById("modal-disponibilidad");

const modalModelos =
    document.getElementById("modal-modelos");

const modalAgregar =
    document.getElementById("modal-agregar");

let productoModalActual = null;

let modeloModalSeleccionado = null;


// ===============================
// CARGAR PRODUCTOS
// ===============================

async function cargarProductos() {

    try {

        const referencia =
            collection(db, "productos");

        const resultado =
            await getDocs(referencia);

        productos = [];

        resultado.forEach((documento) => {

            productos.push({
                id: documento.id,
                ...documento.data()
            });

        });

        mostrarProductos();

    } catch (error) {

        console.error(
            "Error al cargar productos:",
            error
        );

        contenedorProductos.innerHTML = `
            <p>
                No se pudieron cargar los productos.
                Intentá nuevamente más tarde.
            </p>
        `;
    }
}


// ===============================
// MOSTRAR PRODUCTOS
// ===============================

// ===============================
// MOSTRAR PRODUCTOS
// ===============================

function mostrarProductos() {

    const textoBuscado =
        buscador.value.toLowerCase().trim();





        const productosFiltrados =
    productos.filter((producto) => {

        const nombre =
            (producto.nombre || "").toLowerCase();

        const descripcion =
            (producto.descripcion || "").toLowerCase();

        const categoria =
            (producto.categoria || "").toLowerCase();

        // ===============================
        // BUSCAR TAMBIÉN EN LAS OPCIONES
        // ===============================

        const opcionesTexto =
            Array.isArray(producto.modelos)
                ? producto.modelos
                    .map((opcion) => opcion.nombre || "")
                    .join(" ")
                    .toLowerCase()
                : "";

        const coincideBusqueda =
            nombre.includes(textoBuscado) ||
            descripcion.includes(textoBuscado) ||
            categoria.includes(textoBuscado) ||
            opcionesTexto.includes(textoBuscado);

        // ===============================
        // FILTRO POR CATEGORÍA
        // ===============================

        const coincideCategoria =
            categoriaActual === "todos" ||
            categoria === categoriaActual;

        return coincideBusqueda &&
            coincideCategoria;

    });    

            

        


    contenedorProductos.innerHTML = "";


    if (productosFiltrados.length === 0) {

        contenedorProductos.innerHTML = `
            <p>No encontramos productos.</p>
        `;

        return;
    }


    productosFiltrados.forEach((producto) => {

        const tarjeta =
            document.createElement("article");

        tarjeta.classList.add("producto");

// Obtener las imágenes del producto

let imagenesProducto = [];

if (
    Array.isArray(producto.imagenes) &&
    producto.imagenes.length > 0
) {
    imagenesProducto = producto.imagenes;
}
else if (producto.imagen) {
    imagenesProducto = [producto.imagen];
}

// Mostrar la primera imagen disponible

const imagen =
    imagenesProducto[0] ||
    "../img/sin-imagen.jpg";

console.log(
    "IMÁGENES DEL PRODUCTO:",
    producto.nombre,
    imagenesProducto
);


        console.log(
            "IMAGEN DEL PRODUCTO:",
            producto.imagen
        );


        const disponible =
            producto.disponibilidad === true;


        // ==================================
        // OPCIONES DEL PRODUCTO
        // ==================================

        const opciones =
            Array.isArray(producto.modelos)
                ? producto.modelos
                : [];


        let opcionSeleccionada = null;


        let htmlOpciones = "";


if (opciones.length > 0) {

    htmlOpciones = `

        <div class="contenedor-opciones">

            <button
                type="button"
                class="btn-ver-opciones"
            >
                Ver opciones
            </button>

            <div class="opciones-ocultas">

                <h4>
                    Elegí una opción:
                </h4>

                <div class="lista-opciones">

                    ${
                        opciones.map(
                            (opcion, indice) => {

                                const disponibleOpcion =
                                    opcion.disponible !== false;

                                return `

                                    <button
                                        type="button"
                                        class="btn-opcion-producto ${
                                            disponibleOpcion
                                                ? ""
                                                : "agotado"
                                        }"
                                        data-indice="${indice}"
                                        ${
                                            disponibleOpcion
                                                ? ""
                                                : "disabled"
                                        }
                                    >
                                        ${opcion.nombre}

                                        ${
                                            disponibleOpcion
                                                ? ""
                                                : " - Agotado"
                                        }

                                    </button>

                                `;

                            }
                        ).join("")
                    }

                </div>

            </div>

        </div>

    `;

}


        tarjeta.innerHTML = `

            <img
                src="${imagen}"
                alt="${producto.nombre || "Producto"}"
            >

            <h3>
                ${producto.nombre || "Producto sin nombre"}
            </h3>

            <p>
                ${producto.descripcion || ""}
            </p>

            <p class="precio">
                $${Number(producto.precio || 0)
                    .toLocaleString("es-AR")}
            </p>

            <p class="disponibilidad">
                ${
                    disponible
                        ? "Disponible"
                        : "No disponible"
                }
            </p>

            ${htmlOpciones}

            <button
                class="btn-agregar"
                data-id="${producto.id}"
                type="button"
                ${
                    disponible
                        ? ""
                        : "disabled"
                }
            >
                ${
                    disponible
                        ? "Agregar al pedido"
                        : "No disponible"
                }
            </button>

        `;


        contenedorProductos.appendChild(tarjeta);

        // ==================================
// ABRIR MODAL AL TOCAR LA IMAGEN
// ==================================

const imagenProducto =
    tarjeta.querySelector("img");

imagenProducto.addEventListener(
    "click",
    () => {

        abrirModalProducto(producto);

    }
);

// ==================================
// VER / OCULTAR OPCIONES
// ==================================

const botonVerOpciones =
    tarjeta.querySelector(
        ".btn-ver-opciones"
    );

const opcionesOcultas =
    tarjeta.querySelector(
        ".opciones-ocultas"
    );


if (botonVerOpciones) {

    botonVerOpciones.addEventListener(
        "click",
        () => {

            opcionesOcultas.classList.toggle(
                "mostrar"
            );


            if (
                opcionesOcultas.classList.contains(
                    "mostrar"
                )
            ) {

                botonVerOpciones.textContent =
                    "Ocultar opciones";

            } else {

                botonVerOpciones.textContent =
                    "Ver opciones";

            }

        }
    );

}


        // ==================================
        // BOTONES DE OPCIONES
        // ==================================

        tarjeta
            .querySelectorAll(
                ".btn-opcion-producto"
            )
            .forEach((boton) => {

                boton.addEventListener(
                    "click",
                    () => {

                        tarjeta
                            .querySelectorAll(
                                ".btn-opcion-producto"
                            )
                            .forEach(
                                (otroBoton) => {

                                    otroBoton.classList.remove(
                                        "seleccionado"
                                    );

                                }
                            );


                        boton.classList.add(
                            "seleccionado"
                        );


                        const indice =
                            Number(
                                boton.dataset.indice
                            );


                        opcionSeleccionada =
                            opciones[indice].nombre;

                    }
                );

            });


        // ==================================
        // BOTÓN AGREGAR
        // ==================================

        const botonAgregar =
            tarjeta.querySelector(
                ".btn-agregar"
            );


        botonAgregar.addEventListener(
            "click",
            () => {

                // Si tiene opciones,
                // obligamos a elegir una.

                if (
                    opciones.length > 0 &&
                    !opcionSeleccionada
                ) {

                    alert(
                        "Seleccioná una opción antes de agregar el producto."
                    );

                    return;

                }


                agregarAlCarrito(
                    producto.id,
                    opcionSeleccionada
                );

            }
        );

    });

}

// ===============================
// ABRIR MODAL DEL PRODUCTO
// ===============================

// ===============================
// ABRIR MODAL DEL PRODUCTO
// ===============================

function abrirModalProducto(producto) {

    productoModalActual = producto;

    modeloModalSeleccionado = null;


    // ===============================
    // OBTENER TODAS LAS IMÁGENES
    // ===============================

    let imagenes = [];


    if (
        Array.isArray(producto.imagenes) &&
        producto.imagenes.length > 0
    ) {

        imagenes =
            producto.imagenes;

    }


    else if (producto.imagen) {

        imagenes =
            [producto.imagen];

    }


    else {

        imagenes =
            ["../img/sin-imagen.jpg"];

    }


    // ===============================
    // IMAGEN PRINCIPAL
    // ===============================

    modalImagen.src =
        imagenes[0];

    modalImagen.alt =
        producto.nombre || "Producto";


    // ===============================
    // MINIATURAS
    // ===============================

    modalMiniaturas.innerHTML = "";


    imagenes.forEach(
        (imagen, indice) => {

            const miniatura =
                document.createElement("img");


            miniatura.src =
                imagen;


            miniatura.alt =
                `${producto.nombre || "Producto"} - imagen ${indice + 1}`;


            miniatura.classList.add(
                "miniatura-producto"
            );


            // La primera imagen queda seleccionada

            if (indice === 0) {

                miniatura.classList.add(
                    "miniatura-seleccionada"
                );

            }


            miniatura.addEventListener(
                "click",
                () => {

                    modalImagen.src =
                        imagen;


                    modalMiniaturas
                        .querySelectorAll(
                            ".miniatura-producto"
                        )
                        .forEach(
                            (otraMiniatura) => {

                                otraMiniatura.classList.remove(
                                    "miniatura-seleccionada"
                                );

                            }
                        );


                    miniatura.classList.add(
                        "miniatura-seleccionada"
                    );

                }
            );


            modalMiniaturas.appendChild(
                miniatura
            );

        }
    );


    // ===============================
    // INFORMACIÓN
    // ===============================

    modalNombre.textContent =
        producto.nombre || "Producto sin nombre";


    modalDescripcion.textContent =
        producto.descripcion || "Sin descripción";


    modalPrecio.textContent =
        Number(producto.precio || 0)
            .toLocaleString("es-AR");


    // ===============================
    // DISPONIBILIDAD
    // ===============================

    if (producto.disponibilidad === true) {

        modalDisponibilidad.textContent =
            "Disponible";

    } else {

        modalDisponibilidad.textContent =
            "No disponible";

    }


    // ===============================
    // MODELOS
    // ===============================

    const opciones =
        Array.isArray(producto.modelos)
            ? producto.modelos
            : [];


    modalModelos.innerHTML = "";


    if (opciones.length > 0) {

        const titulo =
            document.createElement("h4");

        titulo.textContent =
            "Elegí una opción:";

        modalModelos.appendChild(
            titulo
        );


        const lista =
            document.createElement("div");

        lista.classList.add(
            "lista-opciones"
        );


        opciones.forEach(
            (opcion, indice) => {

                const boton =
                    document.createElement("button");


                boton.type =
                    "button";


                boton.classList.add(
                    "btn-opcion-producto"
                );


                boton.textContent =
                    opcion.nombre;


                const disponible =
                    opcion.disponible !== false;


                if (!disponible) {

                    boton.disabled =
                        true;

                    boton.classList.add(
                        "agotado"
                    );

                    boton.textContent +=
                        " - Agotado";

                }


                if (disponible) {

                    boton.addEventListener(
                        "click",
                        () => {

                            lista
                                .querySelectorAll(
                                    ".btn-opcion-producto"
                                )
                                .forEach(
                                    (otroBoton) => {

                                        otroBoton.classList.remove(
                                            "seleccionado"
                                        );

                                    }
                                );


                            boton.classList.add(
                                "seleccionado"
                            );


                            modeloModalSeleccionado =
                                opciones[indice].nombre;

                        }
                    );

                }


                lista.appendChild(
                    boton
                );

            }
        );


        modalModelos.appendChild(
            lista
        );

    }


    // ===============================
    // BOTÓN AGREGAR
    // ===============================

    if (producto.disponibilidad === true) {

        modalAgregar.disabled =
            false;

        modalAgregar.textContent =
            "🛒 Agregar al pedido";

    } else {

        modalAgregar.disabled =
            true;

        modalAgregar.textContent =
            "No disponible";

    }


    // ===============================
    // MOSTRAR MODAL
    // ===============================

    modalProducto.classList.add(
        "mostrar"
    );


    document.body.style.overflow =
        "hidden";

}

// ===============================
// AGREGAR DESDE EL MODAL
// ===============================

modalAgregar.addEventListener(
    "click",
    () => {

        if (!productoModalActual) {
            return;
        }


        const opciones =
            Array.isArray(
                productoModalActual.modelos
            )
                ? productoModalActual.modelos
                : [];


        // Si tiene modelos,
        // obligamos a seleccionar uno.

        if (
            opciones.length > 0 &&
            !modeloModalSeleccionado
        ) {

            alert(
                "Seleccioná una opción antes de agregar el producto."
            );

            return;

        }


        agregarAlCarrito(
            productoModalActual.id,
            modeloModalSeleccionado
        );


        cerrarModalProducto();

    }
);

// ===============================
// CERRAR MODAL
// ===============================

function cerrarModalProducto() {

    modalProducto.classList.remove(
        "mostrar"
    );

    document.body.style.overflow =
        "";

    productoModalActual = null;

    modeloModalSeleccionado = null;

}

// ===============================
// BOTÓN CERRAR
// ===============================

cerrarModal.addEventListener(
    "click",
    cerrarModalProducto
);

// ===============================
// CERRAR TOCANDO AFUERA
// ===============================

modalProducto.addEventListener(
    "click",
    (event) => {

        if (
            event.target === modalProducto
        ) {

            cerrarModalProducto();

        }

    }
);

// ===============================
// FILTROS
// ===============================

botonesFiltro.forEach((boton) => {

    boton.addEventListener(
        "click",
        () => {

            botonesFiltro.forEach(
                (otroBoton) => {

                    otroBoton.classList.remove(
                        "activo"
                    );

                }
            );


            boton.classList.add("activo");


            categoriaActual =
                boton.dataset.categoria
                    .toLowerCase();


            mostrarProductos();

        }
    );

});


// ===============================
// BUSCADOR
// ===============================

buscador.addEventListener(
    "input",
    mostrarProductos
);


// ===============================
// AGREGAR AL CARRITO
// ===============================

function agregarAlCarrito(id, modelo = null) {

    const producto =
        productos.find(
            (producto) => producto.id === id
        );


    if (!producto) {
        return;
    }


    // ==================================
    // BUSCAR MISMO PRODUCTO + MISMA OPCIÓN
    // ==================================

    const productoExistente =
        carrito.find(
            (item) =>
                item.id === id &&
                (item.modelo || null) === modelo
        );


    if (productoExistente) {

        productoExistente.cantidad++;

    } else {

        carrito.push({

            ...producto,

            modelo: modelo,

            cantidad: 1

        });

    }


    guardarCarrito();

    mostrarCarrito();

}

// ===============================
// MOSTRAR CARRITO
// ===============================

function mostrarCarrito() {
    // Actualizar contador del carrito flotante

if (contadorCarrito) {

    const cantidadTotal =
        carrito.reduce(
            (total, producto) =>
                total + Number(producto.cantidad || 0),
            0
        );

    contadorCarrito.textContent =
        cantidadTotal;

}

    listaCarrito.innerHTML = "";


    if (carrito.length === 0) {

        listaCarrito.innerHTML = `
            <p>
                Todavía no agregaste productos.
            </p>
        `;

        totalElemento.textContent = "0";

        return;
    }


    let total = 0;


    carrito.forEach((producto) => {

        const subtotal =
            Number(producto.precio) *
            producto.cantidad;


        total += subtotal;


        const elemento =
            document.createElement("div");


        elemento.classList.add(
            "item-carrito"
        );


        elemento.innerHTML = `

    <div class="info-producto-carrito">

        <div class="datos-producto-carrito">

            <h3>
                ${producto.nombre}
            </h3>

            ${
                producto.modelo
                    ? `
                        <p class="modelo-carrito">
                            ${producto.modelo}
                        </p>
                    `
                    : ""
            }

            <p class="precio-carrito">
                $${Number(producto.precio)
                    .toLocaleString("es-AR")}
            </p>

        </div>

        <button
            class="btn-eliminar"
            data-id="${producto.id}"
            data-modelo="${producto.modelo || ""}"
            type="button"
            title="Eliminar producto"
        >
            🗑️
        </button>

    </div>

    <div class="controles-carrito">

        <div class="cantidad-carrito">

            <button
                class="btn-restar"
                data-id="${producto.id}"
                data-modelo="${producto.modelo || ""}"
                type="button"
            >
                −
            </button>

            <span>
                ${producto.cantidad}
            </span>

            <button
                class="btn-sumar"
                data-id="${producto.id}"
                data-modelo="${producto.modelo || ""}"
                type="button"
            >
                +
            </button>

        </div>

        <p class="subtotal-carrito">
            Subtotal:
            <strong>
                $${subtotal.toLocaleString("es-AR")}
            </strong>
        </p>

    </div>

`;


        listaCarrito.appendChild(elemento);

    });


    totalElemento.textContent =
        total.toLocaleString("es-AR");


    activarBotonesCarrito();

}



// ===============================
// BOTONES DEL CARRITO
// ===============================

function activarBotonesCarrito() {

    // ==================================
    // SUMAR
    // ==================================

    document
        .querySelectorAll(".btn-sumar")
        .forEach((boton) => {

            boton.addEventListener(
                "click",
                () => {

                    const producto =
                        carrito.find(
                            (item) =>
                                item.id ===
                                    boton.dataset.id &&
                                (item.modelo || "") ===
                                    boton.dataset.modelo
                        );


                    if (producto) {

                        producto.cantidad++;

                        guardarCarrito();

                        mostrarCarrito();

                    }

                }
            );

        });


    // ==================================
    // RESTAR
    // ==================================

    document
        .querySelectorAll(".btn-restar")
        .forEach((boton) => {

            boton.addEventListener(
                "click",
                () => {

                    const producto =
                        carrito.find(
                            (item) =>
                                item.id ===
                                    boton.dataset.id &&
                                (item.modelo || "") ===
                                    boton.dataset.modelo
                        );


                    if (!producto) {
                        return;
                    }


                    producto.cantidad--;


                    if (producto.cantidad <= 0) {

                        carrito =
                            carrito.filter(
                                (item) =>
                                    !(
                                        item.id ===
                                            boton.dataset.id &&
                                        (item.modelo || "") ===
                                            boton.dataset.modelo
                                    )
                            );

                    }


                    guardarCarrito();

                    mostrarCarrito();

                }
            );

        });


    // ==================================
    // ELIMINAR
    // ==================================

    document
        .querySelectorAll(".btn-eliminar")
        .forEach((boton) => {

            boton.addEventListener(
                "click",
                () => {

                    carrito =
                        carrito.filter(
                            (item) =>
                                !(
                                    item.id ===
                                        boton.dataset.id &&
                                    (item.modelo || "") ===
                                        boton.dataset.modelo
                                )
                        );


                    guardarCarrito();

                    mostrarCarrito();

                }
            );

        });

}


// ===============================
// GUARDAR CARRITO TEMPORALMENTE
// ===============================

function guardarCarrito() {

    sessionStorage.setItem(
        "carritoPedido",
        JSON.stringify(carrito)
    );

}


// ===============================
// MÉTODO DE PAGO
// ===============================

if (selectorPago) {

    selectorPago.addEventListener(
        "change",
        () => {

            if (
                selectorPago.value ===
                "transferencia"
            ) {

                datosTransferencia.style.display =
                    "block";

                comprobante.required = true;

            } else {

                datosTransferencia.style.display =
                    "none";

                comprobante.required = false;

                comprobante.value = "";

            }

        }
    );

}

// ===============================
// CONTINUAR CON ENVÍO
// ===============================

if (botonContinuarEnvio) {

    botonContinuarEnvio.addEventListener(
        "click",
        () => {

            // ===============================
            // VERIFICAR CARRITO
            // ===============================

            if (carrito.length === 0) {

                alert(
                    "Primero agregá al menos un producto al pedido."
                );

                return;
            }


            // ===============================
            // DATOS PERSONALES
            // ===============================

            const nombre =
                document.getElementById("nombre")
                    .value.trim();

            const telefono =
                document.getElementById("telefono")
                    .value.trim();

            const email =
                document.getElementById("email")
                    .value.trim();

            const comentario =
                document.getElementById("comentario")
                    .value.trim();


            if (!nombre || !telefono || !email) {

                alert(
                    "Completá tu nombre, teléfono y email."
                );

                return;
            }


            // ===============================
            // FORMA DE ENTREGA
            // ===============================

            const entrega =
                tipoEntrega.value;


            if (!entrega) {

                alert(
                    "Seleccioná cómo querés recibir tu pedido."
                );

                return;
            }


            // ===============================
            // GUARDAR DATOS DEL CLIENTE
            // ===============================

            const datosCliente = {

                nombre: nombre,

                telefono: telefono,

                email: email,

                comentario: comentario,

                entrega: entrega

            };


            sessionStorage.setItem(
                "datosClientePedido",
                JSON.stringify(datosCliente)
            );


            // ===============================
            // GUARDAR CARRITO
            // ===============================

            guardarCarrito();


            // ===============================
            // IR A ENVÍOS
            // ===============================

            window.location.href =
                "envios.html";

        }
    );

}



// ===============================
// CONFIRMAR PEDIDO
// ===============================

if (formularioPedido) {

    formularioPedido.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // ===============================
            // VERIFICAR CARRITO
            // ===============================

            if (carrito.length === 0) {

                alert(
                    "No hay productos en el pedido."
                );

                return;
            }


            // ===============================
            // RECUPERAR DATOS DEL CLIENTE
            // ===============================

            const datosCliente =
                JSON.parse(
                    sessionStorage.getItem(
                        "datosClientePedido"
                    ) || "null"
                );


            // ===============================
            // RECUPERAR DATOS DE ENVÍO
            // ===============================

            const datosEnvio =
                JSON.parse(
                    sessionStorage.getItem(
                        "datosEnvio"
                    ) || "null"
                );


            if (!datosCliente) {

                alert(
                    "Completá los datos del pedido."
                );

                return;
            }


            if (!datosEnvio) {

                alert(
                    "Primero completá los datos de entrega."
                );

                return;
            }


            // ===============================
            // MÉTODO DE PAGO
            // ===============================

            const pago =
                selectorPago.value;


            if (!pago) {

                alert(
                    "Seleccioná un método de pago."
                );

                return;
            }


            try {

                // ===============================
                // DESACTIVAR BOTÓN
                // ===============================

                const botonConfirmar =
                    formularioPedido.querySelector(
                        ".btn-confirmar"
                    );


                if (botonConfirmar) {

                    botonConfirmar.disabled = true;

                    botonConfirmar.textContent =
                        "Enviando pedido...";

                }


                // ===============================
                // SUBTOTAL
                // ===============================

                let subtotal = 0;


                const productosPedido =
                    carrito.map((producto) => {

                        const precio =
                            Number(producto.precio) || 0;

                        const cantidad =
                            Number(producto.cantidad) || 0;

                        const subtotalProducto =
                            precio * cantidad;


                        subtotal +=
                            subtotalProducto;


                        return {

                            id:
                                producto.id,

                            nombre:
                                producto.nombre || "",

                            modelo:
                                producto.modelo || "",

                            precio:
                                precio,

                            cantidad:
                                cantidad,

                            subtotal:
                                subtotalProducto

                        };

                    });


                // ===============================
                // COMPROBANTE
                // ===============================

                let urlComprobante = "";


                if (pago === "transferencia") {

                    const archivo =
                        comprobante.files[0];


                    if (!archivo) {

                        alert(
                            "Debés seleccionar el comprobante de transferencia."
                        );

                        if (botonConfirmar) {

                            botonConfirmar.disabled =
                                false;

                            botonConfirmar.textContent =
                                "Confirmar pedido";

                        }

                        return;
                    }


                    if (archivo.size > 26214400) {

                        alert(
                            "El comprobante supera el límite de 25 MB."
                        );

                        if (botonConfirmar) {

                            botonConfirmar.disabled =
                                false;

                            botonConfirmar.textContent =
                                "Confirmar pedido";

                        }

                        return;
                    }


                    if (botonConfirmar) {

                        botonConfirmar.textContent =
                            "Subiendo comprobante...";

                    }


                    urlComprobante =
                        await subirComprobante(archivo);

                }


                // ===============================
                // COSTO DE ENVÍO
                // ===============================

                let costoEnvio =
                    datosEnvio.costoEnvio;


                if (
                    costoEnvio ===
                    "A confirmar"
                ) {

                    costoEnvio =
                        "A confirmar";

                }


                // ===============================
                // TOTAL
                // ===============================

                let total =
                    subtotal;


                if (
                    typeof costoEnvio ===
                    "number"
                ) {

                    total +=
                        costoEnvio;

                }


                // ===============================
                // PEDIDO
                // ===============================

                const pedido = {

                    cliente: {

                        nombre:
                            datosCliente.nombre,

                        telefono:
                            datosCliente.telefono,

                        email:
                            datosCliente.email

                    },

                    comentario:
                        datosCliente.comentario || "",

                    productos:
                        productosPedido,

                    subtotal:
                        subtotal,

                    envio: {

                        tipo:
                            datosEnvio.tipo,

                        costo:
                            costoEnvio,

                        direccion:
                            datosEnvio.direccion || "",

                        codigoPostal:
                            datosEnvio.codigoPostal || "",

                        telefono:
                            datosEnvio.telefono || "",

                        referencia:
                            datosEnvio.referencia || "",

                        provincia:
                            datosEnvio.provincia || "",

                        localidad:
                            datosEnvio.localidad || ""

                    },

                    pago: {

                        metodo:
                            pago,

                        comprobante:
                            urlComprobante

                    },

                    total:
                        total,

                    estado:
                        "pendiente",

                    fecha:
                        serverTimestamp()

                };


                // ===============================
                // GUARDAR EN FIRESTORE
                // ===============================

                await addDoc(
                    collection(db, "pedidos"),
                    pedido
                );


                // ===============================
                // LIMPIAR PEDIDO
                // ===============================

                carrito = [];

                sessionStorage.removeItem(
                    "carritoPedido"
                );

                sessionStorage.removeItem(
                    "datosClientePedido"
                );

                sessionStorage.removeItem(
                    "datosEnvio"
                );


                mostrarCarrito();

                formularioPedido.reset();


                if (datosTransferencia) {

                    datosTransferencia.style.display =
                        "none";

                }


                if (comprobante) {

                    comprobante.required =
                        false;

                    comprobante.value =
                        "";

                }


                if (tipoEntrega) {

                    tipoEntrega.value =
                        "";

                }


                alert(
                    "¡Pedido enviado correctamente! Gracias por tu compra."
                );


                // ===============================
                // RESTAURAR BOTÓN
                // ===============================

                if (botonConfirmar) {

                    botonConfirmar.disabled =
                        false;

                    botonConfirmar.textContent =
                        "Confirmar pedido";

                }


            } catch (error) {

                console.error(
                    "Error al enviar pedido:",
                    error
                );


                alert(
                    "No se pudo enviar el pedido. Intentá nuevamente."
                );


                const botonConfirmar =
                    formularioPedido.querySelector(
                        ".btn-confirmar"
                    );


                if (botonConfirmar) {

                    botonConfirmar.disabled =
                        false;

                    botonConfirmar.textContent =
                        "Confirmar pedido";

                }

            }

        }
    );

}


// ===============================
// SUBIR COMPROBANTE A IMAGEKIT
// ===============================
function obtenerAutorizacion() {

    return new Promise((resolve, reject) => {

        const callback =
            "imageKitAuth_" + Date.now();

        const script =
            document.createElement("script");

        window[callback] = function(datos) {

            delete window[callback];

            script.remove();

            console.log(
                "Autorización ImageKit recibida:",
                datos
            );

            resolve(datos);

        };

        script.onerror = function() {

            delete window[callback];

            script.remove();

            reject(
                new Error(
                    "No se pudo cargar el endpoint de autorización de ImageKit."
                )
            );

        };

        script.src =
            URL_AUTORIZACION +
            "?callback=" +
            callback;

        document.body.appendChild(script);

    });

}


async function subirComprobante(archivo) {

    try {

        console.log("1. Solicitando autorización de ImageKit...");

        const autorizacion =
            await obtenerAutorizacion();

        console.log(
            "2. Autorización recibida:",
            autorizacion
        );

        const formulario =
            new FormData();

        formulario.append(
            "file",
            archivo
        );

        formulario.append(
            "publicKey",
            PUBLIC_KEY
        );

        formulario.append(
            "signature",
            autorizacion.signature
        );

        formulario.append(
            "expire",
            autorizacion.expire
        );

        formulario.append(
            "token",
            autorizacion.token
        );

        formulario.append(
            "fileName",
            "comprobante_" +
            Date.now() +
            "_" +
            archivo.name
        );

        console.log(
            "3. Enviando comprobante a ImageKit..."
        );

        const respuesta =
            await fetch(
                "https://upload.imagekit.io/api/v1/files/upload",
                {
                    method: "POST",
                    body: formulario
                }
            );

        console.log(
            "4. Respuesta de ImageKit:",
            respuesta.status
        );

        const texto =
            await respuesta.text();

        console.log(
            "5. Respuesta completa:",
            texto
        );

        let resultado;

        try {

            resultado =
                JSON.parse(texto);

        } catch (error) {

            console.error(
                "ImageKit no devolvió JSON:",
                texto
            );

            throw new Error(
                "ImageKit devolvió una respuesta inválida."
            );

        }

        if (!respuesta.ok) {

            console.error(
                "Error de ImageKit:",
                resultado
            );

            throw new Error(
                resultado.message ||
                "No se pudo subir el comprobante."
            );

        }

        if (!resultado.url) {

            console.error(
                "ImageKit no devolvió una URL:",
                resultado
            );

            throw new Error(
                "ImageKit no devolvió la URL del comprobante."
            );

        }

        console.log(
            "6. Comprobante subido correctamente:",
            resultado.url
        );

        return resultado.url;

    } catch (error) {

        console.error(
            "ERROR AL SUBIR COMPROBANTE:",
            error
        );

        throw error;

    }

}


// ===============================
// RECUPERAR CARRITO
// ===============================

function recuperarCarrito() {

    const carritoGuardado =
        sessionStorage.getItem(
            "carritoPedido"
        );


    if (!carritoGuardado) {
        return;
    }


    try {

        carrito =
            JSON.parse(
                carritoGuardado
            );

        mostrarCarrito();

    } catch (error) {

        console.error(
            "Error al recuperar carrito:",
            error
        );

    }

}


// ===============================
// RECUPERAR DATOS DEL CLIENTE
// ===============================

function recuperarDatosPedido() {

    const datosGuardados =
        sessionStorage.getItem(
            "datosClientePedido"
        );


    if (!datosGuardados) {
        return;
    }


    try {

        const datos =
            JSON.parse(
                datosGuardados
            );


        document.getElementById(
            "nombre"
        ).value =
            datos.nombre || "";


        document.getElementById(
            "telefono"
        ).value =
            datos.telefono || "";


        document.getElementById(
            "email"
        ).value =
            datos.email || "";


        document.getElementById(
            "comentario"
        ).value =
            datos.comentario || "";


        selectorPago.value =
            datos.pago || "";


        tipoEntrega.value =
            datos.entrega || "";


        // Mostrar transferencia
        // si ya estaba seleccionada

        if (
            datos.pago ===
            "transferencia"
        ) {

            datosTransferencia.style.display =
                "block";

            comprobante.required =
                true;

        } else {

            datosTransferencia.style.display =
                "none";

            comprobante.required =
                false;

        }

    } catch (error) {

        console.error(
            "Error al recuperar datos:",
            error
        );

    }

}


// ===============================
// INICIAR
// ===============================

cargarProductos();

recuperarCarrito();

mostrarCarrito();

recuperarDatosPedido();

// ===============================
// VOLVER DESDE ENVÍOS AL PAGO
// ===============================

function irAlPagoSiCorresponde() {

    const datosEnvio =
        sessionStorage.getItem("datosEnvio");

    if (!datosEnvio) {
        return;
    }

    const formulario =
        document.getElementById("formulario-pedido");

    if (!formulario) {
        return;
    }

    setTimeout(() => {

        formulario.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 300);
}

irAlPagoSiCorresponde();


// ===============================
// BOTÓN CARRITO FLOTANTE
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    const boton =
        document.getElementById("btn-carrito-flotante");

    if (!boton) return;

    boton.addEventListener("click", () => {

        const carrito =
            document.querySelector(".carrito");

        if (!carrito) return;

        window.scrollTo({
            top: carrito.offsetTop - 20,
            behavior: "smooth"
        });

    });

});


// ===============================
// CONTINUAR CON MIS DATOS
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    const boton =
        document.getElementById("btn-continuar-datos");

    if (!boton) return;

    boton.addEventListener("click", () => {

        if (carrito.length === 0) {

            alert(
                "Primero agregá al menos un producto al pedido."
            );

            return;
        }

        const formulario =
            document.getElementById("formulario-pedido");

        if (!formulario) return;

        window.scrollTo({
            top: formulario.offsetTop - 20,
            behavior: "smooth"
        });

    });

});