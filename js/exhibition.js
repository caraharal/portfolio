(function () {
  'use strict';

  var header = document.getElementById('header');
  var navLinks = document.getElementById('nav-links');
  var hamburger = document.getElementById('hamburger');
  var themeToggle = document.getElementById('theme-toggle');
  var htmlElement = document.documentElement;
  var overlayElement = null;
  var themeKey = 'chl-portfolio-theme';

  function applyTheme(theme) {
    if (theme === 'dark') htmlElement.setAttribute('data-theme', 'dark');
    else htmlElement.removeAttribute('data-theme');
    localStorage.setItem(themeKey, theme);
  }

  applyTheme(localStorage.getItem(themeKey) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  themeToggle.addEventListener('click', function () {
    applyTheme(htmlElement.hasAttribute('data-theme') ? 'light' : 'dark');
  });

  function closeMenu() {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    if (overlayElement) overlayElement.remove();
    overlayElement = null;
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (navLinks.classList.contains('active')) return closeMenu();
    navLinks.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    overlayElement = document.createElement('div');
    overlayElement.className = 'nav__overlay active';
    overlayElement.addEventListener('click', closeMenu);
    document.body.appendChild(overlayElement);
    document.body.style.overflow = 'hidden';
  });

  navLinks.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeMenu); });
  window.addEventListener('scroll', function () { header.classList.toggle('header--scrolled', window.scrollY > 10); }, { passive: true });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMenu(); });
}());
