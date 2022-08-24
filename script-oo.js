const juego = {
  timerId: 0,
  timerObstaculos: 0,
  gravedad: 2,
  skyHeight: 580,


  aleatorio: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  verificaColision: function () {
    if (bird.colision()) {
      juego.terminar();
    }
  },

  loop: function () {
    bird.efectoGravedad();
    obstaculos.mover();
    bird.dibujar() //nuevo
    obstaculos.dibujar() //nuevo
    juego.verificaColision();
  },

  iniciar: function () {
    audio.crearAudio();
    document.addEventListener("keyup", bird.mover);
    obstaculos.crearObstaculo();
    bird.dibujar();
    juego.timerObstaculos = setInterval(obstaculos.crearObstaculo, 3000);
    juego.timerId = setInterval(juego.loop, 20);
  },

  terminar: function () {
    audio.effects.die.play();

    clearInterval(juego.timerId);
    clearInterval(juego.timerObstaculos);
    juego.mostrarGameOver();
    juego.pararEfectos();
  },

  mostrarGameOver: function () {
    const mensaje = document.querySelector(".message");
    mensaje.setAttribute("id", "game-over");
  },

  pararEfectos: function () {
    let ground = document.querySelector(".ground");
    ground.removeAttribute("id");

    bird.div.removeAttribute("id");
    bird.div.setAttribute("id", "fall");
  },
};

const contador = {
  // div: document.querySelector(".contador"),
  unidades: document.querySelector("#unidades"),
  decenas: document.querySelector("#decenas"),
  puntaje: 0,
  actualizarContador: function (parObstaculos) {
    if (bird.left == parObstaculos.left) {
      contador.puntaje += 1;
      audio.effects.point.play();
      console.log("puntaje: " + contador.puntaje);

      let digitos = contador.puntaje.toString().split("").reverse();

      contador.unidades.src = "img/" + digitos[0] + ".png";

      if (digitos.length > 1) {
        contador.decenas.src = "img/" + digitos[1] + ".png";
      }
    }
  },
};

const bird = {
  div: document.querySelector(".bird"),
  bottom: juego.aleatorio(10, 570),
  left: 250,
  width: 60,
  height: 45,

  efectoGravedad: function () {
    bird.bottom -= juego.gravedad;
    // bird.dibujar()
    // bird.div.style.bottom = bird.bottom + "px";
  },

  dibujar: function () {
    bird.div.style.bottom = bird.bottom + "px";
    bird.div.style.left = bird.left + "px";
  },

  mover: function () {
    bird.bottom += 40;
    // bird.dibujar()
    // bird.div.style.bottom = bird.bottom + "px";
    audio.effects.wing.play();
  },

  colisionY: function (parObstaculos) {
    if (
      (bird.bottom < parObstaculos.bottomObstacleHeight &&
        bird.bottom >= parObstaculos.bottomObstacleBottom) ||
      (bird.bottom + bird.height > parObstaculos.topObstacleBottom &&
        bird.bottom + bird.height <
          parObstaculos.topObstacleBottom + parObstaculos.topObstacleHeight)
    ) {
      console.log("colisionY");
      return true;
    }
  },

  colisionX: function (parObstaculos) {
    if (
      (bird.left + bird.width > parObstaculos.left &&
        bird.left + bird.width <= parObstaculos.left + parObstaculos.width) ||
      (bird.left > parObstaculos.left &&
        bird.left < parObstaculos.left + parObstaculos.width)
    ) {
      console.log("colisionX");
      return true;
    }
  },

  colision: function () {
    obstaculos.lista.forEach((obs) => {
      if (bird.colisionX(obs) && bird.colisionY(obs)) {
        obs.topObstacle.setAttribute("id", "colision");
        obs.bottomObstacle.setAttribute("id", "colision");
        audio.effects.hit.play();
        juego.terminar();
      }
    });

    if (bird.bottom < 0) {
      audio.effects.hit.play();
      juego.terminar();
    }
  },
};

const obstaculos = {
  obstacleContainer: document.querySelector(".obstacles"),
  velocidad: 1,
  gap: 200,
  maxHeight: 320,
  minHeight: 50,
  width: 52,
  lista: [],

  crearObstaculo: function () {
    const topObstacle = document.createElement("div");
    const bottomObstacle = document.createElement("div");
    topObstacle.classList.add("topObstacle");
    bottomObstacle.classList.add("bottomObstacle");
    obstaculos.obstacleContainer.appendChild(topObstacle);
    obstaculos.obstacleContainer.appendChild(bottomObstacle);

    topObstacleHeight = Math.max(
      Math.random() * obstaculos.maxHeight,
      obstaculos.minHeight
    );
    bottomObstacleHeight = Math.min(
      juego.skyHeight - topObstacleHeight - obstaculos.gap,
      obstaculos.maxHeight
    );

    const parObstaculos = {
      topObstacle: topObstacle,
      bottomObstacle: bottomObstacle,
      left: window.innerWidth,
      width: obstaculos.width,
      topObstacleHeight: topObstacleHeight,
      bottomObstacleHeight: bottomObstacleHeight,
      topObstacleBottom: juego.skyHeight - topObstacleHeight,
      bottomObstacleBottom: 0,
    };
    obstaculos.dibujar(parObstaculos);
    obstaculos.lista.push(parObstaculos);
  },

  eliminarObstaculo: function (parObstaculos) {
    if (parObstaculos.left + obstaculos.width < 0) {
      parObstaculos.bottomObstacle.remove();
      parObstaculos.topObstacle.remove();
      obstaculos.lista.shift();
      console.log(obstaculos.lista.length);
    }
  },

  mover: function () {
    for (var i = 0; i < obstaculos.lista.length; i++) {
      obstaculos.lista[i].left -= obstaculos.velocidad;

      // obstaculos.dibujar(obstaculos.lista[i]);
      obstaculos.eliminarObstaculo(obstaculos.lista[i]);
      contador.actualizarContador(obstaculos.lista[i]);
    }
  },

  dibujar: function() {
    for (var i=0; i< obstaculos.lista.length; i++) {
      obstaculos.lista[i].topObstacle.style.left = obstaculos.lista[i].left + "px";
      obstaculos.lista[i].bottomObstacle.style.left = obstaculos.lista[i].left + "px";
  
      obstaculos.lista[i].topObstacle.style.height =
        obstaculos.lista[i].topObstacleHeight + "px";
      obstaculos.lista[i].bottomObstacle.style.height =
        obstaculos.lista[i].bottomObstacleHeight + "px";
    }
  },

  // dibujar: function (parObstaculos) {
  //   parObstaculos.topObstacle.style.left = parObstaculos.left + "px";
  //   parObstaculos.bottomObstacle.style.left = parObstaculos.left + "px";

  //   parObstaculos.topObstacle.style.height =
  //     parObstaculos.topObstacleHeight + "px";
  //   parObstaculos.bottomObstacle.style.height =
  //     parObstaculos.bottomObstacleHeight + "px";
  // },
};

const audio = {
  effects: {},

  crearAudio: function () {
    const wing = new Audio("audio/audio_wing.wav");
    audio.effects.wing = wing;

    const hit = new Audio("audio/audio_hit.wav");
    audio.effects.hit = hit;

    const die = new Audio("audio/audio_die.wav");
    audio.effects.die = die;

    const point = new Audio("audio/audio_point.wav");
    audio.effects.point = point;
  },
};

juego.iniciar();
