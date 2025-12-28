// =====================================
// 1. 全局变量和 DOM 元素选择
// =====================================

// 核心布局元素
const form = document.getElementById("resume-form");
const preview = document.getElementById("resume-preview");
const appContainer = document.getElementById("app-container");

// 侧边栏和 Tab 内容
const sidebarItems = document.querySelectorAll("#main-sidebar .sidebar-item");
const tabContents = document.querySelectorAll(".tab-content");

// 顶部按钮
const saveBtn = document.getElementById("save-data-btn");
const downloadBtn = document.getElementById("download-pdf-btn");
const deleteDataBtn = document.getElementById("delete-data-btn");

// 缩放按钮
const zoomInBtn = document.getElementById("zoom-in-btn");
const zoomOutBtn = document.getElementById("zoom-out-btn");

// 样式控制
const colorThemeInput = document.getElementById("color-theme");
const colorThemeDisplay = document.getElementById("color-theme-display");
const fontFamilySelect = document.getElementById("font-family");
const textColorInput = document.getElementById("text-color");
const textColorDisplay = document.getElementById("text-color-display");
const templateButtons = document.querySelectorAll(".template-selector button");
const avatarUpload = document.getElementById("avatar-upload");
const avatarPreview = document.getElementById("avatar-preview");
const previewAvatar = document.getElementById("preview-avatar");

// 动态内容容器 (表单)
const educationContainer = document.getElementById("education-container");
const experienceContainer = document.getElementById("experience-container");
const researchContainer = document.getElementById("research-container");
const honorsContainer = document.getElementById("honors-container");
const skillsContainer = document.getElementById("skills-container");
const certificationsContainer = document.getElementById(
  "certifications-container"
);
const languagesContainer = document.getElementById("languages-container");

// 动态内容 "添加" 按钮
const addEducationBtn = document.getElementById("add-education-btn");
const addExperienceBtn = document.getElementById("add-experience-btn");
const addResearchBtn = document.getElementById("add-research-btn");
const addHonorBtn = document.getElementById("add-honor-btn");
const addSkillBtn = document.getElementById("add-skill-btn");
const addCertificationBtn = document.getElementById("add-certification-btn");
const addLanguageBtn = document.getElementById("add-language-btn");

// 预览区域 (右侧) - 选择更具体的元素
const previewName = document.getElementById("preview-name");
const previewEmail = document.getElementById("preview-email-display");
const previewPhone = document.getElementById("preview-phone-display");
const previewBirthday = document.getElementById("preview-birthday-display");
const previewHometown = document.getElementById("preview-hometown-display");
const previewSummary = document.getElementById("preview-summary");
const previewEvaluation = document.getElementById("preview-evaluation");
const previewEducation = document.getElementById("preview-education");
const previewExperience = document.getElementById("preview-experience");
const previewResearch = document.getElementById("preview-research");
const previewHonors = document.getElementById("preview-honors");
const previewSkills = document.getElementById("preview-skills");
const previewCertifications = document.getElementById("preview-certifications");
const previewLanguages = document.getElementById("preview-languages");

// 工具按钮
const findInput = document.getElementById("find-input");
const replaceInput = document.getElementById("replace-input");
const findReplaceBtn = document.getElementById("find-replace-btn");
const resetFormBtn = document.getElementById("reset-form-btn");
const exportJsonBtn = document.getElementById("export-json-btn");
const importJsonBtn = document.getElementById("import-json-btn");
const importJsonInput = document.getElementById("import-json-input");
const fillDemoBtn = document.getElementById("fill-demo-btn");

// 字数统计
const summaryTextarea = form.summary;
const evaluationTextarea = form.evaluation;
const summaryCharCounter = document.getElementById("summary-char-counter");
const evaluationCharCounter = document.getElementById(
  "evaluation-char-counter"
);

