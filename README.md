# Portfolio Starter

一套开箱即用的个人作品集模板（纯 HTML/CSS/JS）。适合部署到 GitHub Pages / Vercel / Netlify。

## 使用步骤（GitHub Pages）
1. 新建仓库：`yourname.github.io`
2. 把本项目所有文件上传到仓库根目录（或 git push）
3. 打开仓库 Settings → Pages → 选择 `main / root` 保存
4. 等待生效后访问 `https://yourname.github.io`

## 自定义内容
- 替换 `assets/avatar.svg` 与项目图片 `assets/p*.svg`
- 修改 `index.html` 中的个人信息、项目卡片与链接
- 将你的简历命名为 `assets/resume.pdf`（或在按钮中换链接）
- 删除 `blog.html` 示例文章并添加真实内容

## 本地预览
直接双击 `index.html` 或使用任意静态服务器：
```bash
# Python 3
python -m http.server 8000
# 或者 Node
npx serve .
```

## 部署到 Vercel（可选）
将仓库导入 Vercel，项目框架选择 “Other”，一键部署即可。
