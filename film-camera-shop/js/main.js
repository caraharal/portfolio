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

// 暴露到全局（AI 导购需要用到）
window.getCameraById = getCameraById;

/* ================================================================
   首页逻辑
   ================================================================ */

/**
 * 渲染相机卡片列表
 */
function renderCameraList(filterBrand) {
  var container = document.getElementById('camera-list');
  if (!container) return;

  // 无相机时的空状态
  if (!CAMERAS || CAMERAS.length === 0) {
    container.innerHTML = '<div class="empty-state">📷<br>暂无在售相机，请稍后再来</div>';
    return;
  }

  var filtered = CAMERAS;
  if (filterBrand && filterBrand !== 'all') {
    filtered = CAMERAS.filter(function (c) { return c.brand === filterBrand; });
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">📷<br>该品牌暂无在售相机</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < filtered.length; i++) {
    var cam = filtered[i];
    var cover = (cam.images && cam.images.length > 0)
      ? cam.images[0]
      : 'images/placeholder.svg';

      var statusLabel = '';
      if (cam.status === 'sold') {
        statusLabel = '<span class="status-badge status-badge--sold">售罄</span>';
      } else if (cam.status === 'restocking') {
        statusLabel = '<span class="status-badge status-badge--restocking">补货中</span>';
      }

      html +=
      '<a class="camera-card' + (cam.status === 'sold' ? ' camera-card--sold' : '') + '" href="detail.html?id=' + encodeURIComponent(cam.id) + '">' +
        '<div class="card-image-wrap">' +
          '<img src="' + cover + '" alt="' + cam.name + '" loading="lazy" ' +
            'onerror="this.src=\'images/placeholder.svg\'">' +
          (statusLabel ? '<div class="card-status-tag">' + statusLabel + '</div>' : '') +
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

  // 站点标题
  var logo = document.getElementById('site-logo');
  if (logo) logo.textContent = SITE_CONFIG.siteName;
  var subtitle = document.getElementById('site-subtitle');
  if (subtitle) subtitle.textContent = SITE_CONFIG.siteSubtitle;
}

/**
 * 初始化品牌筛选栏
 */
function initBrandFilter() {
  var bar = document.getElementById('brand-filter-bar');
  if (!bar) return;

  bar.addEventListener('click', function (e) {
    var btn = e.target.closest('.brand-filter-btn');
    if (!btn) return;

    // 切换 active 状态
    bar.querySelectorAll('.brand-filter-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');

    // 按品牌筛选
    renderCameraList(btn.getAttribute('data-brand'));
  });
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
    initBrandFilter();
    initAiGuide();
  }
})();

/* ================================================================
   AI 导购助手 — 纯前端决策树，零 API 消耗
   ================================================================ */

/**
 * AI 导购推荐规则
 *
 * 每条规则定义：
 *   match: 用户答案需完全匹配（按 q1, q2, q3 顺序）
 *   recommend: 推荐的相机 id（对应 CAMERAS 数组）
 *   reason: 推荐理由（一句话）
 *
 * 注意：
 *   - 目前只有 3 台样机，规则覆盖了常见组合
 *   - 添加新相机后在这里增加匹配规则即可
 */
/**
 * AI 导购 — 桌面左侧面板 + 移动端弹窗双模式
 * 纯前端决策树，零 API 消耗
 */

