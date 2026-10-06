// Il Cavaliere — menu mobile, segnaposto foto, reveal, dissolvenza hero → intro.

document.documentElement.classList.add('js');

/* Menu mobile ------------------------------------------------------------ */
const bottone = document.querySelector('.testata__menu');
const nav = document.getElementById('nav');

function chiudiMenu() {
  nav.classList.remove('aperto');
  bottone.setAttribute('aria-expanded', 'false');
}

bottone.addEventListener('click', () => {
  const aperto = nav.classList.toggle('aperto');
  bottone.setAttribute('aria-expanded', String(aperto));
});
nav.addEventListener('click', (e) => { if (e.target.closest('a')) chiudiMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') chiudiMenu(); });

/* Segnaposto --------------------------------------------------------------
   Finché una foto non esiste in /images, al suo posto compare un riquadro
   color sabbia con il nome del file da caricare. */
function segnaposto(img) {
  const vuota = document.createElement('div');
  vuota.className = 'foto__vuota';
  vuota.textContent = img.getAttribute('src');
  img.replaceWith(vuota);
}

document.querySelectorAll('.foto img').forEach((img) => {
  if (img.complete && img.naturalWidth === 0) segnaposto(img);
  else img.addEventListener('error', () => segnaposto(img), { once: true });
});

/* Reveal delle fotografie ------------------------------------------------- */
const osservatore = new IntersectionObserver((voci) => {
  voci.forEach((voce) => {
    if (!voce.isIntersecting) return;
    voce.target.classList.add('visibile');
    osservatore.unobserve(voce.target);
  });
}, { rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.foto').forEach((foto) => osservatore.observe(foto));

/* Dissolvenza hero → intro -------------------------------------------------
   La scena resta ferma sotto l'header per un tratto di scroll (--scena-scroll
   nel CSS). In quel tratto aggiorna due variabili CSS sulla scena:
   --t      0 → 1  avanzamento: la hero svanisce, la foto dell'intro sale
   --testo  0 → 1  il testo dell'intro, che compare nella seconda metà
   I valori inseguono lo scroll con un po' di ritardo, così il moto è morbido. */
const scena = document.querySelector('.scena');
const fissa = document.querySelector('.scena__fissa');
const senzaMoto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (scena && fissa && !senzaMoto) {
  const limita = (n) => Math.min(1, Math.max(0, n));
  let t = 0;
  let meta = 0;
  let frame = null;

  function misura() {
    const tratto = scena.offsetHeight - fissa.offsetHeight;
    // di quanto il blocco fermo è già sceso dentro la scena
    const percorso = fissa.getBoundingClientRect().top - scena.getBoundingClientRect().top;
    meta = tratto > 0 ? limita(percorso / tratto) : 1;
  }

  function passo() {
    t += (meta - t) * 0.08;   // più basso = insegue lo scroll più piano
    if (Math.abs(meta - t) < 0.001) t = meta;
    scena.style.setProperty('--t', t.toFixed(4));
    scena.style.setProperty('--testo', limita((t - 0.5) * 2).toFixed(4));
    scena.classList.toggle('oltre', t > 0.5);
    frame = t === meta ? null : requestAnimationFrame(passo);
  }

  function aggiorna() {
    misura();
    if (!frame) frame = requestAnimationFrame(passo);
  }

  window.addEventListener('scroll', aggiorna, { passive: true });
  window.addEventListener('resize', aggiorna);
  aggiorna();
}

/* Soffi di vento ------------------------------------------------------------
   I soffi sullo sfondo della rotta (vedi css/style.css) si disegnano quando
   entrano nello schermo. Con "riduci movimento" restano fermi e già disegnati. */
const osservaSoffi = new IntersectionObserver((voci) => {
  voci.forEach((voce) => {
    if (!voce.isIntersecting) return;
    voce.target.classList.add('disegnato');
    osservaSoffi.unobserve(voce.target);
  });
}, { rootMargin: '0px 0px -12% 0px' });

// anche la rosa dei venti compare così
document.querySelectorAll('.soffio, .rosa').forEach((soffio) => {
  if (senzaMoto) soffio.querySelectorAll('animate').forEach((moto) => moto.remove());
  osservaSoffi.observe(soffio);
});
