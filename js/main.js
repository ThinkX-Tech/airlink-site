/* ==========================================================================
   AirLink — main.js
   Navigation behaviour: scrolled state, mobile menu, link handling.
   ========================================================================== */

(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  /* ---------- Nav background on scroll ---------- */
  function onScroll() {
    nav.classList.toggle('nav--scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  function closeMenu() {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  // Close the menu after choosing a destination
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close if resized back to desktop
  window.addEventListener(
    'resize',
    () => {
      if (window.innerWidth > 768) closeMenu();
    },
    { passive: true }
  );
})();
