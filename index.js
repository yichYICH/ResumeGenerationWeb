// =====================================
// 首页交互逻辑 (index.js)
// =====================================

document.addEventListener("DOMContentLoaded", () => {
  // 轮播图 DOM 元素选择
  const slider = document.getElementById("resume-slider");
  const prevBtn = document.getElementById("slide-prev");
  const nextBtn = document.getElementById("slide-next");
  const dotsContainer = document.getElementById("slider-dots-container");
  const slides = Array.from(slider.querySelectorAll(".slider-item"));
  const totalSlides = slides.length;
  let currentIndex = 0;

  // 自动播放变量
  const autoPlayTime = 4000;
  let autoPlayInterval;

  // 弹窗 DOM 元素选择
  const heroImage = document.querySelector(".hero-image");
  const modalOverlay = document.getElementById("template-modal");
  //const closeBtn = document.getElementById("modal-close-btn");
  const clickableArea = document.querySelector(".slider-wrapper");

  // DOM 元素选择
  const navTemplateBtn = document.getElementById("nav-template-btn");
  const navFeaturesBtn = document.getElementById("nav-features-btn");
  const navHelpBtn = document.getElementById("nav-help-btn");
  const footerPrivacyBtn = document.getElementById("footer-privacy-btn");
  const footerTermsBtn = document.getElementById("footer-terms-btn");
  const helpModal = document.getElementById("help-modal");

  if (totalSlides === 0) return;

  // =====================================
  // 轮播图核心逻辑
  // =====================================

  /**
   * 创建底部的指示点
   */
  function createDots() {
    slides.forEach((_, index) => {
      const dot = document.createElement("span");
      dot.classList.add("dot");
      if (index === 0) {
        dot.classList.add("active");
      }
      dot.addEventListener("click", () => {
        stopAutoPlay();
        goToSlide(index);
        startAutoPlay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  /**
   * 切换到指定的图片
   * @param {number} index 目标图片的索引
   */
  function goToSlide(index) {
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    // 更新图片可见性
    slides.forEach((slide, i) => {
      slide.classList.remove("active");
      if (i === currentIndex) {
        slide.classList.add("active");
      }
    });

    // 更新指示点
    const dots = dotsContainer.querySelectorAll(".dot");
    dots.forEach((dot, i) => {
      dot.classList.remove("active");
      if (i === currentIndex) {
        dot.classList.add("active");
      }
    });
  }

  /**
   * 开始自动播放
   */
  function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, autoPlayTime);
  }

  /**
   * 停止自动播放
   */
  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }

  // 绑定事件
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    stopAutoPlay();
    goToSlide(currentIndex - 1);
    startAutoPlay();
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    stopAutoPlay();
    goToSlide(currentIndex + 1);
    startAutoPlay();
  });

  // 鼠标移入时停止自动播放，移出时恢复
  heroImage.addEventListener("mouseenter", stopAutoPlay);
  heroImage.addEventListener("mouseleave", startAutoPlay);

  // 初始化轮播
  createDots();
  goToSlide(0);
  startAutoPlay();

  // =====================================
  // 弹窗核心逻辑
  // =====================================

  /**
   * 打开弹窗
   */
  function openModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
  /**
   * 关闭弹窗
   */
  function closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.add("hidden");
    document.body.style.overflow = "";
  }

  // 监听：点击轮播图图片区域，打开模板弹窗
  clickableArea.addEventListener("click", () => openModal(modalOverlay));

  // 监听：点击关闭按钮，关闭弹窗 (修改为通用处理)
  // 遍历所有弹窗内的关闭按钮
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modalElement = e.target.closest(".modal-overlay");
      closeModal(modalElement);
    });
  });

  // 监听：点击遮罩层（弹窗外部），关闭弹窗
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // 监听：按下 Esc 键，关闭当前显示的弹窗
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!modalOverlay.classList.contains("hidden")) {
        closeModal(modalOverlay);
      } else if (!helpModal.classList.contains("hidden")) {
        closeModal(helpModal);
      }
    }
  });
  // =====================================
  // 顶部导航栏交互逻辑 (新增)
  // =====================================

  // 1. 点击顶部“模板”链接，弹出模板弹窗
  navTemplateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(modalOverlay);
  });

  // 2. 点击顶部“优势”链接，平滑滚动到特点部分
  if (navFeaturesBtn) {
    navFeaturesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetElement = document.getElementById("section-features");
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // 3. 点击“帮助”和底部链接，弹出帮助/政策弹窗
  // 统一处理顶部“帮助”和底部“隐私/服务”链接
  [navHelpBtn, footerPrivacyBtn].forEach((link) => {
    if (link) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(helpModal);
      });
    }
  });
});
