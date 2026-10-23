
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const stage = $('#stage');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const D = (ms) => reduce ? Math.min(ms, 250) : ms;
const EASE = 'cubic-bezier(.22,.8,.2,1)', EASE_IO = 'cubic-bezier(.65,0,.35,1)';

/* ───── escala do palco 1920×1080 */
function fit() {
  const vv = window.visualViewport, w = vv ? vv.width : innerWidth, h = vv ? vv.height : innerHeight;
  const s = Math.min(w / 1920, h / 1080);
  stage.style.transformOrigin = 'center center';
  stage.style.left = (w / 2) + 'px'; stage.style.top = (h / 2) + 'px';
  stage.style.transform = `translate(-50%,-50%) scale(${s})`;
}
addEventListener('resize', fit); addEventListener('orientationchange', () => setTimeout(fit, 250));
if (window.visualViewport) visualViewport.addEventListener('resize', fit);
fit();

/* ───── animações: registro para pausar, concluir e reiniciar */
let paused = false;
const ambient = new Set();
function anim(el, kf, opt, isAmbient) {
  const a = el.animate(kf, Object.assign({ fill: 'forwards', easing: EASE }, opt, { duration: D(opt.duration || 800) }));
  if (isAmbient) { ambient.add(a); a.finished.then(() => ambient.delete(a)).catch(() => {}); }
  if (paused) a.pause();
  return a;
}
const counters = new Set();
function count(el, to, fmt, dur = 1400) {
  const c = { el, to, fmt, t0: performance.now(), dur: D(dur), done: false, elapsed: 0 };
  counters.add(c);
  const tick = (now) => {
    if (c.done) return;
    if (paused) { c.t0 = now - c.elapsed; return requestAnimationFrame(tick); }
    c.elapsed = now - c.t0;
    const p = Math.min(1, c.elapsed / c.dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(to * e);
    if (p < 1) requestAnimationFrame(tick); else { c.done = true; counters.delete(c); }
  };
  requestAnimationFrame(tick);
}
const staged = (a) => !ambient.has(a) && a.effect && a.effect.target && stage.contains(a.effect.target)
  && !(window.CSSTransition && a instanceof CSSTransition) && a.effect.getComputedTiming().iterations !== Infinity;
function busy() {
  return pending.size > 0 || counters.size > 0 || document.getAnimations().some(a => staged(a) && a.playState === 'running');
}
function finishAll() {
  flushPending();
  document.getAnimations().forEach(a => { if (staged(a)) { try { a.finish(); } catch (e) {} } });
  counters.forEach(c => { c.done = true; c.el.textContent = c.fmt(c.to); }); counters.clear();
  document.getAnimations().forEach(a => { if (staged(a)) { try { a.finish(); } catch (e) {} } });
}
function killAll(scope) {
  scope.getAnimations({ subtree: true }).forEach(a => a.cancel());
  counters.forEach(c => { if (scope.contains(c.el)) { c.done = true; counters.delete(c); } });
}
const pending = new Set();
function later(fn, ms) { const o = { fn }; o.id = setTimeout(() => { pending.delete(o); fn(); }, D(ms)); pending.add(o); }
function flushPending() { [...pending].forEach(o => { clearTimeout(o.id); pending.delete(o); o.fn(); }); }
function dropPending() { pending.forEach(o => clearTimeout(o.id)); pending.clear(); }
const fmtInt = (v) => Math.round(v).toLocaleString('pt-BR');

/* ───── utilitários de revelação */
const rise = (el, delay = 0, dur = 1000) => anim(el, [{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], { duration: dur, delay });
const sink = (el, delay = 0, dur = 700) => anim(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-105%)' }], { duration: dur, delay, easing: EASE_IO });
const fadeIn = (el, delay = 0, dur = 800) => anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: dur, delay });
const fadeOut = (el, delay = 0, dur = 600) => anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: dur, delay });
const draw = (el, delay = 0, dur = 1600) => anim(el, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: dur, delay, easing: EASE_IO });
function setDash(el, v) { el.style.strokeDasharray = '1'; el.style.strokeDashoffset = v; }

