(function () {
  'use strict';

  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var header = document.getElementById('header');
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('nav-links');
  var savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.setAttribute('data-theme', 'dark');
  }

  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  window.addEventListener('scroll', function () {
    header.classList.toggle('header--scrolled', window.scrollY > 10);
  }, { passive: true });

  hamburger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('active');
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
})();
