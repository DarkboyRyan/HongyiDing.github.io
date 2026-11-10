# Hongyi Ding — personal website

Static bilingual portfolio with project details, recent interests, music, and the Yamoto Koki companion. Main entry: `index.html`; site copy and language switching: `script.js`; layout: `styles.css`.

- `companion.js`, `companion.css`, `companion-config.js`: current portrait, idle reactions, and optional Live2D support.
- `companion-chat.js`, `companion-chat.css`: AI chat, source references, and owner-email draft UI. The Contact section can open the same chat directly.
- `f1/`: F1 research presentation, original Jupyter notebook, figures, model checks, and optional figure renderer. Entry: `f1/index.html`.
- `assets/`: current images, music, figures, and retained character models. Source/credit records and license notices are intentional files.

## Local preview

The private chat/mail service lives outside this static repository:

```bash
node '/Users/ryanding/Documents/ChatGPT/vpn维护/website-chat/preview-server.mjs'
```

Open http://127.0.0.1:18880/. A plain static server does not provide the AI or mail endpoints. The public site connects to a separately hosted HTTPS backend configured by `apiBaseUrl` in `companion-config.js`. Chat and mail share that backend; the browser receives only an anonymous session token. Credentials must not be committed to this website. Localhost previews continue using the local service above.

## Checks

```bash
node --test tests/companion.test.cjs
python3 -B f1/tests/f1-model.test.py
```

`LIVE2D.md` documents the portrait and optional model integration. Unused previews, replaced artwork, placeholder blog page, and generated figures were archived outside the website on 2026-11-10; no cleanup backups are served with the site.