var AI_RULES = [
  // ===== Minolta X-700 — 胶片单反 | 标配 50mm 定焦 | ¥680 =====
  // 600-1000 预算
  { match: { q1: '600-1000', q2: 'slr', q3: 'prime', q4: 'portrait' },  recommend: 'minolta-x700', reason: '50mm f/1.7 定焦拍人像虚化自然，MD 卡口镜头群丰富，性价比超高' },
  { match: { q1: '600-1000', q2: 'slr', q3: 'prime', q4: 'beginner' },  recommend: 'minolta-x700', reason: 'P 档全自动 + 50mm 定焦，入门胶片的黄金组合，操作简单出片效果好' },
  { match: { q1: '600-1000', q2: 'slr', q3: 'prime', q4: 'street' },    recommend: 'minolta-x700', reason: '机身轻便、快门清脆，50mm 定焦街拍不心疼，入门首选单反' },
  { match: { q1: '600-1000', q2: 'slr', q3: 'prime', q4: 'landscape' }, recommend: 'minolta-x700', reason: '光圈优先 + 可换广角镜头拍风光，MD 卡口镜头群便宜大碗' },
  { match: { q1: '600-1000', q2: 'slr', q3: 'any', q4: 'portrait' },    recommend: 'minolta-x700', reason: '50mm 定焦套机拍人像效果出众，后续可自由升级镜头' },
  { match: { q1: '600-1000', q2: 'slr', q3: 'any', q4: 'beginner' },    recommend: 'minolta-x700', reason: '最全能的入门胶片单反，自动+手动双模式，学习创作两不误' },
  { match: { q1: '600-1000', q2: 'slr', q3: 'any', q4: 'street' },      recommend: 'minolta-x700', reason: '轻量单反机身 + 定焦镜头，街头抓拍响应快、不引人注目' },
  // 300-600 预算
  { match: { q1: '300-600', q2: 'slr', q3: 'prime', q4: 'beginner' },   recommend: 'minolta-x700', reason: '这个价位能买到的最完整的胶片入门套装，P 档自动曝光新手友好' },
  { match: { q1: '300-600', q2: 'slr', q3: 'prime', q4: 'portrait' },   recommend: 'minolta-x700', reason: '50mm 大光圈定焦 + 胶片色彩，拍人像比手机有质感太多' },
  { match: { q1: '300-600', q2: 'slr', q3: 'any', q4: 'beginner' },     recommend: 'minolta-x700', reason: '胶片入门性价比之王，300+ 就能拥有一台功能完整的经典单反' },
  { match: { q1: '300-600', q2: 'slr', q3: 'any', q4: 'portrait' },     recommend: 'minolta-x700', reason: '预算友好 + 人像利器，剩下的钱还能多买几卷胶卷' },

  // ===== Olympus µ-II — 傻瓜机 | 35mm 定焦 | ¥1200 =====
  { match: { q1: '600-1000', q2: 'ps', q3: 'prime', q4: 'street' },    recommend: 'olympus-mju-ii', reason: '口袋大小、滑盖即拍，35mm 定焦街拍神器，随身带着随手拍' },
  { match: { q1: '600-1000', q2: 'ps', q3: 'prime', q4: 'beginner' },  recommend: 'olympus-mju-ii', reason: '全自动傻瓜机中的经典，生活防水、自动曝光，零学习成本' },
  { match: { q1: '600-1000', q2: 'ps', q3: 'any', q4: 'street' },      recommend: 'olympus-mju-ii', reason: '35mm f/2.8 镜头出片率极高，滑盖开机即拍，不错过任何瞬间' },
  { match: { q1: '600-1000', q2: 'ps', q3: 'any', q4: 'beginner' },    recommend: 'olympus-mju-ii', reason: '不想研究参数？这台完全不用动脑，开机按下快门就是好照片' },

  // ===== Contax T2 — 傻瓜机 | 38mm 定焦 | ¥3800 =====
  { match: { q1: '600-1000', q2: 'ps', q3: 'prime', q4: 'portrait' },  recommend: 'contax-t2', reason: '蔡司 Sonnar 38mm f/2.8 镜头出片锐利，拍人像氛围感一绝' },
  { match: { q1: '600-1000', q2: 'ps', q3: 'prime', q4: 'landscape' }, recommend: 'contax-t2', reason: '钛金属机身 + 蔡司镜头，风光片不用修，直出色彩就够迷人' },
  { match: { q1: '600-1000', q2: 'ps', q3: 'any', q4: 'portrait' },    recommend: 'contax-t2', reason: '口袋里的徕卡，自动对焦精准，拍人像省心出片率高' },

  // ===== 兜底规则（覆盖更多组合，至少有一条匹配） =====
  { match: { q1: '300-600', q2: 'ps', q3: 'any', q4: 'beginner' },     recommend: 'minolta-x700', reason: '这个预算傻瓜机选择不多，推荐一台操作友好、可换镜头的胶片单反入门' },
  { match: { q1: '300-600', q2: 'ps', q3: 'any', q4: 'street' },       recommend: 'minolta-x700', reason: '傻瓜机预算偏紧？这台单反轻便不输口袋机，街拍利器' },
  { match: { q1: '100-300', q2: 'slr', q3: 'any', q4: 'beginner' },    recommend: 'minolta-x700', reason: '百元预算入胶片单反的门，性价比天花板，P 档上手零压力' },
  { match: { q1: '100-300', q2: 'slr', q3: 'any', q4: 'portrait' },    recommend: 'minolta-x700', reason: '百元价位难得的 50mm 大光圈人像机，拍出来的胶片质感手机做不到' },
  { match: { q1: '100以下', q2: 'slr', q3: 'any', q4: 'beginner' },    recommend: 'minolta-x700', reason: '超低预算想玩胶片单反？这台是你能找到的最完整的入门套装' },
  { match: { q1: '100以下', q2: 'ps', q3: 'any', q4: 'beginner' },     recommend: 'minolta-x700', reason: '百元内傻瓜机选择极少，建议稍加预算上一台入门单反，性价比高很多' }
];

