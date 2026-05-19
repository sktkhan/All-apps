# ⬡ Akhtar Engineering Hub

**All-in-one AI tools platform for engineers, students, freelancers & creators.**

---

## 🚀 Features

| Tool | Description |
|------|-------------|
| ✦ Text AI | Generate ads, scripts, captions, ideas & learning content |
| ◉ Image AI | Prompt-to-image with Unsplash API or Picsum fallback |
| ▶ Video AI | Scene breakdowns + canvas slideshow + frame export |
| ◎ Prompt Library | 12+ copy-ready prompts for ads, YouTube, social |
| ⚙ Unit Converter | 9 categories, 60+ units with quick reference |
| 🔧 Engineering Calc | Ohm's Law, Power, Area, BMI, Percentage |
| ≡ Text Tools | Word count, 8 case transforms |

---

## 📂 File Structure

```
akhtar-engineering-hub/
├── index.html      ← Main frontend (all pages)
├── style.css       ← Dark tech design system
├── app.js          ← All frontend logic & AI calls
├── config.js       ← API keys & settings
├── server.js       ← Node.js backend (optional)
├── package.json    ← Dependencies
└── README.md       ← This file
```

---

## ⚡ Option 1: Open Directly (No Setup)

Just double-click `index.html` in your browser.

Works immediately in **Demo Mode** — all tools functional with sample responses.

---

## 🖥️ Option 2: Run Locally with Node.js

### Prerequisites
- [Node.js](https://nodejs.org/) v16+

### Steps

```bash
# 1. Clone or download this project
git clone https://github.com/yourusername/akhtar-engineering-hub.git
cd akhtar-engineering-hub

# 2. Install dependencies
npm install

# 3. (Optional) Set your API key
export ANTHROPIC_API_KEY=your_key_here

# 4. Start the server
npm start

# 5. Open in browser
# http://localhost:3000
```

---

## 🔑 Adding Real API Keys

Edit `config.js`:

```javascript
const AEH_CONFIG = {
  ANTHROPIC_API_KEY: "sk-ant-your-key-here",   // console.anthropic.com (free tier)
  UNSPLASH_ACCESS_KEY: "your-unsplash-key",     // unsplash.com/developers (free)
  DEMO_MODE: false  // auto-switches to false when key is present
};
```

### Free APIs Used

| API | Purpose | Free Tier |
|-----|---------|-----------|
| [Anthropic Claude](https://console.anthropic.com) | Text & Video AI | Yes — free credits |
| [Unsplash](https://unsplash.com/developers) | Image generation | 50 req/hr free |
| [Picsum Photos](https://picsum.photos) | Image fallback | Unlimited, no key |

---

## 🌐 Deploy to GitHub Pages (Free)

1. Push your code to a GitHub repository
2. Go to **Settings → Pages**
3. Set source: **Deploy from branch → main → / (root)**
4. Your site is live at: `https://yourusername.github.io/akhtar-engineering-hub`

> **Note:** GitHub Pages = static hosting. All features work in Demo Mode. For real AI APIs, use Replit or a Node.js host.

---

## 🚀 Deploy to Replit (Free, Full Backend)

1. Go to [replit.com](https://replit.com) → Create Repl → Import from GitHub
2. Add `ANTHROPIC_API_KEY` in **Secrets** tab
3. Click **Run** → Your app is live with real AI!

---

## 🎥 Enabling MP4 Export (FFmpeg)

For full MP4 export (not just frame download):

```bash
# Install FFmpeg
# macOS:    brew install ffmpeg
# Ubuntu:   sudo apt install ffmpeg
# Windows:  https://ffmpeg.org/download.html

# After exporting frames, run:
ffmpeg -framerate 1 -i frame%d.png -c:v libx264 -r 30 -pix_fmt yuv420p output.mp4
```

---

## 📱 Mobile Support

Fully responsive — tested on:
- iOS Safari / Chrome
- Android Chrome
- Tablet (portrait & landscape)

---

## 🛠️ Customization

**Change brand name:** Search `Akhtar Engineering Hub` in all files and replace

**Add new tools:** Add a new `<section class="page" id="mytool">` in `index.html` + matching nav link + JS logic in `app.js`

**Change colors:** Edit CSS variables in `style.css` `:root` block

---

## 📄 License

MIT — free to use, modify, and deploy.

---

*Built with ♥ — Akhtar Engineering Hub v1.0.0*
