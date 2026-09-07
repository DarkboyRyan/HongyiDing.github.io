"use strict";

const LANGUAGE_STORAGE_KEY = "hongyi-portfolio-language";

const projectCards = [...document.querySelectorAll("#projects .card")];
projectCards.forEach((card) => {
  card.addEventListener("click", () => {
    projectCards.forEach((project) => {
      const selected = project === card;
      project.classList.toggle("is-selected", selected);
      project.querySelector(".project-select").setAttribute("aria-pressed", String(selected));
    });
  });
});

const translations = {
  en: {
    documentTitle: "Hongyi Ding | CS & Physics Portfolio",
    metaDescription: "Hongyi Ding is a Computer Science and Physics student at Northeastern University building games, developer tools, and simulation projects.",
    ogTitle: "Hongyi Ding | CS & Physics Portfolio",
    ogDescription: "Games, developer tools, and simulation projects by Hongyi Ding.",
    ogLocale: "en_US",
    navAriaLabel: "Primary navigation",
    subtitle: "Computer Science × Physics at Northeastern University · Expected May 2027",
    navProjects: "Projects",
    navAbout: "About",
    navContact: "Contact",
    avatarAlt: "Portrait of Hongyi Ding",
    skipToContent: "Skip to content",
    heroDiscipline: "Computer science × Physics",
    profileName: "Hi, I'm Hongyi.",
    heroTitle: "To protect the world from devastation,\nto safeguard the peace of the world.",
    heroBody: "I build games, developer tools, and simulation projects, with a focus on game programming, algorithms, and computer systems.",
    viewProjects: "View Projects",
    downloadResume: "Download Resume",
    projectsTitle: "Selected projects",
    projectFocus: "Games / Tools / Simulation",
    personalProject: "Personal project",
    teamProject: "Team project",
    scratchTitle: "Scratch Novel Engine",
    scratchDate: "Jun 2026 - Present",
    scratchBody: "An in-progress visual novel engine with an Electron editor shell and C++ core. Its editor/runtime architecture and basic narrative flow are currently being developed.",
    spireTitle: "Slay the Spire 2 Mod",
    spireDate: "May 2026 - Present",
    spireBody: "Set up the mod development environment and completed card art replacement and text configuration. Now building a playable character with base settings, a starter deck, and exclusive cards.",
    f1Title: "F1 Vehicle Dynamics & Aerodynamic Optimization",
    f1Date: "Jan 2026 - Apr 2026",
    f1Body: "Built longitudinal and lateral dynamics models to study drag, downforce, and tire grip; implemented simplified 2D CFD using the Navier-Stokes equations and FVM; then analyzed CL-CD trade-offs and optimized aero setups with a lap-time model.",
    muTitle: "Mu's Adventure",
    muDate: "Oct 2025 - Present",
    muBody: "A 2D side-scrolling platform game where players use scattered clues to solve puzzles. It includes multiple minigames and integrates broad worldbuilding with gameplay.",
    muGithubLabel: "View Mu's Adventure on GitHub",
    ggjDate: "Feb 2026",
    ggjBody: "Built a playable game in 48 hours around the theme “Mask.” Designed mask mechanics with state transitions and visual feedback while collaborating through Git in a fast-paced team.",
    ggjGithubLabel: "View Global Game Jam 2026 on GitHub",
    aboutTitle: "About",
    aboutBody: "I am pursuing a bachelor's degree in Computer Science and Physics at Northeastern University in Boston and expect to graduate in May 2027. I enjoy game development and software engineering, working primarily with C++, Java, and Python.",
    contactTitle: "Contact",
    footerText: "Built with vanilla HTML/CSS.",
    toggleLabel: "中/En",
    toggleAriaLabel: "Switch to Chinese",
    toggleTitle: "Switch to Chinese"
  },
  zh: {
    documentTitle: "丁泓邑 | 计算机科学与物理作品集",
    metaDescription: "丁泓邑是东北大学计算机科学与物理专业学生，专注于游戏、开发工具和仿真项目。",
    ogTitle: "丁泓邑 | 计算机科学与物理作品集",
    ogDescription: "丁泓邑的游戏、开发工具与仿真项目。",
    ogLocale: "zh_CN",
    navAriaLabel: "主要导航",
    subtitle: "东北大学计算机科学 × 物理 · 预计 2027 年 5 月毕业",
    navProjects: "项目",
    navAbout: "关于我",
    navContact: "联系方式",
    avatarAlt: "丁泓邑的头像",
    skipToContent: "跳转到正文",
    heroDiscipline: "计算机科学 × 物理",
    profileName: "你好，我是丁泓邑。",
    heroTitle: "为了防止世界被破坏\n为了守护世界的和平",
    heroBody: "我专注于游戏编程、算法和计算机系统，并持续开发游戏、开发工具与仿真项目。",
    viewProjects: "查看项目",
    downloadResume: "下载简历",
    projectsTitle: "项目精选",
    projectFocus: "游戏 / 工具 / 仿真",
    personalProject: "个人项目",
    teamProject: "团队项目",
    scratchTitle: "文字小说引擎（Scratch Novel Engine）",
    scratchDate: "2026 年 6 月 - 至今",
    scratchBody: "正在开发的文字小说引擎，目前已搭建 Electron 编辑器外壳与 C++ 核心，并持续推进编辑器/运行时架构和基础叙事流程。",
    spireTitle: "杀戮尖塔 2 Mod 开发",
    spireDate: "2026 年 5 月 - 至今",
    spireBody: "搭建 Mod 开发环境，完成卡牌图片替换与文本配置；目前正使用 BaseLib 开发新角色，包括角色基础设置、初始牌组和专属卡牌。",
    f1Title: "F1 赛车动力学与空气动力学性能优化",
    f1Date: "2026 年 1 月 - 2026 年 4 月",
    f1Body: "建立纵向与横向动力学模型，分析空气阻力、下压力和轮胎抓地力；基于 Navier-Stokes 方程与有限体积法实现简化二维 CFD，并结合圈速模型分析 CL-CD 权衡、优化空气动力学设定。",
    muTitle: "小木之旅",
    muDate: "2025 年 10 月 - 至今",
    muBody: "一款 2D 横版卷轴平台游戏，玩家需要利用散落的线索解谜。项目包含多个迷你游戏，并将广阔的世界观构建与玩法相结合。",
    muGithubLabel: "在 GitHub 查看小木之旅",
    ggjDate: "2026 年 2 月",
    ggjBody: "在 48 小时内围绕“面具”主题使用 Unity 完成可玩游戏；设计并整合状态转换与视觉反馈机制，在快节奏团队中使用 Git 协作迭代。",
    ggjGithubLabel: "在 GitHub 查看 Global Game Jam 2026",
    aboutTitle: "关于我",
    aboutBody: "我在东北大学波士顿校区攻读计算机科学与物理学士学位，预计 2027 年 5 月毕业。我专注于游戏开发与软件工程，主要使用 C++、Java 和 Python。",
    contactTitle: "联系方式",
    footerText: "使用原生 HTML/CSS 构建。",
    toggleLabel: "中/En",
    toggleAriaLabel: "切换至英文",
    toggleTitle: "切换至英文"
  }
};

