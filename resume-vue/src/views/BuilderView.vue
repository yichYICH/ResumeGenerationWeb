<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import html2pdf from 'html2pdf.js'

const route = useRoute()
const LOCAL_STORAGE_KEY = 'resumeBuilderData_v7_final'

// 1. 数据状态
const initialResumeState = {
  name: '',
  email: '',
  phone: '',
  birthday: '',
  hometown: '',
  avatar: '',
  summary: '',
  evaluation: '',
  education: [],
  experience: [],
  research: [],
  honors: [],
  skills: [],
  certifications: [],
  languages: [],
  primaryColor: '#3B82F6',
  textColor: '#333333',
  fontFamily: 'Varela Round, sans-serif',
  template: 'modern',
  fontSize: 16,
  activeTab: 'content',
}

const resumeData = reactive(JSON.parse(JSON.stringify(initialResumeState)))
const activeTab = ref('content')
const previewScale = ref(1.0)
const previewRef = ref(null)
const fileInput = ref(null)
const findInputText = ref('')
const replaceInputText = ref('')

const fontOptions = [
  { name: 'Varela Round', value: 'Varela Round, sans-serif' },
  { name: '宋体', value: 'SimSun, serif' },
  { name: '黑体', value: 'SimHei, sans-serif' },
  { name: '微软雅黑', value: 'Microsoft YaHei, sans-serif' },
  { name: '楷体', value: 'KaiTi, serif' },
  { name: '仿宋', value: 'FangSong, serif' },
  { name: '苹方', value: "'PingFang SC', sans-serif" },
  { name: 'Helvetica', value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
]

// --- 2. 核心逻辑 ---

const addItem = (field) => {
  const templates = {
    education: { school: '', degree: '', major: '', edu_time: '' },
    experience: { company: '', position: '', exp_time: '', duties: '' },
    research: { research_field: '', research_topic: '', research_pubs: '' },
    honors: { honor_name: '', honor_time: '' },
    skills: { skill_text: '' },
    certifications: { cert_name: '', cert_date: '' },
    languages: { lang_name: '', lang_level: '' },
  }
  resumeData[field].push({ ...templates[field] })
}

const removeItem = (field, index) => {
  resumeData[field].splice(index, 1)
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      resumeData.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const updateCssVariables = () => {
  const r = document.documentElement
  if (!r) return
  r.style.setProperty('--primary-color', resumeData.primaryColor)
  r.style.setProperty('--main-text-color', resumeData.textColor)
  r.style.setProperty('--main-font-family', resumeData.fontFamily)
  r.style.setProperty('--main-font-size', resumeData.fontSize + 'px')
}

watch(
  () => [resumeData.primaryColor, resumeData.textColor, resumeData.fontFamily, resumeData.fontSize],
  () => {
    updateCssVariables()
  },
  { immediate: true },
)

watch(activeTab, (newVal) => (resumeData.activeTab = newVal))

const formatLines = (text) => {
  if (!text) return []
  return text.split(/\n(?!\s*\n)/).filter((p) => p.trim().length > 0)
}

const downloadPDF = () => {
  const element = previewRef.value
  const originalTransform = element.style.transform
  element.style.transform = 'scale(1)'
  const opt = {
    margin: 0,
    filename: `${resumeData.name || '简历'}.pdf`,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      element.style.transform = originalTransform
    })
}

const saveData = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resumeData))
  alert('进度已保存！')
}

const deleteData = () => {
  if (confirm('确定要删除所有数据吗？')) {
    Object.assign(resumeData, JSON.parse(JSON.stringify(initialResumeState)))
    ;[
      'education',
      'experience',
      'research',
      'honors',
      'skills',
      'certifications',
      'languages',
    ].forEach((k) => (resumeData[k] = []))
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    nextTick(updateCssVariables)
  }
}