// 全局状态
const LOCAL_STORAGE_KEY = "resumeBuilderData_v6_stable";
let currentZoom = 1.0;
const originalSectionSelectors = [
  ".preview-header",
  "#preview-summary-section",
  "#preview-education-section",
  "#preview-experience-section",
  "#preview-research-section",
  "#preview-honors-section",
  "#preview-skills-section",
  "#preview-certifications-section",
  "#preview-languages-section",
  "#preview-evaluation-section",
];

// =====================================
// 2. 核心APP功能 (侧边栏切换, 缩放)
// =====================================

function handleSidebarClick(e) {
  const selectedItem = e.currentTarget;
  const targetContentId = selectedItem.dataset.contentId;
  sidebarItems.forEach((btn) => btn.classList.remove("active"));
  selectedItem.classList.add("active");
  if (targetContentId) {
    appContainer.classList.remove("editor-hidden");
    tabContents.forEach((content) => content.classList.add("hidden"));
    const targetContent = document.getElementById(targetContentId);
    if (targetContent) targetContent.classList.remove("hidden");
  }
}

sidebarItems.forEach((btn) => {
  if (btn.dataset.contentId) btn.addEventListener("click", handleSidebarClick);
});

function updateZoom() {
  preview.style.transform = `scale(${currentZoom})`;
}
zoomInBtn.addEventListener("click", () => {
  currentZoom = Math.min(1.5, currentZoom + 0.1);
  updateZoom();
});
zoomOutBtn.addEventListener("click", () => {
  currentZoom = Math.max(0.5, currentZoom - 0.1);
  updateZoom();
});

// =====================================
// 3. 实时预览 (核心功能)
// =====================================

function handleFormUpdate() {
  const nameValue = form.name.value;

  updateSimplePreview(previewName, nameValue, "您的姓名");
  updateSimplePreview(previewEmail, form.email.value, "邮箱");
  updateSimplePreview(previewPhone, form.phone.value, "电话");
  updateSimplePreview(previewBirthday, form.birthday.value, "生日");
  updateSimplePreview(previewHometown, form.hometown.value, "籍贯");

  updateSimplePreview(
    previewSummary,
    form.summary.value,
    "[请填写个人简介...]"
  );
  updateSimplePreview(
    previewEvaluation,
    form.evaluation.value,
    "[请填写自我评价...]"
  );

  updateListPreview(
    educationContainer,
    previewEducation,
    (data) =>
      `<li><strong>${data.school || "学校名称"}</strong> - ${
        data.degree || "学历"
      } - ${data.major || "专业"} (${data.edu_time || "时间"})</li>`,
    "<li>[请填写教育背景]</li>",
    "preview-education-section"
  );
  updateListPreview(
    experienceContainer,
    previewExperience,
    (data) =>
      `<article class="experience-detail"><h3>${data.position || "职位"} @ ${
        data.company || "公司名称"
      }</h3><p class="experience-time">${
        data.exp_time || "起止时间"
      }</p><ul>${formatDuties(data.duties)}</ul></article>`,
    "<article class='experience-detail'>[请添加实习经历]</article>",
    "preview-experience-section"
  );
  updateListPreview(
    researchContainer,
    previewResearch,
    (data) =>
      `<article class="experience-detail"><h3>${
        data.research_field || "研究方向/实验室"
      }</h3><p class="experience-time">${
        data.research_topic || "课题名称"
      }</p><ul>${formatDuties(data.research_pubs)}</ul></article>`,
    "<article class='experience-detail'>[请添加科研经历]</article>",
    "preview-research-section"
  );
  updateListPreview(
    honorsContainer,
    previewHonors,
    (data) =>
      `<li><strong>${data.honor_name || "奖项名称"}</strong> (${
        data.honor_time || "时间"
      })</li>`,
    "<li>[请添加获奖情况]</li>",
    "preview-honors-section"
  );
  updateListPreview(
    certificationsContainer,
    previewCertifications,
    (data) =>
      `<li><strong>${data.cert_name || "证书名称"}</strong> (${
        data.cert_date || "时间"
      })</li>`,
    "<li>[请添加证书]</li>",
    "preview-certifications-section"
  );
  updateListPreview(
    languagesContainer,
    previewLanguages,
    (data) =>
      `<li><strong>${data.lang_name || "语言"}</strong> - ${
        data.lang_level || "熟练程度"
      }</li>`,
    "<li>[请添加语言能力]</li>",
    "preview-languages-section"
  );

  applyCreativeTemplateHacks(nameValue);
  saveToLocalStorage();
}

