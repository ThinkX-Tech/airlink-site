/* ==========================================================================
   AirLink — observer.js
   Intersection Observer: adds .in-view to elements as they enter the
   viewport. Drives every scroll reveal on the page.
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Elements that reveal individually
  const revealTargets = document.querySelectorAll('.reveal');

  // Sections whose child animations (lines, bars, particles) trigger together
  const groupTargets = document.querySelectorAll(
    '.vision__diagram, .introducing__diagram, .monitor, .about__pillars'
  );

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // Show everything immediately — no motion.
    revealTargets.forEach((el) => el.classList.add('in-view'));
    groupTargets.forEach((el) => el.classList.add('in-view'));
    document.dispatchEvent(new CustomEvent('airlink:no-motion'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');

          // Counters inside this element start when it becomes visible
          entry.target
            .querySelectorAll('[data-count]')
            .forEach((counter) => {
              document.dispatchEvent(
                new CustomEvent('airlink:count', { detail: counter })
              );
            });

          observer.unobserve(entry.target); // reveal once, stay revealed
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealTargets.forEach((el) => observer.observe(el));
  groupTargets.forEach((el) => observer.observe(el));
})();
