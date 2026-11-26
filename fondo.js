// GEOMAGNI · fondo de puntos interactivo (WEB-042)
// Retícula fina de puntos detrás del contenido. Al mover el ratón, los puntos cercanos se apartan
// en ondas suaves y vuelven a su sitio. Versión propia, sin librerías.
// Quieto con «reducir movimiento», en pantallas táctiles y cuando la pestaña no está visible.
(() => {
  const PASO = 22;          // separación entre puntos (px CSS)
  const RADIO = 150;        // alcance del efecto alrededor del puntero
  const AMPLITUD = 7;       // desplazamiento máximo (px)
  const COLOR = "rgba(91, 42, 134, 0.20)"; // morado GEOMAGNI, muy tenue
  const TAM = 1.3;          // lado del punto

  const lienzo = document.createElement("canvas");
  lienzo.className = "fondo-puntos";
  lienzo.setAttribute("aria-hidden", "true");
  document.body.prepend(lienzo);
  const ctx = lienzo.getContext("2d");
  if (!ctx) return;

  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fino = window.matchMedia("(hover: hover) and (pointer: fine)");
  let ancho = 0, alto = 0, escala = 1;
  let px = -9999, py = -9999;   // puntero
  let fuerza = 0, objetivo = 0; // intensidad que entra y sale suavemente
  let animando = false, t0 = performance.now();

  function medir() {
    escala = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth; alto = window.innerHeight;
    lienzo.width = Math.round(ancho * escala); lienzo.height = Math.round(alto * escala);
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    dibujar(performance.now());
  }

  function dibujar(ahora) {
    ctx.clearRect(0, 0, ancho, alto);
    ctx.fillStyle = COLOR;
    const t = (ahora - t0) / 1000;
    const r2 = RADIO * RADIO;
    const activo = fuerza > 0.01;
    for (let y = PASO / 2; y < alto + PASO; y += PASO) {
      for (let x = PASO / 2; x < ancho + PASO; x += PASO) {
        let dx = 0, dy = 0;
        if (activo) {
          const vx = x - px, vy = y - py, d2 = vx * vx + vy * vy;
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2), caida = 1 - d / RADIO;
            // onda que se aleja del puntero, atenuada hacia el borde del alcance
            const onda = (0.55 + 0.45 * Math.sin(d * 0.09 - t * 4.2)) * caida * caida;
            const m = AMPLITUD * fuerza * onda / d;
            dx = vx * m; dy = vy * m;
          }
        }
        ctx.fillRect(x + dx - TAM / 2, y + dy - TAM / 2, TAM, TAM);
      }
    }
  }

  function cuadro(ahora) {
    fuerza += (objetivo - fuerza) * 0.08;
    dibujar(ahora);
    if (objetivo > 0 || fuerza > 0.01) requestAnimationFrame(cuadro);
    else { fuerza = 0; animando = false; dibujar(ahora); }
  }

  function arrancar() {
    if (animando || document.hidden || quieto.matches || !fino.matches) return;
    animando = true;
    requestAnimationFrame(cuadro);
  }

  let reposo = 0;
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    px = e.clientX; py = e.clientY;
    objetivo = 1;
    clearTimeout(reposo);
    // si el puntero se queda quieto, las ondas se apagan
    reposo = setTimeout(() => { objetivo = 0; }, 1600);
    arrancar();
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => { objetivo = 0; });
  document.addEventListener("visibilitychange", () => { if (document.hidden) objetivo = 0; });

  let espera = 0;
  window.addEventListener("resize", () => { clearTimeout(espera); espera = setTimeout(medir, 120); });
  medir();
})();