function updateSimplePreview(element, value, placeholder) {
  const hasValue = value && value.trim() !== "";
  if (hasValue) {
    // 将换行符转换为<br>标签以保留格式
    const formattedValue = value.trim().replace(/\n/g, "<br>");
    element.innerHTML = formattedValue;
  } else {
    element.innerHTML = placeholder;
  }
}

function updateListPreview(
  container,
  previewList,
  templateFn,
  emptyHtml,
  sectionId
) {
  // 为技能列表添加特殊样式类
  if (previewList.id === "preview-skills") {
    previewList.className = "skills-list";
  }
  previewList.innerHTML = "";
  const items = container.querySelectorAll(".item-group");
  const itemCount = items.length;
  let hasData = false;
  items.forEach((item) => {
    const data = {};
    item.querySelectorAll("input, textarea").forEach((input) => {
      data[input.name.replace(/\[\]/g, "")] = input.value;
    });
    if (Object.values(data).some((v) => v && v.trim() !== "")) {
      const processedData = {};
      item.querySelectorAll("input, textarea").forEach((input) => {
        const key = input.name.replace(/\[\]/g, "");
        const value = input.value;
        if (input.tagName === "TEXTAREA") {
          processedData[key] = value.replace(/^\s+|\s+$/g, "");
        } else {
          processedData[key] = value.trim();
        }
      });
      previewList.innerHTML += templateFn(processedData);
      hasData = true;
    }
  });
  const sectionElement = document.getElementById(sectionId);
  if (sectionElement) {
    sectionElement.style.display = itemCount > 0 ? "" : "none";
  }
  if (itemCount > 0 && !hasData) previewList.innerHTML = emptyHtml;
}

function formatDuties(dutiesText) {
  if (!dutiesText) return "<li>[职责描述...]</li>";

  // 按换行符分割成段落，每个段落作为一个列表项
  return dutiesText
    .split(/\n(?!\s*\n)/)
    .filter((paragraph) => {
      const cleaned = paragraph.replace(/\s+/g, "");
      return cleaned.length > 0;
    })
    .map((paragraph) => {
      const formattedText = paragraph.trim().replace(/\n/g, "<br>");
      return `<li>${formattedText}</li>`;
    })
    .join("");
}

form.addEventListener("input", handleFormUpdate);

// =====================================
// 4. 动态模块管理 (增删功能)
// =====================================

