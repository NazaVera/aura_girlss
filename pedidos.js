import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    orderBy,
    query,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const listaPedidos =
    document.getElementById("lista-pedidos");

const buscador =
    document.getElementById("buscador-pedidos");

const totalPedidos =
    document.getElementById("total-pedidos");

const totalDomicilio =
    document.getElementById("total-domicilio");

const totalRetiro =
    document.getElementById("total-retiro");

const totalInterior =
    document.getElementById("total-interior");


let pedidos = [];
let filtroEstado = "todos";

// ===============================
// CARGAR PEDIDOS
// ===============================

async function cargarPedidos() {

    try {

        const referencia =
            query(
                collection(db, "pedidos"),
                orderBy("fecha", "desc")
            );

        const resultado =
            await getDocs(referencia);

        pedidos = [];

        resultado.forEach((documento) => {

            pedidos.push({
                id: documento.id,
                ...documento.data()
            });

        });

        mostrarResumen();
        mostrarPedidos();

    } catch (error) {

        console.error(
            "Error al cargar pedidos:",
            error
        );

        listaPedidos.innerHTML = `
            <p>
                No se pudieron cargar los pedidos.
            </p>
        `;

    }

}


// ===============================
// RESUMEN
// ===============================

function mostrarResumen() {

    totalPedidos.textContent =
        pedidos.length;


    totalDomicilio.textContent =
        pedidos.filter(
            (pedido) =>
                pedido.envio?.tipo === "domicilio"
        ).length;


    totalRetiro.textContent =
        pedidos.filter(
            (pedido) =>
                pedido.envio?.tipo === "retiro"
        ).length;


    totalInterior.textContent =
        pedidos.filter(
            (pedido) =>
                pedido.envio?.tipo === "interior"
        ).length;

}


// ===============================
// OBTENER FECHA
// ===============================

function obtenerFecha(pedido) {

    if (!pedido.fecha) {
        return null;
    }

    return pedido.fecha.toDate();

}


// ===============================
// NOMBRE DEL GRUPO
// ===============================

