const formulario = document.getElementById("formulario-contacto");

formulario.addEventListener("submit", function (event) {

    event.preventDefault();

    const nombre =
        document.getElementById("nombre-contacto").value.trim();

    const mensaje =
        document.getElementById("mensaje").value.trim();

    const numeroWhatsApp = "5492645153473";

    const texto =
        `Hola Aura Girls 💗

Mi nombre es: ${nombre}

Mi consulta es:
${mensaje}`;

    const url =
        "https://wa.me/" +
        numeroWhatsApp +
        "?text=" +
        encodeURIComponent(texto);

    window.location.href = url;
});