function createItemHTML(type, data = {}) {
  let html = '<div class="item-group">';
  switch (type) {
    case "education":
      html += `<input type="text" name="school[]" placeholder="学校名称" value="${
        data.school || ""
      }"><input type="text" name="degree[]" placeholder="学历 (如：硕士, 学士)" value="${
        data.degree || ""
      }"><input type="text" name="major[]" placeholder="专业" value="${
        data.major || ""
      }"><input type="text" name="edu_time[]" placeholder="起止时间" value="${
        data.edu_time || ""
      }">`;
      break;
    case "experience":
      html += `<input type="text" name="company[]" placeholder="公司/组织名称" value="${
        data.company || ""
      }"><input type="text" name="position[]" placeholder="职位" value="${
        data.position || ""
      }"><input type="text" name="exp_time[]" placeholder="起止时间" value="${
        data.exp_time || ""
      }"><textarea name="duties[]" rows="4" placeholder="职责描述 (每行一条)">${
        data.duties || ""
      }</textarea>`;
      break;
    case "research":
      html += `<input type="text" name="research_field[]" placeholder="研究方向/实验室" value="${
        data.research_field || ""
      }"><input type="text" name="research_topic[]" placeholder="课题名称" value="${
        data.research_topic || ""
      }"><textarea name="research_pubs[]" rows="3" placeholder="成果/发表论文 (选填)">${
        data.research_pubs || ""
      }</textarea>`;
      break;
    case "honors":
      html += `<input type="text" name="honor_name[]" placeholder="奖项名称" value="${
        data.honor_name || ""
      }"><input type="text" name="honor_time[]" placeholder="获奖时间" value="${
        data.honor_time || ""
      }">`;
      break;
    case "certification":
      html += `<input type="text" name="cert_name[]" placeholder="证书名称 (如：CET-6)" value="${
        data.cert_name || ""
      }"><input type="text" name="cert_date[]" placeholder="获取时间 (如：2023-06)" value="${
        data.cert_date || ""
      }">`;
      break;
    case "language":
      html += `<input type="text" name="lang_name[]" placeholder="语言 (如：英语)" value="${
        data.lang_name || ""
      }"><input type="text" name="lang_level[]" placeholder="熟练程度 (如：精通)" value="${
        data.lang_level || ""
      }">`;
      break;
    case "skills":
      return `<div class="item-group item-group-skill"><input type="text" name="skill_text[]" placeholder="技能/特长 (如：精通 Python)" value="${
        data.skill_text || ""
      }"><button type="button" class="btn btn-danger remove-item-btn remove-skill-btn"><i class="ri-delete-bin-line"></i></button></div>`;
    case "certifications":
      html += `<input type="text" name="certification_name[]" placeholder="证书名称" value="${
        data.certification_name || ""
      }"><input type="text" name="certification_date[]" placeholder="获得日期" value="${
        data.certification_date || ""
      }">`;
      break;
    case "languages":
      html += `<input type="text" name="language_name[]" placeholder="语言名称" value="${
        data.language_name || ""
      }"><input type="text" name="proficiency[]" placeholder="熟练度 (如：流利, 熟练)" value="${
        data.proficiency || ""
      }">`;
      break;
  }
  html += `<button type="button" class="btn btn-danger remove-item-btn"><i class="ri-delete-bin-line"></i> 删除此项</button></div>`;
  return html;
}

function setupAddButton(button, container, type) {
  button.addEventListener("click", () => {
    container.insertAdjacentHTML("beforeend", createItemHTML(type));
    handleFormUpdate();
  });
}
setupAddButton(addEducationBtn, educationContainer, "education");
setupAddButton(addExperienceBtn, experienceContainer, "experience");
setupAddButton(addResearchBtn, researchContainer, "research");
setupAddButton(addHonorBtn, honorsContainer, "honors");
setupAddButton(addCertificationBtn, certificationsContainer, "certification");
setupAddButton(addLanguageBtn, languagesContainer, "language");
setupAddButton(addSkillBtn, skillsContainer, "skills");

form.addEventListener("click", (e) => {
  if (e.target.closest(".remove-item-btn")) {
    e.target.closest(".item-group").remove();
    handleFormUpdate();
  }
});

// 删除进度功能
deleteDataBtn.addEventListener("click", function () {
  // 创建变量存储confirm的返回值，确保逻辑清晰
  const userConfirmed = confirm(
    "确定要删除所有已保存的简历数据吗？此操作不可恢复！"
  );

  if (userConfirmed === true) {
    // 清除本地存储中的所有简历数据
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem("lastSaved");

    // 重置表单
    form.reset();

    // 重置动态添加的内容（教育、工作经历等）
    educationContainer.innerHTML = "";
    experienceContainer.innerHTML = "";
    researchContainer.innerHTML = "";
    honorsContainer.innerHTML = "";
    certificationsContainer.innerHTML = "";
    languagesContainer.innerHTML = "";
    skillsContainer.innerHTML = "";

    // 重置头像
    if (previewAvatar) {
      previewAvatar.style.display = "none";
      previewAvatar.src = "";
    }
    if (avatarPreview) {
      avatarPreview.innerHTML = "";
      avatarPreview.style.display = "flex";
    }

    // 重置预览区域内容
    previewName.textContent = "您的姓名";
    previewEmail.textContent = "邮箱";
    previewPhone.textContent = "电话";
    previewSummary.textContent = "[请填写个人简介...]";
    previewEvaluation.textContent = "[请填写自我评价...]";
    previewEducation.innerHTML = "<li>[请填写教育背景]</li>";
    previewExperience.innerHTML =
      "<article class='experience-detail'>[请添加实习经历]</article>";
    previewResearch.innerHTML =
      "<article class='experience-detail'>[请添加科研经历]</article>";
    previewHonors.innerHTML = "<li>[请添加获奖情况]</li>";
    previewCertifications.innerHTML = "<li>[请添加证书]</li>";
    previewLanguages.innerHTML = "<li>[请添加语言能力]</li>";
    previewSkills.innerHTML = "<li>[请添加技能/特长]</li>";

    // 显示成功消息
    alert("简历数据已成功删除");
  } else {
    // 用户点击取消，不执行任何操作，可选地显示提示
    console.log("用户取消了删除操作");
  }
});

