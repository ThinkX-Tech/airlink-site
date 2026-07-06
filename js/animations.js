/* ==========================================================================
   AirLink — animations.js
   1. Sets real path lengths for the SVG line-draw effect
   2. Animated number counters (dashboard KPIs, about stats)
   3. Hero canvas: faint drifting network dots
   4. Installation timeline scroll progress
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. SVG line lengths ----------
     Each .draw-line gets its exact length as --len so the
     dash animation draws the full path, no more, no less. */
  document.querySelectorAll('.draw-line').forEach((path) => {
    const len = Math.ceil(path.getTotalLength());
    path.style.setProperty('--len', len);
  });

  /* ---------- 2. Counters ---------- */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function runCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = 'true';

    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;

    if (prefersReducedMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    const start = performance.now();
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const value = target * easeOut(t);
      el.textContent = value.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  document.addEventListener('airlink:count', (e) => runCounter(e.detail));
  document.addEventListener('airlink:no-motion', () => {
    document.querySelectorAll('[data-count]').forEach(runCounter);
  });

  /* ---------- 3. Hero canvas network ----------
     A few slow-drifting dots, faintly linked when close.
     Deliberately sparse and quiet — atmosphere, not spectacle. */
  const canvas = document.getElementById('heroCanvas');

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let dots = [];
    let raf = null;
    let running = true;

    function resize() {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      const count = Math.min(36, Math.floor(canvas.offsetWidth / 42));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1.2 + Math.random() * 1.6,
      }));
    }

    function tick() {
      if (!running) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const LINK = 130;

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -10) d.x = w + 10;
        if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10;
        if (d.y > h + 10) d.y = -10;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK) {
            ctx.strokeStyle =
              'rgba(0, 119, 182, ' + (0.12 * (1 - dist / LINK)).toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      for (const d of dots) {
        ctx.fillStyle = 'rgba(0, 119, 182, 0.28)';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    // Pause the canvas when the hero is off-screen (saves battery/CPU)
    const heroSection = document.getElementById('hero');
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          running = entry.isIntersecting;
          if (running && raf === null) {
            raf = requestAnimationFrame(tick);
          } else if (!running && raf !== null) {
            cancelAnimationFrame(raf);
            raf = null;
          }
        });
      },
      { threshold: 0 }
    ).observe(heroSection);

    window.addEventListener('resize', resize, { passive: true });
    resize();
    raf = requestAnimationFrame(tick);
  }

  /* ---------- 4. Timeline progress ----------
     The blue line grows as the user scrolls through the
     installation journey. */
  const timeline = document.getElementById('timeline');
  const progress = document.getElementById('timelineProgress');

  if (timeline && progress) {
    function updateTimeline() {
      const rect = timeline.getBoundingClientRect();
      const viewH = window.innerHeight;

      // 0 when the timeline top reaches 80% of the viewport,
      // 1 when its bottom reaches 45% of the viewport.
      const startLine = viewH * 0.8;
      const endLine = viewH * 0.45;
      const total = rect.height + (startLine - endLine);
      const passed = startLine - rect.top;
      const pct = Math.max(0, Math.min(1, passed / total));

      progress.style.height = (pct * 100).toFixed(2) + '%';
    }

    if (prefersReducedMotion) {
      progress.style.height = '100%';
    } else {
      window.addEventListener('scroll', updateTimeline, { passive: true });
      window.addEventListener('resize', updateTimeline, { passive: true });
      updateTimeline();
    }
  }
})();