const exportJSON = () => {
  saveData()
  const dataStr = JSON.stringify(resumeData)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `resume_backup.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const handleImportJSON = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (typeof data === 'object' && data !== null) {
        Object.assign(resumeData, data)
        updateCssVariables()
        alert('导入成功！')
      }
    } catch (err) {
      alert('文件格式错误')
    }
    event.target.value = ''
  }
  reader.readAsText(file)
}

const fillDemoData = () => {
  if (!confirm('这将覆盖当前内容，确定吗？')) return
  const demo = {
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    birthday: '1998-05-20',
    hometown: '北京市',
    summary: '软件工程师，热爱前端开发。具备扎实的编程基础，熟悉Vue.js全家桶。',
    education: [{ school: '北京大学', degree: '硕士', major: '计算机科学与技术', edu_time: '2020-2023' }],
    experience: [
      { company: '字节跳动', position: '前端开发工程师', exp_time: '2023-至今', duties: '负责抖音Web端功能迭代。\n优化页面加载性能，提升用户体验。' },
    ],
    skills: [{ skill_text: 'JavaScript' }, { skill_text: 'Vue.js' }, { skill_text: 'CSS3' }],
    primaryColor: '#3B82F6',
    textColor: '#333333',
    template: 'professional',
    fontSize: 16,
  }
  Object.assign(resumeData, demo)
  updateCssVariables()
}

const findAndReplace = () => {
  const findStr = findInputText.value
  const replaceStr = replaceInputText.value
  if (!findStr) return alert('请输入查找内容')

  let count = 0
  const replaceInObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].includes(findStr)) {
        const regex = new RegExp(findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        obj[key] = obj[key].replace(regex, replaceStr)
        count++
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        replaceInObject(obj[key])
      }
    }
  }
  replaceInObject(resumeData)
  alert(`已替换 ${count} 处`)
}

onMounted(() => {
  if (route.query.template) {
    const map = ['modern', 'professional', 'academic', 'creative', 'classic', 'minimal']
    const idx = parseInt(route.query.template) - 1
    if (map[idx]) resumeData.template = map[idx]
  }
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (saved) {
    try {
      Object.assign(resumeData, JSON.parse(saved))
    } catch (e) {}
  }
  updateCssVariables()
})

const nameInitials = computed(() =>
  (resumeData.name || ' ')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <div class="builder-page">
    <header class="navbar">
      <div class="container">
        <div class="nav-group">
          <router-link to="/" class="logo">
            <i class="ri-briefcase-line"></i>
            <span class="logo-text">在线简历生成器</span>
          </router-link>
        </div>
        <div class="header-actions">
          <button class="header-btn" @click="saveData">
            <i class="ri-save-line"></i> 保存进度
          </button>
          <button class="header-btn" @click="deleteData">
            <i class="ri-delete-bin-line"></i> 清空
          </button>
          <button class="btn btn-primary" @click="downloadPDF">
            <i class="ri-download-line"></i> 导出
          </button>
        </div>
      </div>
    </header>

    <div id="app-container" class="app-container-grid">
      <nav id="main-sidebar">
        <div
          class="sidebar-item"
          :class="{ active: activeTab === 'content' }"
          @click="activeTab = 'content'"
        >
          <i class="ri-edit-box-line"></i><span>内容</span>
        </div>
        <div
          class="sidebar-item"
          :class="{ active: activeTab === 'style' }"
          @click="activeTab = 'style'"
        >
          <i class="ri-palette-line"></i><span>样式</span>
        </div>
        <div
          class="sidebar-item"
          :class="{ active: activeTab === 'tools' }"
          @click="activeTab = 'tools'"
        >
          <i class="ri-tools-line"></i><span>工具</span>
        </div>
        <div
          class="sidebar-item"
          style="margin-top: auto"
          @click="previewScale = Math.max(0.5, previewScale - 0.1)"
        >
          <i class="ri-zoom-out-line"></i><span>缩小</span>
        </div>
        <div class="sidebar-item" @click="previewScale = Math.min(1.5, previewScale + 0.1)">
          <i class="ri-zoom-in-line"></i><span>放大</span>
        </div>
      </nav>

      <aside id="editor-panel">
        <div v-show="activeTab === 'content'" class="tab-content">
          <form @submit.prevent>
            <fieldset>
              <legend>基本信息</legend>
              <input type="text" v-model="resumeData.name" placeholder="姓名" />
              <div class="input-row">
                <div class="input-half">
                  <input type="email" v-model="resumeData.email" placeholder="邮箱" />
                </div>
                <div class="input-half">
                  <input type="tel" v-model="resumeData.phone" placeholder="电话" />
                </div>
              </div>
              <div class="input-row">
                <div class="input-half">
                  <input type="date" v-model="resumeData.birthday" placeholder="生日" />
                </div>
                <div class="input-half">
                  <input type="text" v-model="resumeData.hometown" placeholder="籍贯" />
                </div>
              </div>
              <div class="avatar-upload-group">
                <label>个人头像:</label>
                <div class="custom-file-upload">
                  <input type="file" id="avatar-upload" accept="image/*" @change="handleAvatarUpload" />
                  <label for="avatar-upload" class="file-upload-btn">
                    <i class="ri-upload-2-line"></i> 选择图片
                  </label>
                </div>
                <div class="avatar-preview" v-if="resumeData.avatar">
                  <img :src="resumeData.avatar" alt="预览" />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>个人简介</legend>
              <textarea v-model="resumeData.summary" rows="5" placeholder="简要介绍..."></textarea>
            </fieldset>

            <fieldset>
              <legend>教育经历</legend>
              <div v-for="(edu, index) in resumeData.education" :key="index" class="item-group">
                <input type="text" v-model="edu.school" placeholder="学校名称" />
                <input type="text" v-model="edu.degree" placeholder="学历" />
                <input type="text" v-model="edu.major" placeholder="专业" />
                <input type="text" v-model="edu.edu_time" placeholder="起止时间" />
                <button
                  type="button"
                  class="btn btn-danger remove-item-btn"
                  @click="removeItem('education', index)"
                >
                  <i class="ri-delete-bin-line"></i> 删除
                </button>
              </div>
              <button type="button" class="btn btn-secondary-add" @click="addItem('education')">
                <i class="ri-add-line"></i> 添加教育经历
              </button>
            </fieldset>

            <fieldset>
              <legend>实习/工作经历</legend>
              <div v-for="(exp, i) in resumeData.experience" :key="i" class="item-group">
                <input type="text" v-model="exp.company" placeholder="公司/组织名称" />
                <input type="text" v-model="exp.position" placeholder="职位" />
                <input type="text" v-model="exp.exp_time" placeholder="起止时间" />
                <textarea
                  v-model="exp.duties"
                  rows="4"
                  placeholder="职责描述 (每行一条)"
                ></textarea>
                <button
                  type="button"
                  class="btn btn-danger remove-item-btn"
                  @click="removeItem('experience', i)"
                >
                  <i class="ri-delete-bin-line"></i> 删除
                </button>
              </div>
              <button type="button" class="btn btn-secondary-add" @click="addItem('experience')">
                <i class="ri-add-line"></i> 添加实习经历
              </button>
            </fieldset>

            <fieldset>
              <legend>科研经历</legend>
              <div v-for="(res, i) in resumeData.research" :key="i" class="item-group">
                <input type="text" v-model="res.research_field" placeholder="研究方向/实验室" />
                <input type="text" v-model="res.research_topic" placeholder="课题名称" />
                <textarea
                  v-model="res.research_pubs"
                  rows="3"
                  placeholder="成果/发表论文"
                ></textarea>
                <button
                  type="button"
                  class="btn btn-danger remove-item-btn"
                  @click="removeItem('research', i)"
                >
                  <i class="ri-delete-bin-line"></i> 删除
                </button>
              </div>
              <button type="button" class="btn btn-secondary-add" @click="addItem('research')">
                <i class="ri-add-line"></i> 添加科研经历
              </button>
            </fieldset>

            <fieldset>
              <legend>获奖情况</legend>
              <div v-for="(hon, i) in resumeData.honors" :key="i" class="item-group">
                <input type="text" v-model="hon.honor_name" placeholder="奖项名称" />
                <input type="text" v-model="hon.honor_time" placeholder="获奖时间" />
                <button
                  type="button"
                  class="btn btn-danger remove-item-btn"
                  @click="removeItem('honors', i)"
                >
                  <i class="ri-delete-bin-line"></i> 删除
                </button>
              </div>
              <button type="button" class="btn btn-secondary-add" @click="addItem('honors')">
                <i class="ri-add-line"></i> 添加奖项
              </button>
            </fieldset>

            <fieldset>
              <legend>个人特长/技能</legend>
              <div
                v-for="(skill, index) in resumeData.skills"
                :key="index"
                class="item-group item-group-skill"
              >
                <input type="text" v-model="skill.skill_text" placeholder="技能/特长" />
                <button
                  type="button"
                  class="btn btn-danger remove-item-btn remove-skill-btn"
                  @click="removeItem('skills', index)"
                >
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
              <button type="button" class="btn btn-secondary-add" @click="addItem('skills')">
                <i class="ri-add-line"></i> 添加技能
              </button>
            </fieldset>

            <fieldset>
              <legend>证书</legend>
              <div v-for="(cert, i) in resumeData.certifications" :key="i" class="item-group">
                <input type="text" v-model="cert.cert_name" placeholder="证书名称" />
                <input type="text" v-model="cert.cert_date" placeholder="获取时间" />
                <button
                  type="button"
                  class="btn btn-danger remove-item-btn"
                  @click="removeItem('certifications', i)"
                >
                  <i class="ri-delete-bin-line"></i> 删除
                </button>
              </div>
              <button
                type="button"
                class="btn btn-secondary-add"
                @click="addItem('certifications')"
              >
                <i class="ri-add-line"></i> 添加证书
              </button>
            </fieldset>

            <fieldset>
              <legend>语言能力</legend>
              <div v-for="(lang, i) in resumeData.languages" :key="i" class="item-group">
                <input type="text" v-model="lang.lang_name" placeholder="语言" />
                <input type="text" v-model="lang.lang_level" placeholder="熟练程度" />
                <button
                  type="button"
                  class="btn btn-danger remove-item-btn"
                  @click="removeItem('languages', i)"
                >
                  <i class="ri-delete-bin-line"></i> 删除
                </button>
              </div>
              <button type="button" class="btn btn-secondary-add" @click="addItem('languages')">
                <i class="ri-add-line"></i> 添加语言能力
              </button>
            </fieldset>

            <fieldset>
              <legend>自我评价</legend>
              <textarea
                v-model="resumeData.evaluation"
                rows="5"
                placeholder="自我评价..."
              ></textarea>
            </fieldset>
          </form>
        </div>

        <div v-show="activeTab === 'style'" class="tab-content">
          <section class="settings-module">
            <h3>简历模板</h3>
            <div class="template-selector">
              <button
                v-for="t in [
                  'modern',
                  'classic',
                  'professional',
                  'creative',
                  'minimal',
                  'academic',
                ]"
                :key="t"
                :class="{ active: resumeData.template === t }"
                @click="resumeData.template = t"
              >
                {{ {
                    modern: '现代风',
                    classic: '经典风',
                    professional: '专业风',
                    creative: '创意风',
                    minimal: '简约风',
                    academic: '学术风',
                  }[t] }}
              </button>
            </div>
          </section>

          <section class="settings-module">
            <h3>颜色与字体</h3>
            <div class="color-picker-group">
              <label>主色调:</label>
              <input type="color" v-model="resumeData.primaryColor" />
            </div>
            <div class="color-picker-group">
              <label>文字颜色:</label>
              <input type="color" v-model="resumeData.textColor" />
            </div>
            <div class="font-picker-group">
              <label>功能字体:</label>
              <div class="font-scrollable-container">
                <div
                  v-for="font in fontOptions"
                  :key="font.name"
                  class="font-button"
                  :class="{ active: resumeData.fontFamily === font.value }"
                  @click="resumeData.fontFamily = font.value"
                  :style="{ fontFamily: font.value }"
                >
                  {{ font.name }}
                </div>
              </div>
            </div>
            <div class="font-size-group">
              <label>字体大小: {{ resumeData.fontSize }}px</label>
              <input
                type="range"
                min="12"
                max="24"
                v-model="resumeData.fontSize"
                @input="updateCssVariables"
                style="width: 100%"
              />
            </div>
          </section>
        </div>

        <div v-show="activeTab === 'tools'" class="tab-content">
          <section class="settings-module">
            <h3>全局查找与替换</h3>
            <input type="text" v-model="findInputText" placeholder="查找内容" />
            <input
              type="text"
              v-model="replaceInputText"
              placeholder="替换为"
              style="margin-top: 5px"
            />
            <button
              class="btn btn-primary"
              style="width: 100%; margin-top: 10px"
              @click="findAndReplace"
            >
              全部替换
            </button>
          </section>
          <section class="settings-module">
            <h3>数据管理</h3>
            <button
              class="btn btn-secondary-add"
              style="width: 100%; margin-bottom: 10px"
              @click="exportJSON"
            >
              导出数据 (JSON)
            </button>
            <button class="btn btn-secondary-add" style="width: 100%" @click="fileInput.click()">
              导入数据 (JSON)
            </button>
            <input
              type="file"
              ref="fileInput"
              accept=".json"
              style="display: none"
              @change="handleImportJSON"
            />
          </section>
          <section class="settings-module">
            <button class="btn btn-primary" style="width: 100%" @click="fillDemoData">
              填充演示数据
            </button>
            <button
              class="btn btn-danger"
              style="width: 100%; margin-top: 10px"
              @click="deleteData"
            >
              清空所有内容
            </button>
          </section>
        </div>
      </aside>

      <main id="preview-panel">
        <div
          id="resume-preview"
          ref="previewRef"
          :class="['resume-template', resumeData.template]"
          :style="{ transform: `scale(${previewScale})` }"
        >
          <template v-if="resumeData.template === 'classic'">
              <div class="classic-layout">
                <div class="classic-sidebar">
                  <header class="preview-header classic-header">
                    <div class="avatar-container" v-if="resumeData.avatar">
                      <img :src="resumeData.avatar" class="preview-avatar" style="display: block" />
                    </div>
                    <h1 id="preview-name">{{ resumeData.name || '您的姓名' }}</h1>
                    <div class="contact-info">
                      <p v-if="resumeData.email" id="preview-email-display"><i class="ri-mail-line"></i> 邮箱：{{ resumeData.email }}</p>
                      <p v-if="resumeData.phone" id="preview-phone-display"><i class="ri-phone-line"></i> 电话：{{ resumeData.phone }}</p>
                      <p v-if="resumeData.birthday" id="preview-birthday-display"><i class="ri-calendar-line"></i> 生日：{{ resumeData.birthday }}</p>
                      <p v-if="resumeData.hometown" id="preview-hometown-display"><i class="ri-map-pin-line"></i> 籍贯：{{ resumeData.hometown }}</p>
                    </div>
                  </header>
                  <section class="preview-section classic-sidebar-section" v-if="resumeData.summary">
                    <h2>个人简介</h2>
                    <p>{{ resumeData.summary }}</p>
                  </section>
                  <section class="preview-section classic-sidebar-section" v-if="resumeData.skills.length">
                    <h2>个人特长/技能</h2>
                    <ul>
                      <li v-for="(s, i) in resumeData.skills" :key="i">{{ s.skill_text }}</li>
                    </ul>
                  </section>
                  <section class="preview-section classic-sidebar-section" v-if="resumeData.evaluation">
                    <h2>自我评价</h2>
                    <p>{{ resumeData.evaluation }}</p>
                  </section>
                </div>
                
                <div class="classic-main">
                  
                  <div class="resume-content-grid">
                    <section class="preview-section" v-if="resumeData.education.length">
                      <h2>教育背景</h2>
                      <ul>
                        <li v-for="(edu, i) in resumeData.education" :key="i">
                          <strong>{{ edu.school }}</strong> - {{ edu.degree }} - {{ edu.major }} ({{ edu.edu_time }})
                        </li>
                      </ul>
                    </section>

                    <section class="preview-section" v-if="resumeData.experience.length">
                      <h2>实习/工作经历</h2>
                      <article v-for="(exp, i) in resumeData.experience" :key="i" class="experience-detail">
                        <h3>{{ exp.position }} @ {{ exp.company }}</h3>
                        <p class="experience-time">{{ exp.exp_time }}</p>
                        <ul>
                          <li v-for="(line, k) in formatLines(exp.duties)" :key="k" v-html="line"></li>
                        </ul>
                      </article>
                    </section>

                    <section class="preview-section" v-if="resumeData.research.length">
                      <h2>科研经历</h2>
                      <article v-for="(res, i) in resumeData.research" :key="i" class="experience-detail">
                        <h3>{{ res.research_field }}</h3>
                        <p class="experience-time">{{ res.research_topic }}</p>
                        <ul>
                          <li v-for="(line, k) in formatLines(res.research_pubs)" :key="k" v-html="line"></li>
                        </ul>
                      </article>
                    </section>

                    <section class="preview-section" v-if="resumeData.honors.length">
                      <h2>获奖情况</h2>
                      <ul>
                        <li v-for="(h, i) in resumeData.honors" :key="i">
                          <strong>{{ h.honor_name }}</strong> ({{ h.honor_time }})
                        </li>
                      </ul>
                    </section>

                    <section class="preview-section" v-if="resumeData.certifications.length">
                      <h2>证书</h2>
                      <ul>
                        <li v-for="(c, i) in resumeData.certifications" :key="i">
                          <strong>{{ c.cert_name }}</strong> ({{ c.cert_date }})
                        </li>
                      </ul>
                    </section>

                    <section class="preview-section" v-if="resumeData.languages.length">
                      <h2>语言能力</h2>
                      <ul>
                        <li v-for="(l, i) in resumeData.languages" :key="i">
                          <strong>{{ l.lang_name }}</strong> - {{ l.lang_level }}
                        </li>
                      </ul>
                    </section>
                  </div>
                </div>
              </div>
          </template>
          
          <template v-else-if="resumeData.template === 'modern'">
              <header class="preview-header">
                <div class="header-content" :class="{ 'modern-header-content': resumeData.template === 'modern' }">
                  <div class="avatar-container modern-avatar-container" v-if="resumeData.avatar && resumeData.template === 'modern'">
                    <img :src="resumeData.avatar" class="preview-avatar modern-avatar" style="display: block" />
                  </div>
                  <div class="name-contact-section">
                    <h1 id="preview-name" :data-initials="nameInitials">
                      {{ resumeData.name || '您的姓名' }}
                    </h1>

                    <div class="contact-info" :class="{ 'modern-contact-info': resumeData.template === 'modern' }">
                      <span v-if="resumeData.email" id="preview-email-display"><i class="ri-mail-line"></i> 邮箱：{{ resumeData.email }}</span>
                      <span v-else><i class="ri-mail-line"></i> 邮箱</span>

                      <span v-if="resumeData.phone" id="preview-phone-display"><i class="ri-phone-line"></i> 电话：{{ resumeData.phone }}</span>
                      <span v-else><i class="ri-phone-line"></i> 电话</span>

                      <span v-if="resumeData.birthday" id="preview-birthday-display"><i class="ri-calendar-line"></i> 生日：{{ resumeData.birthday }}</span>
                      <span v-else><i class="ri-calendar-line"></i> 生日</span>

                      <span v-if="resumeData.hometown" id="preview-hometown-display"><i class="ri-map-pin-line"></i> 籍贯：{{ resumeData.hometown }}</span>
                      <span v-else><i class="ri-map-pin-line"></i> 籍贯</span>
                    </div>
                  </div>
                  <div class="avatar-container" v-if="resumeData.avatar && resumeData.template !== 'modern'">
                    <img :src="resumeData.avatar" class="preview-avatar" style="display: block" />
                  </div>
                </div>
              </header>

              <div class="resume-content-grid">
                <section class="preview-section" v-if="resumeData.summary">
                  <h2>个人简介</h2>
                  <p style="white-space: pre-wrap">{{ resumeData.summary }}</p>
                </section>

                <section
                  class="preview-section"
                  v-if="resumeData.skills.length && resumeData.template !== 'creative'"
                >
                  <h2>个人特长/技能</h2>
                  <ul class="skills-list">
                    <li v-for="(skill, i) in resumeData.skills" :key="i">{{ skill.skill_text }}</li>
                  </ul>
                </section>

                <section class="preview-section" v-if="resumeData.education.length">
                  <h2>教育背景</h2>
                  <ul>
                    <li v-for="(edu, i) in resumeData.education" :key="i">
                      <strong>{{ edu.school }}</strong> - {{ edu.degree }} - {{ edu.major }} ({{
                        edu.edu_time
                      }})
                    </li>
                  </ul>
                </section>

                <section class="preview-section" v-if="resumeData.experience.length">
                  <h2>实习/工作经历</h2>
                  <article
                    v-for="(exp, i) in resumeData.experience"
                    :key="i"
                    class="experience-detail"
                  >
                    <h3>{{ exp.position }} @ {{ exp.company }}</h3>
                    <p class="experience-time">{{ exp.exp_time }}</p>
                    <ul>
                      <li v-for="(line, k) in formatLines(exp.duties)" :key="k" v-html="line"></li>
                    </ul>
                  </article>
                </section>

                <section class="preview-section" v-if="resumeData.research.length">
                  <h2>科研经历</h2>
                  <article
                    v-for="(res, i) in resumeData.research"
                    :key="i"
                    class="experience-detail"
                  >
                    <h3>{{ res.research_field }}</h3>
                    <p class="experience-time">{{ res.research_topic }}</p>
                    <ul>
                      <li
                        v-for="(line, k) in formatLines(res.research_pubs)"
                        :key="k"
                        v-html="line"
                      ></li>
                    </ul>
                  </article>
                </section>

                <section class="preview-section" v-if="resumeData.honors.length">
                  <h2>获奖情况</h2>
                  <ul>
                    <li v-for="(h, i) in resumeData.honors" :key="i">
                      <strong>{{ h.honor_name }}</strong> ({{ h.honor_time }})
                    </li>
                  </ul>
                </section>

                <section class="preview-section" v-if="resumeData.certifications.length">
                  <h2>证书</h2>
                  <ul>
                    <li v-for="(c, i) in resumeData.certifications" :key="i">
                      <strong>{{ c.cert_name }}</strong> ({{ c.cert_date }})
                    </li>
                  </ul>
                </section>

                <section class="preview-section" v-if="resumeData.languages.length">
                  <h2>语言能力</h2>
                  <ul>
                    <li v-for="(l, i) in resumeData.languages" :key="i">
                      <strong>{{ l.lang_name }}</strong> - {{ l.lang_level }}
                    </li>
                  </ul>
                </section>

                <section class="preview-section" v-if="resumeData.evaluation">
                  <h2>自我评价</h2>
                  <p>{{ resumeData.evaluation }}</p>
                </section>
              </div>
          </template>

          <template v-else-if="resumeData.template === 'minimal'">
            <div class="minimal-layout">
              <header class="preview-header minimal-header">
                <div class="minimal-header-content">
                  <div class="avatar-container minimal-avatar" v-if="resumeData.avatar">
                    <img :src="resumeData.avatar" class="preview-avatar" />
                  </div>
                  <div class="header-text">
                    <h1 id="preview-name">{{ resumeData.name || '您的姓名' }}</h1>
                    <div class="contact-info">
                      <span v-if="resumeData.email" id="preview-email-display"><i class="ri-mail-fill"></i> {{ resumeData.email }}</span>
                      <span v-if="resumeData.phone" id="preview-phone-display"><i class="ri-phone-fill"></i> {{ resumeData.phone }}</span>
                      <span v-if="resumeData.birthday" id="preview-birthday-display"><i class="ri-calendar-fill"></i> {{ resumeData.birthday }}</span>
                      <span v-if="resumeData.hometown" id="preview-hometown-display"><i class="ri-map-pin-fill"></i> {{ resumeData.hometown }}</span>
                    </div>
                  </div>
                </div>
              </header>
              
              <section class="preview-section" v-if="resumeData.summary">
                <h2>个人简介</h2>
                <p>{{ resumeData.summary }}</p>
              </section>
              
              <section class="preview-section" v-if="resumeData.education.length">
                <h2>教育背景</h2>
                <ul>
                  <li v-for="(edu, i) in resumeData.education" :key="i">{{ edu.school }} - {{ edu.degree }} - {{ edu.major }} ({{ edu.edu_time }})</li>
                </ul>
              </section>
              
              <section class="preview-section" v-if="resumeData.experience.length">
                <h2>实习/工作经历</h2>
                <div v-for="(exp, i) in resumeData.experience" :key="i" class="experience-detail">
                  <p>{{ exp.company }} - {{ exp.position }} ({{ exp.exp_time }})</p>
                  <ul>
                    <li v-for="(line, k) in formatLines(exp.duties)" :key="k" v-html="line"></li>
                  </ul>
                </div>
              </section>
              
              <section class="preview-section" v-if="resumeData.research.length">
                <h2>科研经历</h2>
                <div v-for="(res, i) in resumeData.research" :key="i" class="experience-detail">
                  <p>{{ res.research_field }} - {{ res.research_topic }}</p>
                  <ul>
                    <li v-for="(line, k) in formatLines(res.research_pubs)" :key="k" v-html="line"></li>
                  </ul>
                </div>
              </section>
              
              <section class="preview-section" v-if="resumeData.honors.length">
                <h2>获奖情况</h2>
                <ul>
                  <li v-for="(h, i) in resumeData.honors" :key="i">{{ h.honor_name }} ({{ h.honor_time }})</li>
                </ul>
              </section>
              
              <section class="preview-section" v-if="resumeData.skills.length">
                <h2>个人特长/技能</h2>
                <ul>
                  <li v-for="(s, i) in resumeData.skills" :key="i">{{ s.skill_text }}</li>
                </ul>
              </section>
              
              <section class="preview-section" v-if="resumeData.certifications.length">
                <h2>证书</h2>
                <ul>
                  <li v-for="(c, i) in resumeData.certifications" :key="i">{{ c.cert_name }} ({{ c.cert_date }})</li>
                </ul>
              </section>
              
              <section class="preview-section" v-if="resumeData.languages.length">
                <h2>语言能力</h2>
                <ul>
                  <li v-for="(l, i) in resumeData.languages" :key="i">{{ l.lang_name }} - {{ l.lang_level }}</li>
                </ul>
              </section>
              
              <section class="preview-section" v-if="resumeData.evaluation">
                <h2>自我评价</h2>
                <p>{{ resumeData.evaluation }}</p>
              </section>
            </div>
          </template>

          <template v-else-if="resumeData.template === 'professional'">
            <div class="professional-layout">
              <header class="professional-header">
                <div class="professional-header-content">
                  <div class="avatar-container professional-avatar" v-if="resumeData.avatar">
                    <img :src="resumeData.avatar" class="preview-avatar" />
                  </div>
                  <div class="header-text">
                    <h1 id="preview-name">{{ resumeData.name || '您的姓名' }}</h1>
                    <div class="professional-contact">
                      <span v-if="resumeData.email">
                        <i class="ri-mail-fill"></i> {{ resumeData.email }}
                      </span>
                      <span v-if="resumeData.phone">
                        <i class="ri-phone-fill"></i> {{ resumeData.phone }}
                      </span>
                      <span v-if="resumeData.birthday">
                        <i class="ri-calendar-fill"></i> {{ resumeData.birthday }}
                      </span>
                      <span v-if="resumeData.hometown">
                        <i class="ri-map-pin-fill"></i> {{ resumeData.hometown }}
                      </span>
                    </div>
                  </div>
                </div>
              </header>
              
              <div class="professional-content">
                <section class="professional-section" v-if="resumeData.summary">
                  <h2>个人简介</h2>
                  <p>{{ resumeData.summary }}</p>
                </section>
                
                <section class="professional-section" v-if="resumeData.education.length">
                  <h2>教育背景</h2>
                  <div v-for="(edu, i) in resumeData.education" :key="i" class="experience-detail">
                    <div class="item-header">
                      <div class="item-title">{{ edu.school }}</div>
                      <div class="item-time">{{ edu.edu_time }}</div>
                    </div>
                    <div class="item-subtitle">{{ edu.degree }} - {{ edu.major }}</div>
                  </div>
                </section>
                
                <section class="professional-section" v-if="resumeData.experience.length">
                  <h2>实习/工作经历</h2>
                  <article v-for="(exp, i) in resumeData.experience" :key="i" class="experience-detail">
                    <div class="item-header">
                      <div class="item-title">{{ exp.company }}</div>
                      <div class="item-time">{{ exp.exp_time }}</div>
                    </div>
                    <div class="item-subtitle">{{ exp.position }}</div>
                    <ul>
                      <li v-for="(line, k) in formatLines(exp.duties)" :key="k" v-html="line"></li>
                    </ul>
                  </article>
                </section>
                
                <section class="professional-section" v-if="resumeData.research.length">
                  <h2>科研经历</h2>
                  <article v-for="(res, i) in resumeData.research" :key="i" class="experience-detail">
                    <div class="item-header">
                      <div class="item-title">{{ res.research_field }}</div>
                      <div class="item-time"></div> </div>
                    <div class="item-subtitle">{{ res.research_topic }}</div>
                    <ul>
                      <li v-for="(line, k) in formatLines(res.research_pubs)" :key="k" v-html="line"></li>
                    </ul>
                  </article>
                </section>
                
                <section class="professional-section" v-if="resumeData.honors.length">
                  <h2>获奖情况</h2>
                  <ul>
                    <li v-for="(h, i) in resumeData.honors" :key="i">
                      <strong>{{ h.honor_name }}</strong> 
                      <span v-if="h.honor_time" style="color: var(--text-color-light)"> ({{ h.honor_time }})</span>
                    </li>
                  </ul>
                </section>
                
                <section class="professional-section" v-if="resumeData.skills.length">
                  <h2>个人特长/技能</h2>
                  <ul class="skills-list">
                    <li v-for="(s, i) in resumeData.skills" :key="i">{{ s.skill_text }}</li>
                  </ul>
                </section>
                
                <section class="professional-section" v-if="resumeData.certifications.length">
                  <h2>证书</h2>
                  <ul>
                    <li v-for="(c, i) in resumeData.certifications" :key="i">
                      <strong>{{ c.cert_name }}</strong> ({{ c.cert_date }})
                    </li>
                  </ul>
                </section>
                
                <section class="professional-section" v-if="resumeData.languages.length">
                  <h2>语言能力</h2>
                  <ul>
                    <li v-for="(l, i) in resumeData.languages" :key="i">
                      <strong>{{ l.lang_name }}</strong> - {{ l.lang_level }}
                    </li>
                  </ul>
                </section>
                
                <section class="professional-section" v-if="resumeData.evaluation">
                  <h2>自我评价</h2>
                  <p>{{ resumeData.evaluation }}</p>
                </section>
              </div>
            </div>
          </template>

          <template v-else-if="resumeData.template === 'creative'">
            <div class="creative-layout">
              <div class="creative-left">
                <div class="creative-header">
                  <div class="avatar-container creative-avatar">
                    <img :src="resumeData.avatar" class="preview-avatar" v-if="resumeData.avatar" />
                    <div class="avatar-placeholder" v-else></div>
                  </div>
                  
                  <h1 id="preview-name">{{ resumeData.name || '您的姓名' }}</h1>
                  
                  <div class="contact-info creative-contact">
                    <p v-if="resumeData.email" id="preview-email-display"><i class="ri-mail-line"></i> {{ resumeData.email }}</p>
                    <p v-if="resumeData.phone" id="preview-phone-display"><i class="ri-phone-line"></i> {{ resumeData.phone }}</p>
                    <p v-if="resumeData.birthday" id="preview-birthday-display"><i class="ri-calendar-line"></i> {{ resumeData.birthday }}</p>
                    <p v-if="resumeData.hometown" id="preview-hometown-display"><i class="ri-map-pin-line"></i> {{ resumeData.hometown }}</p>
                  </div>
                </div>
              </div>
              
              <div class="creative-right">
                <div class="creative-grid">
                  <section class="preview-section creative-section" v-if="resumeData.summary">
                    <h2>个人简介</h2>
                    <p>{{ resumeData.summary }}</p>
                  </section>
                  
                  <section class="preview-section creative-section" v-if="resumeData.education.length">
                    <h2>教育背景</h2>
                    <ul>
                      <li v-for="(edu, i) in resumeData.education" :key="i">
                        <strong>{{ edu.school }}</strong> - {{ edu.degree }} - {{ edu.major }} ({{ edu.edu_time }})
                      </li>
                    </ul>
                  </section>
                  
                  <section class="preview-section creative-section" v-if="resumeData.experience.length">
                    <h2>实习/工作经历</h2>
                    <article v-for="(exp, i) in resumeData.experience" :key="i" class="experience-detail">
                      <h3>{{ exp.position }} @ {{ exp.company }}</h3>
                      <p class="experience-time">{{ exp.exp_time }}</p>
                      <ul>
                        <li v-for="(line, k) in formatLines(exp.duties)" :key="k" v-html="line"></li>
                      </ul>
                    </article>
                  </section>
                  
                  <section class="preview-section creative-section" v-if="resumeData.research.length">
                    <h2>科研经历</h2>
                    <article v-for="(res, i) in resumeData.research" :key="i" class="experience-detail">
                      <h3>{{ res.research_field }}</h3>
                      <p class="experience-time">{{ res.research_topic }}</p>
                      <ul>
                        <li v-for="(line, k) in formatLines(res.research_pubs)" :key="k" v-html="line"></li>
                      </ul>
                    </article>
                  </section>
                  
                  <section class="preview-section creative-section" v-if="resumeData.honors.length">
                    <h2>获奖情况</h2>
                    <ul>
                      <li v-for="(h, i) in resumeData.honors" :key="i">
                        {{ h.honor_name }} ({{ h.honor_time }})
                      </li>
                    </ul>
                  </section>
                  
                  <section class="preview-section creative-section" v-if="resumeData.skills.length">
                    <h2>个人特长/技能</h2>
                    <ul>
                      <li v-for="(s, i) in resumeData.skills" :key="i">{{ s.skill_text }}</li>
                    </ul>
                  </section>
                  
                  <section class="preview-section creative-section" v-if="resumeData.certifications.length">
                    <h2>证书</h2>
                    <ul>
                      <li v-for="(c, i) in resumeData.certifications" :key="i">
                        {{ c.cert_name }} ({{ c.cert_date }})
                      </li>
                    </ul>
                  </section>
                  
                  <section class="preview-section creative-section" v-if="resumeData.languages.length">
                    <h2>语言能力</h2>
                    <ul>
                      <li v-for="(l, i) in resumeData.languages" :key="i">
                        {{ l.lang_name }} - {{ l.lang_level }}
                      </li>
                    </ul>
                  </section>
                  
                  <section class="preview-section creative-section" v-if="resumeData.evaluation">
                    <h2>自我评价</h2>
                    <p>{{ resumeData.evaluation }}</p>
                  </section>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="resumeData.template === 'academic'">
            <div class="academic-layout">
              <header class="preview-header">
                <div class="academic-header-content">
                  <div class="avatar-container academic-avatar">
                    <img :src="resumeData.avatar" class="preview-avatar" v-if="resumeData.avatar" />
                    <div class="avatar-placeholder" v-else></div>
                  </div>
                  <div class="header-text">
                    <h1 id="preview-name">{{ resumeData.name || '姓名' }}</h1>
                    <div class="contact-info">
                      <span v-if="resumeData.email" id="preview-email-display"><i class="ri-mail-line"></i> 邮箱：{{ resumeData.email }}</span>
                      <span v-if="resumeData.phone" id="preview-phone-display"><i class="ri-phone-line"></i> 电话：{{ resumeData.phone }}</span>
                      <span v-if="resumeData.hometown" id="preview-hometown-display"><i class="ri-map-pin-line"></i> 籍贯：{{ resumeData.hometown }}</span>
                    </div>
                  </div>
                </div>
              </header>
              <section class="preview-section" v-if="resumeData.summary">
                <h2>个人简介</h2>
                <p>{{ resumeData.summary }}</p>
              </section>
              <div class="academic-columns">
                <div class="column-left">
                  <section class="preview-section" v-if="resumeData.education.length">
                    <h2>教育背景</h2>
                    <ul>
                      <li v-for="(edu, i) in resumeData.education" :key="i">
                        <strong>{{ edu.school }}</strong>, {{ edu.degree }}, {{ edu.major }}
                      </li>
                    </ul>
                  </section>
                </div>
                <div class="column-right">
                  <section class="preview-section" v-if="resumeData.skills.length">
                    <h2>技能</h2>
                    <ul>
                      <li v-for="(s, i) in resumeData.skills" :key="i">{{ s.skill_text }}</li>
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          </template>

        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/builder.css';

.font-button {
  font-size: 14px;
}

/* 头像上传预览样式 */
.avatar-preview {
  margin-top: 15px;
}

.avatar-preview img {
  max-width: 120px;
  max-height: 120px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>