/* ───────────────── CENA 1 · ABERTURA: Morro → luz do sol → Boipeba → a marca */
const s1 = {
  id: 's1', title: 'Abertura', steps: 1, el: $('#s1'),
  notes: 'Abertura de cerca de 10 segundos: Morro do alto, um clarão de sol leva a Boipeba e a marca se revela. Deixar rodar sem falar. Quando o slogan aparecer, agradecer à organização do BTM e aos parceiros presentes.',
  reset() {
    const e = this.el; killAll(e);
    $('#s1a').style.opacity = 0; $('#s1b').style.opacity = 0; $('#s1b').style.filter = '';
    $('.o1-flare', e).style.opacity = 0; $('.o1-veil', e).style.opacity = 0;
    const lg = $('.o1-logo', e); lg.style.opacity = 0; lg.style.clipPath = 'inset(0 50% 0 50%)';
    $('.o1-glint', e).style.backgroundPosition = '120% 0';
    $$('.o1-where, .o1-kicker', e).forEach(x => x.style.opacity = 0);
    ['#s1w1', '#s1w2'].forEach(s => setDash($(s), 1));
    $$('.bar', e).forEach(b => b.style.transform = '');
  },
  show(i, animate) {
    const e = this.el;
    if (!animate) { this.reset(); this.final(); return; }
    this.reset();
    const A = $('#s1a'), B = $('#s1b');
    // 1 · Morro, do alto
    anim(A, [{ opacity: 0 }, { opacity: 1 }], { duration: 1800, easing: 'ease-out' });
    anim($('img', A), [{ transform: 'scale(1.24) translate(1.5%,1%)' }, { transform: 'scale(1.06) translate(-1%,0)' }], { duration: 9000, easing: 'linear' }, true);
    anim($('.o1-kicker', e), [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 1000, delay: 900 });
    // 2 · o clarão do sol leva a Boipeba
    const F = $('.o1-flare', e);
    anim(F, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1.15)' }], { duration: 900, delay: 2900, easing: 'ease-in' });
    anim(B, [{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: 3780 });
    anim(F, [{ opacity: 1, transform: 'scale(1.15)' }, { opacity: 0, transform: 'scale(1.5)' }], { duration: 1500, delay: 3800, easing: 'ease-out' });
    anim($('img', B), [{ transform: 'scale(1.16) translate(-1.5%,0)' }, { transform: 'scale(1.03) translate(1%,0)' }], { duration: 9000, delay: 3700, easing: 'linear' }, true);
    // 3 · a paisagem recua, a marca assume
    anim($('.o1-kicker', e), [{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: 5600 });
    anim(B, [{ filter: 'blur(0px) brightness(1)' }, { filter: 'blur(7px) brightness(.62)' }], { duration: 2200, delay: 5800, easing: EASE_IO });
    anim($('.o1-veil', e), [{ opacity: 0 }, { opacity: 1 }], { duration: 2200, delay: 5800, easing: EASE_IO });
    $$('.bar', e).forEach((b, k) => anim(b, [{ transform: 'translateY(0)' }, { transform: `translateY(${k ? '' : '-'}100%)` }], { duration: 1600, delay: 6000, easing: EASE_IO }));
    const L = $('.o1-logo', e);
    anim(L, [{ opacity: 0, filter: 'blur(22px)', transform: 'scale(1.08)', clipPath: 'inset(0 50% 0 50%)' },
             { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)', clipPath: 'inset(0 0% 0 0%)' }], { duration: 2000, delay: 6500, easing: EASE });
    anim($('.o1-glint', e), [{ backgroundPosition: '120% 0' }, { backgroundPosition: '-20% 0' }], { duration: 1600, delay: 8100, easing: EASE_IO });
    anim($('.o1-where', e), [{ opacity: 0, transform: 'translateY(18px)', letterSpacing: '.02em' }, { opacity: 1, transform: 'translateY(0)', letterSpacing: '0em' }], { duration: 1400, delay: 8500 });
    draw($('#s1w1'), 8300, 2400); draw($('#s1w2'), 8600, 2400);
  },
  final() {
    const e = this.el, B = $('#s1b');
    $('#s1a').style.opacity = 1; B.style.opacity = 1; B.style.filter = 'blur(7px) brightness(.62)';
    $('img', B).style.transform = 'scale(1.03)';
    $('.o1-veil', e).style.opacity = 1;
    $$('.bar', e).forEach((b, k) => b.style.transform = `translateY(${k ? '' : '-'}100%)`);
    const L = $('.o1-logo', e); L.style.opacity = 1; L.style.clipPath = 'inset(0 0% 0 0%)';
    $('.o1-where', e).style.opacity = 1;
    ['#s1w1', '#s1w2'].forEach(s => setDash($(s), 0));
  }
};

/* ───────────────── CENA 2 */
const FMT = { ordinal: v => Math.max(1, Math.round(v)) + 'º', inteiro: v => Math.round(v).toLocaleString('pt-BR'), pct: v => Math.round(v) + '%', mil: v => Math.round(v).toLocaleString('pt-BR') + ' mil' };
const STATS = DADOS.indicadores.filter(d => d.valor !== null && d.valor !== undefined).map(d => ({ n: d.valor, fmt: FMT[d.formato], lab: d.rotulo }));
$('#ledger').innerHTML = STATS.map(x => `<li><b>${x.fmt(x.n)}</b><span>${x.lab}</span></li>`).join('');
const s2 = {
  id: 's2', title: 'A dimensão do destino', steps: STATS.length,
  notes: 'Um indicador por clique, na ordem do arquivo de dados. O número de visitantes só aparece depois de preenchido com o dado oficial (data/dados.js). A linha da maré sobe a cada número.',
  el: $('#s2'), cur: -1,
  reset() {
    killAll(this.el); this.cur = -1;
    $$('.ledger li', this.el).forEach(li => li.className = '');
    $('.tide2', this.el).style.transform = 'translateY(0)';
    $('#heroNum').parentElement.firstElementChild.style.transform = 'translateY(105%)';
    $('#heroLab').style.transform = 'translateY(105%)';
    $('.scene-name', this.el).style.opacity = 0;
  },
  ledger(i) {
    $$('.ledger li', this.el).forEach((li, k) => { li.className = k < i ? 'lit' : k === i ? 'lit now' : ''; });
    anim($('.tide2', this.el), [{ transform: getComputedStyle($('.tide2', this.el)).transform === 'none' ? 'translateY(0)' : getComputedStyle($('.tide2', this.el)).transform }, { transform: `translateY(${-55 * (i + 1)}px)` }], { duration: 1600, easing: EASE_IO });
  },
  show(i, animate, dir) {
    const num = $('#heroNum'), lab = $('#heroLab'), st = STATS[i];
    if (!animate) {
      killAll(this.el);
      num.textContent = st.fmt(st.n); lab.textContent = st.lab;
      num.style.transform = lab.style.transform = 'translateY(0)';
      $('.scene-name', this.el).style.opacity = 1;
      $$('.ledger li', this.el).forEach((li, k) => { li.className = k < i ? 'lit' : k === i ? 'lit now' : ''; });
      $('.tide2', this.el).style.transform = `translateY(${-55 * (i + 1)}px)`;
      this.cur = i; return;
    }
    const first = this.cur < 0;
    const out = first ? 0 : 650;
    if (first) {
      anim($('.bg img', this.el), [{ transform: 'scale(1.3)', filter: 'blur(10px)' }, { transform: 'scale(1.06)', filter: 'blur(0px)' }], { duration: 1800, easing: EASE });
      anim($('.bg img', this.el), [{ transform: 'scale(1.06)' }, { transform: 'scale(1.0)' }], { duration: 20000, delay: 1800, easing: 'linear' }, true);
      fadeIn($('.scene-name', this.el), 600, 900);
    } else { sink(num, 0, 600); sink(lab, 60, 600); }
    later(() => {
      num.textContent = st.fmt(0); lab.textContent = st.lab;
      rise(num, 0, 900); rise(lab, 150, 900);
      count(num, st.n, st.fmt, i === 0 ? 900 : 1500);
    }, out + (first ? 500 : 0));
    this.ledger(i); this.cur = i;
  }
};

/* ───────────────── CENA 3 */
const CAM = [
  { s: 1, fx: 960, fy: 540, sx: 960, sy: 540 },
  { s: 1.1, fx: 1380, fy: 530, sx: 1300, sy: 560 },
  { s: 1.05, fx: 1150, fy: 480, sx: 1260, sy: 540 },
  { s: 1.15, fx: 1320, fy: 560, sx: 1270, sy: 540 },
  { s: 1, fx: 960, fy: 540, sx: 960, sy: 540 },
];
const camT = (c) => `translate(${c.sx - c.fx * c.s}px, ${c.sy - c.fy * c.s}px) scale(${c.s})`;
let planeRaf = 0;
const s3 = {
  id: 's3', title: 'Como chegar', steps: 5,
  notes: 'Mapa esquemático. 1) Visão geral: três formas de chegar. 2) Marítimo direto, saindo do Terminal Marítimo de Salvador: catamarã até o píer de Morro e lancha direta até Boipeba (cerca de 2h a 2h30; operação autorizada pela Agerba desde o fim de 2024). 3) Semiterrestre: van executiva até a baía e lancha até Morro ou Boipeba. 4) Aéreo: aeronaves de pequeno porte até as pistas da Terceira Praia e de Boipeba. 5) As três juntas: o cliente escolhe pelo tempo e pelo orçamento.',
  el: $('#s3'), cur: -1,
  routes: { 1: ['#vCat', '#vBoi'], 2: ['#vVan', '#vBoat', '#vBoat2'], 3: ['#vAir1', '#vAir2'] },
  pins: { 1: '#pinTerm', 2: '#pinEmb', 3: '#pinAir' },
  reset() {
    killAll(this.el); cancelAnimationFrame(planeRaf); this.cur = -1;
    $$('.reveal', this.el).forEach(p => setDash(p, 1));
    ['#pinTerm', '#pinEmb', '#pinAir', '#plane'].forEach(s => $(s).classList.add('hide'));
    $$('.card', this.el).forEach(c => { c.style.opacity = 0; c.style.transform = 'translateY(30px)'; });
    $('#cam').style.transform = camT(CAM[0]);
  },
  state(i) {
    for (let k = 1; k <= 3; k++) {
      const on = i === 4 ? true : k <= i;
      this.routes[k].forEach(s => setDash($(s), on ? 0 : 1));
      $(this.pins[k]).classList.toggle('hide', !on);
    }
  },
  fly() {
    cancelAnimationFrame(planeRaf);
    const plane = $('#plane'), path = $('#air1'), L = path.getTotalLength(), t0 = performance.now(), dur = D(2600);
    plane.classList.remove('hide');
    let held = 0, last = t0;
    const step = (now) => {
      if (paused) { held += now - last; last = now; planeRaf = requestAnimationFrame(step); return; }
      last = now;
      const p = Math.min(1, (now - t0 - held) / dur), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const a = path.getPointAtLength(L * e), b = path.getPointAtLength(Math.min(L, L * e + 2));
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90;
      plane.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang})`);
      if (p < 1) planeRaf = requestAnimationFrame(step); else plane.classList.add('hide');
    };
    planeRaf = requestAnimationFrame(step);
  },
  show(i, animate) {
    const cards = $$('.card', this.el);
    if (!animate) {
      killAll(this.el); cancelAnimationFrame(planeRaf); $('#plane').classList.add('hide');
      this.state(i);
      cards.forEach((c, k) => { c.style.opacity = k === i ? 1 : 0; c.style.transform = 'translateY(0)'; });
      $('#cam').style.transform = camT(CAM[i]); this.cur = i; return;
    }
    const prev = this.cur;
    if (prev >= 0) anim(cards[prev], [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-30px)' }], { duration: 500, easing: EASE_IO });
    anim(cards[i], [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 900, delay: prev >= 0 ? 350 : 500 });
    const from = prev >= 0 ? camT(CAM[prev]) : 'translate(-60px, 40px) scale(1.08)';
    anim($('#cam'), [{ transform: from }, { transform: camT(CAM[i]) }], { duration: prev >= 0 ? 1800 : 2600, easing: EASE_IO });
    if (i >= 1 && i <= 3) {
      $(this.pins[i]).classList.remove('hide');
      fadeIn($(this.pins[i]), 900, 600);
      this.routes[i].forEach((s, k) => draw($(s), 900 + k * 900, i === 2 && k === 0 ? 1800 : 1500));
      if (i === 3) later(() => this.fly(), 1000);
    }
    if (i === 4) this.state(4);
    this.cur = i;
  }
};



/* ───────────────── A1 · ORIGEM: fluxos dos mercados emissores
   Contorno do Brasil: traçado simplificado a partir de coordenadas geográficas (lon/lat),
   projeção equiretangular corrigida para 15° S. Dados em data/dados.js (origem). */
const SVGNS = 'http://www.w3.org/2000/svg';
const mk = (tag, attrs, parent) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const O_BR = "M1206.6 88.0 L1212.1 101.1 L1218.8 112.6 L1215.5 131.0 L1214.4 144.8 L1221.0 156.3 L1228.8 174.7 L1237.7 180.4 L1251.0 174.7 L1268.8 164.4 L1288.8 164.4 L1302.1 166.7 L1313.2 154.0 L1328.8 155.2 L1342.1 159.8 L1357.7 156.3 L1373.2 151.7 L1384.3 133.3 L1396.5 114.9 L1402.1 108.0 L1408.8 121.8 L1415.4 142.5 L1424.3 165.5 L1434.3 183.9 L1431.0 202.3 L1444.3 208.1 L1466.5 213.8 L1469.8 228.8 L1466.5 241.4 L1479.8 226.5 L1492.1 223.0 L1508.7 231.1 L1524.3 235.7 L1546.5 242.6 L1558.7 263.2 L1575.4 264.4 L1595.4 271.3 L1615.4 274.8 L1637.6 274.8 L1659.8 279.4 L1688.7 294.3 L1706.5 310.4 L1722.0 321.9 L1735.3 326.0 L1753.1 326.5 L1760.9 334.6 L1763.1 346.1 L1767.5 365.6 L1770.9 373.7 L1769.8 390.9 L1765.3 407.0 L1758.7 420.8 L1749.8 432.3 L1735.3 449.6 L1720.9 461.1 L1705.3 480.6 L1693.1 499.0 L1687.6 508.2 L1679.8 516.2 L1677.6 531.2 L1677.6 549.6 L1678.7 568.0 L1676.5 586.4 L1673.1 607.1 L1664.2 630.1 L1660.9 653.1 L1649.8 676.1 L1637.6 694.5 L1633.1 712.9 L1613.1 726.7 L1610.9 737.1 L1584.3 738.2 L1557.6 739.4 L1537.6 754.3 L1515.4 761.2 L1495.4 775.0 L1479.8 785.4 L1468.7 796.9 L1464.3 814.1 L1465.4 832.5 L1466.5 846.3 L1461.0 864.7 L1439.9 883.1 L1426.5 906.1 L1413.2 926.8 L1393.2 942.9 L1382.1 959.0 L1373.2 972.8 L1358.3 985.4 L1355.4 975.1 L1355.4 959.0 L1348.8 947.5 L1335.4 940.6 L1322.1 929.1 L1308.8 918.8 L1297.7 913.0 L1286.6 904.9 L1264.3 903.8 L1275.5 893.4 L1291.0 878.5 L1306.6 860.1 L1322.1 848.6 L1339.9 837.1 L1351.0 832.5 L1352.1 812.9 L1344.3 802.6 L1331.0 796.9 L1335.4 779.6 L1337.7 763.5 L1328.8 758.9 L1313.2 756.6 L1308.8 740.5 L1306.6 726.7 L1291.0 719.8 L1271.0 719.8 L1257.7 716.4 L1257.7 692.2 L1259.9 671.5 L1257.7 648.5 L1262.1 627.8 L1251.0 609.4 L1246.6 591.0 L1248.8 584.1 L1208.8 583.0 L1206.6 556.5 L1204.4 538.1 L1197.7 524.3 L1171.0 519.7 L1151.0 508.2 L1131.0 496.7 L1111.1 489.8 L1095.5 478.3 L1092.2 457.6 L1091.1 434.6 L1064.4 436.9 L1042.2 450.7 L1026.6 462.2 L997.8 461.1 L975.5 462.2 L976.6 427.7 L960.0 438.1 L940.0 439.2 L935.5 427.7 L917.8 425.4 L922.2 404.7 L908.9 388.6 L900.0 381.7 L906.7 370.2 L920.0 356.4 L924.4 338.0 L946.7 312.7 L971.1 305.8 L988.9 308.1 L990.0 305.8 L995.5 273.6 L1001.1 236.8 L1000.0 225.3 L988.9 211.5 L987.8 195.4 L1002.2 185.1 L993.3 170.1 L1024.4 168.9 L1035.5 170.1 L1046.6 158.6 L1058.4 181.1 L1071.1 191.9 L1086.6 187.4 L1099.9 183.9 L1115.5 174.7 L1122.2 164.4 L1135.5 159.8 L1131.0 149.4 L1117.7 137.9 L1106.6 119.5 L1117.7 112.6 L1137.7 118.3 L1148.8 117.2 L1155.5 112.6 L1175.5 110.3 L1185.5 105.7 L1193.3 97.7 L1194.8 89.6 Z";
const O_NODE = {"MSPB": [1679.3, 518.5], "BA": [1617.6, 494.4], "SP": [1464.3, 722.1], "MG": [1550.9, 637.0], "RJ": [1595.4, 722.1], "RS": [1359.9, 890.0], "DF": [1481.0, 572.6], "SSA": [1688.7, 507.5]};
const O_DEST = { x: O_NODE.MSPB[0], y: O_NODE.MSPB[1] };
const O_LAB = { BA: [0, -150, 'middle'], SP: [-26, 8, 'end'], MG: [26, -6, 'start'], RJ: [24, 30, 'start'], RS: [-24, 8, 'end'], DF: [-24, -10, 'end'] };
const OR = DADOS.origem.estados;
const OEXT = DADOS.origem.exterior;
const pct2 = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
const pctN = (v) => (Number.isInteger(v) ? v : v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })) + '%';
const umEm = (s) => { const r = 100 / s, n = Math.round(r); return (r > n ? 'quase ' : 'mais de ') + '1 em cada ' + n; };
const soma = (ufs) => OR.filter(o => ufs.includes(o.uf)).reduce((s, o) => s + o.pct, 0);
const OSTEPS = [
  { ufs: [] },
  { ufs: ['BA'], note: () => `${umEm(soma(['BA']))[0].toUpperCase() + umEm(soma(['BA'])).slice(1)} visitantes vem da própria Bahia.` },
  { ufs: ['SP', 'MG', 'RJ'], note: () => `Sudeste: ${pct2(soma(['SP', 'MG', 'RJ']))}, ${umEm(soma(['SP', 'MG', 'RJ']))} visitantes.` },
  { ufs: ['RS', 'DF'], note: () => `Rio Grande do Sul e Distrito Federal somam ${pct2(soma(['RS', 'DF']))}.` },
  { ufs: [], final: true }
];
function oArc(from, to, bend) {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2, dx = to.x - from.x, dy = to.y - from.y;
  return `M${from.x} ${from.y} Q${mx + dy * bend} ${my - dx * bend} ${to.x} ${to.y}`;
}
(function buildOrigem() {
  $('#oBR').setAttribute('d', O_BR); $('#oBRline').setAttribute('d', O_BR);
  const fg = $('#oFlows'), ng = $('#oNodes'), dg = $('#oDots');
  OR.forEach(o => {
    const [x, y] = O_NODE[o.uf], c = { x, y };
    if (o.uf === 'BA') {
      mk('circle', { cx: x, cy: y, r: 120, class: 'o-ba', id: 'oGlowBA', fill: 'url(#oGlow)' }, ng);
    } else {
      const d = oArc(c, O_DEST, o.uf === 'RS' ? 0.16 : 0.22), w = (1.4 + o.pct * 0.34).toFixed(1);
      mk('path', { d, class: 'o-halo', id: 'oH' + o.uf, pathLength: 1, 'stroke-width': w * 3.2 }, fg);
      mk('path', { d, class: 'o-flow', id: 'oF' + o.uf, pathLength: 1, 'stroke-width': w }, fg);
      const g = mk('g', { class: 'o-node', id: 'oN' + o.uf }, ng);
      mk('circle', { cx: x, cy: y, r: (4.2 * Math.sqrt(o.pct)).toFixed(1), class: 'o-disc' }, g);
      mk('circle', { cx: x, cy: y, r: 4, class: 'o-core' }, g);
      for (let k = 0; k < 2; k++) mk('circle', { r: 4.5, class: 'o-dot', 'data-uf': o.uf, 'data-off': k / 2 }, dg);
    }
    const [lx, ly, an] = O_LAB[o.uf] || [24, 0, 'start'];
    const t = mk('text', { x: x + lx, y: y + ly, 'text-anchor': an, class: 'o-lab', id: 'oL' + o.uf }, ng);
    const a = mk('tspan', {}, t); a.textContent = o.uf + ' ';
    const b = mk('tspan', { class: 'p' }, t); b.textContent = pct2(o.pct);
  });
  const eg = $('#oExtG');
  [[2000, 210, -0.10], [2000, 360, -0.02], [2000, 500, 0.03]].forEach(([x, y, bd], k) =>
    mk('path', { d: oArc({ x, y }, O_DEST, bd), class: 'o-ext', id: 'oE' + k, pathLength: 1 }, eg));
  const dg2 = $('#oDest'), { x, y } = O_DEST;
  mk('circle', { cx: x, cy: y, r: 15, class: 'pinring' }, dg2);
  mk('circle', { cx: x, cy: y, r: 9, class: 'pin' }, dg2);
  const t = mk('text', { x: 1895, y: y + 52, class: 'o-destlab', 'text-anchor': 'end' }, dg2);
  mk('tspan', { x: 1895 }, t).textContent = 'Morro de São Paulo';
  mk('tspan', { x: 1895, dy: 27 }, t).textContent = '& Boipeba';
  // painel
  $('#oRank').innerHTML = OR.map(o => `<li data-uf="${o.uf}"><span class="nm">${o.nome}</span><span class="bar"><i style="--w:${(o.pct / OR[0].pct).toFixed(3)}"></i></span><b>${pct2(o.pct)}</b></li>`).join('')
    + (OEXT && OEXT.pct != null ? `<li data-uf="EXT" class="ext"><span class="nm">Exterior</span><span class="bar"><i style="--w:${Math.min(1, OEXT.pct / OR[0].pct).toFixed(3)}"></i></span><b>${pctN(OEXT.pct)}</b></li>` : '');
  $('#oFoot').textContent = DADOS.origem.rodape;
})();
const O_ZOOM = { s: 1.28, fx: O_DEST.x, fy: O_DEST.y, sx: 1470, sy: 430 };
const oCamT = (z) => z ? `translate(${z.sx - z.fx * z.s}px, ${z.sy - z.fy * z.s}px) scale(${z.s})` : 'translate(0px, 0px) scale(1)';
let oRaf = 0;
const a1 = {
  id: 'a1', title: 'Perfil: de onde vêm', steps: OSTEPS.length, el: $('#a1'), cur: -1, live: new Set(), clock: 0,
  notes: (() => {
    const t6 = OR.reduce((s, o) => s + o.pct, 0);
    return `Três atos, cinco cliques. 1) O Brasil surge e o destino acende no litoral da Bahia. Pergunta: de onde vem quem nos descobre? `
      + `2) Bahia, ${pct2(soma(['BA']))}: ${umEm(soma(['BA']))} visitantes é baiano: o mercado de proximidade é a base. `
      + `3) Sudeste: São Paulo ${pct2(soma(['SP']))}, Minas ${pct2(soma(['MG']))}, Rio ${pct2(soma(['RJ']))}. Juntos ${pct2(soma(['SP', 'MG', 'RJ']))}, o maior bloco fora da Bahia. A espessura de cada linha é proporcional ao peso do estado. `
      + `4) Rio Grande do Sul e Distrito Federal, ${pct2(soma(['RS', 'DF']))}. `
      + `5) A câmera fecha no destino: seis estados concentram ${pct2(t6)} dos visitantes${OEXT ? ` e ${pctN(OEXT.pct)} vêm do exterior` : ''}. Pergunta para a plateia: quais desses mercados a sua agência já vende para cá?`;
  })(),
  reset() {
    killAll(this.el); cancelAnimationFrame(oRaf); this.cur = -1; this.live.clear();
    $('#oCam').style.transform = oCamT(null);
    setDash($('#oBRline'), 1); $('#oBR').style.opacity = 0;
    $$('.o-flow, .o-halo, .o-ext', this.el).forEach(p => setDash(p, 1));
    $$('.o-node, .o-lab, .o-ba, .o-dot, #oDest, #oRank li, .o-panel > *', this.el).forEach(x => x.style.opacity = 0);
    $$('#oRank i', this.el).forEach(i => i.style.transform = 'scaleX(0)');
    $('#oNote').innerHTML = ''; $('#oFoot').style.opacity = 0;
  },
  run() {
    cancelAnimationFrame(oRaf);
    const dots = $$('.o-dot', this.el), L = {};
    let last = performance.now();
    const tick = (now) => {
      if (!paused) this.clock += (now - last) / D(3400);
      last = now;
      dots.forEach(d => {
        const uf = d.dataset.uf;
        if (!this.live.has(uf)) { d.style.opacity = 0; return; }
        const p = $('#oF' + uf); L[uf] = L[uf] || p.getTotalLength();
        const u = (this.clock + +d.dataset.off) % 1, e = u * u * (3 - 2 * u), pt = p.getPointAtLength(L[uf] * e);
        d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y);
        d.style.opacity = Math.min(1, u * 6, (1 - u) * 6);
      });
      oRaf = requestAnimationFrame(tick);
    };
    oRaf = requestAnimationFrame(tick);
  },
  noteFor(i) {
    if (OSTEPS[i].final) {
      const t6 = OR.reduce((s, o) => s + o.pct, 0);
      return `<b>${pct2(t6)}</b> dos visitantes vêm de ${OR.length === 6 ? 'seis' : OR.length} estados${OEXT ? `.<br><span class="e">E ${pctN(OEXT.pct)} vêm do exterior.</span>` : '.'}`;
    }
    for (let k = i; k >= 1; k--) if (OSTEPS[k].note) return OSTEPS[k].note();
    return '';
  },
  ufState(uf, on) {
    $$(`#oRank li[data-uf="${uf}"]`).forEach(li => { li.style.opacity = on ? 1 : 0; $('i', li).style.transform = on ? 'scaleX(var(--w))' : 'scaleX(0)'; });
    $('#oL' + uf).style.opacity = on ? 1 : 0;
    if (uf === 'BA') { $('#oGlowBA').style.opacity = on ? 1 : 0; return; }
    setDash($('#oF' + uf), on ? 0 : 1); setDash($('#oH' + uf), on ? 0 : 1); $('#oN' + uf).style.opacity = on ? 1 : 0;
    if (on) this.live.add(uf); else this.live.delete(uf);
  },
  apply(i) {
    killAll(this.el);
    setDash($('#oBRline'), 0); $('#oBR').style.opacity = 1; $('#oDest').style.opacity = 1;
    $$('.o-panel > *', this.el).forEach(x => x.style.opacity = 1); $('#oFoot').style.opacity = 1;
    OSTEPS.forEach((s, k) => s.ufs.forEach(uf => this.ufState(uf, k <= i)));
    const fin = !!OSTEPS[i].final;
    $$('.o-ext', this.el).forEach(p => setDash(p, fin ? 0 : 1));
    const ext = $('#oRank li.ext'); if (ext) { ext.style.opacity = fin ? 1 : 0; $('i', ext).style.transform = fin ? 'scaleX(var(--w))' : 'scaleX(0)'; }
    $('#oCam').style.transform = oCamT(fin ? O_ZOOM : null);
    this.el.classList.toggle('o-fin', fin);
    $('#oNote').innerHTML = this.noteFor(i);
  },
  show(i, animate) {
    if (!animate || (this.cur !== i - 1 && i > 0)) { this.apply(i); this.cur = i; this.run(); return; }
    const e = this.el, st = OSTEPS[i];
    if (i === 0) {
      this.reset(); this.run();
      $$('.o-panel > .kick, .o-panel > h2', e).forEach((x, k) => anim(x, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 1000, delay: 200 + k * 220 }));
      anim($('#oCam'), [{ transform: 'translate(60px, 20px) scale(1.06)' }, { transform: oCamT(null) }], { duration: 3600, easing: EASE_IO });
      draw($('#oBRline'), 300, 2600);
      fadeIn($('#oBR'), 1600, 1800);
      fadeIn($('#oDest'), 2600, 900);
      $$('.o-panel > .o-rank, .o-panel > .o-note', e).forEach(x => x.style.opacity = 1);
      fadeIn($('#oFoot'), 2800, 900);
      this.cur = 0; return;
    }
    const note = $('#oNote');
    anim(note, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
    later(() => { note.innerHTML = this.noteFor(i); anim(note, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 800 }); }, 320);
    st.ufs.forEach((uf, k) => {
      const dl = 150 + k * 420;
      const li = $(`#oRank li[data-uf="${uf}"]`);
      anim(li, [{ opacity: 0, transform: 'translateX(-16px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 700, delay: dl });
      anim($('i', li), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(var(--w))' }], { duration: 1100, delay: dl + 150, easing: EASE_IO });
      if (uf === 'BA') { anim($('#oGlowBA'), [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 1600, delay: dl }); fadeIn($('#oL' + uf), dl + 700, 700); return; }
      fadeIn($('#oN' + uf), dl, 600);
      anim($('#oN' + uf), [{ transform: 'scale(.3)' }, { transform: 'scale(1)' }], { duration: 900, delay: dl });
      draw($('#oH' + uf), dl + 200, 1500); draw($('#oF' + uf), dl + 200, 1500);
      fadeIn($('#oL' + uf), dl + 500, 700);
      later(() => this.live.add(uf), dl + 1500);
    });
    if (st.final) {
      this.el.classList.add('o-fin');
      anim($('#oCam'), [{ transform: oCamT(null) }, { transform: oCamT(O_ZOOM) }], { duration: 2600, easing: EASE_IO });
      $$('.o-ext', e).forEach((p, k) => draw(p, 1400 + k * 250, 1600));
      const ext = $('#oRank li.ext');
      if (ext) { anim(ext, [{ opacity: 0, transform: 'translateX(-16px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 700, delay: 1500 }); anim($('i', ext), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(var(--w))' }], { duration: 1100, delay: 1650, easing: EASE_IO }); }
    }
    this.cur = i;
  }
};

/* ───────────────── A3 · GÊNERO: ilustração + fitas com as localidades do arquipélago */
const RG = DADOS.genero;
const G_LUGARES = 'GAMBOA • MORERÉ • GALEÃO • CANAVIEIRAS • CAIRU • TORRINHAS • COVA DA ONÇA • TAPUIAS • GARAPUÁ • MORRO DE SÃO PAULO • BOIPEBA • ';
let gRaf = 0;
(function buildGenero() {
  $('#gTPA').textContent = G_LUGARES.repeat(4);
  $('#gTPB').textContent = G_LUGARES.split(' • ').filter(Boolean).reverse().join(' • ').concat(' • ').repeat(4);
})();
const a3 = {
  id: 'a3', title: 'Perfil: gênero', steps: 1, el: $('#a3'),
  notes: `Gênero: ${RG.mulheres}% mulheres e ${RG.homens}% homens. Público equilibrado, com leve predominância feminina. As fitas trazem as localidades do arquipélago: Gamboa, Moreré, Galeão, Canavieiras, Cairu, Torrinhas, Cova da Onça, Tapuias e Garapuá.`,
  reset() {
    killAll(this.el); cancelAnimationFrame(gRaf);
    $('.g-title .mask>span', this.el).style.transform = 'translateY(105%)';
    $('.g-art', this.el).style.opacity = 0;
    $$('.g-n', this.el).forEach(x => x.style.opacity = 0);
    $$('.g-band', this.el).forEach(p => setDash(p, 1));
    $$('.g-txt', this.el).forEach(t => t.style.opacity = 0);
    $('#gM').textContent = '0%'; $('#gW').textContent = '0%';
  },
  scroll() {
    cancelAnimationFrame(gRaf);
    const T = [[$('#gTPA'), 0.045], [$('#gTPB'), -0.035]].map(([tp, v]) => ({ tp, v, cyc: tp.getComputedTextLength() / 4 }));
    let last = performance.now(), t = 0;
    const tick = (now) => { if (!paused) t += now - last; last = now;
      T.forEach(o => { const x = ((t * Math.abs(o.v)) % o.cyc); o.tp.setAttribute('startOffset', (o.v > 0 ? -x : x - o.cyc)); });
      gRaf = requestAnimationFrame(tick); };
    gRaf = requestAnimationFrame(tick);
  },
  final() {
    $('.g-title .mask>span', this.el).style.transform = 'translateY(0)';
    $('.g-art', this.el).style.opacity = 1;
    $$('.g-n', this.el).forEach(x => x.style.opacity = 1);
    $$('.g-band', this.el).forEach(p => setDash(p, 0));
    $$('.g-txt', this.el).forEach(t => t.style.opacity = 1);
    $('#gM').textContent = RG.homens + '%'; $('#gW').textContent = RG.mulheres + '%';
  },
  show(i, animate) {
    const e = this.el;
    if (!animate) { killAll(e); this.final(); this.scroll(); return; }
    this.reset(); this.scroll();
    rise($('.g-title .mask>span', e), 200, 1100);
    anim($('.g-art', e), [{ opacity: 0, transform: 'translateY(90px) scale(.97)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 1500, delay: 450 });
    anim($('.g-art', e), [{ translate: '0 0' }, { translate: '0 -8px' }, { translate: '0 0' }], { duration: 7000, delay: 2000, iterations: Infinity, easing: 'ease-in-out' }, true);
    draw($('#gPA'), 900, 1700); draw($('#gPB'), 1150, 1700);
    fadeIn($('#gTA'), 2200, 900); fadeIn($('#gTB'), 2400, 900);
    [['.g-m', '#gM', RG.homens, 1500], ['.g-w', '#gW', RG.mulheres, 1800]].forEach(([box, n, v, d]) => {
      anim($(box, e), [{ opacity: 0, transform: 'translateY(30px) scale(.9)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 900, delay: d });
      later(() => count($(n), v, x => Math.round(x) + '%', 1400), d);
    });
  }
};

/* ───────────────── MB · LIVING MOODBOARD — experiências (Morro, Boipeba, Cairu Sede)
   Cada passo é comandado pelo apresentador. O estado de cada cena é calculado (não depende de tempo),
   então avançar, voltar e pular funcionam a partir de qualquer ponto. */
const MB_TILES = [
  { id: 'forte1', src: 'assets/img/forte1.jpg', alt: 'A Fortaleza do Tapirandu sobre as pedras, de frente para o mar', pos: '50% 50%', g: 'M', w: 1920, h: 1276 },
  { id: 'forte2', src: 'assets/img/forte2.jpg', alt: 'O portal da fortaleza ao pôr do sol, com a baía ao fundo', pos: '50% 60%', g: 'M', w: 1120, h: 1400 },
  { id: 'forte3', src: 'assets/img/forte3.jpg', alt: 'Guarita da muralha da fortaleza ao pôr do sol', pos: '50% 45%', g: 'M', w: 787, h: 1400 },
  { id: 'x_quarta', src: 'assets/img/x_quarta.jpg', alt: 'Piscinas naturais da Quarta Praia vistas do alto', pos: '50% 50%', g: 'M', w: 1900, h: 1068 },
  { id: 'p_praia4', src: 'assets/img/p_praia4.jpg', alt: 'Praia de Morro de São Paulo vista do alto', pos: '50% 50%', g: 'M', w: 900, h: 1600 },
  { id: 'p_agua2', src: 'assets/img/p_agua2.jpg', alt: 'Água transparente sobre os recifes', pos: '50% 50%', g: 'M', w: 1100, h: 1955 },
  { id: 'f15', src: 'assets/img/f15.jpg', alt: 'Quadriciclo em estrada de coqueiros a caminho de Garapuá', pos: '50% 50%', g: 'M', w: 625, h: 693 },
  { id: 'f27', src: 'assets/img/f27.jpg', alt: 'Piscinas naturais de Garapuá vistas do alto', pos: '50% 50%', g: 'M', w: 1280, h: 720 },
  { id: 'f19', src: 'assets/img/f19.jpg', alt: 'Praia da Gamboa com barcos e guarda-sóis', pos: '50% 50%', g: 'M', w: 612, h: 399 },
  { id: 'f17', src: 'assets/img/f17.jpg', alt: 'Falésias coloridas da Gamboa', pos: '50% 50%', g: 'M', w: 863, h: 547 },
  { id: 'n69', src: 'assets/img/n69.jpg', alt: 'O Farol do Morro entre coqueiros', pos: '50% 40%', g: 'M', w: 1100, h: 1655 },
  { id: 'f21', src: 'assets/img/f21.jpg', alt: 'Visitante descendo a tirolesa em direção ao mar', pos: '50% 40%', g: 'M', w: 1280, h: 719 },
  { id: 'p_vila', src: 'assets/img/p_vila.jpg', alt: 'A vila, o farol e a fortaleza vistos do alto', pos: '50% 45%', g: 'M', w: 1100, h: 1955 },
  { id: 'toca1', src: 'assets/img/toca1.jpg', alt: 'Pôr do sol visto do mirante da Toca do Morcego, com barcos na baía', pos: '50% 50%', g: 'M', w: 1920, h: 1280 },
  { id: 'voltav', src: 'assets/video/volta_lancha.mp4', video: true, alt: 'Drone sobre a lancha nas piscinas naturais durante a Volta à Ilha', pos: '50% 50%', g: 'M', w: 1280, h: 720 },
  { id: 'tocav', src: 'assets/video/toca_drone.mp4', video: true, alt: 'Drone sobe do píer até o Farol e o mirante da Toca do Morcego', pos: '50% 50%', g: 'M', w: 540, h: 960 },
  { id: 'toca2', src: 'assets/img/toca2.jpg', alt: 'Visitante faz um coração com as mãos contra o pôr do sol na Toca do Morcego', pos: '50% 40%', g: 'M', w: 1080, h: 1350 },
  { id: 'f36', src: 'assets/img/f36.jpg', alt: 'Piscinas naturais de Moreré vistas do alto', pos: '50% 50%', g: 'B', w: 1280, h: 720 },
  { id: 'f38', src: 'assets/img/f38.jpg', alt: 'Guido segurando uma bacia de lagostas na praia', pos: '50% 30%', g: 'B', w: 747, h: 721 },
  { id: 'f39', src: 'assets/img/f39.jpg', alt: 'Lagosta preparada na panela', pos: '50% 50%', g: 'B', w: 395, h: 458 },
  { id: 'f32', src: 'assets/img/f32.jpg', alt: 'Costa de Boipeba com praia deserta e coqueiral', pos: '50% 50%', g: 'B', w: 1280, h: 721 },
  { id: 'f29', src: 'assets/img/f29.jpg', alt: 'Vila de Boipeba à beira do rio, vista do alto', pos: '50% 50%', g: 'B', w: 1280, h: 721 },
  { id: 'f35', src: 'assets/img/f35.jpg', alt: 'Pastel de polvo aberto na mão', pos: '50% 50%', g: 'B', w: 668, h: 721 },
  { id: 'f12', src: 'assets/img/f12.jpg', alt: 'Ostras frescas nas mãos', pos: '50% 50%', g: 'B', w: 243, h: 365 },
  { id: 'cpano', src: 'assets/img/cairu_pano.jpg', alt: 'Vista aérea de Cairu Sede, com a igreja, o casario e o rio', pos: '50% 50%', g: 'C', w: 1920, h: 1080 },
  { id: 'cconv', src: 'assets/img/cairu_convento.jpg', alt: 'Fachada do Convento de Santo Antônio, com o cruzeiro do adro ao pôr do sol', pos: '50% 60%', g: 'C', w: 933, h: 1400 },
  { id: 'cazul', src: 'assets/img/cairu_azulejos.jpg', alt: 'Sala do Convento de Santo Antônio com azulejos e teto pintado', pos: '50% 50%', g: 'C', w: 1320, h: 989 },
  { id: 'crio', src: 'assets/img/cairu_rio.jpg', alt: 'O Convento de Santo Antônio e o casario de Cairu vistos do rio', pos: '50% 45%', g: 'C', w: 1320, h: 728 },
  { id: 'cigre', src: 'assets/img/cairu_igreja.jpg', alt: 'Igreja histórica de Cairu Sede e seu adro, vistos do alto', pos: '50% 45%', g: 'C', w: 1019, h: 1200 },
  { id: 'ccasa', src: 'assets/img/cairu_casario.jpg', alt: 'Casario colonial e rua de pedra em Cairu', pos: '50% 50%', g: 'C', w: 750, h: 523 }
];
/* slots do mosaico (x, y, w, h), em colunas desencontradas */
const mkCols = (cols) => cols.flatMap(([x, w, cells]) => cells.map(([y, h]) => [x, y, w, h]));
const SL15 = mkCols([[-40, 470, [[-60, 420], [376, 300], [692, 440]]], [446, 400, [[-20, 300], [296, 480], [792, 340]]],
  [862, 400, [[-90, 460], [386, 320], [722, 400]]], [1278, 340, [[-30, 360], [346, 420], [782, 340]]], [1634, 330, [[-70, 300], [246, 460], [722, 420]]]]);
const SL8 = mkCols([[-40, 600, [[-50, 560], [526, 600]]], [576, 480, [[-20, 420], [416, 700]]], [1072, 440, [[-80, 640], [576, 560]]], [1528, 440, [[-40, 480], [456, 680]]]]);
const SL6 = mkCols([[-40, 740, [[-40, 600], [576, 560]]], [716, 524, [[-80, 520], [456, 700]]], [1256, 704, [[-30, 640], [626, 500]]]]);
const MB_LAY = {
  OPEN: [SL15, ['x_quarta', 'f38', 'n69', 'f36', 'f17', 'f35', 'f32', 'forte1', 'f21', 'f27', 'f29', 'toca1', 'f15', 'p_agua2', 'voltav']],
  M: [SL15, ['x_quarta', 'forte2', 'n69', 'f19', 'f17', 'p_praia4', 'voltav', 'forte1', 'f21', 'f27', 'p_vila', 'toca1', 'f15', 'tocav', 'f32']],
  B: [SL8, ['f36', 'f38', 'f32', 'f35', 'f29', 'f12', 'f39', 'ccasa']],
  C: [SL6, ['ccasa', 'cconv', 'voltav', 'cigre', 'cazul', 'crio']],
  F: [SL15, ['x_quarta', 'f38', 'cconv', 'f36', 'f17', 'ccasa', 'f32', 'forte1', 'f21', 'cigre', 'f35', 'toca1', 'f15', 'cazul', 'f27']]
};
const MB_STEPS = [
  { lay: 'OPEN', mode: 'title', k: 'Experiências', t: 'Dois destinos,<br>uma só viagem' },
  { lay: 'M', mode: 'title', k: 'Ilha de Tinharé', t: 'Morro de São Paulo', sub: 'Diversidade que pulsa.' },
  { lay: 'M', mode: 'feat', act: 'Morro de São Paulo', hero: 'voltav', sats: [], t: 'Volta à Ilha', tg: 'Um passeio. Um arquipélago. Infinitas descobertas.', l: 'A experiência mais tradicional de Morro de São Paulo conecta piscinas naturais paradisíacas, praias preservadas, sabores autênticos e a riqueza histórica de Cairu. Uma jornada inesquecível pela essência do nosso arquipélago.' },
  { lay: 'M', mode: 'feat', act: 'Morro de São Paulo', hero: 'x_quarta', sats: ['p_praia4', 'p_agua2'], t: 'Praias e piscinas naturais', l: 'Da Primeira à Quarta Praia, água clara e piscinas naturais que se formam na maré baixa.', note: 'Quarta Praia: 4º lugar mundial no Travelers’ Choice 2022 e 3º na América do Sul em 2023 (Tripadvisor).', src: 'Drone: Alex Lemonis' },
  { lay: 'M', mode: 'feat', act: 'Morro de São Paulo', hero: 'f21', sats: ['n69', 'p_vila'], t: 'Farol do Morro + Tirolesa', l: 'Do alto do Farol, a vista da vila e do mar. Para descer, 340 metros de tirolesa até a Primeira Praia.', src: 'Imagens do Farol: Alex Lemonis' },
  { lay: 'M', mode: 'feat', act: 'Morro de São Paulo', hero: 'toca1', sats: ['tocav', 'toca2'], t: 'Pôr do Sol na Toca do Morcego', l: 'O fim de tarde de Morro: onde o pôr do sol deixa de ser paisagem e se transforma em experiência.' },
  { lay: 'M', mode: 'feat', act: 'Morro de São Paulo', hero: 'f15', sats: ['f27'], t: 'Quadriciclo até Garapuá', l: 'Estradas de terra entre coqueirais até as piscinas naturais de Garapuá.' },
  { lay: 'M', mode: 'feat', act: 'Morro de São Paulo', hero: 'f17', sats: ['f19'], t: 'Gamboa + Coroa', l: 'As falésias coloridas da Gamboa e um banco de areia que surge com a maré.' },
  { lay: 'M', mode: 'feat', act: 'Morro de São Paulo', hero: 'forte1', sats: ['forte2', 'forte3'], t: 'Forte do Tapirandu', tg: 'Quase quatro séculos de história diante do mar.', l: 'Erguida a partir de 1630 para proteger a costa baiana, a Fortaleza do Tapirandu é um dos grandes testemunhos do Brasil colonial. Suas muralhas centenárias, que um dia defenderam o arquipélago, hoje revelam histórias e proporcionam um dos mais belos cenários para contemplar o pôr do sol em Morro de São Paulo.' },
  { lay: 'B', mode: 'title', k: 'Ilha de Boipeba', t: 'Boipeba', sub: 'Autenticidade que encanta.' },
  { lay: 'B', mode: 'feat', act: 'Boipeba', hero: 'f36', sats: [], t: 'Piscinas naturais de Moreré', l: 'Água rasa e transparente entre os recifes, cercada de natureza preservada.' },
  { lay: 'B', mode: 'feat', act: 'Boipeba', hero: 'f38', sats: ['f39'], t: 'Lagosta do Guido', l: 'A lagosta servida de frente para o mar, na Praia da Cueira. Tradição de Boipeba.' },
  { lay: 'B', mode: 'feat', act: 'Boipeba', hero: 'f32', sats: ['f29'], t: 'Volta à Ilha de Boipeba', l: 'A costa da ilha vista do mar, praia por praia, entre coqueirais e vilas de pescadores.' },
  { lay: 'B', mode: 'feat', act: 'Boipeba', hero: 'f35', sats: [], t: 'Pastel de polvo com banana', l: 'Em Ponta dos Castelhanos, uma receita que só existe ali.' },
  { lay: 'B', mode: 'feat', act: 'Boipeba', hero: 'f12', sats: [], t: 'Ostras em Canavieiras', l: 'Ostras frescas, ligadas ao manguezal e à cultura das comunidades locais.' },
  { lay: 'C', mode: 'title', full: 'cpano', k: 'Ilha de Cairu', t: 'Cairu Sede', sub: 'Um encontro com a história do Brasil', subCaps: true },
  { lay: 'C', mode: 'feat', act: 'Cairu Sede', hero: 'cconv', sats: [], kb: true, frameH: 920, t: 'Convento de Santo Antônio', tg: 'Desde 1654', tgCaps: true, l: '' },
  { lay: 'C', mode: 'feat', act: 'Cairu Sede', hero: null, sats: [], frames: { cazul: [640, 78, 620, 465, 42], crio: [1225, 96, 620, 342, 44], cigre: [1300, 470, 470, 555, 45], ccasa: [748, 590, 520, 363, 43] }, src: 'Sala do convento: Plinio Cintra · Sanctuaria.art', t: 'Igrejas, casarios e séculos de história', l: 'Entre igrejas, casarios e séculos de história, Cairu revela a riqueza cultural de um arquipélago que vai muito além de suas praias.' },
  { lay: 'F', mode: 'final' }
];
const MB_ACT_N = (() => { const c = {}; MB_STEPS.forEach(s => { if (s.mode === 'feat') { c[s.act] = (c[s.act] || 0) + 1; s.n = c[s.act]; } }); MB_STEPS.forEach(s => { if (s.mode === 'feat') s.of = c[s.act]; }); return c; })();
const MB = {};
(function buildMB() {
  const board = $('#mbBoard');
  MB_TILES.forEach((t, k) => {
    const f = document.createElement('figure'); f.className = 'mb-t';
    f.innerHTML = (t.video
      ? `<video muted loop playsinline autoplay preload="auto" aria-label="${t.alt}" style="object-position:${t.pos}"><source src="${t.src.replace('.mp4', '.webm')}" type="video/webm"><source src="${t.src}" type="video/mp4"></video>`
      : `<img src="${t.src}" alt="${t.alt}" style="object-position:${t.pos}">`) + '<i class="mb-sh"></i>';
    board.appendChild(f); MB[t.id] = { ...t, el: f, img: $('img, video', f), sh: $('.mb-sh', f), k };
  });
})();
/* moldura do destaque: respeita a proporção da foto e limita a ampliação (evita foto estourada) */
function mbFrame(t, maxW, maxH, cx, cy, up = 1.7) {
  const nw = (t.img && t.img.naturalWidth) || t.w, nh = (t.img && t.img.naturalHeight) || t.h;
  t = { w: nw, h: nh };
  const r = t.w / t.h; let w = maxW, h = w / r; if (h > maxH) { h = maxH; w = h * r; }
  const cap = Math.min(1, (t.w * up) / w); w *= cap; h *= cap;
  return [Math.round(cx - w / 2), Math.round(cy - h / 2), Math.round(w), Math.round(h)];
}
function mbTargets(i) {
  const st = MB_STEPS[i], [slots, ids] = MB_LAY[st.lay], T = {};
  Object.keys(MB).forEach(id => T[id] = null);
  ids.forEach((id, k) => { T[id] = { r: slots[k], o: 1, sh: st.mode === 'title' ? 0.34 : st.mode === 'final' ? 0.45 : 0.12, sc: 1, z: 2 }; });
  if (st.full) {
    ids.forEach(id => { T[id].sh = 0.8; T[id].sc = 0.965; });
    T[st.full] = { r: [0, 0, 1920, 1080], o: 1, sh: 0.12, sc: 1, z: 40 };
  }
  if (st.frames) {
    ids.forEach(id => { T[id].sh = 0.78; T[id].sc = 0.965; });
    Object.entries(st.frames).forEach(([id, [x, y, w, h, z]]) => { T[id] = { r: [x, y, w, h], o: 1, sh: 0, sc: 1, z }; });
  }
  if (st.mode === 'feat' && st.hero) {
    ids.forEach(id => { T[id].sh = 0.74; T[id].sc = 0.965; });
    const H = MB[st.hero], hr = mbFrame(H, st.sats.length ? 980 : 1120, st.frameH || 780, st.sats.length ? 1150 : 1265, 520, st.up || 1.7);
    T[st.hero] = { r: hr, o: 1, sh: 0, sc: 1, z: 40 };
    const [hx, hy, hw, hh] = hr;
    st.sats.forEach((id, k) => {
      const t = MB[id], portrait = t.w < t.h, w0 = t.video ? 300 : portrait ? 270 : 380, h0 = t.video ? 534 : portrait ? 380 : 270;
      const [, , w, h] = mbFrame(t, w0, h0, 0, 0, 2.2);
      const pos = [
        [Math.min(1880 - w, hx + hw - w * 0.3), Math.max(46, hy - h * 0.28)],          // topo direito
        [Math.min(1880 - w, hx + hw - w * 0.36), Math.min(1034 - h, hy + hh - h * 0.62)], // base direita
        [Math.max(610, hx - w * 0.45), Math.min(1034 - h, hy + hh - h * 0.55)]          // base esquerda
      ][k];
      T[id] = { r: [Math.round(pos[0]), Math.round(pos[1]), w, h], o: 1, sh: 0, sc: 1, z: 41 + k };
    });
  }
  return T;
}
const mbPx = (v) => Math.round(v) + 'px';
const mb = {
  id: 'mb', title: 'Experiências: Morro, Boipeba e Cairu', steps: MB_STEPS.length, el: $('#mb'), cur: -1, last: null,
  notes: 'Moodboard vivo. Cada clique leva uma experiência ao primeiro plano; o clique seguinte a devolve ao mosaico. Seta para a esquerda volta uma experiência. Ordem: abertura; Morro (Forte de Tapirandu, praias e piscinas, Volta à Ilha, quadriciclo até Garapuá, Gamboa + Coroa, Farol + tirolesa, pôr do sol na Toca do Morcego); Boipeba (Moreré, Lagosta do Guido, Volta à Ilha de Boipeba, pastel de polvo com banana em Castelhanos, ostras em Canavieiras); Cairu Sede (vista da sede, Convento de Santo Antônio desde 1654, igrejas, azulejaria e casario); fechamento com a marca do arquipélago.',
  reset() {
    killAll(this.el); this.cur = -1; this.last = null; this.kbA = null;
    Object.values(MB).forEach(t => { t.el.style.opacity = 0; t.el.style.zIndex = 1; });
    $$('.mb-ttl, .mb-cap, .mb-fin', this.el).forEach(x => x.style.opacity = 0);
    $('.mb-veil', this.el).style.opacity = 0; $('.mb-veil2', this.el).style.opacity = 0;
  },
  ambient() {
    $$('video', this.el).forEach(v => { v.muted = true; const pr = v.play(); if (pr) pr.catch(() => {}); });
    Object.values(MB).forEach((t, k) => {
      anim(t.img, [{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }], { duration: 15000 + (k % 5) * 2600, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }, true);
      anim(t.el, [{ translate: '0 0' }, { translate: `0 ${k % 2 ? 10 : -10}px` }], { duration: 9000 + (k % 4) * 1700, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }, true);
    });
  },
  place(i, animate, dir) {
    const T = mbTargets(i), st = MB_STEPS[i], prevSt = this.last != null ? MB_STEPS[this.last] : null, DUR = 1250;
    const prevFeat = prevSt ? [prevSt.hero, ...(prevSt.sats || []), prevSt.full, ...Object.keys(prevSt.frames || {})].filter(Boolean) : [];
    Object.values(MB).forEach(t => {
      const el = t.el, cs = getComputedStyle(el), tg = T[t.id];
      const from = { left: cs.left, top: cs.top, width: cs.width, height: cs.height, opacity: cs.opacity, scale: cs.scale === 'none' ? '1' : cs.scale };
      const shFrom = getComputedStyle(t.sh).opacity;
      el.getAnimations().forEach(a => { if (a.effect && a.effect.getKeyframes().some(f => 'left' in f)) a.cancel(); });
      t.sh.getAnimations().forEach(a => a.cancel());
      let to;
      if (tg) {
        const [x, y, w, h] = tg.r;
        to = { left: mbPx(x), top: mbPx(y), width: mbPx(w), height: mbPx(h), opacity: '1', scale: String(tg.sc) };
        el.style.zIndex = tg.z > 2 ? tg.z : prevFeat.includes(t.id) ? 30 : 2;
        el.classList.toggle('lift', tg.z > 2);
      } else {
        to = { left: from.left, top: (parseFloat(from.top) - 40) + 'px', width: from.width, height: from.height, opacity: '0', scale: '0.94' };
        el.style.zIndex = 1; el.classList.remove('lift');
      }
      const entering = tg && parseFloat(from.opacity) < 0.05;
      if (entering) { from.left = to.left; from.width = to.width; from.height = to.height; from.top = (parseFloat(to.top) + 60) + 'px'; from.scale = '0.94'; }
      Object.assign(el.style, to); t.sh.style.opacity = tg ? tg.sh : 0;
      if (animate) {
        const stagger = entering ? (t.k % 7) * 60 : 0;
        anim(el, [from, to], { duration: entering ? 1500 : DUR, delay: stagger, easing: EASE_IO });
        anim(t.sh, [{ opacity: shFrom }, { opacity: tg ? tg.sh : 0 }], { duration: DUR, easing: EASE_IO });
      }
    });
  },
  text(i, animate) {
    const st = MB_STEPS[i], e = this.el, ttl = $('.mb-ttl', e), cap = $('.mb-cap', e), fin = $('.mb-fin', e);
    const v1 = st.mode === 'feat' ? 1 : 0, v2 = st.mode === 'title' || st.mode === 'final' ? 1 : 0;
    const swap = (box, fill, show) => {
      if (!animate) { if (show) fill(); box.style.opacity = show ? 1 : 0; return; }
      const was = parseFloat(getComputedStyle(box).opacity);
      if (was > 0.05) anim(box, [{ opacity: was, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-14px)' }], { duration: 380 });
      box.style.opacity = show ? 1 : 0;
      if (show) later(() => { fill(); anim(box, [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 900 }); }, was > 0.05 ? 400 : 250);
    };
    swap(ttl, () => { $('.k', ttl).textContent = st.k || ''; $('h2', ttl).innerHTML = st.t || ''; $('.s', ttl).textContent = st.sub || ''; $('.s', ttl).classList.toggle('caps', !!st.subCaps); }, st.mode === 'title');
    swap(cap, () => {
      $('.a', cap).textContent = st.act; $('.n', cap).textContent = st.of > 1 ? `${String(st.n).padStart(2, '0')} / ${String(st.of).padStart(2, '0')}` : '';
      $('h2', cap).textContent = st.t; $('.tg', cap).textContent = st.tg || ''; $('.tg', cap).classList.toggle('caps', !!st.tgCaps); $('.l', cap).textContent = st.l;
      $('.nt', cap).textContent = st.note || ''; $('.src', cap).textContent = st.src || '';
    }, st.mode === 'feat');
    swap(fin, () => {}, st.mode === 'final');
    [['.mb-veil', v1], ['.mb-veil2', v2]].forEach(([s, v]) => {
      const el = $(s, e), was = getComputedStyle(el).opacity; el.style.opacity = v;
      if (animate) anim(el, [{ opacity: was }, { opacity: v }], { duration: 900, easing: EASE_IO });
    });
  },
  camera(i) {
    if (this.kbA) { this.kbA.cancel(); this.kbA = null; }
    const st = MB_STEPS[i];
    if (st.kb && st.hero) this.kbA = anim(MB[st.hero].img, [{ transform: 'scale(1.04) translate(1.5%, 1%)' }, { transform: 'scale(1.16) translate(-1.5%, -1%)' }], { duration: 14000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }, true);
    if (st.full) this.kbA = anim(MB[st.full].img, [{ transform: 'scale(1.02)' }, { transform: 'scale(1.12) translate(-1%, 0)' }], { duration: 16000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }, true);
  },
  show(i, animate, dir) {
    const anim8 = animate || dir === -1;
    setTimeout(() => this.camera(i), 0);
    if (this.cur < 0 && !animate) { this.place(i, false); this.text(i, false); this.ambient(); this.last = i; this.cur = i; return; }
    if (this.cur < 0) this.ambient();
    this.place(i, anim8, dir); this.text(i, anim8); this.last = i; this.cur = i;
  }
};

/* ───────────────── PALESTRANTES · reconstrução do slide aprovado no Canva (camadas separadas)
   Passo 1: o cenário se monta e os retratos aparecem na penumbra.
   Passo 2: Jackson se acende, com nome e cargos.  Passo 3: Alexandre se acende, com nome e cargos. */
const CV = (k) => $('#cv_' + k);
const CV_DIM = 'brightness(.26) saturate(.15) contrast(1.05) drop-shadow(0 0 0 rgba(255,255,255,0))';
const CV_LIT = 'brightness(1) saturate(1) contrast(1) drop-shadow(0 0 0 rgba(255,255,255,0))';
const CV_SIDE = { L: ['nameL', 'rule1L', 'role1L', 'rule2L', 'role2L', 'rule3L', 'role3L'], R: ['nameR', 'rule1R', 'role1R', 'rule2R', 'role2R', 'rule3R', 'role3R'] };
const CV_SET = ['panelL', 'panelR', 'band', 'iconL', 'iconR', 'ruleTopL', 'ruleTopR', 'titleText', 'titleRule', 'bandText', 'bandRuleL', 'bandRuleR'];
const sp = {
  id: 'sp', title: 'Palestrantes', steps: 3, el: $('#sp'),
  notes: 'Três cliques. 1) O cenário se monta e os dois aparecem na penumbra. 2) Jackson se acende: nome e cargos. 3) Alexandre se acende: CEO da IBDTUR, ex-secretário de Turismo de Fortaleza e ex-presidente da ANSEDITUR.',
  init() {},
  reset() {
    const e = this.el; killAll(e);
    $('.cv-photo-in', e).style.clipPath = 'inset(0 50% 0 50%)';
    [...CV_SET, ...CV_SIDE.L, ...CV_SIDE.R].forEach(k => { CV(k).style.opacity = 0; CV(k).style.clipPath = ''; });
    ['portJ', 'portA'].forEach(k => { CV(k).style.opacity = 0; CV(k).style.filter = CV_DIM; });
  },
  side(s, on) {
    CV_SIDE[s].forEach(k => { CV(k).style.opacity = on ? 1 : 0; CV(k).style.clipPath = ''; });
    CV(s === 'L' ? 'portJ' : 'portA').style.filter = on ? CV_LIT : CV_DIM;
  },
  final(i) {
    $('.cv-photo-in', this.el).style.clipPath = 'inset(0 0% 0 0%)';
    CV_SET.forEach(k => { CV(k).style.opacity = 1; CV(k).style.clipPath = ''; });
    ['portJ', 'portA'].forEach(k => CV(k).style.opacity = 1);
    this.side('L', i >= 1); this.side('R', i >= 2);
  },
  wipe(k, from, delay, dur = 1100) {   // from: 'l' (esq→dir), 'r' (dir→esq), 'c' (do centro)
    const st = { l: 'inset(0 100% 0 0)', r: 'inset(0 0 0 100%)', c: 'inset(0 50% 0 50%)' }[from];
    CV(k).style.opacity = 1;
    anim(CV(k), [{ clipPath: st }, { clipPath: 'inset(0 0% 0 0%)' }], { duration: dur, delay, easing: EASE_IO });
    anim(CV(k), [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay });
  },
  up(k, delay, dist = 18, dur = 900) {
    CV(k).style.opacity = 1;
    anim(CV(k), [{ opacity: 0, transform: `translateY(${dist}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration: dur, delay, easing: EASE });
  },
  light(s) {
    const L = s === 'L', P = CV(L ? 'portJ' : 'portA'), K = CV_SIDE[s], dir = L ? 'l' : 'r';
    P.style.filter = CV_LIT;
    anim(P, [{ filter: CV_DIM }, { filter: 'brightness(1.08) saturate(1) contrast(1) drop-shadow(0 0 26px rgba(255,255,255,.55))', offset: .6 }, { filter: CV_LIT }], { duration: 1500, easing: 'ease-out' });
    this.up(K[0], 350, 26, 1000);
    this.wipe(K[1], dir, 750, 700); this.up(K[2], 850, 12, 800);
    this.wipe(K[3], dir, 1050, 700); this.up(K[4], 1150, 12, 800);
    this.wipe(K[5], dir, 1350, 700); this.up(K[6], 1450, 12, 800);
  },
  show(i, animate) {
    const e = this.el;
    if (!animate) { this.reset(); this.final(i); return; }
    if (i === 1) return this.light('L');
    if (i === 2) return this.light('R');
    this.reset();
    // a paisagem abre do centro e os retratos surgem na penumbra
    anim($('.cv-photo-in', e), [{ clipPath: 'inset(0 50% 0 50%)' }, { clipPath: 'inset(0 0% 0 0%)' }], { duration: 1700, easing: EASE_IO });
    ['portJ', 'portA'].forEach((k, n) => { CV(k).style.opacity = 1; anim(CV(k), [{ opacity: 0 }, { opacity: 1 }], { duration: 1200, delay: 700 + n * 150 }); });
    // os painéis entram pelas bordas, a faixa sobe
    this.wipe('panelL', 'l', 600, 1300); this.wipe('panelR', 'r', 600, 1300);
    CV('band').style.opacity = 1;
    anim(CV('band'), [{ transform: 'translateY(117px)' }, { transform: 'translateY(0)' }], { duration: 1200, delay: 800, easing: EASE_IO });
    // título, ícones e ornamentos
    this.wipe('titleText', 'c', 1200, 1400); this.wipe('titleRule', 'c', 1650, 1200);
    this.up('iconL', 1500, 22, 1100); this.up('iconR', 1650, 22, 1100);
    this.wipe('ruleTopL', 'l', 1800, 1000); this.wipe('ruleTopR', 'r', 1800, 1000);
    this.wipe('bandText', 'c', 1900, 1500); this.wipe('bandRuleL', 'r', 2100, 1200); this.wipe('bandRuleR', 'l', 2100, 1200);
    anim($('.cv-sweep', e), [{ transform: 'translateX(-60%)', opacity: 0 }, { opacity: .9, offset: .4 }, { transform: 'translateX(160%)', opacity: 0 }], { duration: 2200, delay: 1500, easing: 'ease-in-out' });
  }
};

/* ───────────────── IDADE · linha da vida */
const a2 = {
  id: 'a2', title: 'Perfil: faixa etária', steps: 2, el: $('#a2'),
  notes: 'A faixa mostra os visitantes por idade, da mais jovem à mais madura. Segundo clique: os três grupos centrais, de 23 a 50 anos, somam 64,1%. Um destino que conversa com todos os públicos, com forte peso do adulto em idade produtiva.',
  init() {
    const life = $('#life'), W = 1620, tot = DADOS.idade.reduce((s, g) => s + g.pct, 0);
    const COL = ['#EAD7B8', '#F9BE3E', '#FE5837', '#FE5837', '#FE5837', '#2E9A9A', '#7FB6D6'];
    let x = 0; this.core = [Infinity, 0];
    DADOS.idade.forEach((g, k) => {
      const w = g.pct / tot * W, d = document.createElement('div');
      d.className = 'seg'; d.dataset.core = g.central ? 1 : 0;
      Object.assign(d.style, { left: x + 'px', width: w + 'px' });
      d.innerHTML = `<i style="background:${COL[k]}"></i><div class="lab"><b>${g.pct.toLocaleString('pt-BR')}%</b>${g.faixa}</div>`;
      life.appendChild(d);
      if (g.central) { this.core[0] = Math.min(this.core[0], x); this.core[1] = x + w; }
      x += w;
    });
    const b = document.createElement('div'); b.className = 'brk';
    Object.assign(b.style, { left: this.core[0] + 'px', width: (this.core[1] - this.core[0]) + 'px' }); life.appendChild(b);
    const hl = $('#lifeHl'); Object.assign(hl.style, { left: (150 + this.core[0]) + 'px', width: (this.core[1] - this.core[0]) + 'px', top: '400px' });
  },
  reset() { killAll(this.el); $$('.seg', this.el).forEach(s => { s.style.transform = 'scaleX(0)'; s.style.opacity = 1; $('.lab', s).style.opacity = 0; }); $('.brk', this.el).style.opacity = 0; $('#lifeHl').style.opacity = 0; $$('.lp > *', this.el).forEach(x => x.style.opacity = 0); },
  state(i) { $$('.seg', this.el).forEach(s => { s.style.transform = 'scaleX(1)'; $('.lab', s).style.opacity = 1; s.style.opacity = i && s.dataset.core !== '1' ? .28 : 1; }); $('.brk', this.el).style.opacity = i ? 1 : 0; $('#lifeHl').style.opacity = i ? 1 : 0; $$('.lp > *', this.el).forEach(x => x.style.opacity = 1); },
  show(i, animate) {
    if (!animate) { killAll(this.el); this.state(i); return; }
    if (i === 0) {
      $$('.lp > *', this.el).forEach((x, k) => fadeIn(x, 200 + k * 200, 900));
      $$('.seg', this.el).forEach((s, k) => { anim(s, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 700, delay: 900 + k * 260, easing: EASE_IO }); fadeIn($('.lab', s), 1300 + k * 260, 500); });
    } else {
      $$('.seg', this.el).forEach(s => { if (s.dataset.core !== '1') anim(s, [{ opacity: 1 }, { opacity: .28 }], { duration: 700 }); });
      fadeIn($('.brk', this.el), 300, 600);
      anim($('#lifeHl'), [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 900, delay: 500 });
    }
  }
};

sp.init(); a2.init();

/* barras de tempo na cena Como chegar */
(function(){
  const box = $('#tbars'), mx = Math.max(...DADOS.acesso.map(a => a.minutos)), C = ['var(--sol)', 'var(--teal)', 'var(--coral)'];
  box.innerHTML = DADOS.acesso.map((a, k) => `<div class="tbar"><div class="tn"><b>${a.modal}</b><span>${a.rotulo}</span></div><div class="tt" style="width:${Math.round(a.minutos / mx * 100)}%;background:${a.cor || C[k % 3]}"></div></div>`).join('');
  const show0 = s3.show.bind(s3);
  s3.show = function(i, animate){
    show0(i, animate);
    const tt = $$('#tbars .tt');
    if (i !== 4) { tt.forEach(t => t.style.transform = 'scaleX(0)'); return; }
    if (!animate) { tt.forEach(t => t.style.transform = 'scaleX(1)'); return; }
    tt.forEach((t, k) => anim(t, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1200, delay: 900 + k * 300, easing: EASE_IO }));
  };
  s3.notes = s3.notes.replace('5) As três juntas: o cliente escolhe pelo tempo e pelo orçamento.', '5) Quanto tempo leva cada opção saindo de Salvador: voo de menos de 30 minutos, catamarã cerca de 2h30, semiterrestre cerca de 3h30 (confirmar os tempos antes do BTM).');
})();

const SCENES = [s1, sp, s2, s3, a1, a2, a3, mb];
const TOTAL = SCENES.length;

/* ───── transições entre cenas */
function dive(from, to) {           // cena 1 → 2: a câmera mergulha no mar
  anim(from.el, [{ transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' }, { transform: 'scale(1.35)', opacity: 0, filter: 'blur(8px)' }], { duration: 1200, easing: 'cubic-bezier(.6,0,.4,1)' })
    .finished.then(() => { from.el.classList.remove('on'); from.el.style.transform = ''; from.el.style.opacity = ''; from.el.style.filter = ''; killAll(from.el); }).catch(() => {});
}
function toMap(from, to) {          // cena 2 → 3: a foto encolhe até virar o ponto de Morro no mapa
  const img = $('.bg', from.el);
  ['.hero', '.ledger', '.scene-name', '.tide2', '.veil'].forEach(s => fadeOut($(s, from.el), 0, 500));
  from.el.style.zIndex = 3;
  anim(img, [{ clipPath: 'circle(1200px at 960px 540px)' }, { clipPath: 'circle(10px at 1182px 422px)' }], { duration: 1500, easing: 'cubic-bezier(.7,0,.3,1)' })
    .finished.then(() => { from.el.classList.remove('on'); from.el.style.zIndex = ''; killAll(from.el); ['.hero', '.ledger', '.scene-name', '.tide2', '.veil'].forEach(s => $(s, from.el).style.opacity = ''); img.style.clipPath = ''; }).catch(() => {});
}
function crossfade(from, to) {
  anim(from.el, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: EASE_IO })
    .finished.then(() => { from.el.classList.remove('on'); from.el.style.opacity = ''; killAll(from.el); }).catch(() => {});
}

/* ───── estado e navegação */
let si = 0, step = 0;
function go(n, opts = {}) {
  if (n < 0) return;
  $('#endcard').classList.remove('on');
  if (n >= SCENES.length) { if (opts.fromNext) $('#endcard').classList.add('on'); return; }
  const from = SCENES[si], to = SCENES[n], forward = n > si;
  finishAll(); dropPending();
  if (from.stop && from !== to) from.stop();
  to.reset(); to.el.classList.add('on'); to.el.style.opacity = '';
  const target = opts.atEnd ? to.steps - 1 : 0;
  if (from !== to && from.el.classList.contains('on')) {
    if (forward && si === 1 && n === 2) dive(from, to);
    else if (forward && si === 2 && n === 3) toMap(from, to);
    else crossfade(from, to);
  }
  si = n; step = target;
  if (opts.atEnd) to.show(target, false); else to.show(0, true);
  ui();
}
function next() {
  if (busy()) { finishAll(); return; }
  const sc = SCENES[si];
  if (step < sc.steps - 1) { step++; sc.show(step, true, 1); ui(); }
  else go(si + 1, { fromNext: true });
}
function prev() {
  if ($('#endcard').classList.contains('on')) { $('#endcard').classList.remove('on'); return; }
  finishAll();
  const sc = SCENES[si];
  if (step > 0) { step--; sc.show(step, false, -1); ui(); }
  else if (si > 0) go(si - 1, { atEnd: true });
}
function restart() { dropPending(); const sc = SCENES[si]; sc.reset(); step = 0; sc.show(0, true); ui(); }
function togglePause() {
  paused = !paused;
  document.getAnimations().forEach(a => paused ? a.pause() : a.play());
  $('#bPause').innerHTML = paused ? '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M9 5v14M15 5v14"/></svg>';
  toast(paused ? 'Animações pausadas. Pressione K para retomar.' : 'Animações retomadas.'); ui();
}
function full() {
  const d = document, el = d.documentElement;
  if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
  else (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
}

/* ───── interface */
const prog = $('#progress'); for (let k = 0; k < TOTAL; k++) prog.appendChild(document.createElement('i'));
function ui() {
  const sc = SCENES[si];
  $('#where').textContent = `${String(si + 1).padStart(2, '0')} / ${TOTAL}  ${sc.title}${sc.steps > 1 ? `  (${step + 1}/${sc.steps})` : ''}`;
  $$('i', prog).forEach((x, k) => x.className = k < si ? 'done' : k === si ? 'cur' : '');
  presenter.update();
}
let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2600); }
let idle; function wake() { document.body.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('idle'), 2500); }
addEventListener('mousemove', wake); wake();

function key(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key;
  if (['ArrowRight', ' ', 'PageDown', 'Enter'].includes(k)) { e.preventDefault(); next(); }
  else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
  else if (k === 'Home') go(0); else if (k === 'End') go(SCENES.length - 1, { atEnd: true });
  else if (/^[1-9]$/.test(k)) go(+k - 1);
  else if (k === '0') go(9);
  else if (k === 'r' || k === 'R') restart();
  else if (k === 'k' || k === 'K') togglePause();
  else if (k === 'f' || k === 'F') full();
  else if (k === 'p' || k === 'P') presenter.open();
  else if (k === '?' || k === 'h' || k === 'H') $('#help').classList.toggle('on');
  else if (k === 'Escape') $('#help').classList.remove('on');
  else return;
  wake();
}
addEventListener('keydown', key);
$('#bNext').onclick = next; $('#bPrev').onclick = prev; $('#bRestart').onclick = restart;
(() => {   /* celular e tablet: toque na direita avança, na esquerda volta; deslizar também */
  let x0 = null, y0 = null, t0 = 0;
  stage.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') return; x0 = e.clientX; y0 = e.clientY; t0 = Date.now(); }, { passive: true });
  stage.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'touch' || x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0, w = window.visualViewport ? visualViewport.width : innerWidth; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); return; }
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && Date.now() - t0 < 500) { e.clientX > w * 0.33 ? next() : prev(); }
  });
})();
$('#bPause').onclick = togglePause; $('#bFull').onclick = full; $('#bHelp').onclick = () => $('#help').classList.toggle('on');
$('#bNotes').onclick = () => presenter.open();
$('#help').onclick = () => $('#help').classList.remove('on');

/* ───── modo apresentador: janela separada, funciona offline */
const presenter = {
  win: null, t0: Date.now(),
  open() {
    if (this.win && !this.win.closed) { this.win.focus(); return; }
    const w = open('', 'mspb-apresentador', 'width=980,height=720');
    if (!w) { toast('O navegador bloqueou a janela do apresentador. Libere pop-ups para este arquivo.'); return; }
    this.win = w;
    w.document.open();
    w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Apresentador · Morro de São Paulo & Boipeba</title>
<style>
body{margin:0;background:#062638;color:#FEF4D7;font:18px/1.6 ${getComputedStyle(document.documentElement).getPropertyValue('--sans')};display:grid;grid-template-columns:1fr 300px;height:100vh}
main{padding:32px 40px;overflow:auto}aside{background:#041b28;padding:24px;overflow:auto}
h1{font:600 34px/1.2 ${getComputedStyle(document.documentElement).getPropertyValue('--serif')};margin:6px 0 4px}
.meta{color:#EAD7B8;font-size:16px}.notes{font-size:24px;line-height:1.55;margin-top:24px;max-width:62ch}
.next{margin-top:28px;color:#EAD7B8;font-size:17px}.bar{display:flex;gap:10px;margin-top:26px;flex-wrap:wrap}
button{font-weight:600;font-size:16px;font-family:inherit;padding:12px 18px;border-radius:10px;border:0;background:#09496D;color:#FEF4D7;cursor:pointer}
button:hover{background:#2E9A9A}.clock{font-size:30px;font-weight:600;color:#FDDA00}
ol{list-style:none;padding:0;margin:14px 0 0}li button{width:100%;text-align:left;background:transparent;padding:10px 12px;font-weight:500}
li button.cur{background:#09496D}li button:disabled{opacity:.35;cursor:default}
</style></head><body><main><div class="meta" id="pos"></div><h1 id="ttl"></h1><div class="meta" id="stp"></div>
<div class="notes" id="nts"></div><div class="next" id="nxt"></div>
<div class="bar"><button id="p">‹ Voltar</button><button id="n">Avançar ›</button><button id="r">Reiniciar cena</button><button id="k">Pausar/retomar</button></div></main>
<aside><div class="meta">Tempo de palestra</div><div class="clock" id="clk">00:00</div><button id="z" style="margin-top:8px">Zerar tempo</button><div class="meta" style="margin-top:22px">Cenas</div><ol id="lst"></ol></aside></body></html>`);
    w.document.close();
    const d = w.document;
    d.getElementById('p').onclick = () => prev(); d.getElementById('n').onclick = () => next();
    d.getElementById('r').onclick = () => restart(); d.getElementById('k').onclick = () => togglePause();
    d.getElementById('z').onclick = () => { this.t0 = Date.now(); };
    w.addEventListener('keydown', key);
    const names = SCENES.map(s => s.title);
    const lst = d.getElementById('lst');
    names.forEach((nm, k) => { const li = d.createElement('li'), b = d.createElement('button'); b.textContent = `${k + 1}. ${nm}`; b.onclick = () => go(k); li.appendChild(b); lst.appendChild(li); });
    clearInterval(this.clock);
    this.clock = setInterval(() => { if (!this.win || this.win.closed) return clearInterval(this.clock); const s = Math.floor((Date.now() - this.t0) / 1000); d.getElementById('clk').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000);
    this.update();
  },
  update() {
    const w = this.win; if (!w || w.closed) return;
    const d = w.document, sc = SCENES[si];
    d.getElementById('pos').textContent = `Cena ${si + 1} de ${TOTAL}`;
    d.getElementById('ttl').textContent = sc.title;
    d.getElementById('stp').textContent = sc.steps > 1 ? `Etapa ${step + 1} de ${sc.steps}` : '';
    d.getElementById('nts').textContent = sc.notes;
    const nx = step < sc.steps - 1 ? `Próximo clique: etapa ${step + 2}` : (SCENES[si + 1] ? `A seguir: ${SCENES[si + 1].title}` : 'Última cena');
    d.getElementById('nxt').textContent = nx;
    [...d.querySelectorAll('#lst button')].forEach((b, k) => b.classList.toggle('cur', k === si));
  }
};
addEventListener('beforeunload', () => { if (presenter.win && !presenter.win.closed) presenter.win.close(); });

/* ───── início: espera as imagens decodificarem */
const imgs = $$('#stage img');
Promise.all(imgs.map(i => (i.decode ? i.decode() : Promise.resolve()).catch(() => { i.style.background = '#09496D'; })))
  .then(() => {
    const l = $('#loading'); l.style.opacity = 0; setTimeout(() => l.remove(), 700);
    SCENES.forEach(s => s.reset());
    $('#s1').classList.add('on'); s1.show(0, true); ui();
    toast('Pressione F para tela cheia, P para as notas e ? para os atalhos.');
  });
})();
