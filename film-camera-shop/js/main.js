/**
 * ============================================================
 * 慢帧时光 film — 公共逻辑
 * 首页渲染 / 详情页渲染 / 图片轮播 / 微信复制
 * ============================================================
 *
 * 📍 修改全局配置在这里！
 * ============================================================
 */

var SITE_CONFIG = {
  // 📍 你的微信号（点击微信咨询按钮会复制这个）
  wechatId: 'caraharal0213',

  // 📍 你的闲鱼主页链接
  xianyuLink: 'https://m.tb.cn/h.R9xYB8c?tk=kRw7gdBVeTV',

  // 📍 网站名称
  siteName: '慢帧时光',
  siteSubtitle: 'film camera market'
};

/* ================================================================
   工具函数
   ================================================================ */

/**
 * 获取 URL 查询参数
 * 例如 detail.html?id=contax-t2 → 返回 'contax-t2'
 */
function getUrlParam(name) {
  var params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * 复制文本到剪贴板（兼容降级方案）
 */
function copyToClipboard(text) {
  // 优先使用现代 API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }

  // 降级方案：创建临时 textarea
  return new Promise(function (resolve, reject) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch (err) {
      reject(err);
    }
    document.body.removeChild(textarea);
  });
}

/**
 * 显示 Toast 提示
 * @param {string} message - 提示文字
 * @param {number} duration - 显示时长（毫秒）
 */
function showToast(message, duration) {
  duration = duration || 2000;

  var toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(function () {
    toast.classList.remove('show');
  }, duration);
}

/**
 * 根据 ID 查找相机数据
 */
function getCameraById(id) {
  for (var i = 0; i < CAMERAS.length; i++) {
    if (CAMERAS[i].id === id) {
      return CAMERAS[i];
    }
  }
  return null;
}

/* ================================================================
   首页逻辑
   ================================================================ */

/**
 * 渲染相机卡片列表
 */
function renderCameraList() {
  var container = document.getElementById('camera-list');
  if (!container) return;

  // 无相机时的空状态
  if (!CAMERAS || CAMERAS.length === 0) {
    container.innerHTML = '<div class="empty-state">📷<br>暂无在售相机，请稍后再来</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < CAMERAS.length; i++) {
    var cam = CAMERAS[i];
    // 封面图用第一张，没有的话用占位图
    var cover = (cam.images && cam.images.length > 0)
      ? cam.images[0]
      : 'images/placeholder.svg';

    html +=
      '<a class="camera-card" href="detail.html?id=' + encodeURIComponent(cam.id) + '">' +
        '<div class="card-image-wrap">' +
          '<img src="' + cover + '" alt="' + cam.name + '" loading="lazy" ' +
            'onerror="this.src=\'images/placeholder.svg\'">' +
        '</div>' +
        '<div class="card-body">' +
          '<h2 class="card-name">' + cam.name + '</h2>' +
          '<div class="card-model">' + cam.brand + ' ' + cam.model + '</div>' +
          '<div class="card-footer">' +
            '<span class="condition-badge">' + cam.condition + '</span>' +
            '<span class="card-price">' +
              '<span class="price-unit">¥</span>' + cam.price.toLocaleString() +
            '</span>' +
          '</div>' +
        '</div>' +
      '</a>';
  }
  container.innerHTML = html;

  // 给当前页面的站点标题赋值
  var logo = document.getElementById('site-logo');
  if (logo) logo.textContent = SITE_CONFIG.siteName;

  var subtitle = document.getElementById('site-subtitle');
  if (subtitle) subtitle.textContent = SITE_CONFIG.siteSubtitle;
}

/* ================================================================
   详情页逻辑
   ================================================================ */

/**
 * 渲染详情页完整内容
 */
function renderDetail() {
  var cameraId = getUrlParam('id');

  // 没有 id 参数
  if (!cameraId) {
    showErrorState('缺少相机 ID 参数');
    return;
  }

  var cam = getCameraById(cameraId);

  // 找不到对应相机
  if (!cam) {
    showErrorState('未找到相机：' + cameraId);
    return;
  }

  // 设置页面标题
  document.title = cam.name + ' - ' + SITE_CONFIG.siteName;

  // 填充各个区域
  renderCarousel(cam);
  renderVideo(cam);
  renderInfo(cam);
  renderAccessories(cam);
  renderDescription(cam);
  renderPrice(cam);
  bindActions(cam);
}

/**
 * 显示错误状态
 */
function showErrorState(message) {
  var main = document.querySelector('main') || document.body;
  main.innerHTML =
    '<div class="error-state">' +
      '<div class="error-icon">📷</div>' +
      '<h2>相机未找到</h2>' +
      '<p>' + message + '</p>' +
      '<a class="btn btn-wechat" href="index.html" style="display:inline-block;width:auto;padding:12px 32px;">← 返回首页</a>' +
    '</div>';
}

/**
 * 初始化图片轮播
 */
