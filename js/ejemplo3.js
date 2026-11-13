const primerColorFondo = function (event) {
  document.body.style.backgroundColor = event.target.value;
};

const cambiarColorFondo = function (event) {
  document.body.style.backgroundColor = event.target.value;
};

const primerColorTitulos = function (event) {
  let colorSeleccionado = event.target.value;
  const titulos = document.querySelectorAll("h1");
  for (let index = 0; index < titulos.length; index++) {
    titulos[index].style.color = colorSeleccionado;
  }
};

const cambiarColorTitulos = function (event) {
  const colorSeleccionado = event.target.value;
  const titulos = document.querySelectorAll("h1");
  for (let index = 0; index < titulos.length; index++) {
    titulos[index].style.color = colorSeleccionado;
  }
};

const primerColorParrafos = function (event) {
  let colorSeleccionado = event.target.value;
  const parrafos = document.querySelectorAll("p");
  for (let index = 0; index < parrafos.length; index++) {
    parrafos[index].style.color = colorSeleccionado;
  }
};

const cambiarColorParrafos = function (event) {
  const colorSeleccionado = event.target.value;
  const parrafos = document.querySelectorAll("p");
  for (let index = 0; index < parrafos.length; index++) {
    parrafos[index].style.color = colorSeleccionado;
  }
};

let tamanioLetra = 1;

const aplicarTamanioLetra = function () {
  document.body.style.fontSize = `${tamanioLetra}rem`;
  const parrafos = document.querySelectorAll("p");
  for (let index = 0; index < parrafos.length; index++) {
    parrafos[index].style.fontSize = `${tamanioLetra * 1.25}rem`;
  }
  const titulos = document.querySelectorAll("h1");
  for (let index = 0; index < titulos.length; index++) {
    titulos[index].style.fontSize = `${tamanioLetra * 3}rem`;
  }
};

const aumentarLetra = function () {
  tamanioLetra += 0.05;
  aplicarTamanioLetra();
};

const disminuirLetra = function () {
  if (tamanioLetra > 0.5) {
    tamanioLetra -= 0.05;
  }
  aplicarTamanioLetra();
};

const startDOM = () => {
  const buttonFondo = document.getElementById("idFondo");
  buttonFondo.value = "#ffffff";
  buttonFondo.addEventListener("input", primerColorFondo, false);
  buttonFondo.addEventListener("change", cambiarColorFondo, false);
  buttonFondo.select();

  const buttonTitulos = document.getElementById("idTitulos");
  buttonTitulos.value = "#000000";
  buttonTitulos.addEventListener("input", primerColorTitulos, false);
  buttonTitulos.addEventListener("change", cambiarColorTitulos, false);
  buttonTitulos.select();

  const buttonParrafos = document.getElementById("idParrafos");
  buttonParrafos.value = "#000000";
  buttonParrafos.addEventListener("input", primerColorParrafos, false);
  buttonParrafos.addEventListener("change", cambiarColorParrafos, false);
  buttonParrafos.select();

  const buttonAumentar = document.getElementById("idBtnAumentar");
  const buttonDisminuir = document.getElementById("idBtnDisminuir");

  buttonAumentar.addEventListener("click", aumentarLetra, false);
  buttonDisminuir.addEventListener("click", disminuirLetra, false);
};

startDOM();
