document.addEventListener('DOMContentLoaded', () => {
  /* ═══ RENDER MATH (KaTeX) ═══ */
  document.querySelectorAll('.math-block').forEach(el => {
    try {
      katex.render(el.dataset.formula, el, { displayMode: true, throwOnError: false });
    } catch (e) { el.textContent = el.dataset.formula; }
  });
  document.querySelectorAll('.math-inline').forEach(el => {
    try {
      katex.render(el.dataset.formula, el, { displayMode: false, throwOnError: false });
    } catch (e) { el.textContent = el.dataset.formula; }
  });

  /* ═══ SIDEBAR NAV ═══ */
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const el = document.getElementById(item.dataset.target);
      if (el) {
        if (el.classList.contains('collapsed')) el.classList.remove('collapsed');
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      document.querySelector('.sidebar').classList.remove('open');
      document.querySelector('.overlay').classList.remove('show');
    });
  });

  /* ═══ SCROLL SPY ═══ */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(n => n.classList.remove('active'));
        const a = document.querySelector(`.nav-item[data-target="${entry.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => observer.observe(s));

  /* ═══ COLLAPSE TOGGLE ═══ */
  document.querySelectorAll('.section-header').forEach(h => {
    h.addEventListener('click', () => h.closest('.section').classList.toggle('collapsed'));
  });

  /* ═══ PROGRESS BAR ═══ */
  function updateProgress() {
    const pct = Math.min(Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100), 100);
    document.querySelector('.progress-fill').style.width = pct + '%';
    document.querySelector('.progress-pct').textContent = pct + '%';
  }
  window.addEventListener('scroll', updateProgress);
  updateProgress();

  /* ═══ MOBILE MENU ═══ */
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.overlay');
  document.querySelector('.menu-toggle').addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  /* ═══ CARD ENTRANCE ANIMATION ═══ */
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.card').forEach(c => cardObs.observe(c));

  /* ═══ QUIZ LOGIC ═══ */
  document.querySelectorAll('.quiz-box').forEach(quiz => {
    const options = quiz.querySelectorAll('.quiz-option');
    const fb = quiz.querySelector('.quiz-feedback');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => { o.classList.add('disabled'); o.classList.remove('correct', 'wrong'); });
        if (opt.dataset.correct === 'true') {
          opt.classList.add('correct');
          fb.className = 'quiz-feedback show correct-fb';
          fb.textContent = '✅ ' + (quiz.dataset.explanation || 'إجابة صحيحة!');
        } else {
          opt.classList.add('wrong');
          const right = quiz.querySelector('[data-correct="true"]');
          if (right) right.classList.add('correct');
          fb.className = 'quiz-feedback show wrong-fb';
          fb.textContent = '❌ ' + (quiz.dataset.explanation || 'إجابة خاطئة.');
        }
      });
    });
  });

  /* ═══ FLASHCARDS ═══ */
  document.querySelectorAll('.flashcard').forEach(fc => {
    fc.addEventListener('click', () => fc.classList.toggle('flipped'));
  });

  /* ═══ TABS ═══ */
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const btns = tabGroup.querySelectorAll('.tab-btn');
    const parent = tabGroup.closest('.card') || tabGroup.parentElement;
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        parent.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        const target = parent.querySelector(`#${btn.dataset.tab}`);
        if (target) target.classList.add('active');
      });
    });
  });

  /* ═══ LANGUAGE TOGGLE ═══ */
  function toggleSectionLang(section) {
    const arDiv = section.querySelector('.lang-ar');
    const enDiv = section.querySelector('.lang-en');
    if (!arDiv || !enDiv) return;
    const btn = section.querySelector('.section-lang-btn');
    if (arDiv.style.display === 'none') {
      arDiv.style.display = 'block';
      enDiv.style.display = 'none';
      if (btn) btn.querySelector('.lang-text').textContent = 'EN';
    } else {
      arDiv.style.display = 'none';
      enDiv.style.display = 'block';
      if (btn) btn.querySelector('.lang-text').textContent = 'AR';
      enDiv.querySelectorAll('.math-block').forEach(el => {
        if (el.dataset.formula && !el.querySelector('.katex')) {
          try { katex.render(el.dataset.formula, el, { displayMode: true, throwOnError: false }); } catch (e) { }
        }
      });
      enDiv.querySelectorAll('.math-inline').forEach(el => {
        if (el.dataset.formula && !el.querySelector('.katex')) {
          try { katex.render(el.dataset.formula, el, { displayMode: false, throwOnError: false }); } catch (e) { }
        }
      });
      enDiv.querySelectorAll('.card:not(.visible)').forEach(c => {
        c.style.opacity = '0'; c.style.transform = 'translateY(16px)';
        setTimeout(() => c.classList.add('visible'), 50);
      });
    }
  }

  document.querySelectorAll('.section-lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const section = btn.closest('.section');
      toggleSectionLang(section);
    });
  });

  const globalSwitch = document.querySelector('.lang-switch');
  if (globalSwitch) {
    globalSwitch.addEventListener('click', () => {
      const isEn = globalSwitch.classList.toggle('en');
      document.querySelectorAll('.section').forEach(sec => {
        const arDiv = sec.querySelector('.lang-ar');
        const enDiv = sec.querySelector('.lang-en');
        if (!arDiv || !enDiv) return;
        const btn = sec.querySelector('.section-lang-btn');
        if (isEn) {
          arDiv.style.display = 'none';
          enDiv.style.display = 'block';
          if (btn) btn.querySelector('.lang-text').textContent = 'AR';
          enDiv.querySelectorAll('.math-block').forEach(el => {
            if (el.dataset.formula && !el.querySelector('.katex')) {
              try { katex.render(el.dataset.formula, el, { displayMode: true, throwOnError: false }); } catch (e) { }
            }
          });
          enDiv.querySelectorAll('.math-inline').forEach(el => {
            if (el.dataset.formula && !el.querySelector('.katex')) {
              try { katex.render(el.dataset.formula, el, { displayMode: false, throwOnError: false }); } catch (e) { }
            }
          });
          enDiv.querySelectorAll('.card:not(.visible)').forEach(c => {
            setTimeout(() => c.classList.add('visible'), 50);
          });
        } else {
          arDiv.style.display = 'block';
          enDiv.style.display = 'none';
          if (btn) btn.querySelector('.lang-text').textContent = 'EN';
        }
      });
    });
  }

  /* ═══ SVG DIAGRAMS ═══ */
  buildCh3Diagrams();
});