const root = document.documentElement;
const languageToggle = document.getElementById("language-toggle");
const themeToggle = document.getElementById("theme-toggle");
const metaDescription = document.querySelector('meta[name="description"]');
const ogTitle = document.querySelector('meta[property="og:title"]');
const ogDescription = document.querySelector('meta[property="og:description"]');
const ogLocale = document.querySelector('meta[property="og:locale"]');

document.querySelectorAll("#year").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

try {
  if (localStorage.getItem("theme") === "dark") root.classList.add("dark");
} catch {
  // The page still works when browser storage is unavailable.
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    root.classList.toggle("dark");
    try {
      localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
    } catch {
      // Theme switching still works for the current page.
    }
  });
}

function readStoredLanguage() {
  try {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedLanguage === "en" || storedLanguage === "zh" ? storedLanguage : null;
  } catch {
    return null;
  }
}

function detectBrowserLanguage() {
  const browserLanguage = navigator.languages?.[0] || navigator.language || "en";
  return browserLanguage.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function applyLanguage(language, persist = false) {
  const selectedLanguage = translations[language] ? language : "en";
  const copy = translations[selectedLanguage];

  root.lang = selectedLanguage === "zh" ? "zh-CN" : "en";
  document.title = copy.documentTitle;

  if (metaDescription) metaDescription.setAttribute("content", copy.metaDescription);
  if (ogTitle) ogTitle.setAttribute("content", copy.ogTitle);
  if (ogDescription) ogDescription.setAttribute("content", copy.ogDescription);
  if (ogLocale) ogLocale.setAttribute("content", copy.ogLocale);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (copy[key]) element.textContent = copy[key];
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    const key = element.dataset.i18nAlt;
    if (copy[key]) element.setAttribute("alt", copy[key]);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const key = element.dataset.i18nAriaLabel;
    if (copy[key]) element.setAttribute("aria-label", copy[key]);
  });

  if (languageToggle) {
    languageToggle.textContent = copy.toggleLabel;
    languageToggle.setAttribute("aria-label", copy.toggleAriaLabel);
    languageToggle.setAttribute("title", copy.toggleTitle);
    languageToggle.dataset.currentLanguage = selectedLanguage;
  }

  if (persist) {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);
    } catch {
      // The page still works when browser storage is unavailable.
    }
  }
}

if (languageToggle) {
  applyLanguage(readStoredLanguage() || detectBrowserLanguage());

  languageToggle.addEventListener("click", () => {
    const nextLanguage = languageToggle.dataset.currentLanguage === "zh" ? "en" : "zh";
    applyLanguage(nextLanguage, true);
  });

  window.addEventListener("storage", (event) => {
    if (event.key === LANGUAGE_STORAGE_KEY && (event.newValue === "en" || event.newValue === "zh")) {
      applyLanguage(event.newValue);
    }
  });
}