function obtenerNombreFecha(fecha) {

    if (!fecha) {
        return "Sin fecha";
    }


    const ahora = new Date();


    const hoy =
        new Date(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate()
        );


    const fechaPedido =
        new Date(
            fecha.getFullYear(),
            fecha.getMonth(),
            fecha.getDate()
        );


    const diferencia =
        Math.round(
            (hoy - fechaPedido) /
            (1000 * 60 * 60 * 24)
        );


    if (diferencia === 0) {
        return "Hoy";
    }


    if (diferencia === 1) {
        return "Ayer";
    }


    return fechaPedido.toLocaleDateString(
        "es-AR",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// ===============================
// MOSTRAR PEDIDOS
// ===============================

function mostrarPedidos() {

    const texto =
        buscador.value
            .toLowerCase()
            .trim();


   const pedidosFiltrados = pedidos.filter((pedido) => {

    const texto = buscador.value.toLowerCase();

    const coincideTexto =
        pedido.cliente.nombre.toLowerCase().includes(texto) ||
        pedido.cliente.telefono.toLowerCase().includes(texto) ||
        pedido.cliente.email.toLowerCase().includes(texto);

    const estadoPedido = pedido.estado || "pendiente";

    const coincideEstado =
        filtroEstado === "todos" ||
        estadoPedido === filtroEstado;

    return coincideTexto && coincideEstado;
});


    listaPedidos.innerHTML = "";


    if (pedidosFiltrados.length === 0) {

        listaPedidos.innerHTML = `
            <p class="sin-pedidos">
                No hay pedidos para mostrar.
            </p>
        `;

        return;
    }


    // ===============================
    // AGRUPAR POR FECHA
    // ===============================

    const grupos = {};


    pedidosFiltrados.forEach((pedido) => {

        const fecha =
            obtenerFecha(pedido);

        const nombreFecha =
            obtenerNombreFecha(fecha);


        if (!grupos[nombreFecha]) {

            grupos[nombreFecha] = [];

        }


        grupos[nombreFecha].push(
            pedido
        );

    });


    // ===============================
    // MOSTRAR GRUPOS
    // ===============================

    Object.entries(grupos).forEach(
        ([nombreFecha, pedidosDelDia]) => {


            const grupo =
                document.createElement("section");

            grupo.classList.add(
                "grupo-fecha"
            );


            const titulo =
                document.createElement("h2");

            titulo.classList.add(
                "titulo-fecha"
            );

            titulo.textContent =
                nombreFecha;


            grupo.appendChild(
                titulo
            );


            const contenedor =
                document.createElement("div");

            contenedor.classList.add(
                "pedidos-del-dia"
            );


            pedidosDelDia.forEach(
                (pedido) => {

                    const tarjeta =
                        crearTarjetaPedido(
                            pedido
                        );

                    contenedor.appendChild(
                        tarjeta
                    );

                }
            );


            grupo.appendChild(
                contenedor
            );


            listaPedidos.appendChild(
                grupo
            );

        }
    );

}



// ===============================
// ABRIR TELÉFONO EN WHATSAPP
// ===============================

function obtenerLinkWhatsApp(telefono) {

    if (!telefono) {
        return "#";
    }

    // Eliminar espacios, guiones, paréntesis y otros caracteres
    let numero =
        String(telefono).replace(/\D/g, "");

    // Si empieza con 0, lo quitamos
    if (numero.startsWith("0")) {
        numero = numero.substring(1);
    }

    // Si es un número argentino de 10 dígitos,
    // agregamos el código de Argentina y el 9 de WhatsApp
    if (numero.length === 10) {
        numero = "549" + numero;
    }

    // Si ya tiene código de Argentina sin el 9
    else if (
        numero.startsWith("54") &&
        !numero.startsWith("549")
    ) {
        numero =
            "549" +
            numero.substring(2);
    }

    return `https://wa.me/${numero}`;
}


// ===============================
// CREAR TARJETA
// ===============================

function crearTarjetaPedido(pedido) {

    const tarjeta =
        document.createElement("article");

    tarjeta.classList.add(
        "tarjeta-pedido"
    );


    const fecha =
        obtenerFecha(pedido);


    const hora =
        fecha
            ? fecha.toLocaleTimeString(
                "es-AR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
            : "--:--";


    const envio =
        pedido.envio || {};


    const tipoEntrega =
        envio.tipo || "No especificado";


    const estado =
        pedido.estado || "pendiente";


    // ===============================
    // PRODUCTOS
    // ===============================

    let productosHTML = "";


    if (
        pedido.productos &&
        pedido.productos.length > 0
    ) {



        productosHTML = pedido.productos.map((producto) => {
    return `
        <li>
            <span>
                <strong>${producto.nombre}</strong>
                × ${producto.cantidad}

                ${
                    producto.modelo
                        ? `<br><small>Opción: ${producto.modelo}</small>`
                        : ""
                }
            </span>

            <strong>
                $${Number(producto.subtotal || 0).toLocaleString("es-AR")}
            </strong>
        </li>
    `;
}).join("");            
                        
                            



    } else {

        productosHTML = `
            <li>
                No hay productos registrados.
            </li>
        `;

    }


    // ===============================
    // ESTADO
    // ===============================

    const estaEntregado =
        estado === "entregado";


    tarjeta.innerHTML = `

        <div class="tarjeta-cabecera">

            <div>

                <h3>
                    ${pedido.cliente?.nombre || "Cliente"}
                </h3>

                <span class="hora-pedido">
                    ${hora}
                </span>

            </div>


            <span
                class="estado-pedido ${
                    estaEntregado
                        ? "estado-entregado"
                        : "estado-pendiente"
                }"
            >
                ${
                    estaEntregado
                        ? "✓ Entregado"
                        : "⏳ Pendiente"
                }
            </span>

        </div>


        <div class="datos-cliente">

        <p>
    <strong>Teléfono:</strong>

    ${
        pedido.cliente?.telefono
            ? `
                <a
                    href="${obtenerLinkWhatsApp(pedido.cliente.telefono)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${pedido.cliente.telefono}
                </a>
            `
            : "-"
    }
</p>

            <p>
                <strong>Email:</strong>
                ${pedido.cliente?.email || "-"}
            </p>

        </div>


        <div class="seccion-pedido">

            <h4>
                Productos
            </h4>

            <ul class="lista-productos-pedido">
                ${productosHTML}
            </ul>

        </div>


        <div class="seccion-pedido">

            <h4>
                Entrega
            </h4>

            <p>
                <strong>Tipo:</strong>
                ${tipoEntrega}
            </p>

            ${
                envio.direccion
                    ? `
                        <p>
                            <strong>Dirección:</strong>
                            ${envio.direccion}
                        </p>
                    `
                    : ""
            }

            ${
                envio.localidad
                    ? `
                        <p>
                            <strong>Localidad:</strong>
                            ${envio.localidad}
                        </p>
                    `
                    : ""
            }

            ${
                envio.provincia
                    ? `
                        <p>
                            <strong>Provincia:</strong>
                            ${envio.provincia}
                        </p>
                    `
                    : ""
            }

            ${
                envio.codigoPostal
                    ? `
                        <p>
                            <strong>Código postal:</strong>
                            ${envio.codigoPostal}
                        </p>
                    `
                    : ""
            }

            ${
                envio.referencia
                    ? `
                        <p>
                            <strong>Referencia:</strong>
                            ${envio.referencia}
                        </p>
                    `
                    : ""
            }

        </div>


        <div class="seccion-pedido">

            <h4>
                Pago
            </h4>

            <p>
                <strong>Método:</strong>
                ${pedido.pago?.metodo || "-"}
            </p>

            ${
                pedido.pago?.comprobante
                    ? `
                        <p>
                            <strong>Comprobante:</strong>

                            <a
                                href="${pedido.pago.comprobante}"
                                target="_blank"
                            >
                                Ver comprobante
                            </a>
                        </p>
                    `
                    : ""
            }

        </div>


        ${
            pedido.comentario
                ? `
                    <div class="seccion-pedido">

                        <h4>
                            Comentario
                        </h4>

                        <p>
                            ${pedido.comentario}
                        </p>

                    </div>
                `
                : ""
        }


        <div class="totales-pedido">

            <p>
                <span>Subtotal</span>

                <strong>
                    $${Number(
                        pedido.subtotal || 0
                    ).toLocaleString("es-AR")}
                </strong>
            </p>


            <p>

                <span>Envío</span>

                <strong>
                    ${
                        typeof pedido.envio?.costo === "number"
                            ? "$" +
                              pedido.envio.costo
                                  .toLocaleString("es-AR")
                            : pedido.envio?.costo || "-"
                    }
                </strong>

            </p>


            <p class="total-final">

                <span>Total</span>

                <strong>
                    $${Number(
                        pedido.total || 0
                    ).toLocaleString("es-AR")}
                </strong>

            </p>

        </div>


        <div class="acciones-pedido">

    <button
        type="button"
        class="btn-estado"
        data-id="${pedido.id}"
    >

        ${
            estaEntregado
                ? "Marcar como pendiente"
                : "Marcar como entregado"
        }

    </button>


    <button
        type="button"
        class="btn-eliminar-pedido"
        data-id="${pedido.id}"
    >
        🗑️ Eliminar pedido
    </button>

</div>
    `;


    const botonEstado =
        tarjeta.querySelector(
            ".btn-estado"
        );


    botonEstado.addEventListener(
        "click",
        () => cambiarEstadoPedido(
            pedido.id,
            estaEntregado
                ? "pendiente"
                : "entregado"
        )
    );

     const botonEliminar =
    tarjeta.querySelector(
        ".btn-eliminar-pedido"
    );


botonEliminar.addEventListener(
    "click",
    () => eliminarPedido(
        pedido.id
    )
);

    return tarjeta;

}


// ===============================
// CAMBIAR ESTADO
// ===============================

async function cambiarEstadoPedido(
    id,
    nuevoEstado
) {

    try {

        await updateDoc(
            doc(
                db,
                "pedidos",
                id
            ),
            {
                estado: nuevoEstado
            }
        );


        const pedido =
            pedidos.find(
                (pedido) =>
                    pedido.id === id
            );


        if (pedido) {

            pedido.estado =
                nuevoEstado;

        }


        mostrarPedidos();


    } catch (error) {

        console.error(
            "Error al cambiar estado:",
            error
        );


        alert(
            "No se pudo actualizar el estado del pedido."
        );

    }

}

// ===============================
// ELIMINAR PEDIDO
// ===============================

async function eliminarPedido(id) {

    const confirmar =
        confirm(
            "¿Seguro que querés eliminar este pedido? Esta acción no se puede deshacer."
        );


    if (!confirmar) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "pedidos",
                id
            )
        );


        pedidos =
            pedidos.filter(
                (pedido) =>
                    pedido.id !== id
            );


        mostrarResumen();

        mostrarPedidos();


        alert(
            "Pedido eliminado correctamente."
        );


    } catch (error) {

        console.error(
            "Error al eliminar pedido:",
            error
        );


        alert(
            "No se pudo eliminar el pedido."
        );

    }

}


// ===============================
// BUSCADOR
// ===============================

buscador.addEventListener(
    "input",
    mostrarPedidos
);


// ===============================
// INICIAR
// ===============================

cargarPedidos();


const botonesFiltro =
    document.querySelectorAll(".filtro-estado");

botonesFiltro.forEach((boton) => {

    boton.addEventListener("click", () => {

        filtroEstado = boton.dataset.estado;

        botonesFiltro.forEach((b) => {
            b.classList.remove("activo");
        });

        boton.classList.add("activo");

        mostrarPedidos();
    });

});