function matchAiRule(answers) {
  // 优先：4 维完全匹配 + 有货
  for (var i = 0; i < AI_RULES.length; i++) {
    var rule = AI_RULES[i];
    if (rule.match.q1 === answers.q1 && rule.match.q2 === answers.q2 &&
        rule.match.q3 === answers.q3 && rule.match.q4 === answers.q4) {
      var cam = window.getCameraById(rule.recommend);
      if (cam && cam.status !== 'sold') return rule;
    }
  }
  // 其次：完全匹配 + 补货中
  for (var k = 0; k < AI_RULES.length; k++) {
    var r2 = AI_RULES[k];
    if (r2.match.q1 === answers.q1 && r2.match.q2 === answers.q2 &&
        r2.match.q3 === answers.q3 && r2.match.q4 === answers.q4) return r2;
  }
  // 然后：q1+q2+q3 匹配 + 有货
  for (var j = 0; j < AI_RULES.length; j++) {
    var r = AI_RULES[j];
    if (r.match.q1 === answers.q1 && r.match.q2 === answers.q2 && r.match.q3 === answers.q3) {
      var c = window.getCameraById(r.recommend);
      if (c && c.status !== 'sold') return r;
    }
  }
  // 再然后：q1+q2 匹配 + 有货
  for (var m = 0; m < AI_RULES.length; m++) {
    var r3 = AI_RULES[m];
    if (r3.match.q1 === answers.q1 && r3.match.q2 === answers.q2) {
      var c2 = window.getCameraById(r3.recommend);
      if (c2 && c2.status !== 'sold') return r3;
    }
  }
  // 最后兜底：返回第一条有货的规则
  for (var n = 0; n < AI_RULES.length; n++) {
    var r4 = AI_RULES[n];
    var c3 = window.getCameraById(r4.recommend);
    if (c3 && c3.status !== 'sold') return r4;
  }
  return AI_RULES[0];
}

var AI_QUESTIONS = [
  { id: 'q1', text: '嗨！想找一台合适的胶片相机？<br><br>先告诉我你的<span style="color:#5C3D2E;font-weight:700;">预算范围</span>吧～', options: [
    { label: '💰 100 元以下',      value: '100以下' },
    { label: '💰 100 - 300 元',    value: '100-300' },
    { label: '💰 300 - 600 元',    value: '300-600' },
    { label: '💰 600 - 1000 元',   value: '600-1000' }
  ]},
  { id: 'q2', text: '了解！你想要什么<span style="color:#5C3D2E;font-weight:700;">类型的相机</span>？', options: [
    { label: '📷 傻瓜机 — 口袋大小、自动对焦、操作简单',       value: 'ps' },
    { label: '📸 胶片单反 — 可换镜头、手动操控、创作空间大',    value: 'slr' }
  ]},
  { id: 'q3', text: '对<span style="color:#5C3D2E;font-weight:700;">焦段</span>有偏好吗？', options: [
    { label: '🔍 定焦 — 固定焦距、画质更好、轻便',   value: 'prime' },
    { label: '🔎 变焦 — 可调焦距、灵活方便',          value: 'zoom' },
    { label: '🤷 不太了解，帮我推荐就行',              value: 'any' }
  ]},
  { id: 'q4', text: '你主要想拍<span style="color:#5C3D2E;font-weight:700;">什么题材</span>？', options: [
    { label: '👤 人像',            value: 'portrait' },
    { label: '🚶 街拍 / 日常记录',  value: 'street' },
    { label: '🏔 风光 / 旅行',      value: 'landscape' },
    { label: '📖 入门练习，什么都拍', value: 'beginner' }
  ]}
];