/* ═══════════════════════════════════════════ */
/*        CHAPTER 3 SVG DIAGRAM BUILDERS       */
/* ═══════════════════════════════════════════ */

function buildCh3Diagrams() {

  // --- Ideal Diode IV Curve (Arabic) ---
  buildSvg('diagram-ideal-iv', 400, 220, svg => {
    const ox = 200, oy = 140;
    // Axes
    line(svg, 30, oy, 380, oy, '#4b5563', 1);
    line(svg, ox, 10, ox, 210, '#4b5563', 1);
    // Labels
    text(svg, 360, oy + 18, 'V', '#94a3b8', 12);
    text(svg, ox - 20, 25, 'I', '#94a3b8', 12);
    text(svg, ox + 10, oy + 16, '0', '#64748b', 10);
    // Forward: vertical line at V=0 going up
    line(svg, ox, oy, ox, 20, '#34d399', 3);
    // Reverse: horizontal line at I=0 going left
    line(svg, ox, oy, 30, oy, '#f87171', 3);
    // Annotations
    text(svg, ox + 60, 30, 'V>0: I→∞', '#34d399', 11);
    text(svg, 100, oy + 20, 'V<0: I=0', '#f87171', 11);
    // Arrow heads
    line(svg, ox - 4, 28, ox, 20, '#34d399', 2);
    line(svg, ox + 4, 28, ox, 20, '#34d399', 2);
  });

  // --- Ideal Diode IV Curve (English) ---
  buildSvg('diagram-ideal-iv-en', 400, 220, svg => {
    const ox = 200, oy = 140;
    line(svg, 30, oy, 380, oy, '#4b5563', 1);
    line(svg, ox, 10, ox, 210, '#4b5563', 1);
    text(svg, 360, oy + 18, 'V', '#94a3b8', 12);
    text(svg, ox - 20, 25, 'I', '#94a3b8', 12);
    text(svg, ox + 10, oy + 16, '0', '#64748b', 10);
    line(svg, ox, oy, ox, 20, '#34d399', 3);
    line(svg, ox, oy, 30, oy, '#f87171', 3);
    text(svg, ox + 60, 30, 'V>0: I→∞', '#34d399', 11);
    text(svg, 100, oy + 20, 'V<0: I=0', '#f87171', 11);
    line(svg, ox - 4, 28, ox, 20, '#34d399', 2);
    line(svg, ox + 4, 28, ox, 20, '#34d399', 2);
  });

  // --- Half-Wave Rectifier Waveform (Arabic) ---
  buildSvg('diagram-rectifier', 440, 180, svg => {
    // Input sine wave
    text(svg, 110, 16, 'Vin (دخل)', '#94a3b8', 11);
    const cy1 = 60;
    for (let x = 20; x < 220; x++) {
      const y1 = cy1 - 30 * Math.sin((x - 20) / 200 * Math.PI * 4);
      const y2 = cy1 - 30 * Math.sin((x - 19) / 200 * Math.PI * 4);
      line(svg, x, y1, x + 1, y2, '#6366f1', 1.5);
    }
    // Arrow
    text(svg, 230, 60, '→', '#fbbf24', 18);
    // Output half wave
    text(svg, 350, 16, 'Vout (خرج)', '#94a3b8', 11);
    const cy2 = 60;
    for (let x = 250; x < 440; x++) {
      const val = Math.sin((x - 250) / 190 * Math.PI * 4);
      const y1 = cy2 - (val > 0 ? val * 30 : 0);
      const nextVal = Math.sin((x - 249) / 190 * Math.PI * 4);
      const y2 = cy2 - (nextVal > 0 ? nextVal * 30 : 0);
      line(svg, x, y1, x + 1, y2, '#34d399', 1.5);
    }
    // Zero line
    line(svg, 250, cy2, 440, cy2, '#334155', 0.5);

    // Diode symbol
    text(svg, 220, 140, '▶|', '#fbbf24', 20);
    text(svg, 220, 165, 'Diode', '#94a3b8', 10);
  });

  // --- Half-Wave Rectifier (English) ---
  buildSvg('diagram-rectifier-en', 440, 180, svg => {
    text(svg, 110, 16, 'Vin (input)', '#94a3b8', 11);
    const cy1 = 60;
    for (let x = 20; x < 220; x++) {
      const y1 = cy1 - 30 * Math.sin((x - 20) / 200 * Math.PI * 4);
      const y2 = cy1 - 30 * Math.sin((x - 19) / 200 * Math.PI * 4);
      line(svg, x, y1, x + 1, y2, '#6366f1', 1.5);
    }
    text(svg, 230, 60, '→', '#fbbf24', 18);
    text(svg, 350, 16, 'Vout (output)', '#94a3b8', 11);
    const cy2 = 60;
    for (let x = 250; x < 440; x++) {
      const val = Math.sin((x - 250) / 190 * Math.PI * 4);
      const y1 = cy2 - (val > 0 ? val * 30 : 0);
      const nextVal = Math.sin((x - 249) / 190 * Math.PI * 4);
      const y2 = cy2 - (nextVal > 0 ? nextVal * 30 : 0);
      line(svg, x, y1, x + 1, y2, '#34d399', 1.5);
    }
    line(svg, 250, cy2, 440, cy2, '#334155', 0.5);
    text(svg, 220, 140, '▶|', '#fbbf24', 20);
    text(svg, 220, 165, 'Diode', '#94a3b8', 10);
  });

  // --- Half-Wave Input/Output (Arabic) ---
  buildSvg('diagram-half-wave', 440, 160, svg => {
    text(svg, 220, 16, 'نصف موجة — الجزء السالب محذوف', '#94a3b8', 11);
    const cy = 90;
    line(svg, 20, cy, 420, cy, '#334155', 0.5);
    for (let x = 20; x < 420; x++) {
      const val = Math.sin((x - 20) / 400 * Math.PI * 6);
      const y1 = cy - (val > 0 ? val * 40 : 0);
      const nextVal = Math.sin((x - 19) / 400 * Math.PI * 6);
      const y2 = cy - (nextVal > 0 ? nextVal * 40 : 0);
      line(svg, x, y1, x + 1, y2, '#34d399', 2);
    }
    text(svg, 220, 145, 'الخرج: النص الموجب فقط', '#64748b', 10);
  });

  // --- Half-Wave (English) ---
  buildSvg('diagram-half-wave-en', 440, 160, svg => {
    text(svg, 220, 16, 'Half-Wave — negative half removed', '#94a3b8', 11);
    const cy = 90;
    line(svg, 20, cy, 420, cy, '#334155', 0.5);
    for (let x = 20; x < 420; x++) {
      const val = Math.sin((x - 20) / 400 * Math.PI * 6);
      const y1 = cy - (val > 0 ? val * 40 : 0);
      const nextVal = Math.sin((x - 19) / 400 * Math.PI * 6);
      const y2 = cy - (nextVal > 0 ? nextVal * 40 : 0);
      line(svg, x, y1, x + 1, y2, '#34d399', 2);
    }
    text(svg, 220, 145, 'Output: positive half only', '#64748b', 10);
  });

  // --- Full-Wave Waveform (Arabic) ---
  buildSvg('diagram-full-wave', 440, 160, svg => {
    text(svg, 220, 16, 'موجة كاملة — النصف السالب معكوس', '#94a3b8', 11);
    const cy = 100;
    line(svg, 20, cy, 420, cy, '#334155', 0.5);
    for (let x = 20; x < 420; x++) {
      const val = Math.sin((x - 20) / 400 * Math.PI * 6);
      const y1 = cy - Math.abs(val) * 40;
      const nextVal = Math.sin((x - 19) / 400 * Math.PI * 6);
      const y2 = cy - Math.abs(nextVal) * 40;
      line(svg, x, y1, x + 1, y2, '#a78bfa', 2);
    }
    text(svg, 220, 145, 'الخرج: كل الموجة موجبة', '#64748b', 10);
  });

  // --- Full-Wave (English) ---
  buildSvg('diagram-full-wave-en', 440, 160, svg => {
    text(svg, 220, 16, 'Full-Wave — negative half inverted', '#94a3b8', 11);
    const cy = 100;
    line(svg, 20, cy, 420, cy, '#334155', 0.5);
    for (let x = 20; x < 420; x++) {
      const val = Math.sin((x - 20) / 400 * Math.PI * 6);
      const y1 = cy - Math.abs(val) * 40;
      const nextVal = Math.sin((x - 19) / 400 * Math.PI * 6);
      const y2 = cy - Math.abs(nextVal) * 40;
      line(svg, x, y1, x + 1, y2, '#a78bfa', 2);
    }
    text(svg, 220, 145, 'Output: all wave is positive', '#64748b', 10);
  });

  // --- Bridge Rectifier (Arabic) ---
  buildSvg('diagram-bridge', 400, 260, svg => {
    // Diamond shape for bridge
    const cx = 200, cy = 120;
    // D1 top-left
    line(svg, cx, cy - 70, cx - 70, cy, '#f472b6', 2);
    text(svg, cx - 50, cy - 40, 'D1', '#f472b6', 11, 'bold');
    // D2 top-right
    line(svg, cx, cy - 70, cx + 70, cy, '#f472b6', 2);
    text(svg, cx + 40, cy - 40, 'D2', '#f472b6', 11, 'bold');
    // D3 bottom-left
    line(svg, cx - 70, cy, cx, cy + 70, '#22d3ee', 2);
    text(svg, cx - 50, cy + 45, 'D3', '#22d3ee', 11, 'bold');
    // D4 bottom-right
    line(svg, cx + 70, cy, cx, cy + 70, '#22d3ee', 2);
    text(svg, cx + 40, cy + 45, 'D4', '#22d3ee', 11, 'bold');
    // Input terminals
    text(svg, cx - 85, cy + 4, 'Vin', '#fbbf24', 12, 'bold');
    circle(svg, cx - 70, cy, 4, '#fbbf24');
    text(svg, cx + 80, cy + 4, '+', '#34d399', 14, 'bold');
    circle(svg, cx + 70, cy, 4, '#34d399');
    // Output
    text(svg, cx, cy - 85, 'Vout+', '#34d399', 11, 'bold');
    text(svg, cx, cy + 90, 'Vout−', '#f87171', 11, 'bold');
    // Label
    text(svg, cx, cy + 130, 'Bridge Rectifier = 4 دايودات', '#94a3b8', 11);
    // Diode arrows (small triangles suggestion)
    text(svg, cx - 25, cy - 25, '▶', '#f472b6', 10);
    text(svg, cx + 18, cy - 25, '◀', '#f472b6', 10);
    text(svg, cx - 25, cy + 30, '▶', '#22d3ee', 10);
    text(svg, cx + 18, cy + 30, '◀', '#22d3ee', 10);
  });

  // --- Bridge Rectifier (English) ---
  buildSvg('diagram-bridge-en', 400, 260, svg => {
    const cx = 200, cy = 120;
    line(svg, cx, cy - 70, cx - 70, cy, '#f472b6', 2);
    text(svg, cx - 50, cy - 40, 'D1', '#f472b6', 11, 'bold');
    line(svg, cx, cy - 70, cx + 70, cy, '#f472b6', 2);
    text(svg, cx + 40, cy - 40, 'D2', '#f472b6', 11, 'bold');
    line(svg, cx - 70, cy, cx, cy + 70, '#22d3ee', 2);
    text(svg, cx - 50, cy + 45, 'D3', '#22d3ee', 11, 'bold');
    line(svg, cx + 70, cy, cx, cy + 70, '#22d3ee', 2);
    text(svg, cx + 40, cy + 45, 'D4', '#22d3ee', 11, 'bold');
    text(svg, cx - 85, cy + 4, 'Vin', '#fbbf24', 12, 'bold');
    circle(svg, cx - 70, cy, 4, '#fbbf24');
    text(svg, cx + 80, cy + 4, '+', '#34d399', 14, 'bold');
    circle(svg, cx + 70, cy, 4, '#34d399');
    text(svg, cx, cy - 85, 'Vout+', '#34d399', 11, 'bold');
    text(svg, cx, cy + 90, 'Vout−', '#f87171', 11, 'bold');
    text(svg, cx, cy + 130, 'Bridge Rectifier = 4 Diodes', '#94a3b8', 11);
    text(svg, cx - 25, cy - 25, '▶', '#f472b6', 10);
    text(svg, cx + 18, cy - 25, '◀', '#f472b6', 10);
    text(svg, cx - 25, cy + 30, '▶', '#22d3ee', 10);
    text(svg, cx + 18, cy + 30, '◀', '#22d3ee', 10);
  });
}