function renderCarousel(cam) {
  var container = document.getElementById('carousel');
  if (!container) return;

  // 没有图片时显示占位
  var images = (cam.images && cam.images.length > 0)
    ? cam.images
    : ['images/placeholder.svg'];

  // 构建轮播 HTML
  var slidesHtml = '';
  var dotsHtml = '';
  for (var i = 0; i < images.length; i++) {
    slidesHtml +=
      '<div class="carousel-slide">' +
        '<img src="' + images[i] + '" alt="' + cam.name + ' - ' + (i + 1) + '" ' +
          'onerror="this.src=\'images/placeholder.svg\'">' +
      '</div>';
    var isActive = i === 0 ? ' active' : '';
    dotsHtml += '<span class="carousel-dot' + isActive + '" data-index="' + i + '"></span>';
  }

  container.innerHTML =
    '<div class="carousel-track">' + slidesHtml + '</div>' +
    '<div class="carousel-dots">' + dotsHtml + '</div>' +
    '<button class="carousel-arrow prev" aria-label="上一张">‹</button>' +
    '<button class="carousel-arrow next" aria-label="下一张">›</button>';

  // 初始化轮播交互
  initCarouselInteraction(container, images.length);
}

/**
 * 轮播交互：触摸滑动 + 自动播放 + 箭头点击
 */
function initCarouselInteraction(carousel, totalSlides) {
  if (totalSlides <= 1) {
    // 只有一张图，隐藏圆点
    var dots = carousel.querySelector('.carousel-dots');
    if (dots) dots.style.display = 'none';
    return;
  }

  var track = carousel.querySelector('.carousel-track');
  var dotEls = carousel.querySelectorAll('.carousel-dot');
  var prevBtn = carousel.querySelector('.carousel-arrow.prev');
  var nextBtn = carousel.querySelector('.carousel-arrow.next');

  var currentIndex = 0;
  var startX = 0;
  var moveX = 0;
  var isDragging = false;
  var autoplayTimer = null;

  /**
   * 跳转到指定 slide
   */
  function goToSlide(index, animate) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    currentIndex = index;

    if (animate === false) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }

    track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

    // 更新圆点
    for (var i = 0; i < dotEls.length; i++) {
      dotEls[i].classList.toggle('active', i === currentIndex);
    }
  }

  /**
   * 自动播放
   */
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(function () {
      var next = (currentIndex + 1) % totalSlides;
      goToSlide(next, true);
    }, 3000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // ---- 触摸事件 ----
  track.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    moveX = startX;
    isDragging = true;
    track.style.transition = 'none';
    stopAutoplay();
  }, { passive: true });

  track.addEventListener('touchmove', function (e) {
    if (!isDragging) return;
    moveX = e.touches[0].clientX;
    var diff = moveX - startX;
    var percent = (diff / carousel.offsetWidth) * 100;
    track.style.transform = 'translateX(' + (-currentIndex * 100 + percent) + '%)';
  }, { passive: true });

  track.addEventListener('touchend', function () {
    if (!isDragging) return;
    isDragging = false;

    var diff = moveX - startX;
    var threshold = 50; // 滑动阈值（像素）

    if (diff < -threshold && currentIndex < totalSlides - 1) {
      currentIndex++;
    } else if (diff > threshold && currentIndex > 0) {
      currentIndex--;
    }

    goToSlide(currentIndex, true);
    startAutoplay();
  });

  // ---- 鼠标事件（桌面端辅助） ----
  track.addEventListener('mousedown', function (e) {
    e.preventDefault();
    startX = e.clientX;
    moveX = startX;
    isDragging = true;
    track.style.transition = 'none';
    stopAutoplay();
  });

  track.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    moveX = e.clientX;
    var diff = moveX - startX;
    var percent = (diff / carousel.offsetWidth) * 100;
    track.style.transform = 'translateX(' + (-currentIndex * 100 + percent) + '%)';
  });

  track.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;

    var diff = moveX - startX;
    if (Math.abs(diff) > 50) {
      if (diff < 0 && currentIndex < totalSlides - 1) currentIndex++;
      if (diff > 0 && currentIndex > 0) currentIndex--;
    }
    goToSlide(currentIndex, true);
    startAutoplay();
  });

  track.addEventListener('mouseleave', function () {
    if (isDragging) {
      isDragging = false;
      goToSlide(currentIndex, true);
      startAutoplay();
    }
  });

  // ---- 箭头按钮 ----
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      stopAutoplay();
      goToSlide(currentIndex - 1, true);
      startAutoplay();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      stopAutoplay();
      goToSlide(currentIndex + 1, true);
      startAutoplay();
    });
  }

  // ---- 圆点点击 ----
  for (var d = 0; d < dotEls.length; d++) {
    (function (dot, idx) {
      dot.addEventListener('click', function () {
        stopAutoplay();
        goToSlide(idx, true);
        startAutoplay();
      });
    })(dotEls[d], d);
  }

  // ---- 启动轮播 ----
  startAutoplay();

  // 页面隐藏时暂停（节省资源）
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });
}

