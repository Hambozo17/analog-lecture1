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
          fb.textContent = '❌ ' + (quiz.dataset.explanation || 'إجابة خاطئة. الإجابة الصحيحة محددة باللون الأخضر.');
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
      // Re-render KaTeX in newly visible content
      enDiv.querySelectorAll('.math-block').forEach(el => {
        if (el.dataset.formula && !el.querySelector('.katex')) {
          try { katex.render(el.dataset.formula, el, { displayMode: true, throwOnError: false }); }
          catch (e) { el.textContent = el.dataset.formula; }
        }
      });
      enDiv.querySelectorAll('.math-inline').forEach(el => {
        if (el.dataset.formula && !el.querySelector('.katex')) {
          try { katex.render(el.dataset.formula, el, { displayMode: false, throwOnError: false }); }
          catch (e) { el.textContent = el.dataset.formula; }
        }
      });
      // Observe new cards for animation
      enDiv.querySelectorAll('.card:not(.visible)').forEach(c => {
        c.style.opacity = '0'; c.style.transform = 'translateY(16px)';
        setTimeout(() => c.classList.add('visible'), 50);
      });
    }
  }

  // Per-section toggle buttons
  document.querySelectorAll('.section-lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't trigger section collapse
      const section = btn.closest('.section');
      toggleSectionLang(section);
    });
  });

  // Global toggle in sidebar
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
  buildDiagrams();
});

/* ═══════════════════════════════════════════ */
/*           SVG DIAGRAM BUILDERS              */
/* ═══════════════════════════════════════════ */

