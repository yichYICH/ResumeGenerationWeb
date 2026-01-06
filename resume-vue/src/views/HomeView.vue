<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- 状态数据 ---
const showTemplateModal = ref(false) // 控制模板弹窗
const showHelpModal = ref(false) // 控制帮助弹窗
const currentSlide = ref(0) // 当前轮播图索引
const totalSlides = 6 // 总共有6张图
let autoPlayInterval = null

// --- 轮播图逻辑 ---
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % totalSlides
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + totalSlides) % totalSlides
}

const goToSlide = (index) => {
  currentSlide.value = index
}

const startAutoPlay = () => {
  stopAutoPlay()
  autoPlayInterval = setInterval(nextSlide, 4000)
}

const stopAutoPlay = () => {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
}

// --- 页面跳转 ---
const goToBuilder = (templateId) => {
  // 如果传了模板ID，就带参数跳转
  if (templateId) {
    router.push({ path: '/builder', query: { template: templateId } })
  } else {
    router.push('/builder')
  }
}

const scrollToFeatures = () => {
  document.getElementById('section-features')?.scrollIntoView({ behavior: 'smooth' })
}

// --- 生命周期 ---
onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <div>
    <header class="navbar">
      <div class="container">
        <div class="nav-group">
          <a href="#" class="logo">
            <i class="ri-briefcase-line"></i>
            <span class="logo-text">在线简历生成器</span>
          </a>
          <nav class="nav-links">
            <a href="#" @click.prevent="showTemplateModal = true">模板</a>
            <a href="#section-features" @click.prevent="scrollToFeatures">优势</a>
            <a href="#" @click.prevent="showHelpModal = true">帮助</a>
          </nav>
        </div>
      </div>
    </header>

    <main class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1>轻松制作令人印象深刻的专业简历</h1>
          <p>选择精美模板，填入你的经历，一键生成 PDF，助你斩获理想 Offer！</p>
          <button @click="goToBuilder()" class="btn btn-primary btn-hero">
            制作一份简历 <i class="ri-arrow-right-line"></i>
          </button>
        </div>

        <div
          class="hero-image slider-container"
          @mouseenter="stopAutoPlay"
          @mouseleave="startAutoPlay"
          @click="showTemplateModal = true"
        >
          <div class="slider-wrapper">
            <img
              v-for="n in totalSlides"
              :key="n"
              :src="`/hero-resume-preview-${n}.png`"
              :class="['slider-item', { active: currentSlide === n - 1 }]"
              alt="简历预览"
            />
          </div>

          <button class="slide-btn slide-prev" @click.stop="prevSlide">
            <i class="ri-arrow-left-s-line"></i>
          </button>
          <button class="slide-btn slide-next" @click.stop="nextSlide">
            <i class="ri-arrow-right-s-line"></i>
          </button>

          <div class="slider-dots">
            <span
              v-for="(n, index) in totalSlides"
              :key="index"
              :class="['dot', { active: currentSlide === index }]"
              @click.stop="goToSlide(index)"
            ></span>
          </div>
        </div>
      </div>
    </main>

    <section class="features-section" id="section-features">
      <div class="container">
        <h2>为什么选择我们？</h2>
        <div class="feature-grid">
          <div class="feature-item">
            <i class="ri-paint-brush-line"></i>
            <h3>海量精美模板</h3>
            <p>风格多样，涵盖各行业，总有一款适合你。</p>
          </div>
          <div class="feature-item">
            <i class="ri-edit-2-line"></i>
            <h3>简单易用编辑器</h3>
            <p>无需设计经验，拖拽、填写即可完成。</p>
          </div>
          <div class="feature-item">
            <i class="ri-file-download-line"></i>
            <h3>一键下载 PDF</h3>
            <p>高质量输出，兼容性强，随时随地投递。</p>
          </div>
          <div class="feature-item">
            <i class="ri-smartphone-line"></i>
            <h3>完美响应式</h3>
            <p>在任何设备上都能流畅使用，随时编辑。</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <p>&copy; 2025 在线简历生成器. All rights reserved.</p>
          <p class="footer-links">
            <a href="#" @click.prevent="showHelpModal = true">隐私政策与服务条款</a>
          </p>
        </div>
      </div>
    </footer>

    <div v-if="showTemplateModal" class="modal-overlay" @click.self="showTemplateModal = false">
      <div class="modal-content">
        <button class="modal-close-btn" @click="showTemplateModal = false">
          <i class="ri-close-line"></i>
        </button>
        <div class="modal-body">
          <div class="template-previews-grid">
            <div v-for="n in 6" :key="n" class="template-link" @click="goToBuilder(n)">
              <img :src="`/hero-resume-preview-${n}.png`" class="preview-img" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showHelpModal" class="modal-overlay" @click.self="showHelpModal = false">
      <div class="modal-content">
        <button class="modal-close-btn" @click="showHelpModal = false">
          <i class="ri-close-line"></i>
        </button>
        <div class="modal-body">
          <h2 style="margin-bottom: 20px">隐私政策与服务条款</h2>
          <p>
            <strong>隐私政策概要:</strong>
            您的简历数据仅存储在您的本地浏览器中，我们不会上传到服务器。
          </p>
          <h3 style="margin-top: 20px">服务条款</h3>
          <p><strong>用户内容:</strong> 您对您创建的内容拥有所有权。</p>
        </div>
      </div>
    </div>
  </div>
</template>
