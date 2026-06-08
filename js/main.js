/**
 * 陈会凌 — 个人作品集
 * Main JavaScript: theme, navigation, gallery, lightbox, animations, form
 */
(function () {
  'use strict';

  // =========================================================================
  // 0. DOM References
  // =========================================================================
  var header = document.getElementById('header');
  var navLinks = document.getElementById('nav-links');
  var hamburger = document.getElementById('hamburger');
  var themeToggle = document.getElementById('theme-toggle');
  var htmlElement = document.documentElement;
  var allNavLinks = document.querySelectorAll('.nav__link');
  var overlayElement = null;

  // =========================================================================
  // 1. Theme Toggle
  // =========================================================================
  var THEME_KEY = 'chl-portfolio-theme';

  function getPreferredTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      htmlElement.setAttribute('data-theme', 'dark');
    } else {
      htmlElement.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  applyTheme(getPreferredTheme());

  themeToggle.addEventListener('click', function () {
    var current = htmlElement.hasAttribute('data-theme') ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // =========================================================================
  // 2. Header Scroll Shadow
  // =========================================================================
  function updateHeaderShadow() {
    if (window.scrollY > 10) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }
  window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  updateHeaderShadow();

  // =========================================================================
  // 3. Mobile Hamburger Menu
  // =========================================================================
  function createOverlay() {
    if (overlayElement) return;
    overlayElement = document.createElement('div');
    overlayElement.className = 'nav__overlay';
    overlayElement.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlayElement);
  }

  function openMenu() {
    navLinks.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    createOverlay();
    overlayElement.classList.add('active');
    overlayElement.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    if (overlayElement) {
      overlayElement.classList.remove('active');
      overlayElement.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (navLinks.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('click', function (e) {
    if (overlayElement && e.target === overlayElement) {
      closeMenu();
    }
  });

  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (navLinks.classList.contains('active')) closeMenu();
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (lightbox.classList.contains('active')) {
        closeLightbox();
      } else if (navLinks.classList.contains('active')) {
        closeMenu();
      }
    }
  });

  // =========================================================================
  // 4. Active Nav Highlighting
  // =========================================================================
  var sections = document.querySelectorAll('section[id]');
  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        allNavLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

  sections.forEach(function (section) { sectionObserver.observe(section); });

  // =========================================================================
  // 5. Photography Gallery
  // =========================================================================
  var galleryData = window.__GALLERY_DATA || {};
  var photoGallery = document.getElementById('photo-gallery');
  var filterButtons = document.querySelectorAll('.gallery-filter');
  var currentCategory = 'studio-portrait';

  function renderGallery(category) {
    if (!photoGallery || !galleryData[category]) return;

    var images = galleryData[category];
    var html = '';

    images.forEach(function (filename, index) {
      var thumbPath = 'assets/images/thumbnails/' + category + '/' + filename;
      var fullPath = 'assets/images/' + category + '/' + filename;
      html +=
        '<div class="gallery-item" data-index="' + index + '" data-category="' + category + '" data-full="' + fullPath + '">' +
        '  <img src="' + thumbPath + '" alt="' + category + ' ' + (index + 1) + '" loading="lazy">' +
        '  <div class="gallery-item__overlay"><span>🔍</span></div>' +
        '</div>';
    });

    photoGallery.innerHTML = html;
    currentCategory = category;

    // Bind click events for lightbox
    photoGallery.querySelectorAll('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () {
        openLightbox(
          parseInt(item.getAttribute('data-index')),
          item.getAttribute('data-category')
        );
      });
    });

    // Animate items
    animateGalleryItems();
  }

  // Category filter buttons
  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderGallery(btn.getAttribute('data-category'));
    });
  });

  // Initial render
  renderGallery('studio-portrait');

  // =========================================================================
  // 5b. Video Gallery — Dynamic Cards with Thumbnail Navigation
  // =========================================================================
  var videoGrid = document.getElementById('video-grid');
  var videoData = window.__VIDEO_DATA || [];

  if (videoGrid && videoData.length) {
    buildVideoCards();
  }

  function buildVideoCards() {
    var html = '';
    videoData.forEach(function (cat) {
      var hasMultiple = cat.videos.length > 1;
      var firstVideo = cat.videos[0];

      html += '<div class="video-card" data-category="' + cat.category + '">';

      // Main player
      html += '<div class="video-card__main' + (hasMultiple ? '' : ' video-card__main--single') + '" data-cat="' + cat.category + '">';
      html += '  <video src="' + firstVideo + '" muted loop playsinline preload="metadata" class="video-card__video"></video>';
      html += '  <div class="video-card__overlay">';
      html += '    <div class="video-card__play-btn">▶</div>';
      html += '  </div>';
      if (hasMultiple) {
        html += '  <button class="video-card__arrow video-card__arrow--prev" aria-label="上一个">◀</button>';
        html += '  <button class="video-card__arrow video-card__arrow--next" aria-label="下一个">▶</button>';
      }
      html += '</div>';

      // Thumbnail strip (only for multi-video categories)
      if (hasMultiple) {
        html += '<div class="video-card__strip" data-cat="' + cat.category + '">';
        cat.videos.forEach(function (v, i) {
          html += '<div class="video-card__thumb' + (i === 0 ? ' video-card__thumb--active' : '') + '" data-index="' + i + '" data-src="' + v + '">';
          html += '  <video src="' + v + '" muted preload="metadata"></video>';
          html += '  <span class="video-card__thumb-index">' + (i + 1) + '</span>';
          html += '</div>';
        });
        html += '</div>';
      }

      // Card body
      html += '<div class="video-card__body">';
      html += '  <h3 class="video-card__title">' + cat.title + '</h3>';
      html += '  <p class="video-card__count">' + cat.videos.length + ' 个作品</p>';
      html += '  <p class="video-card__desc">' + cat.desc + '</p>';
      html += '</div>';

      html += '</div>';
    });

    videoGrid.innerHTML = html;

    // Bind interactions
    bindVideoCardEvents();
  }

  function bindVideoCardEvents() {
    // For each video card
    videoGrid.querySelectorAll('.video-card').forEach(function (card) {
      var main = card.querySelector('.video-card__main');
      var mainVideo = main.querySelector('.video-card__video');
      var overlay = main.querySelector('.video-card__overlay');

      // Click overlay to play/pause
      if (overlay) {
        overlay.addEventListener('click', function () {
          if (mainVideo.paused) {
            mainVideo.play();
            main.classList.add('is-playing');
          } else {
            mainVideo.pause();
            main.classList.remove('is-playing');
          }
        });
      }

      // Thumbnail clicks to switch videos
      var thumbs = card.querySelectorAll('.video-card__thumb');
      thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          var newSrc = thumb.getAttribute('data-src');
          var newIndex = parseInt(thumb.getAttribute('data-index'));

          // Update main video
          var wasPlaying = !mainVideo.paused;
          mainVideo.src = newSrc;
          mainVideo.load();
          if (wasPlaying) {
            mainVideo.play();
            main.classList.add('is-playing');
          } else {
            main.classList.remove('is-playing');
          }

          // Update active thumbnail
          thumbs.forEach(function (t) { t.classList.remove('video-card__thumb--active'); });
          thumb.classList.add('video-card__thumb--active');

          // Scroll thumbnail into view
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
      });

      // Prev/Next arrows
      var prevBtn = main.querySelector('.video-card__arrow--prev');
      var nextBtn = main.querySelector('.video-card__arrow--next');

      if (prevBtn) {
        prevBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          navigateVideo(card, -1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          navigateVideo(card, 1);
        });
      }
    });
  }

  function navigateVideo(card, direction) {
    var thumbs = card.querySelectorAll('.video-card__thumb');
    if (thumbs.length < 2) return;

    var activeThumb = card.querySelector('.video-card__thumb--active');
    var currentIndex = activeThumb ? parseInt(activeThumb.getAttribute('data-index')) : 0;
    var newIndex = (currentIndex + direction + thumbs.length) % thumbs.length;

    thumbs[newIndex].click();
  }

  // =========================================================================
  // 6. Lightbox
  // =========================================================================
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var currentIndex = 0;
  var currentCat = '';

  function openLightbox(index, category) {
    currentIndex = index;
    currentCat = category;
    updateLightboxImage();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateLightboxImage() {
    var images = galleryData[currentCat];
    if (!images) return;
    var filename = images[currentIndex];
    // Use thumbnail (800px) for lightbox — high quality for screen, small file size
    var imgPath = 'assets/images/thumbnails/' + currentCat + '/' + filename;
    lightboxImg.src = imgPath;
    lightboxCaption.textContent = currentCat + ' — ' + (currentIndex + 1) + ' / ' + images.length;
  }

  function showPrev() {
    var images = galleryData[currentCat];
    if (!images) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightboxImage();
  }

  function showNext() {
    var images = galleryData[currentCat];
    if (!images) return;
    currentIndex = (currentIndex + 1) % images.length;
    updateLightboxImage();
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  // Close lightbox on background click
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'Escape') closeLightbox();
  });

  // =========================================================================
  // 7. Scroll Animations
  // =========================================================================
  var animateElements = document.querySelectorAll(
    '.project-card, .skill-category, .timeline__item, .about__image-wrapper'
  );

  animateElements.forEach(function (el) {
    el.classList.add('animate-hidden');
  });

  var animationObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  animateElements.forEach(function (el) { animationObserver.observe(el); });

  function animateGalleryItems() {
    var items = photoGallery.querySelectorAll('.gallery-item');
    items.forEach(function (item, i) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.4s ease ' + (i * 0.05) + 's, transform 0.4s ease ' + (i * 0.05) + 's';
      // Trigger reflow then animate
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        });
      });
    });
  }

  // =========================================================================
  // 8. Contact Form
  // =========================================================================
  var contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  var nameInput = document.getElementById('name');
  var emailInput = document.getElementById('email');
  var messageInput = document.getElementById('message');
  var nameError = document.getElementById('name-error');
  var emailError = document.getElementById('email-error');
  var messageError = document.getElementById('message-error');
  var submitBtn = contactForm.querySelector('button[type="submit"]');
  var btnText = submitBtn.querySelector('.btn__text');
  var btnLoading = submitBtn.querySelector('.btn__loading');
  var formSuccess = document.getElementById('form-success');
  var formErrorGlobal = document.getElementById('form-error-global');

  function showError(input, errorEl, message) {
    input.classList.add('error');
    errorEl.textContent = message;
  }

  function clearError(input, errorEl) {
    input.classList.remove('error');
    errorEl.textContent = '';
  }

  function validateName() {
    var val = nameInput.value.trim();
    if (!val) { showError(nameInput, nameError, '请输入你的名字'); return false; }
    if (val.length < 2) { showError(nameInput, nameError, '名字至少需要2个字符'); return false; }
    clearError(nameInput, nameError);
    return true;
  }

  function validateEmail() {
    var val = emailInput.value.trim();
    if (!val) { showError(emailInput, emailError, '请输入邮箱地址'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      showError(emailInput, emailError, '请输入有效的邮箱地址');
      return false;
    }
    clearError(emailInput, emailError);
    return true;
  }

  function validateMessage() {
    var val = messageInput.value.trim();
    if (!val) { showError(messageInput, messageError, '请输入消息内容'); return false; }
    if (val.length < 10) { showError(messageInput, messageError, '消息至少需要10个字符'); return false; }
    clearError(messageInput, messageError);
    return true;
  }

  function validateForm() {
    return validateName() && validateEmail() && validateMessage();
  }

  nameInput.addEventListener('blur', validateName);
  emailInput.addEventListener('blur', validateEmail);
  messageInput.addEventListener('blur', validateMessage);

  nameInput.addEventListener('input', function () {
    if (nameInput.classList.contains('error')) clearError(nameInput, nameError);
  });
  emailInput.addEventListener('input', function () {
    if (emailInput.classList.contains('error')) clearError(emailInput, emailError);
  });
  messageInput.addEventListener('input', function () {
    if (messageInput.classList.contains('error')) clearError(messageInput, messageError);
  });

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    formSuccess.hidden = true;
    formErrorGlobal.hidden = true;

    if (!validateForm()) return;

    btnText.hidden = true;
    btnLoading.hidden = false;
    submitBtn.disabled = true;

    var formData = new FormData(contactForm);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', contactForm.action, true);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = function () {
      btnText.hidden = false;
      btnLoading.hidden = true;
      submitBtn.disabled = false;

      if (xhr.status === 200) {
        formSuccess.hidden = false;
        contactForm.reset();
        [nameInput, emailInput, messageInput].forEach(function (el) { el.classList.remove('error'); });
        [nameError, emailError, messageError].forEach(function (el) { el.textContent = ''; });
      } else {
        formErrorGlobal.hidden = false;
      }
    };

    xhr.onerror = function () {
      btnText.hidden = false;
      btnLoading.hidden = true;
      submitBtn.disabled = false;
      formErrorGlobal.hidden = false;
    };

    xhr.send(formData);
  });

})();
