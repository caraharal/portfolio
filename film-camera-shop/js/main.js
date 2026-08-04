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
var AI_RULES = [
  // Contax T2 — 有基础 / 预算充足 / 街拍或风光
  { match: { q1: '3000+', q2: 'experienced', q3: 'street' },    recommend: 'contax-t2', reason: 'Contax T2 钛金属机身、蔡司镜头，街拍利器，口袋里的徕卡' },
  { match: { q1: '3000+', q2: 'experienced', q3: 'landscape' }, recommend: 'contax-t2', reason: '蔡司 38mm f/2.8 成像锐利，风光出片质感极佳' },
  { match: { q1: '3000+', q2: 'beginner', q3: 'portrait' },    recommend: 'contax-t2', reason: '自动对焦 + 光圈优先，新手也能拍出氛围感人像' },
  { match: { q1: '3000+', q2: 'beginner', q3: 'street' },      recommend: 'contax-t2', reason: '傻瓜式操作 + 顶级画质，入门即巅峰' },
  { match: { q1: '1500-3000', q2: 'experienced', q3: 'street' },    recommend: 'contax-t2', reason: '街拍摄影师的梦中情机，钛金质感无可替代' },
  { match: { q1: '1500-3000', q2: 'experienced', q3: 'landscape' }, recommend: 'contax-t2', reason: '蔡司镜头的色彩和锐度，风光片不用修' },

  // Olympus µ-II — 新手 / 中等预算 / 街拍或入门
  { match: { q1: '1500-3000', q2: 'beginner', q3: 'street' },   recommend: 'olympus-mju-ii', reason: '口袋大小、滑盖即拍，新手街拍最友好的入门机' },
  { match: { q1: '1500-3000', q2: 'beginner', q3: 'beginner' }, recommend: 'olympus-mju-ii', reason: '生活防水、自动曝光、小巧到塞进口袋，最适合日常记录' },
  { match: { q1: '500-1500', q2: 'beginner', q3: 'street' },    recommend: 'olympus-mju-ii', reason: '性价比最高的口袋机，35mm f/2.8 镜头出片率极高' },
  { match: { q1: '500-1500', q2: 'beginner', q3: 'portrait' },  recommend: 'olympus-mju-ii', reason: '操作零门槛，专注构图就行，拍人像自然柔和' },
  { match: { q1: '1500-3000', q2: 'experienced', q3: 'portrait' }, recommend: 'olympus-mju-ii', reason: '轻便到可以随身带，随时捕捉自然表情' },

  // Minolta X-700 — 入门练习 / 预算有限 / 有基础想玩手动
  { match: { q1: '500以下', q2: 'beginner', q3: 'beginner' },   recommend: 'minolta-x700', reason: '胶片入门性价比之王，P 档全自动对新手上手非常友好' },
  { match: { q1: '500以下', q2: 'beginner', q3: 'portrait' },   recommend: 'minolta-x700', reason: '丰富的 MD 卡口镜头群，玩人像从 50mm f/1.7 开始，成本极低' },
  { match: { q1: '500以下', q2: 'beginner', q3: 'street' },     recommend: 'minolta-x700', reason: '机身轻便、快门清脆，街头抓拍不心疼，入门首选' },
  { match: { q1: '500-1500', q2: 'beginner', q3: 'beginner' },  recommend: 'minolta-x700', reason: '预算内能买到的最完整的胶片入门套装，机身+镜头+配件全有' },
  { match: { q1: '500-1500', q2: 'beginner', q3: 'landscape' }, recommend: 'minolta-x700', reason: '光圈优先模式拍风光得心应手，MD 广角镜头便宜大碗' },
  { match: { q1: '500以下', q2: 'experienced', q3: 'landscape' }, recommend: 'minolta-x700', reason: '手动控制 + 丰富镜头群，风光创作不受限' },
  { match: { q1: '500-1500', q2: 'experienced', q3: 'beginner' }, recommend: 'minolta-x700', reason: '有基础但预算有限？X-700 手动创作空间大，性价比无可匹敌' }
];

/**
 * 根据用户答案匹配推荐结果
 */
function matchAiRule(answers) {
  for (var i = 0; i < AI_RULES.length; i++) {
    var rule = AI_RULES[i];
    if (rule.match.q1 === answers.q1 &&
        rule.match.q2 === answers.q2 &&
        rule.match.q3 === answers.q3) {
      return rule;
    }
  }
  // 兜底：返回第一条能匹配 q1+q2 的规则
  for (var j = 0; j < AI_RULES.length; j++) {
    var r = AI_RULES[j];
    if (r.match.q1 === answers.q1 && r.match.q2 === answers.q2) return r;
  }
  return AI_RULES[0]; // 最终兜底
}

/**
 * 对话步骤定义
 */
