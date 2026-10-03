// ConvenPos · Una caja para cada tarea. Sin dependencias, sin cookies, sin almacenamiento ni analítica.
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Revelado al entrar en pantalla */
  const reveladores = $$("[data-rev]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entradas) => {
      for (const e of entradas) if (e.isIntersecting) { e.target.classList.add("dentro"); io.unobserve(e.target); }
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveladores.forEach((el) => io.observe(el));
  } else reveladores.forEach((el) => el.classList.add("dentro"));

  /* El muro de cajas: pestañas con teclado completo y atajos 1 a 8 */
  const lista = $('[role="tablist"]');
  const cajas = $$('[role="tab"]', lista);
  const paneles = cajas.map((c) => document.getElementById(c.getAttribute("aria-controls")));
  paneles.forEach((p, i) => { p.hidden = cajas[i].getAttribute("aria-selected") !== "true"; });

  function abrir(i, { enfocar = false, desplazar = false } = {}) {
    cajas.forEach((c, k) => {
      const activa = k === i;
      c.setAttribute("aria-selected", String(activa));
      c.tabIndex = activa ? 0 : -1;
      paneles[k].hidden = !activa;
    });
    const panel = paneles[i];
    panel.classList.remove("abre");
    if (!reducido.matches) { void panel.offsetWidth; panel.classList.add("abre"); }
    if (enfocar) cajas[i].focus();
    if (desplazar) {
      const r = panel.getBoundingClientRect();
      if (r.top > innerHeight * 0.8 || r.bottom < 0) panel.scrollIntoView({ behavior: reducido.matches ? "auto" : "smooth", block: "start" });
    }
  }
  cajas.forEach((c, i) => c.addEventListener("click", () => abrir(i)));
  lista.addEventListener("keydown", (e) => {
    const actual = cajas.findIndex((c) => c.getAttribute("aria-selected") === "true");
    const columnas = getComputedStyle(lista).gridTemplateColumns.split(" ").length;
    let destino = null;
    if (e.key === "ArrowRight") destino = (actual + 1) % cajas.length;
    else if (e.key === "ArrowLeft") destino = (actual - 1 + cajas.length) % cajas.length;
    else if (e.key === "ArrowDown") destino = Math.min(actual + columnas, cajas.length - 1);
    else if (e.key === "ArrowUp") destino = Math.max(actual - columnas, 0);
    else if (e.key === "Home") destino = 0;
    else if (e.key === "End") destino = cajas.length - 1;
    if (destino === null) return;
    e.preventDefault();
    abrir(destino, { enfocar: true });
  });
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    if (e.key >= "1" && e.key <= "8") { e.preventDefault(); abrir(Number(e.key) - 1, { desplazar: true }); }
  });
})();
