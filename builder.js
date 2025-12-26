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

// 缩放按钮
const zoomInBtn = document.getElementById("zoom-in-btn");
const zoomOutBtn = document.getElementById("zoom-out-btn");

// 样式控制
const colorThemeInput = document.getElementById("color-theme");
const colorThemeDisplay = document.getElementById("color-theme-display");
const templateButtons = document.querySelectorAll(".template-selector button");

// 动态内容容器 (表单)
const educationContainer = document.getElementById("education-container");
const experienceContainer = document.getElementById("experience-container");
const researchContainer = document.getElementById("research-container");
const honorsContainer = document.getElementById("honors-container");
const skillsContainer = document.getElementById("skills-container");

// 动态内容 "添加" 按钮
const addEducationBtn = document.getElementById("add-education-btn");
const addExperienceBtn = document.getElementById("add-experience-btn");
const addResearchBtn = document.getElementById("add-research-btn");
const addHonorBtn = document.getElementById("add-honor-btn");
const addSkillBtn = document.getElementById("add-skill-btn");

// 预览区域 (右侧) - 选择更具体的元素
const previewName = document.getElementById("preview-name");
const previewEmail = document.getElementById("preview-email-display");
const previewPhone = document.getElementById("preview-phone-display");
const previewSummary = document.getElementById("preview-summary");
const previewEvaluation = document.getElementById("preview-evaluation");
const previewEducation = document.getElementById("preview-education");
const previewExperience = document.getElementById("preview-experience");
const previewResearch = document.getElementById("preview-research");
const previewHonors = document.getElementById("preview-honors");
const previewSkills = document.getElementById("preview-skills");

// 工具按钮
const findInput = document.getElementById("find-input");
const replaceInput = document.getElementById("replace-input");
const findReplaceBtn = document.getElementById("find-replace-btn");
const resetFormBtn = document.getElementById("reset-form-btn");

// 字数统计
const summaryTextarea = form.summary;
const evaluationTextarea = form.evaluation;
const summaryCharCounter = document.getElementById("summary-char-counter");
const evaluationCharCounter = document.getElementById(
  "evaluation-char-counter"
);

// 全局状态
const LOCAL_STORAGE_KEY = "resumeBuilderData_v6_stable"; // 更新版本
let currentZoom = 1.0;
const originalSectionSelectors = [
  ".preview-header",
  "#preview-summary-section",
  "#preview-education-section",
  "#preview-experience-section",
  "#preview-research-section",
  "#preview-honors-section",
  "#preview-skills-section",
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

  // 【修复】恢复电话和邮箱的更新
  updateSimplePreview(previewName, nameValue, "您的姓名");
  updateSimplePreview(previewEmail, form.email.value, "邮箱");
  updateSimplePreview(previewPhone, form.phone.value, "电话");

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
    skillsContainer,
    previewSkills,
    (data) => `<li>${data.skill_text || "技能/特长"}</li>`,
    "<li>[请添加技能/特长]</li>",
    "preview-skills-section"
  );

  applyCreativeTemplateHacks(nameValue);
  saveToLocalStorage();
}

function updateSimplePreview(element, value, placeholder) {
  const hasValue = value && value.trim() !== "";
  element.textContent = hasValue ? value.trim() : placeholder;
}

function updateListPreview(
  container,
  previewList,
  templateFn,
  emptyHtml,
  sectionId
) {
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
      const trimmedData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v.trim()])
      );
      previewList.innerHTML += templateFn(trimmedData);
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
  return dutiesText
    .split("\n")
    .filter((d) => d.trim() !== "")
    .map((d) => `<li>${d}</li>`)
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
    case "skills":
      return `<div class="item-group item-group-skill"><input type="text" name="skill_text[]" placeholder="技能/特长 (如：精通 Python)" value="${
        data.skill_text || ""
      }"><button type="button" class="btn btn-danger remove-item-btn remove-skill-btn"><i class="ri-delete-bin-line"></i></button></div>`;
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
setupAddButton(addSkillBtn, skillsContainer, "skills");

form.addEventListener("click", (e) => {
  if (e.target.closest(".remove-item-btn")) {
    e.target.closest(".item-group").remove();
    handleFormUpdate();
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

  ["education", "experience", "research", "honors", "skills"].forEach(
    (type) => {
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
          : "honor_name";
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
          else if (type === "skills")
            itemData = { skill_text: data.skill_text[index] };
          container.insertAdjacentHTML(
            "beforeend",
            createItemHTML(type, itemData)
          );
        });
      }
    }
  );

  const activeSidebarItem = document.querySelector(
    `#main-sidebar .sidebar-item[data-tab-name="${data.activeTab}"]`
  );
  if (activeSidebarItem) activeSidebarItem.click();
}

saveBtn.addEventListener("click", () => {
  saveToLocalStorage();
  alert("进度已保存到本地浏览器！");
});

// =====================================
// 7. 工具 & 导出功能
// =====================================

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

function updateCharCounter(textarea, counterElement, maxChars = 500) {
  const count = textarea.value.length;
  counterElement.textContent = `${count} / ${maxChars}`;
  counterElement.style.color =
    count > maxChars ? "var(--danger-color)" : "var(--text-color-light)";
}
summaryTextarea.addEventListener("input", () =>
  updateCharCounter(summaryTextarea, summaryCharCounter)
);
evaluationTextarea.addEventListener("input", () =>
  updateCharCounter(evaluationTextarea, evaluationCharCounter)
);

// =====================================
// 8. 初始化
// =====================================

window.addEventListener("load", () => {
  loadFromLocalStorage();
  handleFormUpdate();
  updateZoom();
  updateCharCounter(summaryTextarea, summaryCharCounter);
  updateCharCounter(evaluationTextarea, evaluationCharCounter);
});
