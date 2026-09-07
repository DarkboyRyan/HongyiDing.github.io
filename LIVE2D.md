# 网页角色小伙伴

## 当前交付

当前默认使用 **矢本小季（Yamoto Koki）的透明立绘互动版**，由用户确认先替换外观。以提供的动画画面为参考生成正面立绘，包含黑色短发、蓝眼睛、深蓝牛角扣外套、百褶裙和背刀。保留轻微摆动、点击回应、中英文对话、页面导航、暂停和收起。每次打开或刷新网页时默认显示在右下角，手机和矮屏也一样；仅点击「−」按钮收起，不读取或保存收起状态，导航和窗口尺寸变化不会自动收起。加载失败显示重试，收起或页面进入后台会暂停动画；系统设置减少动态效果时默认暂停。

当前立绘版支持左右轻摆、30 秒无操作后闭眼休息，以及点击后的轻跳问候。鼠标移动、滚动、键盘或点击会唤醒并重新计时；收起与后台状态不计时。点击台词为「demo、矢本小季です。」，仅显示文字，不播放语音。

闭眼由 imagegen 生成的眼部图像叠加完成：`sleeping-eyes.png` 只通过 CSS 裁切显示眼睛区域，保留原立绘的身体、姿态与透明背景。它不是 Live2D 转头、眼睛跟随或连续绑定动画，也没有 AI 对话。完整 Live2D 支持和 Haru 示例文件仍保留，但默认不会下载或运行这些依赖。矢本小季定制 Live2D 仍需分层绘制、Cubism 绑定与导出。

`companion-config.js` 中 `mode: "portrait"` 指定立绘模式，`portraitUrl` 指向 `assets/characters/yamoto-koki/standing.png`。`name`/`nameZh` 指定双语角色名称。图像来源和生成提示词保存在同目录的 `provenance.json`，鸣谢页面为 `character-notices.html`。

`sleepingPortraitUrl` 指定闭眼素材，`idleAfterMs` 设置休息等待时间（默认 30000 毫秒）；`greeting` 为显示台词。换成别的尺寸或姿态时，需要重新调整 companion.css 的眼部裁切区域。

## 本地预览 / 发布

在项目目录运行 `python3 -m http.server 8765 --bind 127.0.0.1`，访问 `http://127.0.0.1:8765/`。必须通过 HTTP 预览，不要双击 HTML 使用 file://。

无需 npm 或构建步骤。GitHub Pages 发布时，一起提交三个 companion 文件、index.html、assets、vendor/live2d、character-notices.html 和 live2d-notices.html。所有运行时文件都在本地，运行时无需第三方 CDN。原网站的其他文件照常发布。

## 换成参考图角色

1. 以深色短发、蓝眼睛、深蓝外套为参考准备透明背景正面立绘，分层绘制眼白、瞳孔、眼皮、嘴、前后发、脸、躯干与手臂，并补画遮挡区域。
2. 在 Cubism Editor 中做网格与变形器，绑定头部角度、眼睛开合/视线、呼吸、头发物理和点击动作。
3. 此集成使用 pixi-live2d-display 0.4.0 的 Cubism 4 适配器。请导出 **Cubism 4.0 兼容** 模型；不要依赖 Cubism 5 新增功能。若需要新版模型，先升级并验证渲染器与 Core 的兼容性。
4. 把运行时导出目录完整放到 `assets/live2d/your-character/`：model3.json、moc3、纹理，以及 manifest 引用的 physics3.json、pose3.json、motion3.json、exp3.json。保留导出目录结构和大小写；PSD/cmo3 是编辑源文件，不是网页加载入口。
5. 将 companion-config.js 的 mode 改为 "live2d"，并修改 modelUrl、name、nameZh、credit、creditUrl、idleMotion、tapMotion 和 expressions。动作组与表情名必须与新 model3.json 一致；没有表情时填空数组。当前 modelUrl 仍指向之前的 Haru 示例，必须同时替换为矢本小季的完整模型目录，不能只切换 mode 或改名字。

组件保留现有主站布局；尺寸在 companion.css 中设置。桌面为 230 × 300 像素，手机/矮屏为 200 × 220 像素。遮挡时可以立即收起。

## 依赖与来源

- PixiJS 6.5.10 / pixi-live2d-display 0.4.0：固定版本，本地托管，MIT 协议保存在 vendor/live2d。
- Cubism Core：从官方 `https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js` 获取并保留文件头协议；以仓库内快照为准。
- Haru：来自 `https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display@v0.4.0/test/assets/haru/`，遵循 Live2D 示例素材协议。移除了 Sound 引用和上游不存在的 DisplayInfo 引用；其余模型文件保持原样。
- 原 Live2D 示例鸣谢保存在 live2d-notices.html；当前同人立绘说明在 character-notices.html。

## 检查

运行 `node --test tests/companion.test.cjs` 检查资源引用、真实 Cubism Core 读取模型、UI 生命周期逻辑（使用 DOM/渲染器替身，不代表浏览器视觉验收）。