function buildDiagrams() {

  // 1. Silicon Covalent Bonds
  buildSvg('diagram-si-bonds', 320, 260, svg => {
    const cx = 160, cy = 120, r = 50;
    const neighbors = [[cx, cy - 80], [cx + 80, cy], [cx, cy + 80], [cx - 80, cy]];
    neighbors.forEach(([nx, ny]) => {
      line(svg, cx, cy, nx, ny, '#4b5563', 2);
      circle(svg, (cx + nx) / 2, (cy + ny) / 2, 5, '#6366f1'); // shared electron 1
      circle(svg, (cx + nx) / 2 + 6, (cy + ny) / 2 + 6, 5, '#6366f1'); // shared electron 2
      circle(svg, nx, ny, 20, '#1e293b', 1, '#334155');
      text(svg, nx, ny + 4, 'Si', '#94a3b8', 11);
    });
    circle(svg, cx, cy, 24, '#1a1f35', 2, '#6366f1');
    text(svg, cx, cy + 4, 'Si', '#a5b4fc', 13, 'bold');
    text(svg, cx, cy + 60 + 24, '= إلكترون مشترك', '#64748b', 10);
    circle(svg, cx - 60, cy + 60 + 20, 4, '#6366f1');
  });

  // 2. N-type Doping
  buildSvg('diagram-n-type', 340, 180, svg => {
    // Grid of Si
    const startX = 40, startY = 40, gap = 70;
    for (let i = 0; i < 4; i++) {
      const x = startX + i * gap, y = 90;
      if (i === 2) {
        rect(svg, x - 20, y - 20, 40, 40, 8, 'rgba(99,102,241,0.2)', 1, '#6366f1');
        text(svg, x, y + 4, 'P', '#a5b4fc', 14, 'bold');
        // free electron
        circle(svg, x + 28, y - 28, 7, '#22d3ee');
        text(svg, x + 28, y - 28 + 3, 'e⁻', '#06080f', 7, 'bold');
        // arrow
        line(svg, x + 36, y - 30, x + 52, y - 38, '#22d3ee', 2);
        text(svg, x + 58, y - 36, 'حر!', '#22d3ee', 10);
      } else {
        rect(svg, x - 20, y - 20, 40, 40, 8, 'rgba(75,85,99,0.2)', 1, '#4b5563');
        text(svg, x, y + 4, 'Si', '#94a3b8', 12);
      }
      if (i < 3) line(svg, x + 20, y, x + gap - 20 + startX + i * gap - startX - (i) * gap + 20, y, '#334155', 1);
    }
    text(svg, 170, 165, 'N-type: الفسفور يتبرع بإلكترون حر', '#94a3b8', 11);
  });

  // 3. P-type Doping
  buildSvg('diagram-p-type', 340, 180, svg => {
    const startX = 40, gap = 70;
    for (let i = 0; i < 4; i++) {
      const x = startX + i * gap, y = 90;
      if (i === 1) {
        rect(svg, x - 20, y - 20, 40, 40, 8, 'rgba(244,114,182,0.2)', 1, '#f472b6');
        text(svg, x, y + 4, 'B', '#f472b6', 14, 'bold');
        circle(svg, x + 28, y - 28, 7, 'transparent', 1.5, '#f472b6');
        text(svg, x + 28, y - 28 + 3, 'h⁺', '#f472b6', 7, 'bold');
        line(svg, x + 36, y - 30, x + 52, y - 38, '#f472b6', 2);
        text(svg, x + 58, y - 36, 'فجوة!', '#f472b6', 10);
      } else {
        rect(svg, x - 20, y - 20, 40, 40, 8, 'rgba(75,85,99,0.2)', 1, '#4b5563');
        text(svg, x, y + 4, 'Si', '#94a3b8', 12);
      }
    }
    text(svg, 170, 165, 'P-type: البورون يخلق فجوة', '#94a3b8', 11);
  });

  // 4. PN Junction
  buildSvg('diagram-pn-junction', 440, 220, svg => {
    // P region
    rect(svg, 20, 30, 190, 120, 0, 'rgba(244,114,182,0.08)', 1, '#f472b6');
    text(svg, 115, 55, 'P-type', '#f472b6', 14, 'bold');
    text(svg, 115, 80, '⊕ ⊕ ⊕ فجوات كتير', '#f472b6', 11);
    // N region
    rect(svg, 230, 30, 190, 120, 0, 'rgba(34,211,238,0.08)', 1, '#22d3ee');
    text(svg, 325, 55, 'N-type', '#22d3ee', 14, 'bold');
    text(svg, 325, 80, '⊖ ⊖ ⊖ إلكترونات كتير', '#22d3ee', 11);
    // Depletion region
    rect(svg, 170, 30, 80, 120, 0, 'rgba(251,191,36,0.12)', 1, '#fbbf24');
    text(svg, 210, 100, 'منطقة', '#fbbf24', 10);
    text(svg, 210, 115, 'النضوب', '#fbbf24', 10);
    // Ions
    text(svg, 185, 75, '⊖', '#f472b6', 16); // negative ions in P side
    text(svg, 230, 75, '⊕', '#22d3ee', 16); // positive ions in N side
    // Electric field arrow
    line(svg, 250, 160, 170, 160, '#fb923c', 2);
    text(svg, 235, 160, '→', '#fb923c', 16);
    text(svg, 210, 180, 'E المجال الكهربائي', '#fb923c', 10);
    // Built-in potential
    text(svg, 210, 205, 'V₀ ≈ 0.7V', '#fbbf24', 12, 'bold');
  });

  // 5. Reverse Bias
  buildSvg('diagram-reverse-bias', 440, 180, svg => {
    rect(svg, 20, 30, 150, 100, 0, 'rgba(244,114,182,0.08)', 1, '#f472b6');
    text(svg, 95, 60, 'P', '#f472b6', 16, 'bold');
    rect(svg, 270, 30, 150, 100, 0, 'rgba(34,211,238,0.08)', 1, '#22d3ee');
    text(svg, 345, 60, 'N', '#22d3ee', 16, 'bold');
    // Wider depletion
    rect(svg, 140, 30, 160, 100, 0, 'rgba(251,191,36,0.15)', 1, '#fbbf24');
    text(svg, 220, 70, 'منطقة نضوب', '#fbbf24', 11);
    text(svg, 220, 88, 'واسعة ⬅️➡️', '#fbbf24', 11);
    // Battery
    text(svg, 95, 155, '−', '#f87171', 20, 'bold');
    text(svg, 345, 155, '+', '#34d399', 20, 'bold');
    line(svg, 95, 145, 95, 135, '#4b5563', 1.5);
    line(svg, 345, 145, 345, 135, '#4b5563', 1.5);
    text(svg, 220, 160, '❌ التيار ≈ 0', '#f87171', 12, 'bold');
  });

  // 6. Forward Bias
  buildSvg('diagram-forward-bias', 440, 180, svg => {
    rect(svg, 20, 30, 160, 100, 0, 'rgba(244,114,182,0.08)', 1, '#f472b6');
    text(svg, 100, 60, 'P', '#f472b6', 16, 'bold');
    rect(svg, 260, 30, 160, 100, 0, 'rgba(34,211,238,0.08)', 1, '#22d3ee');
    text(svg, 340, 60, 'N', '#22d3ee', 16, 'bold');
    // Narrow depletion
    rect(svg, 170, 30, 100, 100, 0, 'rgba(251,191,36,0.1)', 1, '#fbbf24');
    text(svg, 220, 70, 'نضوب', '#fbbf24', 10);
    text(svg, 220, 86, 'ضيقة', '#fbbf24', 10);
    // Battery reversed
    text(svg, 100, 155, '+', '#34d399', 20, 'bold');
    text(svg, 340, 155, '−', '#f87171', 20, 'bold');
    line(svg, 100, 145, 100, 135, '#4b5563', 1.5);
    line(svg, 340, 145, 340, 135, '#4b5563', 1.5);
    text(svg, 220, 160, '✅ التيار يمشي!', '#34d399', 12, 'bold');
  });

  // 7. IV Curve
  buildIVCurve('diagram-iv-curve');

  // ── English duplicates (same diagrams, -en suffix) ──
  buildSvg('diagram-si-bonds-en', 320, 260, svg => {
    const cx = 160, cy = 120;
    const neighbors = [[cx, cy - 80], [cx + 80, cy], [cx, cy + 80], [cx - 80, cy]];
    neighbors.forEach(([nx, ny]) => {
      line(svg, cx, cy, nx, ny, '#4b5563', 2);
      circle(svg, (cx + nx) / 2, (cy + ny) / 2, 5, '#6366f1');
      circle(svg, (cx + nx) / 2 + 6, (cy + ny) / 2 + 6, 5, '#6366f1');
      circle(svg, nx, ny, 20, '#1e293b', 1, '#334155');
      text(svg, nx, ny + 4, 'Si', '#94a3b8', 11);
    });
    circle(svg, cx, cy, 24, '#1a1f35', 2, '#6366f1');
    text(svg, cx, cy + 4, 'Si', '#a5b4fc', 13, 'bold');
    text(svg, cx, cy + 84, '= shared electron', '#64748b', 10);
    circle(svg, cx - 55, cy + 80, 4, '#6366f1');
  });

  buildSvg('diagram-n-type-en', 340, 180, svg => {
    const startX = 40, gap = 70;
    for (let i = 0; i < 4; i++) {
      const x = startX + i * gap, y = 90;
      if (i === 2) { rect(svg, x - 20, y - 20, 40, 40, 8, 'rgba(99,102,241,0.2)', 1, '#6366f1'); text(svg, x, y + 4, 'P', '#a5b4fc', 14, 'bold'); circle(svg, x + 28, y - 28, 7, '#22d3ee'); text(svg, x + 28, y - 25, 'e⁻', '#06080f', 7, 'bold'); line(svg, x + 36, y - 30, x + 52, y - 38, '#22d3ee', 2); text(svg, x + 58, y - 36, 'free!', '#22d3ee', 10); }
      else { rect(svg, x - 20, y - 20, 40, 40, 8, 'rgba(75,85,99,0.2)', 1, '#4b5563'); text(svg, x, y + 4, 'Si', '#94a3b8', 12); }
    }
    text(svg, 170, 165, 'N-type: Phosphorus donates a free electron', '#94a3b8', 11);
  });

  buildSvg('diagram-p-type-en', 340, 180, svg => {
    const startX = 40, gap = 70;
    for (let i = 0; i < 4; i++) {
      const x = startX + i * gap, y = 90;
      if (i === 1) { rect(svg, x - 20, y - 20, 40, 40, 8, 'rgba(244,114,182,0.2)', 1, '#f472b6'); text(svg, x, y + 4, 'B', '#f472b6', 14, 'bold'); circle(svg, x + 28, y - 28, 7, 'transparent', 1.5, '#f472b6'); text(svg, x + 28, y - 25, 'h⁺', '#f472b6', 7, 'bold'); line(svg, x + 36, y - 30, x + 52, y - 38, '#f472b6', 2); text(svg, x + 58, y - 36, 'hole!', '#f472b6', 10); }
      else { rect(svg, x - 20, y - 20, 40, 40, 8, 'rgba(75,85,99,0.2)', 1, '#4b5563'); text(svg, x, y + 4, 'Si', '#94a3b8', 12); }
    }
    text(svg, 170, 165, 'P-type: Boron creates a hole', '#94a3b8', 11);
  });

  buildSvg('diagram-pn-junction-en', 440, 220, svg => {
    rect(svg, 20, 30, 190, 120, 0, 'rgba(244,114,182,0.08)', 1, '#f472b6');
    text(svg, 115, 55, 'P-type', '#f472b6', 14, 'bold'); text(svg, 115, 80, '⊕ ⊕ ⊕ many holes', '#f472b6', 11);
    rect(svg, 230, 30, 190, 120, 0, 'rgba(34,211,238,0.08)', 1, '#22d3ee');
    text(svg, 325, 55, 'N-type', '#22d3ee', 14, 'bold'); text(svg, 325, 80, '⊖ ⊖ ⊖ many e⁻', '#22d3ee', 11);
    rect(svg, 170, 30, 80, 120, 0, 'rgba(251,191,36,0.12)', 1, '#fbbf24');
    text(svg, 210, 100, 'Depletion', '#fbbf24', 10); text(svg, 210, 115, 'Region', '#fbbf24', 10);
    text(svg, 185, 75, '⊖', '#f472b6', 16); text(svg, 230, 75, '⊕', '#22d3ee', 16);
    line(svg, 250, 160, 170, 160, '#fb923c', 2); text(svg, 235, 160, '→', '#fb923c', 16);
    text(svg, 210, 180, 'E (Electric Field)', '#fb923c', 10);
    text(svg, 210, 205, 'V₀ ≈ 0.7V', '#fbbf24', 12, 'bold');
  });

  buildSvg('diagram-reverse-bias-en', 440, 180, svg => {
    rect(svg, 20, 30, 150, 100, 0, 'rgba(244,114,182,0.08)', 1, '#f472b6'); text(svg, 95, 60, 'P', '#f472b6', 16, 'bold');
    rect(svg, 270, 30, 150, 100, 0, 'rgba(34,211,238,0.08)', 1, '#22d3ee'); text(svg, 345, 60, 'N', '#22d3ee', 16, 'bold');
    rect(svg, 140, 30, 160, 100, 0, 'rgba(251,191,36,0.15)', 1, '#fbbf24');
    text(svg, 220, 70, 'Wide Depletion', '#fbbf24', 11); text(svg, 220, 88, '⬅️➡️', '#fbbf24', 11);
    text(svg, 95, 155, '−', '#f87171', 20, 'bold'); text(svg, 345, 155, '+', '#34d399', 20, 'bold');
    text(svg, 220, 160, '❌ I ≈ 0', '#f87171', 12, 'bold');
  });

  buildSvg('diagram-forward-bias-en', 440, 180, svg => {
    rect(svg, 20, 30, 160, 100, 0, 'rgba(244,114,182,0.08)', 1, '#f472b6'); text(svg, 100, 60, 'P', '#f472b6', 16, 'bold');
    rect(svg, 260, 30, 160, 100, 0, 'rgba(34,211,238,0.08)', 1, '#22d3ee'); text(svg, 340, 60, 'N', '#22d3ee', 16, 'bold');
    rect(svg, 170, 30, 100, 100, 0, 'rgba(251,191,36,0.1)', 1, '#fbbf24');
    text(svg, 220, 70, 'Narrow', '#fbbf24', 10); text(svg, 220, 86, 'Depletion', '#fbbf24', 10);
    text(svg, 100, 155, '+', '#34d399', 20, 'bold'); text(svg, 340, 155, '−', '#f87171', 20, 'bold');
    text(svg, 220, 160, '✅ Current flows!', '#34d399', 12, 'bold');
  });

  buildIVCurve('diagram-iv-curve-en');
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

/* ── Interactive IV Curve ── */
function buildIVCurve(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const canvas = document.createElement('canvas');
  canvas.width = 440; canvas.height = 280;
  canvas.style.maxWidth = '100%';
  canvas.style.borderRadius = '8px';
  el.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const ox = 200, oy = 200; // origin
  // Axes
  ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(30, oy); ctx.lineTo(420, oy); ctx.stroke(); // x
  ctx.beginPath(); ctx.moveTo(ox, 10); ctx.lineTo(ox, 260); ctx.stroke(); // y

  // Labels
  ctx.fillStyle = '#94a3b8'; ctx.font = '12px Cairo';
  ctx.textAlign = 'center';
  ctx.fillText('V (الجهد)', 380, oy + 20);
  ctx.save(); ctx.translate(ox - 30, 30); ctx.fillText('I (التيار)', 0, 0); ctx.restore();
  ctx.fillText('0', ox + 8, oy + 16);

  // Forward bias curve (exponential)
  ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let v = 0; v <= 1; v += 0.005) {
    const I = 0.001 * (Math.exp(v / 0.06) - 1);
    const px = ox + v * 200;
    const py = oy - Math.min(I * 0.015, 180);
    if (v === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Reverse bias (flat)
  ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ox, oy + 4);
  ctx.lineTo(30, oy + 4);
  ctx.stroke();

  // 0.7V marker
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  const vx = ox + 0.7 * 200;
  ctx.beginPath(); ctx.moveTo(vx, oy); ctx.lineTo(vx, 30); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#fbbf24'; ctx.font = '11px Cairo';
  ctx.fillText('≈ 0.7V', vx, oy + 16);

  // Legend
  ctx.fillStyle = '#34d399'; ctx.font = '11px Cairo';
  ctx.fillText('← انحياز أمامي', ox + 140, 30);
  ctx.fillStyle = '#f87171';
  ctx.fillText('انحياز عكسي →', ox - 100, oy + 30);
  ctx.fillStyle = '#94a3b8'; ctx.font = '10px Cairo';
  ctx.fillText('Is ≈ 0', 60, oy + 20);
}
