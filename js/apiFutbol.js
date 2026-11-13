const API_HOST = "api-football-v1.p.rapidapi.com";
const API_URL = `https://${API_HOST}/v3`;
const CLAVE_STORAGE = "guia7_rapidapi_key";

const inputKey = document.getElementById("idApiKey");
const cmbLiga = document.getElementById("idCmbLiga");
const cmbTemporada = document.getElementById("idCmbTemporada");
const buttonGuardarKey = document.getElementById("idBtnGuardarKey");
const buttonCargar = document.getElementById("idBtnCargar");
const contenedorEstado = document.getElementById("idEstado");
const contenedorEquipos = document.getElementById("idEquipos");
const contenedorDetalle = document.getElementById("idDetalle");

const leerKey = function () {
  try {
    return localStorage.getItem(CLAVE_STORAGE) || "";
  } catch (error) {
    return "";
  }
};

const guardarKey = function (valor) {
  try {
    localStorage.setItem(CLAVE_STORAGE, valor);
  } catch (error) {
    return;
  }
};

const mostrarEstado = function (texto, tipo = "info", cargando = false) {
  contenedorEstado.replaceChildren();
  if (!texto) {
    contenedorEstado.classList.add("d-none");
    return;
  }

  contenedorEstado.className = `alert alert-${tipo} d-flex align-items-center gap-2`;
  if (cargando) {
    const spinner = document.createElement("span");
    spinner.setAttribute("class", "spinner-border spinner-border-sm");
    spinner.setAttribute("role", "status");
    contenedorEstado.appendChild(spinner);
  }
  contenedorEstado.appendChild(document.createTextNode(texto));
};

const consultarApi = async function (ruta) {
  const key = inputKey.value.trim();
  if (key == "") {
    throw new Error("Ingrese su API Key de RapidAPI para consultar la información");
  }

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": API_HOST,
      },
    });
  } catch (error) {
    throw new Error("No se pudo conectar con la API. Revise su conexión a internet");
  }

  if (respuesta.status == 401 || respuesta.status == 403) {
    throw new Error("La API Key no es válida o no está suscrito al plan gratuito de API-Football en RapidAPI");
  }
  if (respuesta.status == 429) {
    throw new Error("Se alcanzó el límite de solicitudes del plan gratuito. Intente más tarde");
  }
  if (!respuesta.ok) {
    throw new Error(`La API respondió con un error (${respuesta.status})`);
  }

  const datos = await respuesta.json();
  const errores = Array.isArray(datos.errors) ? datos.errors : Object.values(datos.errors || {});
  if (errores.length > 0) {
    throw new Error(`La API devolvió un error: ${errores.join(" ")}`);
  }
  return datos.response || [];
};

const crearElemento = function (etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.setAttribute("class", clase);
  if (texto != undefined) elemento.textContent = texto;
  return elemento;
};

const crearTarjetaEquipo = function ({ team, venue }) {
  const columna = crearElemento("div", "col");
  const tarjeta = crearElemento("button", "card h-100 w-100 text-start tarjeta-equipo");
  tarjeta.setAttribute("type", "button");
  tarjeta.dataset.id = team.id;

  const cuerpo = crearElemento("div", "card-body d-flex align-items-center gap-3");
  const escudo = crearElemento("img", "escudo");
  escudo.setAttribute("src", team.logo);
  escudo.setAttribute("alt", `Escudo de ${team.name}`);
  escudo.setAttribute("loading", "lazy");

  const texto = crearElemento("div");
  texto.appendChild(crearElemento("h5", "card-title mb-1", team.name));
  texto.appendChild(crearElemento("small", "text-muted", venue && venue.city ? venue.city : team.country));

  cuerpo.appendChild(escudo);
  cuerpo.appendChild(texto);
  tarjeta.appendChild(cuerpo);
  columna.appendChild(tarjeta);
  return columna;
};

const cargarEquipos = async function () {
  contenedorDetalle.replaceChildren();
  contenedorEquipos.replaceChildren();
  buttonCargar.disabled = true;
  mostrarEstado("Cargando equipos...", "info", true);

  try {
    const equipos = await consultarApi(
      `/teams?league=${cmbLiga.value}&season=${cmbTemporada.value}`
    );

    if (equipos.length == 0) {
      mostrarEstado("No se encontraron equipos para la liga y temporada seleccionadas", "warning");
      return;
    }

    equipos
      .sort((a, b) => a.team.name.localeCompare(b.team.name))
      .forEach((equipo) => contenedorEquipos.appendChild(crearTarjetaEquipo(equipo)));

    mostrarEstado(
      `${equipos.length} equipos de ${cmbLiga.options[cmbLiga.selectedIndex].text}. Seleccione uno para ver su detalle`,
      "success"
    );
  } catch (error) {
    mostrarEstado(error.message, "danger");
  } finally {
    buttonCargar.disabled = false;
  }
};

const crearDato = function (titulo, valor) {
  const item = crearElemento("li", "list-group-item d-flex justify-content-between gap-3");
  item.appendChild(crearElemento("span", "fw-bold", titulo));
  item.appendChild(crearElemento("span", "text-end", valor || "No disponible"));
  return item;
};

