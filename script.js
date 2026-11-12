"use strict";

const LANGUAGE_STORAGE_KEY = "hongyi-portfolio-language";

async function copyOwnerEmail() {
  const button = document.getElementById("copy-owner-email");
  const status = document.getElementById("email-copy-status");
  const email = button.dataset.email;
  let copied = false;
  status.textContent = "";
  try {
    await navigator.clipboard.writeText(email);
    copied = true;
  } catch {
    // Support local-file previews and browsers without Clipboard API access.
    const previousFocus = document.activeElement;
    const field = document.createElement("textarea");
    field.value = email;
    field.readOnly = true;
    field.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;font-size:16px";
    document.body.append(field);
    try {
      field.select();
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    } finally {
      field.remove();
      previousFocus?.focus({ preventScroll: true });
    }
  }
  const key = copied ? "emailCopied" : "emailCopyFailed";
  status.dataset.i18n = key;
  status.textContent = translations[document.documentElement.lang.startsWith("zh") ? "zh" : "en"][key];
}

document.getElementById("copy-owner-email")?.addEventListener("click", copyOwnerEmail);

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
    musicPlayerLabel: "Music player: 834.194 by sakanaction",
    musicTitle: "Music for browsing",
    musicHint: "Music starts automatically when allowed. If it stays silent, press play below. You can close this panel while listening.",
    musicAvailability: "834.194 · sakanaction · Full track · Loop enabled",
    subtitle: "Computer Science × Physics at Northeastern University · Expected May 2027",
    navProjects: "Projects",
    navRecent: "Lately",
    recentTitle: "Lately",
    recentGames: "Recently playing",
    recentAnime: "Recently watching",
    recentMusic: "Recently listening",
    recentGameName: "Fire Emblem: Fortune’s Weave",
    recentAnimeName: "Puella Magi Madoka Magica the Movie: Walpurgisnacht Rising",
    recentMusicName: "Kaiju",
    recentGamesAlt: "Fire Emblem: Fortune’s Weave official artwork (watch the trailer on YouTube)",
    recentAnimeAlt: "Madoka Magica: Walpurgisnacht Rising official poster (opens official website)",
    recentMusicAlt: "Kaiju by sakanaction single cover (opens official website)",
    navAbout: "About",
    navContact: "Contact",
    avatarAlt: "Portrait of Hongyi Ding",
    skipToContent: "Skip to content",
    heroDiscipline: "Computer science × Physics",
    profileName: "Hi, I'm Hongyi.",
    heroTitle: "To protect the world from devastation!\nTo unite all peoples within our nation!",
    heroBody: "I focus on game programming, algorithms, and computer systems.",
    viewProjects: "View Projects",
    downloadResume: "Download Resume",
    projectsTitle: "Selected projects",
    projectFocus: "Games / Tools / Simulation",
    personalProject: "Personal project",
    teamProject: "Team project",
    bilibiliTitle: "Bilibili AI Agent",
    bilibiliDate: "Nov 2026 - Present",
    bilibiliBody: "Built an independent Bilibili AI account, 高松灯-侠影江湖, that responds to mentions and replies in video comments, keeps context within comment threads, and uses available subtitles and sampled video frames for analysis when requested.",
    bilibiliLink: "Visit AI account",
    bilibiliLinkLabel: "Visit the Bilibili AI account 高松灯-侠影江湖",
    scratchTitle: "Scratch Novel Engine",
    scratchDate: "Jun 2026 - Present",
    scratchBody: "A visual novel engine with an Electron editor shell and C++ core, used to create my game The Door at Seven. Development of the editor and runtime continues.",
    scratchGithubLabel: "View Scratch Novel Engine on GitHub",
    doorStatus: "Available on itch.io",
    visualNovel: "Visual novel",
    doorBody: "A visual novel I created with my own Scratch Novel Engine, bringing the engine into a narrative game. Visit the itch.io page to explore the game.",
    doorLink: "View on itch.io",
    doorLinkLabel: "View The Door at Seven on itch.io",
    spireTitle: "Slay the Spire 2 Mod - OTTO",
    spireLink: "View on Steam Workshop",
    spireLinkLabel: "View Slay the Spire 2 Mod - OTTO on Steam Workshop",
    spireDate: "May 2026 - Oct 2026",
    spireBody: "Set up the mod development environment and completed card art replacement and text configuration. Now building a playable character with base settings, a starter deck, and exclusive cards.",
    f1Title: "F1 Vehicle Dynamics & Aerodynamic Optimization",
    f1Date: "Jan 2026 - Apr 2026",
    f1Results: "View research results",
    f1Body: "Built longitudinal and lateral dynamics models to study drag, downforce, and tire grip; implemented simplified 2D CFD using the Navier-Stokes equations and FVM; then analyzed CL-CD trade-offs and optimized aero setups with a lap-time model.",
    muTitle: "Mu's Adventure",
    muDate: "Oct 2025 - Present",
    muBody: "A 2D side-scrolling platform game where players use scattered clues to solve puzzles. It includes multiple minigames and integrates broad worldbuilding with gameplay.",
    muGithubLabel: "View Mu's Adventure on GitHub",
    ggjDate: "Feb 2026",
    ggjBody: "Built a playable game in 48 hours around the theme “Mask.” Designed mask mechanics with state transitions and visual feedback while collaborating through Git in a fast-paced team.",
    ggjGithubLabel: "View Global Game Jam 2026 on GitHub",
    aboutTitle: "About",
    aboutBody: "I am pursuing a bachelor's degree in Computer Science and Physics at Northeastern University in Boston and expect to graduate in May 2027. I focus on game development and software engineering, working primarily with C++, C#, and Python. I love games and anime—feel free to get in touch! If you have any questions, feel free to ask my assistant =-=",
    contactTitle: "Contact",
    contactOwner: "Contact the site owner (copy email)",
    emailCopied: "Email copied: dinghongyi8@gmail.com",
    emailCopyFailed: "Could not copy automatically. Please copy this email: dinghongyi8@gmail.com",
    contactCompanion: "Tell Yamoto Koki",
    footerText: "Built with vanilla HTML/CSS.",
    lastUpdated: "Last updated:",
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
    musicPlayerLabel: "音乐播放器：sakanaction《834.194》",
    musicTitle: "浏览时听首歌",
    musicHint: "浏览器允许时将自动播放；如果没有声音，请点击下方播放按钮。聆听时可以收起面板。",
    musicAvailability: "834.194 · sakanaction · 完整歌曲 · 循环播放",
    subtitle: "东北大学计算机科学 × 物理 · 预计 2027 年 5 月毕业",
    navProjects: "项目",
    navRecent: "最近一览",
    recentTitle: "最近一览",
    recentGames: "我最近玩的游戏",
    recentAnime: "我最近看的动漫",
    recentMusic: "我最近听的音乐",
    recentGameName: "火焰纹章：万紫千红",
    recentAnimeName: "魔法少女小圆 魔女的回天",
    recentMusicName: "怪兽",
    recentGamesAlt: "火焰纹章：万紫千红官方宣传图（在 YouTube 观看宣传片）",
    recentAnimeAlt: "魔法少女小圆 魔女的回天官方海报（打开官网）",
    recentMusicAlt: "sakanaction《怪兽》单曲封面（打开官网）",
    navAbout: "关于我",
    navContact: "联系方式",
    avatarAlt: "丁泓邑的头像",
    skipToContent: "跳转到正文",
    heroDiscipline: "计算机科学 × 物理",
    profileName: "你好，我是丁泓邑。",
    heroTitle: "为了防止世界被破坏\n为了守护世界的和平",
    heroBody: "我专注于游戏编程、算法和计算机系统。",
    viewProjects: "查看项目",
    downloadResume: "下载简历",
    projectsTitle: "项目精选",
    projectFocus: "游戏 / 工具 / 仿真",
    personalProject: "个人项目",
    teamProject: "团队项目",
    bilibiliTitle: "B站 AI Agent · 高松灯-侠影江湖",
    bilibiliDate: "2026 年 11 月 - 至今",
    bilibiliBody: "搭建独立的 B站 AI 账号「高松灯-侠影江湖」，自动回应视频评论中的 @ 和回复，保留同一评论楼层的对话上下文；在明确要求分析视频时，结合可用字幕和抽样画面作答。",
    bilibiliLink: "访问 AI 账号主页",
    bilibiliLinkLabel: "访问高松灯-侠影江湖的 B站 AI 账号主页",
    scratchTitle: "文字小说引擎（Scratch Novel Engine）",
    scratchDate: "2026 年 6 月 - 至今",
    scratchBody: "自主开发的文字小说引擎，采用 Electron 编辑器外壳与 C++ 核心，已用于制作个人游戏 The Door at Seven，并持续完善编辑器与运行时。",
    scratchGithubLabel: "在 GitHub 查看 Scratch Novel Engine",
    doorStatus: "已发布于 itch.io",
    visualNovel: "文字小说",
    doorBody: "使用自主开发的 Scratch Novel Engine 制作的文字小说游戏，将引擎用于实际的叙事作品。可前往 itch.io 页面查看游戏。",
    doorLink: "前往 itch.io",
    doorLinkLabel: "在 itch.io 查看 The Door at Seven",
    spireTitle: "杀戮尖塔 2 Mod 开发 - OTTO",
    spireLink: "查看 Steam 创意工坊",
    spireLinkLabel: "在 Steam 创意工坊查看杀戮尖塔 2 Mod - OTTO",
    spireDate: "2026 年 5 月 - 2026 年 10 月",
    spireBody: "搭建 Mod 开发环境，完成卡牌图片替换与文本配置；目前正使用 BaseLib 开发新角色，包括角色基础设置、初始牌组和专属卡牌。",
    f1Title: "F1 赛车动力学与空气动力学性能优化",
    f1Date: "2026 年 1 月 - 2026 年 4 月",
    f1Results: "查看研究结果",
    f1Body: "建立纵向与横向动力学模型，分析空气阻力、下压力和轮胎抓地力；基于 Navier-Stokes 方程与有限体积法实现简化二维 CFD，并结合圈速模型分析 CL-CD 权衡、优化空气动力学设定。",
    muTitle: "小木之旅",
    muDate: "2025 年 10 月 - 至今",
    muBody: "一款 2D 横版卷轴平台游戏，玩家需要利用散落的线索解谜。项目包含多个迷你游戏，并将广阔的世界观构建与玩法相结合。",
    muGithubLabel: "在 GitHub 查看小木之旅",
    ggjDate: "2026 年 2 月",
    ggjBody: "在 48 小时内围绕“面具”主题使用 Unity 完成可玩游戏；设计并整合状态转换与视觉反馈机制，在快节奏团队中使用 Git 协作迭代。",
    ggjGithubLabel: "在 GitHub 查看 Global Game Jam 2026",
    aboutTitle: "关于我",
    aboutBody: "我在东北大学波士顿校区攻读计算机科学与物理学士学位，预计 2027 年 5 月毕业。我专注于游戏开发与软件工程，主要使用 C++、C# 和 Python。热爱游戏和动漫，欢迎交流。如果有任何问题都可以询问我的助手 =-=",
    contactTitle: "联系方式",
    contactOwner: "联系站长（复制邮箱）",
    emailCopied: "邮箱已复制：dinghongyi8@gmail.com",
    emailCopyFailed: "自动复制失败，请手动复制邮箱：dinghongyi8@gmail.com",
    contactCompanion: "告诉矢本小季",
    footerText: "使用原生 HTML/CSS 构建。",
    lastUpdated: "最后更新：",
    toggleLabel: "中/En",
    toggleAriaLabel: "切换至英文",
    toggleTitle: "切换至英文"
  }
};