// =====================================
// 5. 样式与创意模板切换
// =====================================

colorThemeInput.addEventListener("input", () => {
  const newColor = colorThemeInput.value;
  document.documentElement.style.setProperty("--primary-color", newColor);
  colorThemeDisplay.textContent = newColor.toUpperCase();
  handleFormUpdate();
});

// 为字体按钮添加点击事件监听器
const fontButtons = document.querySelectorAll(".font-button");
fontButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const fontFamily = button.getAttribute("data-font");
    document.documentElement.style.setProperty(
      "--main-font-family",
      fontFamily
    );
    preview.style.fontFamily = fontFamily;
    fontButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
  });
});

// 头像上传事件处理
avatarUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = function (event) {
      const imgUrl = event.target.result;

      // 在编辑器中显示预览
      avatarPreview.innerHTML = `<img src="${imgUrl}" alt="预览" />`;

      // 在简历预览中显示头像
      previewAvatar.src = imgUrl;
      previewAvatar.style.display = "block";

      // 保存到本地存储
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      let data = storedData ? JSON.parse(storedData) : {};
      data.avatar = imgUrl;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    };

    reader.readAsDataURL(file);
  }
});

// 文字颜色选择器事件监听器
textColorInput.addEventListener("input", () => {
  const newTextColor = textColorInput.value;
  document.documentElement.style.setProperty("--main-text-color", newTextColor);
  textColorDisplay.textContent = newTextColor.toUpperCase();
  handleFormUpdate();
});

// 字体大小滑块事件监听器
const fontSizeSlider = document.getElementById("font-size-slider");
const fontSizeDisplay = document.getElementById("font-size-display");

// 初始化字体大小
function initializeFontSize() {
  // 从本地存储加载保存的字体大小，如果没有则使用默认值
  const savedFontSize = localStorage.getItem("resumeFontSize");
  if (savedFontSize) {
    const fontSize = parseInt(savedFontSize);
    fontSizeSlider.value = fontSize;
    updateFontSize(fontSize);
  } else {
    updateFontSize(fontSizeSlider.value);
  }
}

// 更新字体大小
function updateFontSize(size) {
  // 设置CSS变量
  document.documentElement.style.setProperty("--main-font-size", size + "px");
  // 更新预览区域的字体大小
  preview.style.fontSize = size + "px";
  // 更新显示的数值
  fontSizeDisplay.value = size + "px";
  // 保存到本地存储
  localStorage.setItem("resumeFontSize", size);
  // 更新表单以触发预览更新
  handleFormUpdate();
}

// 添加滑块事件监听器
fontSizeSlider.addEventListener("input", (e) => {
  updateFontSize(e.target.value);
});

// 初始化字体大小
initializeFontSize();

templateButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    resetPreviewDOM();
    const templateName = e.currentTarget.dataset.template;
    preview.className = `resume-template ${templateName}`;
    templateButtons.forEach((btn) => btn.classList.remove("active"));
    e.currentTarget.classList.add("active");
    handleFormUpdate();
  });
});

