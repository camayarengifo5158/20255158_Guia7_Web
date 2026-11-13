const formulario = document.forms["frmRegistro"];
const button = document.forms["frmRegistro"].elements["btnRegistro"];

const inputNombre = document.getElementById("idNombre");
const inputApellidos = document.getElementById("idApellidos");
const inputFechaNac = document.getElementById("idFechaNac");
const inputCorreo = document.getElementById("idCorreo");
const inputPassword = document.getElementById("idPassword");
const inputPasswordRepetir = document.getElementById("idPasswordRepetir");
const cmbPais = document.getElementById("idCmPais");
const inputArchivo = document.getElementById("idArchivo");
const intereses = document.querySelectorAll("#idIntereses input[type='checkbox']");
const carreras = document.getElementsByName("idRdCarrera");
const contenedorErrores = document.getElementById("idErrores");

const modal = new bootstrap.Modal(document.getElementById("idModal"), {});
const bodyModal = document.getElementById("idBodyModal");

const regexCorreo = /^[\w.+-]+@[A-Za-z\d-]+(\.[A-Za-z\d-]+)*\.[A-Za-z]{2,}$/;

const textoEtiqueta = function (input) {
  return document.querySelector(`label[for='${input.id}']`).textContent.trim();
};

const marcarCampo = function (campo, valido) {
  campo.classList.toggle("is-invalid", !valido);
  campo.classList.toggle("is-valid", valido);
};

const fechaHoy = function () {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
};

const mostrarErrores = function (errores) {
  contenedorErrores.replaceChildren();
  if (errores.length == 0) {
    contenedorErrores.classList.add("d-none");
    return;
  }

  const titulo = document.createElement("strong");
  titulo.textContent = "Revise los siguientes campos:";
  const lista = document.createElement("ul");
  lista.setAttribute("class", "mb-0");

  errores.forEach((error) => {
    const item = document.createElement("li");
    item.appendChild(document.createTextNode(error));
    lista.appendChild(item);
  });

  contenedorErrores.appendChild(titulo);
  contenedorErrores.appendChild(lista);
  contenedorErrores.classList.remove("d-none");
  contenedorErrores.scrollIntoView({ behavior: "smooth", block: "center" });
};

const validarFormulario = function () {
  const errores = [];

  [inputNombre, inputApellidos, inputFechaNac, inputCorreo, inputPassword, inputPasswordRepetir].forEach(
    (campo) => {
      const lleno = campo.value.trim() != "";
      marcarCampo(campo, lleno);
      if (!lleno) errores.push(`El campo "${textoEtiqueta(campo)}" no puede estar vacío`);
    }
  );

  if (inputFechaNac.value != "") {
    const fechaValida = inputFechaNac.value <= fechaHoy();
    marcarCampo(inputFechaNac, fechaValida);
    if (!fechaValida) errores.push("La fecha de nacimiento no puede ser mayor a la fecha actual");
  }

  if (inputCorreo.value.trim() != "") {
    const correoValido = regexCorreo.test(inputCorreo.value.trim());
    marcarCampo(inputCorreo, correoValido);
    if (!correoValido) errores.push("El correo electrónico no tiene un formato válido");
  }

  if (inputPassword.value != "" && inputPasswordRepetir.value != "") {
    const iguales = inputPassword.value == inputPasswordRepetir.value;
    marcarCampo(inputPassword, iguales);
    marcarCampo(inputPasswordRepetir, iguales);
    if (!iguales) errores.push("Las contraseñas no coinciden");
  }

  const interesesMarcados = [...intereses].filter((item) => item.checked);
  intereses.forEach((item) => item.classList.toggle("is-invalid", interesesMarcados.length == 0));
  if (interesesMarcados.length == 0) errores.push("Seleccione al menos un interés");

  const carrera = [...carreras].find((item) => item.checked);
  carreras.forEach((item) => item.classList.toggle("is-invalid", !carrera));
  if (!carrera) errores.push("Seleccione la carrera que estudia");

  const paisValido = cmbPais.value != "";
  marcarCampo(cmbPais, paisValido);
  if (!paisValido) errores.push("Seleccione un país de origen");

  const archivoValido = inputArchivo.files.length > 0;
  marcarCampo(inputArchivo, archivoValido);
  if (!archivoValido) errores.push("Seleccione la imagen de su avatar");

  mostrarErrores(errores);

  if (errores.length > 0) return null;

  return [
    ["Nombres", inputNombre.value.trim()],
    ["Apellidos", inputApellidos.value.trim()],
    ["Fecha de nacimiento", inputFechaNac.value.split("-").reverse().join("/")],
    ["Correo electrónico", inputCorreo.value.trim()],
    ["Contraseña", "•".repeat(inputPassword.value.length)],
    ["Intereses", interesesMarcados.map((item) => textoEtiqueta(item)).join(", ")],
    ["Carrera", textoEtiqueta(carrera)],
    ["País de origen", cmbPais.options[cmbPais.selectedIndex].text],
    ["Avatar", inputArchivo.files[0].name],
  ];
};

const crearTabla = function (datos) {
  const tabla = document.createElement("table");
  tabla.setAttribute("class", "table table-striped table-bordered mb-0");

  const thead = document.createElement("thead");
  const filaTitulo = document.createElement("tr");
  ["Campo", "Información"].forEach((texto) => {
    const th = document.createElement("th");
    th.setAttribute("scope", "col");
    th.appendChild(document.createTextNode(texto));
    filaTitulo.appendChild(th);
  });
  thead.appendChild(filaTitulo);

  const tbody = document.createElement("tbody");
  datos.forEach(([campo, valor]) => {
    const fila = document.createElement("tr");
    const celdaCampo = document.createElement("th");
    celdaCampo.setAttribute("scope", "row");
    celdaCampo.appendChild(document.createTextNode(campo));
    const celdaValor = document.createElement("td");
    celdaValor.appendChild(document.createTextNode(valor));
    fila.appendChild(celdaCampo);
    fila.appendChild(celdaValor);
    tbody.appendChild(fila);
  });

  tabla.appendChild(thead);
  tabla.appendChild(tbody);
  return tabla;
};

button.onclick = () => {
  const datos = validarFormulario();
  if (datos) {
    bodyModal.replaceChildren(crearTabla(datos));
    modal.show();
  }
};

inputFechaNac.setAttribute("max", fechaHoy());