/* ── SVG Helpers ── */
function buildSvg(id, w, h, fn) {
  const el = document.getElementById(id);
  if (!el) return;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  fn(svg);
  el.appendChild(svg);
}

function circle(svg, cx, cy, r, fill, sw, stroke) {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r);
  c.setAttribute('fill', fill || 'none');
  if (sw) c.setAttribute('stroke-width', sw);
  if (stroke) c.setAttribute('stroke', stroke);
  svg.appendChild(c);
}

function rect(svg, x, y, w, h, rx, fill, sw, stroke) {
  const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', w); r.setAttribute('height', h);
  if (rx) r.setAttribute('rx', rx);
  r.setAttribute('fill', fill || 'none');
  if (sw) r.setAttribute('stroke-width', sw);
  if (stroke) r.setAttribute('stroke', stroke);
  svg.appendChild(r);
}

function line(svg, x1, y1, x2, y2, stroke, sw) {
  const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2);
  l.setAttribute('stroke', stroke || '#fff'); l.setAttribute('stroke-width', sw || 1);
  svg.appendChild(l);
}

function text(svg, x, y, content, fill, size, weight) {
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', x); t.setAttribute('y', y);
  t.setAttribute('fill', fill || '#fff');
  t.setAttribute('font-size', size || 12);
  t.setAttribute('text-anchor', 'middle');
  t.setAttribute('font-family', 'Cairo, sans-serif');
  if (weight) t.setAttribute('font-weight', weight);
  t.textContent = content;
  svg.appendChild(t);
}