// Detail pages can extend the shared language switcher with their own copy.
if (window.portfolioPageTranslations) {
  for (const language of ["en", "zh"]) {
    Object.assign(translations[language], window.portfolioPageTranslations[language]);
  }
}

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

// GitHub Pages supplies the deployed file's timestamp; never use the visitor's current date.
const siteUpdated = document.getElementById("site-updated");
if (siteUpdated) {
  fetch(new URL("index.html", document.baseURI), {
    method: "HEAD",
    cache: "no-cache",
    signal: AbortSignal.timeout(5000),
  }).then((response) => {
    if (!response.ok) return;
    const modified = response.headers.get("Last-Modified");
    if (!modified) return;
    const published = new Date(modified);
    if (Number.isNaN(published.getTime())) return;
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(published);
    const value = (type) => parts.find((part) => part.type === type).value;
    const date = `${value("year")}-${value("month")}-${value("day")}`;
    siteUpdated.dateTime = date;
    siteUpdated.textContent = date;
  }).catch(() => {
    // Keep the embedded release date if offline or the host omits Last-Modified.
  });
}


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

function applyLanguage(language, persist = false) {
  const selectedLanguage = translations[language] ? language : "en";
  const copy = translations[selectedLanguage];
  const resumeDownload = document.getElementById("resume-download");
  if (resumeDownload) {
    const resumeLanguage = selectedLanguage === "zh" ? "Cn" : "En";
    resumeDownload.setAttribute("href", `Resume_${resumeLanguage}.pdf`);
    resumeDownload.setAttribute("download", `Hongyi-Ding-Resume-${resumeLanguage}.pdf`);
  }

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
  // Every page load starts in English; visitors can switch languages manually.
  applyLanguage("en");

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