var AI_QUESTIONS = [
  { id: 'q1', text: '嗨！想找一台合适的胶片相机？<br><br>先告诉我你的<span style="color:#5C3D2E;font-weight:700;">预算范围</span>吧～', options: [
    { label: '💰 500 元以下',    value: '500以下' },
    { label: '💰 500 - 1500 元', value: '500-1500' },
    { label: '💰 1500 - 3000 元', value: '1500-3000' },
    { label: '💰 3000 元以上',    value: '3000+' }
  ]},
  { id: 'q2', text: '收到！那你之前的<span style="color:#5C3D2E;font-weight:700;">拍摄经验</span>是？', options: [
    { label: '🌱 纯新手，没用过胶片',           value: 'beginner' },
    { label: '📱 用过数码相机/手机认真拍过',     value: 'experienced' }
  ]},
  { id: 'q3', text: '明白了～你主要想拍<span style="color:#5C3D2E;font-weight:700;">什么题材</span>？', options: [
    { label: '👤 人像',      value: 'portrait' },
    { label: '🚶 街拍/日常', value: 'street' },
    { label: '🏔 风光/旅行', value: 'landscape' },
    { label: '📖 入门练习，什么都拍', value: 'beginner' }
  ]}
];

/**
 * 初始化 AI 导购
 */
function initAiGuide() {
  var fab = document.getElementById('ai-guide-fab');
  var modal = document.getElementById('ai-guide-modal');
  var chat = document.getElementById('ai-guide-chat');

  if (!fab || !modal || !chat) return;

  var closeBtn = document.getElementById('ai-guide-close');
  var overlay = modal.querySelector('.ai-guide-overlay');

  var currentStep = 0;
  var answers = {};

  function openModal() {
    currentStep = 0;
    answers = {};
    chat.innerHTML = '';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    showQuestion(0);
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showQuestion(stepIndex) {
    if (stepIndex >= AI_QUESTIONS.length) {
      showResult();
      return;
    }

    currentStep = stepIndex;
    var q = AI_QUESTIONS[stepIndex];

    // AI 消息
    var bubble = document.createElement('div');
    bubble.className = 'ai-bubble ai-bubble--ai';
    bubble.innerHTML = q.text;
    chat.appendChild(bubble);

    // 选项按钮
    var optionsDiv = document.createElement('div');
    optionsDiv.className = 'ai-options';
    q.options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.className = 'ai-option-btn';
      btn.textContent = opt.label;
      btn.addEventListener('click', function () {
        // 用户选择回显
        var userBubble = document.createElement('div');
        userBubble.className = 'ai-bubble ai-bubble--user';
        userBubble.textContent = opt.label.replace(/^.\s*/, '');
        chat.appendChild(userBubble);

        // 移除选项按钮
        optionsDiv.remove();

        // 记录答案
        answers[q.id] = opt.value;
        // 下一步
        setTimeout(function () { showQuestion(stepIndex + 1); }, 400);
      });
      optionsDiv.appendChild(btn);
    });
    chat.appendChild(optionsDiv);

    // 滚动到底部
    chat.scrollTop = chat.scrollHeight;
  }

  function showResult() {
    var rule = matchAiRule(answers);
    var cam = getCameraById(rule.recommend);

    if (!cam) {
      // 找不到相机数据时的兜底
      var errBubble = document.createElement('div');
      errBubble.className = 'ai-bubble ai-bubble--ai';
      errBubble.textContent = '抱歉，暂时没有完全匹配的机型。请点击右下角按钮重新开始～';
      chat.appendChild(errBubble);
      chat.scrollTop = chat.scrollHeight;
      return;
    }

    // AI 推荐消息
    var aiMsg = document.createElement('div');
    aiMsg.className = 'ai-bubble ai-bubble--ai';
    aiMsg.innerHTML = '根据你的需求，我推荐这台 👇';
    chat.appendChild(aiMsg);

    // 结果卡片
    var resultCard = document.createElement('div');
    resultCard.className = 'ai-result';
    resultCard.innerHTML =
      '<div class="ai-result-title">' + cam.name + '</div>' +
      '<div class="ai-result-reason">' + rule.reason + '</div>' +
      '<a class="ai-result-link" href="detail.html?id=' + encodeURIComponent(cam.id) + '">查看详情 →</a>';
    chat.appendChild(resultCard);

    // 重新开始
    var restartBtn = document.createElement('button');
    restartBtn.className = 'ai-restart';
    restartBtn.textContent = '🔄 重新选择';
    restartBtn.addEventListener('click', function () {
      chat.innerHTML = '';
      currentStep = 0;
      answers = {};
      showQuestion(0);
    });
    chat.appendChild(restartBtn);

    chat.scrollTop = chat.scrollHeight;
  }

  // 事件绑定
  fab.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);
}
