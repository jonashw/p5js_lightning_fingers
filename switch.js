// Version switch for Lightning Fingers.
//
// One home-screen shortcut opens the site root. A grown-up picks which toy that shortcut opens:
//   Original (the p5.js sketch at /), Shader (/shader/, the faithful port) or Plasma (/plasma/, the reimagining).
// The choice lives in this tablet's localStorage, so it sticks until it's changed again.
//
// How a grown-up gets to it: hold BOTH bottom corners of the screen for 3 seconds (a ring fills in each
// corner after the first second), the same gesture as the Plasma settings panel. On Plasma the switch sits
// inside that panel; on the other two it opens a small base with just the switch. Key "g" also opens it.
// Add #original, #shader or #plasma to the root address to visit one version without changing the choice.
(function () {
  var KEY = 'lightning-fingers-version';
  var VERSIONS = [
    { id: 'original', name: 'Original', path: '/' },
    { id: 'shader', name: 'Shader', path: '/shader/' },
    { id: 'plasma', name: 'Plasma', path: '/plasma/' }
  ];
  function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(id) { try { localStorage.setItem(KEY, id); } catch (e) {} }
  var here = /\/plasma\//.test(location.pathname) ? 'plasma' : /\/shader\//.test(location.pathname) ? 'shader' : 'original';
  var byId = function (id) { for (var i = 0; i < VERSIONS.length; i++) if (VERSIONS[i].id === id) return VERSIONS[i]; return null; };

  // 1. The shortcut: the root page sends you on to the chosen version before anything loads.
  if (here === 'original') {
    var visit = (location.hash.match(/original|shader|plasma/) || [])[0];
    var want = byId(visit || load());
    if (want && want.id !== 'original') { location.replace(want.path); return; }
  }

  // 2. The switch itself, built once the page is ready.
  function ready(fn) { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn(); }
  ready(function () { setTimeout(build, 0); });

  var NS = 'http://www.w3.org/2000/svg';
  function polar(a, r) { return [38 + r * Math.sin(a * Math.PI / 180), 38 - r * Math.cos(a * Math.PI / 180)]; }

  // A three-way rotary selector: black cap, white pointer, three neon dots. Turning it goes to that version.
  function selector(cls) {
    var i = VERSIONS.indexOf(byId(here)), span = 120;
    var box = document.createElement('div'); box.className = cls.ctl; box.tabIndex = 0;
    box.setAttribute('role', 'button'); box.setAttribute('aria-label', 'Toy version');
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 76 76');
    var marks = '';
    VERSIONS.forEach(function (_, k) { var p = polar(-span / 2 + span * k / 2, 33); marks += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.6" fill="#3a1d10"/>'; });
    svg.innerHTML = '<defs><radialGradient id="lfsCap" cx="40%" cy="32%" r="75%"><stop offset="0" stop-color="#3b3b44"/><stop offset=".55" stop-color="#17171b"/><stop offset="1" stop-color="#0a0a0c"/></radialGradient></defs>' +
      '<g class="marks">' + marks + '</g><circle cx="38" cy="38" r="20" fill="url(#lfsCap)"/>' +
      '<g class="head"><path d="M38 12 L44 36 Q38 46 32 36 Z" fill="#e9e3d8"/><circle cx="38" cy="38" r="8" fill="#e9e3d8"/></g>';
    var lab = document.createElement('div'); lab.className = cls.lab; lab.textContent = 'Toy';
    var out = document.createElement('div'); out.className = cls.val;
    box.appendChild(svg); box.appendChild(lab); box.appendChild(out);
    function draw() {
      svg.querySelector('.head').setAttribute('transform', 'rotate(' + (-span / 2 + span * i / 2) + ' 38 38)');
      var dots = svg.querySelectorAll('.marks circle');
      for (var k = 0; k < dots.length; k++) { dots[k].setAttribute('fill', k === i ? '#ff8a3c' : '#3a1d10'); dots[k].style.filter = k === i ? 'drop-shadow(0 0 3px rgba(255,120,40,.95))' : 'none'; }
      out.textContent = VERSIONS[i].name; box.setAttribute('aria-valuetext', VERSIONS[i].name);
    }
    var go = null;
    function turn() {
      i = (i + 1) % VERSIONS.length; draw(); save(VERSIONS[i].id);
      // wait a moment so a grown-up can turn past a version without loading it
      clearTimeout(go);
      if (VERSIONS[i].id !== here) go = setTimeout(function () { location.replace(VERSIONS[i].path); }, 1400);
    }
    box.addEventListener('click', turn);
    box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); turn(); } });
    draw();
    return box;
  }

  function build() {
    // Plasma already has a grown-up panel: put the switch beside its other switches.
    var row = document.querySelector('.gp-sw');
    if (row) { row.appendChild(selector({ ctl: 'gp-ctl', lab: 'gp-lab', val: 'gp-val' })); return; }

    var css = document.createElement('style');
    css.textContent =
      '.lfs-ring{position:fixed;bottom:10px;width:64px;height:64px;pointer-events:none;opacity:0;transition:opacity .3s;z-index:30}' +
      '.lfs-ring circle{fill:none;stroke:rgba(255,140,60,.9);stroke-width:3;stroke-linecap:round;filter:drop-shadow(0 0 4px rgba(255,120,40,.9))}' +
      '.lfs-shade{position:fixed;inset:0;z-index:40;display:none}' +
      '.lfs-base{position:fixed;left:50%;bottom:0;transform:translate(-50%,105%);transition:transform .45s cubic-bezier(.2,.8,.2,1);' +
      'width:min(100%,320px);z-index:41;box-sizing:border-box;padding:18px 12px calc(20px + env(safe-area-inset-bottom,0px));display:flex;justify-content:center;' +
      'background:linear-gradient(#1b1b20,#0b0b0e 38%,#060608);border-radius:26px 26px 0 0;box-shadow:0 -1px 0 rgba(255,255,255,.14) inset,0 -18px 40px rgba(0,0,0,.55);' +
      'font-family:system-ui,sans-serif;color:#b9b3a8;user-select:none;-webkit-user-select:none;touch-action:none}' +
      '.lfs-base.open{transform:translate(-50%,0)}' +
      '.lfs-ctl{display:flex;flex-direction:column;align-items:center;gap:6px;width:80px;cursor:pointer}' +
      '.lfs-ctl svg{width:62px;height:62px;overflow:visible}' +
      '.lfs-lab{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8d867b}' +
      '.lfs-val{font-size:11px;color:#ffb27a;letter-spacing:.06em;min-height:1em}' +
      '.lfs-ctl:focus-visible{outline:2px solid #ff9a50;outline-offset:4px;border-radius:10px}';
    document.head.appendChild(css);

    var rings = ['left', 'right'].map(function (side) {
      var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 64 64'); s.setAttribute('class', 'lfs-ring');
      s.style[side] = '10px';
      s.innerHTML = '<circle cx="32" cy="32" r="24" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 32 32)"/>';
      document.body.appendChild(s); return s;
    });
    var shade = document.createElement('div'); shade.className = 'lfs-shade';
    var base = document.createElement('div'); base.className = 'lfs-base'; base.setAttribute('role', 'dialog'); base.setAttribute('aria-label', 'Grown-up settings');
    base.appendChild(selector({ ctl: 'lfs-ctl', lab: 'lfs-lab', val: 'lfs-val' }));
    document.body.appendChild(shade); document.body.appendChild(base);
    var open = false;
    function openIt() { open = true; rings.forEach(function (r) { r.style.opacity = 0; }); shade.style.display = 'block'; base.classList.add('open'); }
    function closeIt() { open = false; shade.style.display = 'none'; base.classList.remove('open'); }
    shade.addEventListener('pointerdown', function (e) { e.preventDefault(); closeIt(); });
    window.addEventListener('keydown', function (e) { if (e.key === 'g') open ? closeIt() : openIt(); if (e.key === 'Escape' && open) closeIt(); });

    // The gate: watch every finger without getting in the toy's way.
    var pts = {};
    function track(e) { pts[e.pointerId] = { x: e.clientX, y: e.clientY }; }
    function drop(e) { delete pts[e.pointerId]; }
    window.addEventListener('pointerdown', track, true); window.addEventListener('pointermove', function (e) { if (pts[e.pointerId]) track(e); }, true);
    ['pointerup', 'pointercancel'].forEach(function (t) { window.addEventListener(t, drop, true); });
    var held = 0, last = performance.now();
    (function frame(now) {
      var dt = Math.min(100, now - last) / 1000; last = now;
      if (!open) {
        var W = innerWidth, H = innerHeight, zone = Math.max(70, Math.min(W, H) * 0.16), bl = false, br = false;
        for (var id in pts) { var p = pts[id]; if (p.y < H - zone) continue; if (p.x < zone) bl = true; else if (p.x > W - zone) br = true; }
        held = bl && br ? held + dt : 0;
        var f = Math.max(0, Math.min(1, (held - 1) / 2));
        rings.forEach(function (r) { r.style.opacity = held > 1 ? 1 : 0; r.querySelector('circle').setAttribute('stroke-dasharray', (f * 100) + ' 100'); });
        if (held >= 3) { held = 0; pts = {}; openIt(); }
      }
      requestAnimationFrame(frame);
    })(last);
  }
})();