const crearTablaJugadores = function (jugadores) {
  const tabla = crearElemento("table", "table table-sm table-striped align-middle mb-0");
  const thead = crearElemento("thead");
  const filaTitulo = crearElemento("tr");
  ["", "#", "Jugador", "Posición", "Edad"].forEach((titulo) =>
    filaTitulo.appendChild(crearElemento("th", null, titulo))
  );
  thead.appendChild(filaTitulo);

  const tbody = crearElemento("tbody");
  jugadores.forEach((jugador) => {
    const fila = crearElemento("tr");
    const celdaFoto = crearElemento("td");
    const foto = crearElemento("img", "foto-jugador");
    foto.setAttribute("src", jugador.photo);
    foto.setAttribute("alt", jugador.name);
    foto.setAttribute("loading", "lazy");
    celdaFoto.appendChild(foto);
    fila.appendChild(celdaFoto);
    fila.appendChild(crearElemento("td", null, jugador.number ?? "-"));
    fila.appendChild(crearElemento("td", null, jugador.name));
    fila.appendChild(crearElemento("td", null, jugador.position));
    fila.appendChild(crearElemento("td", null, jugador.age ?? "-"));
    tbody.appendChild(fila);
  });

  tabla.appendChild(thead);
  tabla.appendChild(tbody);
  return tabla;
};

const cargarDetalle = async function (idEquipo) {
  document.querySelectorAll(".tarjeta-equipo").forEach((tarjeta) =>
    tarjeta.classList.toggle("seleccionada", tarjeta.dataset.id == idEquipo)
  );
  contenedorDetalle.replaceChildren();
  mostrarEstado("Cargando detalle del equipo...", "info", true);

  try {
    const [infoEquipo, plantilla] = await Promise.all([
      consultarApi(`/teams?id=${idEquipo}`),
      consultarApi(`/players/squads?team=${idEquipo}`),
    ]);

    if (infoEquipo.length == 0) {
      mostrarEstado("No se encontró información del equipo seleccionado", "warning");
      return;
    }

    const { team, venue } = infoEquipo[0];
    const jugadores = plantilla.length > 0 ? plantilla[0].players : [];

    const tarjeta = crearElemento("div", "card shadow-sm");
    const encabezado = crearElemento("div", "card-header d-flex align-items-center gap-3");
    const escudo = crearElemento("img", "escudo-grande");
    escudo.setAttribute("src", team.logo);
    escudo.setAttribute("alt", `Escudo de ${team.name}`);
    encabezado.appendChild(escudo);
    encabezado.appendChild(crearElemento("h2", "h4 mb-0", team.name));

    const cuerpo = crearElemento("div", "card-body row g-4");
    const columnaInfo = crearElemento("div", "col-lg-4");
    if (venue && venue.image) {
      const estadio = crearElemento("img", "img-fluid rounded mb-3");
      estadio.setAttribute("src", venue.image);
      estadio.setAttribute("alt", venue.name || "Estadio");
      columnaInfo.appendChild(estadio);
    }
    const lista = crearElemento("ul", "list-group");
    lista.appendChild(crearDato("País", team.country));
    lista.appendChild(crearDato("Fundación", team.founded ? String(team.founded) : ""));
    lista.appendChild(crearDato("Código", team.code));
    lista.appendChild(crearDato("Estadio", venue ? venue.name : ""));
    lista.appendChild(crearDato("Ciudad", venue ? venue.city : ""));
    lista.appendChild(
      crearDato("Capacidad", venue && venue.capacity ? venue.capacity.toLocaleString("es-SV") : "")
    );
    columnaInfo.appendChild(lista);

    const columnaJugadores = crearElemento("div", "col-lg-8");
    columnaJugadores.appendChild(crearElemento("h3", "h5", `Plantilla (${jugadores.length} jugadores)`));
    if (jugadores.length > 0) {
      const envoltura = crearElemento("div", "table-responsive tabla-jugadores");
      envoltura.appendChild(crearTablaJugadores(jugadores));
      columnaJugadores.appendChild(envoltura);
    } else {
      columnaJugadores.appendChild(crearElemento("p", "text-muted", "La API no tiene la plantilla de este equipo"));
    }

    cuerpo.appendChild(columnaInfo);
    cuerpo.appendChild(columnaJugadores);
    tarjeta.appendChild(encabezado);
    tarjeta.appendChild(cuerpo);
    contenedorDetalle.appendChild(tarjeta);

    mostrarEstado(`Detalle de ${team.name} cargado correctamente`, "success");
    contenedorDetalle.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    mostrarEstado(error.message, "danger");
  }
};

contenedorEquipos.addEventListener("click", (e) => {
  const tarjeta = e.target.closest(".tarjeta-equipo");
  if (tarjeta) cargarDetalle(tarjeta.dataset.id);
});

buttonGuardarKey.onclick = () => {
  guardarKey(inputKey.value.trim());
  mostrarEstado("La API Key se guardó solo en este navegador", "success");
};

buttonCargar.onclick = () => {
  cargarEquipos();
};

inputKey.value = leerKey();
