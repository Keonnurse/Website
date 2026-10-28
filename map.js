// Connections map: what I studied, what I built, and the lines between them.
// No libraries. Does nothing if the #map section is missing, and the page works without it.
(() => {
  const svg = document.getElementById('map-graph');
  const panel = document.getElementById('map-panel');
  if (!svg || !panel) return;

  // Each node: group (psych, comp, built), a short note, where it lives on the page, and its cross links.
  // Every non-hub node also links to its own hub automatically.
  const NODES = [
    { id: 'psych', group: 'psych', hub: true, label: 'Psychology', meta: 'BA major',
      text: 'How people sense, remember, learn and act. The part of my degree that shapes how I build things for people.',
      go: '#education', goLabel: 'See education' },
    { id: 'comp', group: 'comp', hub: true, label: 'Computing', meta: 'Minor, plus self taught',
      text: 'Programming, hardware and networks. Some from the minor, the rest from needing it for a project.',
      go: '#skills', goLabel: 'See skills' },
    { id: 'built', group: 'built', hub: true, label: 'Built', meta: 'Projects and work',
      text: 'Things I designed, wired, ran or taught. Most of them pull from both sides of the map.',
      go: '#projects', goLabel: 'See projects' },

    { id: 'perception', group: 'psych', label: 'Perception', meta: 'PSYCH 367',
      text: 'How the senses turn noisy input into a stable picture. A scoreboard gets read in a glance from across a table, so it is a perception problem before it is a wiring one.',
      links: ['scoreboard', 'chords'], go: '#education', goLabel: 'See education' },
    { id: 'cognition', group: 'psych', label: 'Cognitive psych', title: 'Cognitive psychology', meta: 'PSYCH 258',
      text: 'Attention, working memory and problem solving. Most of what I know about why a screen feels easy or confusing started here.',
      links: ['web', 'cogsci', 'memory'], go: '#education', goLabel: 'See education' },
    { id: 'memory', group: 'psych', label: 'Memory', title: 'Human memory', meta: 'PSYCH 350',
      text: 'Encoding, retrieval and forgetting. Recall runs on cues, and the more paths lead to something, the easier it is to find. Part of why this map exists.',
      go: '#education', goLabel: 'See education' },
    { id: 'cogsci', group: 'psych', label: 'Cognitive science', meta: 'PSYCH 354',
      text: 'The mind as an information processor: rules on one side, networks of simple units on the other. Where psychology and computing stopped being separate subjects for me.',
      links: ['nn', 'minds'], go: '#education', goLabel: 'See education' },
    { id: 'minds', group: 'psych', label: 'Minds and machines', meta: 'PSYCH 452 · in progress',
      text: 'Building artificial neural networks as models of how people think, then checking what the trained network actually learned.',
      links: ['nn', 'chords'], go: '#education', goLabel: 'See education' },
    { id: 'behaviour', group: 'psych', label: 'Behaviour mod', title: 'Behaviour modification', meta: 'PSYCH 282',
      text: 'Reinforcement and shaping. Small, immediate feedback beats big, late feedback, in a classroom as much as anywhere.',
      links: ['bbc'], go: '#education', goLabel: 'See education' },
    { id: 'social', group: 'psych', label: 'Social psych', title: 'Social psychology', meta: 'PSYCH 241',
      text: 'How people read each other and decide who to trust. It shows up every time I am the tech person in the room.',
      links: ['factsnet', 'bbc'], go: '#education', goLabel: 'See education' },
    { id: 'methods', group: 'psych', label: 'Methods and stats', title: 'Research methods and statistics', meta: 'PSYCH 212 · PSYCH 213',
      text: 'Define what you are measuring, control what you are not, and ask what a number is really counting.',
      links: ['chords'], go: '#education', goLabel: 'See education' },

    { id: 'c', group: 'comp', label: 'C and C++', meta: 'CMPUT 201',
      text: 'Pointers, memory, debugging from a terminal. The scoreboard firmware is C++ on the same footing.',
      links: ['embedded', 'scoreboard'], go: '#education', goLabel: 'See education' },
    { id: 'arch', group: 'comp', label: 'Architecture', title: 'Computer architecture', meta: 'CMPUT 229',
      text: 'RISC-V assembly and how a processor actually runs a program. It took the mystery out of microcontrollers.',
      links: ['embedded'], go: '#education', goLabel: 'See education' },
    { id: 'networking', group: 'comp', label: 'Networking', meta: 'Self taught · studying for Network+',
      text: 'TCP/IP, subnetting, static addressing, managed switches and isolating traffic. Learned on my own rack, then used at Foote Field.',
      links: ['homelab', 'meet'], go: '#skills', goLabel: 'See skills' },
    { id: 'linux', group: 'comp', label: 'Linux', title: 'Linux and self hosting', meta: 'Proxmox · Raspberry Pi · Tailscale',
      text: 'Linux and Proxmox hosts on static IPs, with remote access over Tailscale.',
      links: ['homelab'], go: '#skills', goLabel: 'See skills' },
    { id: 'embedded', group: 'comp', label: 'Embedded', title: 'Embedded hardware', meta: 'ESP32 · Bluetooth LE · LED panels',
      text: 'Microcontrollers, Bluetooth Low Energy, LED matrix panels, LiPo power and charging.',
      links: ['scoreboard'], go: '#skills', goLabel: 'See skills' },
    { id: 'cad', group: 'comp', label: 'CAD as code', meta: 'Fusion 360 Python · CadQuery',
      text: 'Parts modelled as parametric scripts, so changing one number regenerates the whole part.',
      links: ['scoreboard'], go: '#scoreboard', goLabel: 'See the scoreboard' },
    { id: 'web', group: 'comp', label: 'Web', meta: 'HTML · CSS · JavaScript',
      text: 'Plain HTML, CSS and JavaScript, the same as this site. I taught the basics and supported non-profit sites with it.',
      links: ['bbc', 'factsnet'], go: '#skills', goLabel: 'See skills' },
    { id: 'nn', group: 'comp', label: 'Neural networks', meta: 'Connectionism',
      text: 'Simple units and weighted connections, trained by shrinking the error. A rough model of the brain, built in code.',
      links: ['chords'], go: '#education', goLabel: 'See education' },

    { id: 'scoreboard', group: 'built', label: 'Scoreboard', title: 'ESP32 LED scoreboard', meta: '2026',
      text: 'A battery powered table tennis scoreboard. ESP32, LED panels, Bluetooth buttons and parametric CAD, all 3D printed.',
      go: '#scoreboard', goLabel: 'See the project' },
    { id: 'homelab', group: 'built', label: 'Home server', title: 'Self-hosted home server', meta: 'Ongoing',
      text: 'A home server and network on mini PCs and Raspberry Pis, in a small rack I cabled myself.',
      go: '#homelab', goLabel: 'See the project' },
    { id: 'meet', group: 'built', label: 'Meet network', title: 'Foote Field meet network', meta: 'Timing and network crew · Summer 2026',
      text: 'The meet LAN for the timing, results and display systems, with the photo finish cameras on their own isolated network.',
      go: '#meet', goLabel: 'See the role' },
    { id: 'factsnet', group: 'built', label: 'FACTSnet', title: 'FACTSnet IT support', meta: 'April to August 2026',
      text: 'IT support for a non-profit: their sites, Google Workspace, and walking non-technical staff through it over screen share.',
      go: '#factsnet', goLabel: 'See the role' },
    { id: 'bbc', group: 'built', label: 'Black Boys Code', title: 'Teaching at Black Boys Code', meta: 'Summer 2026',
      text: 'Taught web development to students in an online after school coding program.',
      go: '#bbc', goLabel: 'See the role' },
    { id: 'chords', group: 'built', label: 'Chord network', title: 'Chord resolution network', meta: 'PSYCH 452 project · in progress',
      text: 'A neural network that hears two chords and predicts where they resolve. R&B progressions in all 12 keys, 24 inputs in, 12 out.',
      go: '#education', goLabel: 'See education' },
  ];
  const GROUP = { psych: 'Psychology', comp: 'Computing', built: 'Built' };
  const byId = new Map(NODES.map(n => [n.id, n]));

  // Edges
  const edges = [];
  const seen = new Set();
  const nbrs = new Map(NODES.map(n => [n.id, new Set()]));
  function link(a, b, kind) {
    const key = a < b ? a + '|' + b : b + '|' + a;
    if (a === b || seen.has(key) || !byId.has(b)) return;
    seen.add(key);
    edges.push({ a: byId.get(a), b: byId.get(b), kind });
    nbrs.get(a).add(b);
    nbrs.get(b).add(a);
  }
  NODES.forEach(n => { if (!n.hub) link(n.id, n.group, 'hub'); });
  NODES.forEach(n => (n.links || []).forEach(t => link(n.id, t, byId.get(t).group === n.group ? 'same' : 'cross')));

  // Drawing
  const NS = 'http://www.w3.org/2000/svg';
  function make(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const gEdges = make('g', {}, svg);
  const gNodes = make('g', {}, svg);
  edges.forEach(e => { e.el = make('line', { class: `edge ${e.kind} g-${e.a.group} g-${e.b.group}` }, gEdges); });
  NODES.forEach(n => {
    n.r = n.hub ? 9 : 4.5 + Math.min(nbrs.get(n.id).size, 5) * 0.5;
    const g = make('g', { class: `node ${n.group}${n.hub ? ' hub' : ''}`, tabindex: 0, role: 'button', 'aria-label': (n.title || n.label) + ', ' + GROUP[n.group] }, gNodes);
    make('circle', { class: 'hit', r: n.r + 10 }, g);
    make('circle', { class: 'ring', r: n.r + 5 }, g);
    make('circle', { class: 'core', r: n.r }, g);
    make('text', { y: n.r + (n.hub ? 18 : 14), 'text-anchor': 'middle' }, g).textContent = n.label;
    n.el = g;
  });

  // Drawn position = settled position plus a small float offset (ox, oy).
  const px = n => (n.x + (n.ox || 0)).toFixed(1);
  const py = n => (n.y + (n.oy || 0)).toFixed(1);
  function draw() {
    edges.forEach(e => {
      e.el.setAttribute('x1', px(e.a)); e.el.setAttribute('y1', py(e.a));
      e.el.setAttribute('x2', px(e.b)); e.el.setAttribute('y2', py(e.b));
    });
    NODES.forEach(n => n.el.setAttribute('transform', `translate(${px(n)},${py(n)})`));
  }

  // Layout: a small force simulation. Seeded, so it settles the same way on every visit.
  let W = 0, H = 0, held = null;
  const ANCHOR = { psych: [0.23, 0.33], comp: [0.77, 0.33], built: [0.5, 0.74] };
  let seed = 7;
  const rand = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const narrow = () => W < 640;
  const clampX = x => Math.max(56, Math.min(W - 56, x));
  const clampY = y => Math.max(18, Math.min(H - 34, y));

  function step(alpha) {
    const C = (narrow() ? 90 : 190) * alpha;
    const minGap = narrow() ? 30 : 44;
    for (let i = 0; i < NODES.length; i++) {
      for (let j = i + 1; j < NODES.length; j++) {
        const p = NODES[i], q = NODES[j];
        let dx = q.x - p.x, dy = q.y - p.y, l = dx * dx + dy * dy;
        if (l < 1) { dx = rand() - 0.5; dy = rand() - 0.5; l = 1; }
        const f = C / l * (p.hub || q.hub ? 1.5 : 1);
        p.vx -= dx * f; p.vy -= dy * f; q.vx += dx * f; q.vy += dy * f;
        const d = Math.sqrt(l);
        if (d < minGap) {
          const push = (minGap - d) / d * 0.25;
          if (p !== held) { p.x -= dx * push; p.y -= dy * push; }
          if (q !== held) { q.x += dx * push; q.y += dy * push; }
        }
      }
    }
    edges.forEach(e => {
      const rest = e.kind === 'hub' ? (narrow() ? 50 : 72) : (narrow() ? 100 : 140);
      const s = e.kind === 'hub' ? 0.3 : 0.035;
      const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, d = Math.hypot(dx, dy) || 1;
      const f = (d - rest) / d * s * alpha;
      e.a.vx += dx * f; e.a.vy += dy * f; e.b.vx -= dx * f; e.b.vy -= dy * f;
    });
    NODES.forEach(n => {
      if (n === held) { n.vx = n.vy = 0; return; }
      const [ax, ay] = ANCHOR[n.group];
      const k = (n.hub ? 0.15 : 0.05) * alpha;
      n.vx += (ax * W - n.x) * k; n.vy += (ay * H - n.y) * k;
      n.vx *= 0.55; n.vy *= 0.55;
      n.x = clampX(n.x + n.vx); n.y = clampY(n.y + n.vy);
    });
  }

  function layout() {
    const box = svg.getBoundingClientRect();
    W = Math.round(box.width); H = Math.round(box.height);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.classList.toggle('compact', narrow());
    seed = 7;
    NODES.forEach(n => {
      const [ax, ay] = ANCHOR[n.group];
      n.x = ax * W + (rand() - 0.5) * W * 0.25;
      n.y = ay * H + (rand() - 0.5) * H * 0.3;
      n.vx = n.vy = 0;
    });
    // Drift settings come from each dot's position in the list, not from rand(),
    // so they never change the layout's seeded sequence.
    NODES.forEach((n, i) => {
      n.phase = (i * 2.39996) % (Math.PI * 2);   // where in its drift each dot starts
      n.speed = 0.35 + ((i * 0.618034) % 1) * 0.3; // and how fast it drifts
    });
    let a = 1;
    for (let i = 0; i < 360; i++) { step(a); a *= 0.985; }
    draw();
  }

  let alpha = 0, raf = 0;
  function heat(a) { alpha = Math.max(alpha, a); if (!raf) raf = requestAnimationFrame(loop); }
  // One loop for both jobs: settling after a drag, and the slow idle float.
  // The float stops when the map is off screen or the visitor prefers less motion.
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  let onScreen = true;
  function loop(t) {
    if (held) alpha = Math.max(alpha, 0.12);
    if (alpha > 0.004) { step(alpha); alpha *= 0.96; } else { alpha = 0; }
    const floating = onScreen && !calm.matches;
    const s = (t || 0) / 1000;
    NODES.forEach(n => {
      if (floating && n !== held) {
        const amp = n.hub ? 3 : 4.5;
        n.ox = Math.sin(s * n.speed + n.phase) * amp;
        n.oy = Math.cos(s * n.speed * 0.8 + n.phase * 1.7) * amp * 0.85;
      } else {
        n.ox = n.oy = 0;
      }
    });
    draw();
    raf = alpha > 0 || held || floating ? requestAnimationFrame(loop) : 0;
  }

  // Focus: hover traces a node's lines, a click keeps them traced and fills the side panel.
  let selected = null, hovered = null;
  function paint() {
    const f = hovered || selected;
    svg.classList.toggle('focus', !!f);
    const on = f ? new Set([f, ...nbrs.get(f)]) : null;
    NODES.forEach(n => {
      n.el.classList.toggle('on', !!on && on.has(n.id));
      n.el.classList.toggle('sel', n.id === selected);
    });
    edges.forEach(e => e.el.classList.toggle('on', !!f && (e.a.id === f || e.b.id === f)));
  }

  const chip = id => {
    const n = byId.get(id);
    return `<button type="button" data-id="${id}"><i class="map-dot ${n.group}"></i>${n.label}</button>`;
  };
  function intro() {
    panel.innerHTML = `
      <p class="meta">Start anywhere</p>
      <h3>Three fields, one map</h3>
      <p>Each dot is a course, a skill, or something I built. A line means one fed into the other, and the dashed ones cross between fields.</p>
      <p class="map-label">Start with</p>
      <div class="map-chips">${['psych', 'comp', 'built'].map(chip).join('')}</div>`;
  }
  function select(id) {
    const n = byId.get(id);
    selected = id;
    paint();
    const list = [...nbrs.get(id)].sort((x, y) => (byId.get(x).hub ? 1 : 0) - (byId.get(y).hub ? 1 : 0));
    panel.innerHTML = `
      <button type="button" class="map-close" aria-label="Clear selection">&times;</button>
      <p class="meta"><i class="map-dot ${n.group}"></i>${GROUP[n.group]}${n.meta ? ' · ' + n.meta : ''}</p>
      <h3>${n.title || n.label}</h3>
      <p>${n.text}</p>
      <p class="map-label">Connects to</p>
      <div class="map-chips">${list.map(chip).join('')}</div>
      ${n.go ? `<a class="button ghost map-go" href="${n.go}">${n.goLabel} &darr;</a>` : ''}`;
  }
  function clear() { selected = null; paint(); intro(); }
  function pulse(id) {
    const g = byId.get(id).el;
    g.classList.remove('pulse'); void g.getBoundingClientRect(); g.classList.add('pulse');
  }

  const point = e => { const r = svg.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  NODES.forEach(n => {
    n.el.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      const [sx, sy] = point(e);
      let moved = false;
      n.el.setPointerCapture(e.pointerId);
      const move = ev => {
        const [x, y] = point(ev);
        if (!moved && Math.hypot(x - sx, y - sy) < 4) return;
        if (!moved) { moved = true; held = n; svg.classList.add('dragging'); heat(0.3); }
        n.x = clampX(x); n.y = clampY(y);
      };
      const up = () => {
        n.el.removeEventListener('pointermove', move);
        n.el.removeEventListener('pointerup', up);
        n.el.removeEventListener('pointercancel', up);
        svg.classList.remove('dragging');
        if (moved) { held = null; heat(0.2); } else { select(n.id); }
      };
      n.el.addEventListener('pointermove', move);
      n.el.addEventListener('pointerup', up);
      n.el.addEventListener('pointercancel', up);
    });
    n.el.addEventListener('pointerenter', () => { hovered = n.id; paint(); });
    n.el.addEventListener('pointerleave', () => { hovered = null; paint(); });
    n.el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n.id); } });
  });
  svg.addEventListener('click', e => { if (e.target === svg) clear(); });

  panel.addEventListener('click', e => {
    const c = e.target.closest('[data-id]');
    if (c) { select(c.dataset.id); pulse(c.dataset.id); return; }
    if (e.target.closest('.map-close')) { clear(); return; }
    const go = e.target.closest('.map-go');
    if (go) {
      const t = document.querySelector(go.getAttribute('href'));
      if (t) { t.classList.remove('map-flash'); void t.offsetWidth; t.classList.add('map-flash'); }
    }
  });

  // Filters dim the other groups rather than hiding them, so the layout never jumps.
  const filters = document.querySelectorAll('.map-filters button');
  filters.forEach(b => b.addEventListener('click', () => {
    filters.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    svg.dataset.filter = b.dataset.filter;
  }));

  intro();
  layout();
  heat(0);

  // Pause the float while the map is scrolled out of view.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) heat(0);
    }).observe(svg);
  }
  calm.addEventListener('change', () => heat(0));

  let lastW = W;
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      const w = svg.getBoundingClientRect().width;
      if (Math.abs(w - lastW) < 40) return;
      lastW = w;
      layout();
    }).observe(svg);
  }
})();