function resetPreviewDOM() {
  const fragment = document.createDocumentFragment();
  originalSectionSelectors.forEach((selector) => {
    const element =
      preview.querySelector(selector) ||
      document.getElementById(selector.substring(1));
    if (element) {
      fragment.appendChild(element);
    }
  });
  preview.innerHTML = "";
  preview.appendChild(fragment);
}

function applyCreativeTemplateHacks(nameValue) {
  const currentTemplate = preview.classList[1] || "modern";
  switch (currentTemplate) {
    case "classic":
      const initials = (nameValue || " ")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      previewName.setAttribute("data-initials", initials);
      break;
    case "creative":
      preview.querySelectorAll(".preview-section h2").forEach((h2, index) => {
        h2.setAttribute("data-section-bg", `0${index + 1}`);
      });
      break;
    case "professional":
      if (preview.querySelector(".preview-sidebar")) return;
      const sidebar = document.createElement("div");
      sidebar.className = "preview-sidebar";
      const main = document.createElement("div");
      main.className = "preview-main";
      main.appendChild(preview.querySelector(".preview-header"));
      [
        "#preview-summary-section",
        "#preview-skills-section",
        "#preview-evaluation-section",
      ].forEach((s) => sidebar.appendChild(document.querySelector(s)));
      [
        "#preview-education-section",
        "#preview-experience-section",
        "#preview-research-section",
        "#preview-honors-section",
        "#preview-certifications-section",
        "#preview-languages-section",
      ].forEach((s) => main.appendChild(document.querySelector(s)));
      preview.innerHTML = "";
      preview.appendChild(sidebar);
      preview.appendChild(main);
      break;
    case "academic":
      if (preview.querySelector(".academic-columns")) return;
      const columns = document.createElement("div");
      columns.className = "academic-columns";
      const sectionsToMove = Array.from(
        preview.querySelectorAll(
          ".preview-section:not(#preview-summary-section)"
        )
      );
      sectionsToMove.forEach((section) => columns.appendChild(section));
      const summarySection = preview.querySelector("#preview-summary-section");
      if (summarySection) {
        summarySection.after(columns);
      }
      break;
  }
}

// =====================================
// 6. 数据持久化
// =====================================