/**
 * 渲染视频区域
 */
function renderVideo(cam) {
  var section = document.getElementById('video-section');
  if (!section) return;

  if (!cam.video) {
    section.classList.add('empty');
    return;
  }

  section.classList.remove('empty');
  section.innerHTML =
    '<h3>📹 实拍视频</h3>' +
    '<video src="' + cam.video + '" controls preload="metadata" ' +
      'poster="' + (cam.images && cam.images[0] ? cam.images[0] : '') + '">' +
      '您的浏览器不支持视频播放' +
    '</video>';
}

/**
 * 渲染机器基本信息
 */
function renderInfo(cam) {
  var section = document.getElementById('info-section');
  if (!section) return;

  var pageHeaderTitle = document.getElementById('page-header-title');
  if (pageHeaderTitle) {
    pageHeaderTitle.textContent = cam.name;
  }

  section.innerHTML =
    '<h1 class="info-name">' + cam.name + '</h1>' +
    '<div class="info-meta">' +
      '<span class="condition-badge">' + cam.condition + '</span>' +
      '<span class="meta-divider">|</span>' +
      '<span>' + cam.brand + '</span>' +
      '<span class="meta-divider">|</span>' +
      '<span>型号：' + cam.model + '</span>' +
    '</div>';
}

/**
 * 渲染附件清单
 */
function renderAccessories(cam) {
  var section = document.getElementById('accessories-section');
  if (!section) return;

  if (!cam.accessories || cam.accessories.length === 0) {
    section.style.display = 'none';
    return;
  }

  var itemsHtml = '';
  for (var i = 0; i < cam.accessories.length; i++) {
    itemsHtml += '<li>' + cam.accessories[i] + '</li>';
  }

  section.innerHTML =
    '<h3>📦 附件清单</h3>' +
    '<ul class="accessories-list">' + itemsHtml + '</ul>';
}

/**
 * 渲染详细描述
 */
function renderDescription(cam) {
  var section = document.getElementById('description-section');
  if (!section) return;

  if (!cam.description) {
    section.style.display = 'none';
    return;
  }

  section.innerHTML =
    '<h3>📝 机器描述</h3>' +
    '<p>' + cam.description + '</p>';
}

/**
 * 渲染价格
 */
function renderPrice(cam) {
  var section = document.getElementById('price-section');
  if (!section) return;

  section.innerHTML =
    '<span class="price-tag">' +
      '<span class="currency">¥</span>' + cam.price.toLocaleString() +
    '</span>';
}

/**
 * 绑定操作按钮
 */
function bindActions(cam) {
  // 「微信咨询」按钮
  var wechatBtn = document.getElementById('btn-wechat');
  if (wechatBtn) {
    wechatBtn.addEventListener('click', function () {
      copyToClipboard(SITE_CONFIG.wechatId).then(function () {
        showToast('✅ 微信号已复制：「' + SITE_CONFIG.wechatId + '」，请打开微信添加');
      }).catch(function () {
        showToast('⚠ 复制失败，请手动添加微信：' + SITE_CONFIG.wechatId, 3000);
      });
    });
  }

  // 「查看样片」按钮 — 跳转闲鱼
  var xianyuBtn = document.getElementById('btn-xianyu');
  if (xianyuBtn) {
    xianyuBtn.addEventListener('click', function () {
      window.open(SITE_CONFIG.xianyuLink, '_blank');
    });
  }
}

/* ================================================================
   页面初始化
   ================================================================ */

(function init() {
  // 🔄 从 localStorage 加载数据（管理后台写入的），没有则用默认数据
  var storedCameras = localStorage.getItem('film_cameras');
  if (storedCameras) {
    try {
      CAMERAS = JSON.parse(storedCameras);
    } catch(e) {
      console.warn('读取相机缓存失败，使用默认数据');
    }
  }

  var storedConfig = localStorage.getItem('film_config');
  if (storedConfig) {
    try {
      var cfg = JSON.parse(storedConfig);
      SITE_CONFIG.wechatId = cfg.wechatId || SITE_CONFIG.wechatId;
      SITE_CONFIG.xianyuLink = cfg.xianyuLink || SITE_CONFIG.xianyuLink;
      SITE_CONFIG.siteName = cfg.siteName || SITE_CONFIG.siteName;
      SITE_CONFIG.siteSubtitle = cfg.siteSubtitle || SITE_CONFIG.siteSubtitle;
    } catch(e) {
      console.warn('读取配置缓存失败，使用默认配置');
    }
  }

  // 判断当前页面
  var path = window.location.pathname;

  if (path.indexOf('detail.html') !== -1) {
    // 详情页
    renderDetail();
  } else {
    // 首页（默认）
    renderCameraList();
  }
})();
