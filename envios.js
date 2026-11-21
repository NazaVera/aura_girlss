const datosCliente = sessionStorage.getItem("datosClientePedido");

if (datosCliente) {

    const datos = JSON.parse(datosCliente);
    const entrega = datos.entrega;

    const seccionRetiro = document.getElementById("seccion-retiro");
    const seccionDomicilio = document.getElementById("seccion-domicilio");
    const seccionInterior = document.getElementById("seccion-interior");

    // Ocultar todas las secciones
    if (seccionRetiro) seccionRetiro.style.display = "none";
    if (seccionDomicilio) seccionDomicilio.style.display = "none";
    if (seccionInterior) seccionInterior.style.display = "none";

    // Mostrar solamente la opción elegida
    if (entrega === "retiro") {
        if (seccionRetiro) {
            seccionRetiro.style.display = "block";
        }
    }

    if (entrega === "domicilio") {
        if (seccionDomicilio) {
            seccionDomicilio.style.display = "block";
        }
    }

    if (entrega === "interior") {
        if (seccionInterior) {
            seccionInterior.style.display = "block";
        }
    }
}


// ===============================
// MOSTRAR FORMULARIO DOMICILIO
// ===============================

function mostrarDomicilio() {

    const formulario =
        document.getElementById("formulario-domicilio");

    if (formulario) {
        formulario.style.display = "block";
    }
}


// ===============================
// MOSTRAR FORMULARIO INTERIOR
// ===============================

function mostrarInterior() {

    const formulario =
        document.getElementById("formulario-interior");

    if (formulario) {
        formulario.style.display = "block";
    }
}


// ===============================
// FORMULARIO DOMICILIO
// ===============================

const formularioDomicilio =
    document.getElementById("form-domicilio");

if (formularioDomicilio) {

    formularioDomicilio.addEventListener("submit", function(event) {

        event.preventDefault();

        const direccion =
            document.getElementById("direccion").value.trim();

        const codigoPostal =
            document.getElementById("codigo-postal").value.trim();

        const telefono =
            document.getElementById("telefono-envio").value.trim();

        const referencia =
            document.getElementById("referencia").value.trim();

        if (!direccion || !codigoPostal || !telefono) {
            alert("Completá todos los campos obligatorios.");
            return;
        }

        const datosEnvio = {
            tipo: "domicilio",
            direccion: direccion,
            codigoPostal: codigoPostal,
            telefono: telefono,
            referencia: referencia,
            costoEnvio: "A confirmar"
        };

        sessionStorage.setItem(
            "datosEnvio",
            JSON.stringify(datosEnvio)
        );

        alert("Datos de envío guardados correctamente.");

        window.location.href = "catalogo.html";
    });
}


// ===============================
// FORMULARIO INTERIOR
// ===============================

const formularioInterior =
    document.getElementById("form-interior");

if (formularioInterior) {

    formularioInterior.addEventListener("submit", function(event) {

        event.preventDefault();

        const provincia =
            document.getElementById("provincia").value.trim();

        const localidad =
            document.getElementById("localidad").value.trim();

        const direccion =
            document.getElementById("direccion-interior").value.trim();

        const codigoPostal =
            document.getElementById("codigo-postal-interior").value.trim();

        const telefono =
            document.getElementById("telefono-interior").value.trim();

        const referencia =
            document.getElementById("referencia-interior").value.trim();

        if (
            !provincia ||
            !localidad ||
            !direccion ||
            !codigoPostal ||
            !telefono
        ) {
            alert("Completá todos los campos obligatorios.");
            return;
        }

        const datosEnvio = {
            tipo: "interior",
            provincia: provincia,
            localidad: localidad,
            direccion: direccion,
            codigoPostal: codigoPostal,
            telefono: telefono,
            referencia: referencia,
            costoEnvio: "A confirmar"
        };

        sessionStorage.setItem(
            "datosEnvio",
            JSON.stringify(datosEnvio)
        );

        alert("Datos de envío guardados correctamente.");

        window.location.href = "catalogo.html";
    });
}


// ===============================
// RETIRO POR EL LOCAL
// ===============================

function confirmarRetiro() {

    const datosEnvio = {
        tipo: "retiro",
        costoEnvio: 0
    };

    sessionStorage.setItem(
        "datosEnvio",
        JSON.stringify(datosEnvio)
    );

    alert("Retiro seleccionado correctamente.");

    window.location.href = "catalogo.html";
}