function saveToLocalStorage() {
  const data = {};
  const formData = new FormData(form);
  for (const [key, value] of formData.entries()) {
    const cleanKey = key.replace(/\[\]/g, "");
    if (key.endsWith("[]")) {
      if (!data[cleanKey]) data[cleanKey] = [];
      data[cleanKey].push(value);
    } else {
      data[key] = value;
    }
  }
  data.primaryColor = colorThemeInput.value;
  // 从激活的字体按钮获取字体
  const activeFontButton = document.querySelector(".font-button.active");
  data.fontFamily = activeFontButton
    ? activeFontButton.getAttribute("data-font")
    : "Varela Round, sans-serif";
  data.textColor = textColorInput.value;
  // 保存头像信息
  if (previewAvatar.src && previewAvatar.src !== window.location.href) {
    data.avatar = previewAvatar.src;
  }
  data.template =
    document.querySelector(".template-selector button.active")?.dataset
      .template || "modern";
  data.activeTab =
    document.querySelector("#main-sidebar .sidebar-item.active")?.dataset
      .tabName || "content";
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

function loadFromLocalStorage() {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!storedData) return;
  const data = JSON.parse(storedData);
  const primaryColor = data.primaryColor || "#3B82F6";
  colorThemeInput.value = primaryColor;
  colorThemeDisplay.textContent = primaryColor.toUpperCase();
  document.documentElement.style.setProperty("--primary-color", primaryColor);

  const fontFamily = data.fontFamily || "Varela Round, sans-serif";
  document.documentElement.style.setProperty("--main-font-family", fontFamily);
  preview.style.fontFamily = fontFamily;
  // 激活对应的字体按钮
  const fontButtons = document.querySelectorAll(".font-button");
  fontButtons.forEach((button) => {
    if (button.getAttribute("data-font") === fontFamily) {
      button.classList.add("active");
    }
  });

  // 加载头像
  if (data.avatar) {
    previewAvatar.src = data.avatar;
    previewAvatar.style.display = "block";
    // 同时在编辑器中显示预览
    avatarPreview.innerHTML = `<img src="${data.avatar}" alt="预览" />`;
  }

  const textColor = data.textColor || "#333333";
  textColorInput.value = textColor;
  textColorDisplay.textContent = textColor.toUpperCase();
  document.documentElement.style.setProperty("--main-text-color", textColor);

  const activeTemplateBtn = document.querySelector(
    `.template-selector button[data-template="${data.template}"]`
  );
  if (activeTemplateBtn) {
    activeTemplateBtn.click();
  }

  form.name.value = data.name || "";
  form.email.value = data.email || "";
  form.phone.value = data.phone || "";
  form.summary.value = data.summary || "";
  form.evaluation.value = data.evaluation || "";

  [
    "education",
    "experience",
    "research",
    "honors",
    "certifications",
    "languages",
    "skills",
  ].forEach((type) => {
    const container = document.getElementById(`${type}-container`);
    container.innerHTML = "";
    const dataKey =
      type === "skills"
        ? "skill_text"
        : type === "education"
        ? "school"
        : type === "experience"
        ? "company"
        : type === "research"
        ? "research_field"
        : type === "honors"
        ? "honor_name"
        : type === "certifications"
        ? "cert_name"
        : "lang_name";
    if (data[dataKey] && data[dataKey].length > 0) {
      data[dataKey].forEach((_, index) => {
        let itemData = {};
        if (type === "education")
          itemData = {
            school: data.school[index],
            degree: data.degree[index],
            major: data.major[index],
            edu_time: data.edu_time[index],
          };
        else if (type === "experience")
          itemData = {
            company: data.company[index],
            position: data.position[index],
            exp_time: data.exp_time[index],
            duties: data.duties[index],
          };
        else if (type === "research")
          itemData = {
            research_field: data.research_field[index],
            research_topic: data.research_topic[index],
            research_pubs: data.research_pubs[index],
          };
        else if (type === "honors")
          itemData = {
            honor_name: data.honor_name[index],
            honor_time: data.honor_time[index],
          };
        else if (type === "certifications")
          itemData = {
            cert_name: data.cert_name[index],
            cert_date: data.cert_date[index],
          };
        else if (type === "languages")
          itemData = {
            lang_name: data.lang_name[index],
            lang_level: data.lang_level[index],
          };
        else if (type === "skills")
          itemData = { skill_text: data.skill_text[index] };

        const singularType =
          type === "certifications"
            ? "certification"
            : type === "languages"
            ? "language"
            : type;
        container.insertAdjacentHTML(
          "beforeend",
          createItemHTML(singularType, itemData)
        );
      });
    }
  });

  const activeSidebarItem = document.querySelector(
    `#main-sidebar .sidebar-item[data-tab-name="${data.activeTab}"]`
  );
  if (activeSidebarItem) activeSidebarItem.click();
}

saveBtn.addEventListener("click", () => {
  saveToLocalStorage();
  alert("进度已保存到本地浏览器！");
});

downloadBtn.addEventListener("click", () => {
  if (typeof html2pdf === "undefined")
    return alert("下载失败：未找到 PDF 导出库。");
  handleFormUpdate();
  const originalTransform = preview.style.transform;
  preview.style.transform = "scale(1)";
  const opt = {
    margin: 0,
    filename: `${form.name.value || "我的"}_简历.pdf`,
    image: { type: "jpeg", quality: 1.0 },
    html2canvas: { scale: 3, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };
  html2pdf()
    .set(opt)
    .from(preview)
    .save()
    .then(() => {
      preview.style.transform = originalTransform;
    });
});

findReplaceBtn.addEventListener("click", () => {
  const findValue = findInput.value;
  const replaceValue = replaceInput.value;
  if (!findValue) return alert("请输入要查找的内容。");
  const inputs = form.querySelectorAll(
    'input[type="text"], input[type="email"], input[type="tel"], textarea'
  );
  let replacementsMade = 0;
  inputs.forEach((input) => {
    if (input.value.includes(findValue)) {
      input.value = input.value.replaceAll(findValue, replaceValue);
      replacementsMade++;
    }
  });
  alert(
    replacementsMade > 0
      ? `已成功替换 ${replacementsMade} 处。`
      : "未找到要替换的内容。"
  );
  if (replacementsMade > 0) handleFormUpdate();
});

resetFormBtn.addEventListener("click", () => {
  if (confirm("您确定要清空所有内容吗？此操作不可撤销！")) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    location.reload();
  }
});