// 共享状态
var _aiState = { step: 0, answers: {} };

function _aiStartChat(chat) {
  _aiState = { step: 0, answers: {} };
  while (chat.firstChild) chat.removeChild(chat.firstChild);
  _aiShowQuestion(chat, 0);
}

function _aiShowQuestion(chat, stepIndex) {
  if (stepIndex >= AI_QUESTIONS.length) { _aiShowResult(chat); return; }
  _aiState.step = stepIndex;
  var q = AI_QUESTIONS[stepIndex];

  var bubble = document.createElement('div');
  bubble.className = 'ai-bubble ai-bubble--ai';
  bubble.innerHTML = q.text;
  chat.appendChild(bubble);

  var opts = document.createElement('div');
  opts.className = 'ai-options';
  q.options.forEach(function (opt) {
    var btn = document.createElement('button');
    btn.className = 'ai-option-btn';
    btn.textContent = opt.label;
    btn.addEventListener('click', function () {
      var ub = document.createElement('div');
      ub.className = 'ai-bubble ai-bubble--user';
      ub.textContent = opt.label.replace(/^.[\s]*/, '');
      chat.appendChild(ub);
      opts.remove();
      _aiState.answers[q.id] = opt.value;
      setTimeout(function () { _aiShowQuestion(chat, stepIndex + 1); }, 400);
    });
    opts.appendChild(btn);
  });
  chat.appendChild(opts);
  chat.scrollTop = chat.scrollHeight;
}

function _aiShowResult(chat) {
  var rule = matchAiRule(_aiState.answers);
  var cam = window.getCameraById ? window.getCameraById(rule.recommend) : null;
  if (!cam) {
    var eb = document.createElement('div');
    eb.className = 'ai-bubble ai-bubble--ai';
    eb.textContent = '抱歉，暂时没有完全匹配的机型，请重新试试～';
    chat.appendChild(eb); return;
  }
  var am = document.createElement('div');
  am.className = 'ai-bubble ai-bubble--ai';
  am.innerHTML = '根据你的需求，我推荐这台 👇';
  chat.appendChild(am);

  var rc = document.createElement('div');
  rc.className = 'ai-result';
  rc.innerHTML = '<div class="ai-result-title">' + cam.name + '</div>' +
    '<div class="ai-result-reason">' + rule.reason + '</div>' +
    '<a class="ai-result-link" href="detail.html?id=' + encodeURIComponent(cam.id) + '">查看详情 →</a>';
  chat.appendChild(rc);

  var rb = document.createElement('button');
  rb.className = 'ai-restart';
  rb.textContent = '🔄 重新选择';
  rb.addEventListener('click', function () { _aiStartChat(chat); });
  chat.appendChild(rb);
  chat.scrollTop = chat.scrollHeight;
}

function initAiGuide() {
  // 桌面端：左侧面板
  var panelChat = document.getElementById('ai-panel-chat');
  var startBtn = document.getElementById('ai-start-btn');
  if (panelChat && startBtn) {
    startBtn.addEventListener('click', function () { _aiStartChat(panelChat); });
  }

  // 移动端：FAB + 弹窗
  var fab = document.getElementById('ai-guide-fab');
  var modal = document.getElementById('ai-guide-modal');
  var modalChat = document.getElementById('ai-guide-chat');
  if (fab && modal && modalChat) {
    var closeBtn = document.getElementById('ai-guide-close');
    var overlay = modal.querySelector('.ai-guide-overlay');
    fab.addEventListener('click', function () {
      modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      _aiStartChat(modalChat);
    });
    var closeFn = function () {
      modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    if (closeBtn) closeBtn.addEventListener('click', closeFn);
    if (overlay) overlay.addEventListener('click', closeFn);
  }
}