// =====================================
// 7. 工具 & 导出功能
// =====================================

// 导出数据 (JSON)
exportJsonBtn.addEventListener("click", () => {
  saveToLocalStorage();
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) return alert("没有可导出的数据。");

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resume_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// 导入数据
importJsonBtn.addEventListener("click", () => {
  importJsonInput.click();
});

// 导入数据
importJsonInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      // 简单验证数据格式
      if (typeof data === "object" && data !== null) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        loadFromLocalStorage();
        handleFormUpdate();
        alert("数据导入成功！");
      } else {
        throw new Error("Invalid JSON structure");
      }
    } catch (error) {
      alert("导入失败：文件格式不正确。");
      console.error(error);
    }
    importJsonInput.value = "";
  };
  reader.readAsText(file);
});

// 填充演示数据
fillDemoBtn.addEventListener("click", () => {
  if (!confirm("这将覆盖您当前填写的内容，确定要继续吗？")) return;

  const demoData = {
    name: "张三",
    email: "zhangsan@example.com",
    phone: "13800138000",
    birthday: "1998-05-20",
    hometown: "北京市海淀区",
    summary:
      "拥有3年前端开发经验的软件工程师，热衷于构建高性能、响应式的Web应用。精通React、Vue等主流框架，对用户体验和代码质量有极致追求。具备良好的团队协作能力和问题解决能力。",
    evaluation:
      "性格开朗，乐于分享，具备较强的抗压能力。对待工作认真负责，善于沟通，能够快速融入团队。对新技术保持敏感，有持续学习的习惯。",
    school: ["北京大学", "清华大学"],
    degree: ["硕士", "学士"],
    major: ["计算机科学与技术", "软件工程"],
    edu_time: ["2020-09 - 2023-06", "2016-09 - 2020-06"],
    company: ["字节跳动", "腾讯科技"],
    position: ["前端开发工程师", "前端实习生"],
    exp_time: ["2023-07 - 至今", "2022-06 - 2022-09"],
    duties: [
      "负责公司核心产品的前端架构设计与开发，提升页面加载速度30%。\n主导内部组件库的建设，提高团队开发效率。\n参与代码评审，制定前端开发规范。",
      "参与微信小程序功能的迭代开发。\n协助解决线上Bug，优化用户体验。\n编写技术文档，沉淀项目经验。",
    ],
    research_field: ["人工智能实验室"],
    research_topic: ["基于深度学习的图像识别研究"],
    research_pubs: [
      "发表论文《Image Recognition based on CNN》于CVPR 2022。\n申请发明专利一项。",
    ],
    honor_name: ["国家奖学金", "北京市优秀毕业生"],
    honor_time: ["2022-10", "2023-06"],
    cert_name: ["CET-6", "PMP项目管理认证"],
    cert_date: ["2018-12", "2023-03"],
    lang_name: ["英语", "日语"],
    lang_level: ["精通 (IELTS 7.5)", "日常会话 (N3)"],
    skill_text: [
      "JavaScript/TypeScript",
      "React/Vue",
      "Node.js",
      "Webpack/Vite",
      "Git",
      "HTML5/CSS3",
    ],
    primaryColor: "#3B82F6",
    textColor: "#333333",
    template: "modern",
    activeTab: "content",
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoData));
  loadFromLocalStorage();
  handleFormUpdate();
  alert("演示数据已填充！");
});
