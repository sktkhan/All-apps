/**
 * =====================================================
 * AKHTAR ENGINEERING HUB — APP.JS
 * All feature logic: navigation, AI tools, converters
 * =====================================================
 */

/* ════════════════════════════════════
   NAVIGATION
════════════════════════════════════ */

/** Switch visible page section */
function goTo(section) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const page = document.getElementById(section);
  if (page) page.classList.add('active');

  const link = document.querySelector(`.nav-link[data-section="${section}"]`);
  if (link) link.classList.add('active');

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Sidebar link clicks
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    goTo(link.dataset.section);
  });
});

// Mobile hamburger
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Chip group: single-select logic
document.querySelectorAll('.chip-group').forEach(group => {
  group.addEventListener('click', e => {
    if (!e.target.classList.contains('chip')) return;
    group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
  });
});

/** Get active chip value in a group */
function getActiveChip(groupId) {
  const active = document.querySelector(`#${groupId} .chip.active`);
  return active ? active.dataset.val : '';
}

/* ════════════════════════════════════
   TOAST NOTIFICATIONS
════════════════════════════════════ */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ════════════════════════════════════
   LOADING OVERLAY
════════════════════════════════════ */
function showLoading(msg = 'Generating...') {
  document.getElementById('loading-msg').textContent = msg;
  document.getElementById('loading-overlay').classList.add('show');
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('show');
}

/* ════════════════════════════════════
   COPY & DOWNLOAD UTILITIES
════════════════════════════════════ */
function copyOutput(id) {
  const el = document.getElementById(id);
  const text = el.innerText || el.textContent;
  if (!text.trim() || text.includes('will appear here')) {
    showToast('Nothing to copy yet', 'error'); return;
  }
  navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard ✓'));
}

function downloadOutput(id, filename) {
  const text = document.getElementById(id).innerText;
  if (!text.trim()) { showToast('Nothing to download yet', 'error'); return; }
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
  showToast('Download started ↓');
}

/* ════════════════════════════════════
   ① TEXT AI GENERATOR
════════════════════════════════════ */

/** Demo responses for when no API key is set */
const TEXT_DEMOS = {
  "Ad Copy": `🚀 ATTENTION HOMEOWNERS — CUT YOUR ELECTRICITY BILL BY 70%!

Tired of skyrocketing energy bills? Akhtar Solar Solutions brings you premium solar panels designed for maximum efficiency — now with a FREE installation assessment.

✅ Zero upfront cost financing available
✅ Government rebates up to $7,500
✅ 25-year performance warranty
✅ Professional installation in just 1 day

⚡ Over 10,000 homes already powered by clean energy.

👉 Claim your FREE solar quote today — limited spots available this month!

[Call Now: 1-800-SOLAR-AE] | [Get Free Quote →]`,

  "YouTube Script": `[INTRO — 0:00-0:15]
Hook: "What if I told you that most engineers are solving problems the HARD way?"

[CUT TO PRESENTER]
"Hey everyone, welcome back to Akhtar Engineering — where we break down complex concepts into simple, actionable insights."

[MAIN CONTENT — 0:15-3:45]
Today we're covering the top 5 engineering principles that separate average engineers from great ones.

Principle #1: First-principles thinking — don't accept the default solution...
[Continue with detailed explanation]

[CALL TO ACTION — 3:45-4:00]
"If you found this valuable, smash that like button and subscribe for weekly engineering insights. Drop a comment below with your biggest engineering challenge — I read every single one!"`,

  "Caption": `⚡ Engineering the future, one circuit at a time.

The difference between a good engineer and a great one? Not the tools — it's the mindset. Every problem is just an unsolved puzzle waiting for the right question.

🔧 What engineering challenge are you working through today?

#Engineering #Innovation #STEM #AkhtarEngineering #TechLife #ProblemSolving #Engineers #BuildTheFuture`,

  "Ideas": `💡 10 VIRAL CONTENT IDEAS FOR ENGINEERS:

1. "I rebuilt [famous product] with $50 worth of parts" — Challenge video
2. "Engineering mistakes that became billion-dollar innovations" — Educational
3. "Day in the life of a senior engineer at Tesla" — Lifestyle/behind-scenes
4. "I solved a 10-year manufacturing problem in 3 hours" — Story-driven
5. "Engineering interview: 100 people, 1 impossible question" — Experiment
6. "The physics behind why cars crumple in crashes" — Explainer
7. "I designed a house using only free software" — Tutorial series
8. "Engineering fails: when $500M projects go wrong" — Analysis
9. "Reverse engineering Apple's newest chip" — Deep dive
10. "Sustainable engineering: building with trash" — Eco-innovation`,

  "Learning Content": `📚 LESSON: Understanding Ohm's Law

WHAT IS OHM'S LAW?
Ohm's Law is one of the fundamental principles in electrical engineering, describing the relationship between voltage (V), current (I), and resistance (R).

THE FORMULA: V = I × R

BREAKDOWN:
• V (Voltage) = measured in Volts (V) — the electrical pressure
• I (Current) = measured in Amperes (A) — the flow of electrons
• R (Resistance) = measured in Ohms (Ω) — opposition to current flow

PRACTICAL EXAMPLE:
If a circuit has a resistance of 10Ω and a current of 2A flowing through it:
V = 2A × 10Ω = 20 Volts

WHY IT MATTERS:
Understanding Ohm's Law allows engineers to:
✓ Calculate safe current limits for components
✓ Design efficient power distribution systems
✓ Troubleshoot electrical faults
✓ Select appropriate resistors and conductors

MEMORY TIP: Think of water in a pipe — voltage is water pressure, current is flow rate, resistance is pipe diameter.`
};

async function generateText() {
  const prompt   = document.getElementById('text-prompt').value.trim();
  const category = getActiveChip('text-categories');
  const tone     = document.getElementById('text-tone').value;
  const length   = getActiveChip('text-length');
  const outputEl = document.getElementById('text-output');

  if (!prompt) { showToast('Please enter a prompt first', 'error'); return; }

  showLoading('Generating content...');

  try {
    let result = '';

    if (AEH_CONFIG.DEMO_MODE) {
      // ── DEMO MODE: use built-in sample ──
      await sleep(1800); // simulate API delay
      result = TEXT_DEMOS[category] || TEXT_DEMOS["Ad Copy"];
      result = `[Category: ${category} | Tone: ${tone} | Length: ${length}]\n\n` + result;

    } else {
      // ── REAL API MODE: call Claude ──
      const systemPrompt = `You are an expert ${category} copywriter with a ${tone} tone. Generate ${length} content. Be creative, professional, and engaging.`;
      const userMsg = `${category}: ${prompt}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AEH_CONFIG.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: length === 'long' ? 1000 : length === 'medium' ? 600 : 350,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMsg }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      result = data.content[0].text;
    }

    // Render output with typing effect
    outputEl.innerHTML = '';
    typeWriter(outputEl, result, 8);

  } catch (err) {
    showToast('Generation failed — ' + err.message, 'error');
    console.error(err);
  } finally {
    hideLoading();
  }
}

/** Typing animation for output text */
function typeWriter(el, text, speed = 10) {
  el.innerHTML = '';
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text[i++];
    el.scrollTop = el.scrollHeight;
    if (i >= text.length) clearInterval(timer);
  }, speed);
}

/* ════════════════════════════════════
   ② IMAGE AI GENERATOR
════════════════════════════════════ */

async function generateImages() {
  const prompt  = document.getElementById('img-prompt').value.trim();
  const style   = getActiveChip('img-styles');
  const count   = parseInt(document.getElementById('img-count').value);
  const results = document.getElementById('image-results');

  if (!prompt) { showToast('Please enter an image description', 'error'); return; }

  showLoading('Generating images...');
  results.innerHTML = '';

  try {
    await sleep(2000); // simulate generation delay

    if (!AEH_CONFIG.DEMO_MODE && AEH_CONFIG.UNSPLASH_ACCESS_KEY) {
      // ── REAL UNSPLASH API ──
      const query = encodeURIComponent(`${prompt} ${style}`);
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=${count}&orientation=squarish`,
        { headers: { Authorization: `Client-ID ${AEH_CONFIG.UNSPLASH_ACCESS_KEY}` } }
      );
      const data = await res.json();

      if (data.results && data.results.length) {
        data.results.forEach(photo => renderImageCard(photo.urls.regular, photo.alt_description || prompt, results, photo.links.download));
      } else {
        fallbackImages(count, prompt, results);
      }

    } else {
      // ── DEMO: use Picsum (free, no key) ──
      fallbackImages(count, prompt, results);
    }

  } catch (err) {
    showToast('Image generation failed', 'error');
    fallbackImages(count, prompt, results);
  } finally {
    hideLoading();
  }
}

function fallbackImages(count, prompt, container) {
  // Picsum Photos — always free, always works
  const seeds = ['engineering', 'technology', 'design', 'abstract', 'futuristic', 'city'];
  for (let i = 0; i < count; i++) {
    const seed = encodeURIComponent(prompt + i);
    const url  = `https://picsum.photos/seed/${seed}/512/512`;
    renderImageCard(url, prompt + ` — Image ${i + 1}`, container, url);
  }
}

function renderImageCard(src, alt, container, downloadUrl) {
  const card = document.createElement('div');
  card.className = 'img-card';
  card.innerHTML = `
    <img src="${src}" alt="${alt}" loading="lazy" />
    <div class="img-overlay">
      <a href="${downloadUrl}" download="aeh-image.jpg" class="icon-btn" title="Download">↓ Save</a>
    </div>`;
  container.appendChild(card);
}

/* ════════════════════════════════════
   ③ VIDEO AI GENERATOR
════════════════════════════════════ */

let videoScenes = [];   // Store generated scenes for slideshow

/** Demo scene templates */
const SCENE_TEMPLATES = [
  { title: "SCENE 1 — OPENING HOOK",       overlay: "\"The Future is Here.\"",              color: "#00d4aa" },
  { title: "SCENE 2 — PROBLEM STATEMENT",  overlay: "\"Old solutions don't fit new problems.\"", color: "#0099ff" },
  { title: "SCENE 3 — SOLUTION REVEAL",    overlay: "\"Introducing: [PRODUCT/CONCEPT]\"",   color: "#f5c842" },
  { title: "SCENE 4 — KEY FEATURES",       overlay: "\"Fast. Reliable. Powerful.\"",         color: "#ff4d6d" },
  { title: "SCENE 5 — CALL TO ACTION",     overlay: "\"Start Today — It's Free.\"",          color: "#00d4aa" },
  { title: "SCENE 6 — SOCIAL PROOF",       overlay: "\"Join 10,000+ professionals.\"",        color: "#0099ff" },
  { title: "SCENE 7 — CLOSING BRAND",      overlay: "\"Built by Engineers. For Engineers.\"", color: "#f5c842" },
  { title: "SCENE 8 — OUTRO",              overlay: "\"Akhtar Engineering Hub\"",             color: "#e8edf5" }
];

async function generateVideo() {
  const prompt     = document.getElementById('vid-prompt').value.trim();
  const vidType    = getActiveChip('vid-types');
  const sceneCount = parseInt(document.getElementById('scene-count').value);
  const mood       = document.getElementById('vid-mood').value;
  const outputEl   = document.getElementById('vid-output');

  if (!prompt) { showToast('Please enter a video topic', 'error'); return; }

  showLoading('Building scene breakdown...');
  videoScenes = [];

  try {
    await sleep(2200);

    let scenesData = [];

    if (AEH_CONFIG.DEMO_MODE) {
      // Demo: generate scene breakdown from templates
      scenesData = SCENE_TEMPLATES.slice(0, sceneCount).map((tmpl, idx) => ({
        index: idx + 1,
        title: tmpl.title,
        description: buildSceneDesc(prompt, vidType, idx),
        overlay: tmpl.overlay.replace('[PRODUCT/CONCEPT]', prompt.split(' ').slice(0, 3).join(' ')),
        duration: "3-5 seconds",
        color: tmpl.color,
        mood: mood
      }));

    } else {
      // Real Claude API call
      const systemPrompt = `You are a professional video scriptwriter. Generate a JSON array of scene objects with fields: index, title, description, overlay (on-screen text), duration, color (hex), mood.`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AEH_CONFIG.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 1200,
          system: systemPrompt,
          messages: [{ role: 'user', content: `Create ${sceneCount} scenes for a ${vidType} video about: ${prompt}. Mood: ${mood}. Return ONLY a JSON array.` }]
        })
      });
      const data = await res.json();
      const raw = data.content[0].text.replace(/```json|```/g, '').trim();
      scenesData = JSON.parse(raw);
    }

    videoScenes = scenesData;

    // Render scene cards in output
    outputEl.innerHTML = '';
    scenesData.forEach(scene => {
      const block = document.createElement('div');
      block.className = 'scene-block';
      block.style.borderLeftColor = scene.color || 'var(--accent)';
      block.innerHTML = `
        <div class="scene-title">${scene.title}</div>
        <div class="scene-text">${scene.description}</div>
        <div class="scene-overlay">📝 TEXT OVERLAY: ${scene.overlay}</div>
        <div class="scene-overlay" style="color:var(--text3)">⏱ Duration: ${scene.duration}</div>`;
      outputEl.appendChild(block);
    });

    // Show video player
    document.getElementById('video-player-wrap').style.display = 'block';
    initSlideshowCanvas(scenesData[0]);
    showToast(`${scenesData.length} scenes generated ✓`);

  } catch (err) {
    showToast('Scene generation failed — ' + err.message, 'error');
    console.error(err);
  } finally {
    hideLoading();
  }
}

function buildSceneDesc(prompt, type, idx) {
  const descs = [
    `Open with a dynamic establishing shot. Quick zoom in. Subject: ${prompt}. Camera: wide to close.`,
    `Show the core problem or pain point related to ${prompt}. Use contrast and dramatic lighting.`,
    `Reveal the solution. ${type === 'Product Ad' ? 'Product hero shot with soft spotlight.' : 'Presenter frame with clear messaging.'}`,
    `Highlight key features or benefits. Rapid-cut b-roll supporting ${prompt}.`,
    `Strong call-to-action frame. Clean background. ${type === 'Social Reel' ? 'Swipe-up animation.' : 'URL / button overlay.'}`,
    `Social proof section — testimonials, ratings, logos. Builds trust for ${prompt}.`,
    `Brand closing. Logo animation. Tagline hold for 2 seconds.`,
    `End card with subscribe/follow button and outro music fade.`
  ];
  return descs[idx] || `Scene ${idx + 1} for ${prompt}. ${type} style, ${document.getElementById('vid-mood').value} mood.`;
}

function exportVideoScript() {
  if (!videoScenes.length) { showToast('Generate scenes first', 'error'); return; }
  const text = videoScenes.map(s =>
    `${s.title}\n${'─'.repeat(40)}\nDescription: ${s.description}\nText Overlay: ${s.overlay}\nDuration: ${s.duration}\n`
  ).join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: 'video-script.txt'
  });
  a.click();
  showToast('Script downloaded ↓');
}

/* ── CANVAS SLIDESHOW ── */
let slideshowTimer = null;
let currentSlide   = 0;

function initSlideshowCanvas(scene) {
  const canvas = document.getElementById('video-canvas');
  if (!canvas) return;
  drawSlide(canvas, scene, 0);
}

function drawSlide(canvas, scene, index) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const total = videoScenes.length;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0a0c0f');
  grad.addColorStop(1, scene.color + '22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Accent line
  ctx.strokeStyle = scene.color || '#00d4aa';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(40, H - 60);
  ctx.lineTo(W - 40, H - 60);
  ctx.stroke();

  // Scene number
  ctx.font = '700 13px Space Mono, monospace';
  ctx.fillStyle = scene.color || '#00d4aa';
  ctx.fillText(`SCENE ${index + 1} / ${total}`, 40, 45);

  // Title
  ctx.font = '700 22px Syne, sans-serif';
  ctx.fillStyle = '#e8edf5';
  wrapText(ctx, scene.title.replace(/SCENE \d+ — /, ''), 40, 90, W - 80, 30);

  // Overlay text
  ctx.font = '400 16px Space Mono, monospace';
  ctx.fillStyle = scene.color || '#00d4aa';
  wrapText(ctx, scene.overlay, 40, H - 90, W - 80, 22);

  // Progress bar
  const progress = ((index + 1) / total) * (W - 80);
  ctx.fillStyle = '#1f2733';
  ctx.fillRect(40, H - 20, W - 80, 4);
  ctx.fillStyle = scene.color || '#00d4aa';
  ctx.fillRect(40, H - 20, progress, 4);
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '';
  for (let w of words) {
    const test = line + w + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, y);
      line = w + ' ';
      y += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

function playSlideshow() {
  if (!videoScenes.length) return;
  const canvas = document.getElementById('video-canvas');
  const btn = document.getElementById('play-btn');

  if (slideshowTimer) {
    clearInterval(slideshowTimer);
    slideshowTimer = null;
    btn.textContent = '▶ Play Preview';
    return;
  }

  currentSlide = 0;
  btn.textContent = '⏸ Pause';

  slideshowTimer = setInterval(() => {
    if (currentSlide >= videoScenes.length) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
      btn.textContent = '▶ Play Preview';
      currentSlide = 0;
      return;
    }
    drawSlide(canvas, videoScenes[currentSlide], currentSlide);
    currentSlide++;
  }, 2000);
}

function exportMP4() {
  if (!videoScenes.length) { showToast('Generate scenes first', 'error'); return; }

  // Canvas to image frames download (browser-based export)
  showToast('Exporting frames... In full version, FFmpeg creates MP4.', 'success');

  const canvas = document.getElementById('video-canvas');
  let frame = 0;

  const exportTimer = setInterval(() => {
    if (frame >= videoScenes.length) {
      clearInterval(exportTimer);
      showToast('Frames exported ✓ — Use FFmpeg: ffmpeg -r 1 -i frame%d.png output.mp4', 'success');
      return;
    }
    drawSlide(canvas, videoScenes[frame], frame);
    const link = document.createElement('a');
    link.download = `frame${frame}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    frame++;
  }, 300);
}

/* ════════════════════════════════════
   ④ PROMPT LIBRARY
════════════════════════════════════ */

const PROMPTS = [
  {
    category: "video", catLabel: "Video Ads", catClass: "cat-video",
    title: "30-Second Product Ad",
    text: "Create a 30-second video ad script for [PRODUCT]. Target audience: [AUDIENCE]. Tone: energetic and persuasive. Include: hook (0-5s), problem (5-10s), solution reveal (10-20s), features (20-25s), CTA (25-30s). Add b-roll suggestions for each scene."
  },
  {
    category: "video", catLabel: "Video Ads", catClass: "cat-video",
    title: "Explainer Video Script",
    text: "Write a 60-second explainer video script for [CONCEPT/PRODUCT]. Use the Problem-Agitate-Solution framework. Keep language simple. Include narrator lines, on-screen text suggestions, and scene descriptions. End with a clear CTA."
  },
  {
    category: "image", catLabel: "Image Gen", catClass: "cat-image",
    title: "Photorealistic Product Shot",
    text: "Photorealistic product photography of [PRODUCT], studio lighting, white seamless background, shallow depth of field, 85mm lens, 4K resolution, commercial quality, shot from slight 3/4 angle, subtle shadow, ultra-detailed"
  },
  {
    category: "image", catLabel: "Image Gen", catClass: "cat-image",
    title: "Futuristic Tech Scene",
    text: "Cinematic futuristic [SCENE], neon blue and cyan lighting, rain-slicked surfaces, holographic displays, cyberpunk aesthetic, ultra-detailed, volumetric fog, 8K resolution, hyperrealistic, dramatic perspective, inspired by Blade Runner 2049"
  },
  {
    category: "image", catLabel: "Image Gen", catClass: "cat-image",
    title: "Engineering Blueprint",
    text: "Technical engineering blueprint of [OBJECT/MACHINE], clean vector style, dark navy background, cyan/white lines, precise measurements labeled, isometric view, professional CAD aesthetic, high contrast"
  },
  {
    category: "youtube", catLabel: "YouTube", catClass: "cat-youtube",
    title: "YouTube Tutorial Hook",
    text: "Write the first 60 seconds (hook + intro) for a YouTube tutorial about [TOPIC]. Start with a shocking fact or bold claim. Tease what viewers will learn. Promise a transformation. Be conversational. End the intro with a reason to keep watching."
  },
  {
    category: "youtube", catLabel: "YouTube", catClass: "cat-youtube",
    title: "Full YouTube Script",
    text: "Write a complete 5-minute YouTube video script about [TOPIC] for [CHANNEL NICHE]. Include: title, hook, intro (60s), 3 main sections with transitions, viewer engagement question, CTA for likes/subscribe, outro. Add timestamps and B-roll suggestions."
  },
  {
    category: "social", catLabel: "Social Media", catClass: "cat-social",
    title: "LinkedIn Thought Leadership",
    text: "Write a high-engagement LinkedIn post about [INSIGHT/LESSON] from my experience as [PROFESSION]. Use short punchy lines. Start with a controversial or bold statement. Share a personal story. End with a question to drive comments. 150-200 words. Add relevant hashtags."
  },
  {
    category: "social", catLabel: "Social Media", catClass: "cat-social",
    title: "Instagram Caption with CTA",
    text: "Write an Instagram caption for a [TYPE OF POST] about [TOPIC]. Tone: [casual/inspiring/educational]. Include: 2-line hook, main value (3-4 lines), call-to-action ('save this', 'tag a friend', 'link in bio'), 15-20 targeted hashtags in the first comment section."
  },
  {
    category: "social", catLabel: "Social Media", catClass: "cat-social",
    title: "Twitter/X Thread",
    text: "Write a 10-tweet thread about [TOPIC]. Tweet 1: bold hook/claim. Tweets 2-9: one insight each (max 280 chars), use numbering. Tweet 10: summary + CTA. Make it educational and shareable. Separate each tweet with [TWEET X]."
  },
  {
    category: "video", catLabel: "Video Ads", catClass: "cat-video",
    title: "Social Media Reel Script",
    text: "Write a 15-second Instagram/TikTok Reel script for [BRAND/TOPIC]. Hook in first 2 seconds (bold visual + text). Fast-cut scenes (3s each). Trending audio suggestion. Text overlays for each scene. End with logo and CTA. High energy, Gen-Z friendly."
  },
  {
    category: "youtube", catLabel: "YouTube", catClass: "cat-youtube",
    title: "Thumbnail & Title Ideas",
    text: "Generate 10 viral YouTube title and thumbnail combinations for a video about [TOPIC]. For each: write the title (curiosity-driven, under 60 chars), describe the thumbnail (expression, text overlay, background, colors). Include CTR-optimization tips."
  }
];

/** Render prompt library cards */
function renderPrompts(filter = 'all') {
  const grid = document.getElementById('prompt-grid');
  grid.innerHTML = '';

  const filtered = filter === 'all' ? PROMPTS : PROMPTS.filter(p => p.category === filter);

  filtered.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.innerHTML = `
      <span class="prompt-category ${p.catClass}">${p.catLabel}</span>
      <div class="prompt-title">${p.title}</div>
      <div class="prompt-text">${p.text}</div>
      <div class="prompt-actions">
        <button class="prompt-use-btn" onclick="copyPrompt(${idx})">⎘ Copy</button>
        <button class="prompt-use-btn" onclick="usePrompt(${idx})" style="background:var(--bg3);color:var(--text);border:1px solid var(--border2)">
          Use in Text AI →
        </button>
      </div>`;
    grid.appendChild(card);
  });
}

function copyPrompt(idx) {
  navigator.clipboard.writeText(PROMPTS[idx].text);
  showToast('Prompt copied ✓');
}

function usePrompt(idx) {
  document.getElementById('text-prompt').value = PROMPTS[idx].text;
  goTo('text');
  showToast('Prompt loaded in Text AI ✓');
}

// Prompt filter click
document.getElementById('prompt-filter').addEventListener('click', e => {
  if (!e.target.classList.contains('chip')) return;
  document.querySelectorAll('#prompt-filter .chip').forEach(c => c.classList.remove('active'));
  e.target.classList.add('active');
  renderPrompts(e.target.dataset.filter);
});

renderPrompts(); // Initial render

/* ════════════════════════════════════
   ⑤ UNIT CONVERTER
════════════════════════════════════ */

const UNITS = {
  length: {
    units: ['Meter (m)', 'Kilometer (km)', 'Centimeter (cm)', 'Millimeter (mm)', 'Mile (mi)', 'Foot (ft)', 'Inch (in)', 'Yard (yd)', 'Nautical Mile'],
    toBase: [1, 1000, 0.01, 0.001, 1609.344, 0.3048, 0.0254, 0.9144, 1852],
    ref: [['1 meter', '3.281 ft'], ['1 km', '0.621 mi'], ['1 mile', '1.609 km'], ['1 foot', '30.48 cm'], ['1 inch', '2.54 cm']]
  },
  weight: {
    units: ['Kilogram (kg)', 'Gram (g)', 'Milligram (mg)', 'Pound (lb)', 'Ounce (oz)', 'Ton (metric)', 'Short Ton (US)'],
    toBase: [1, 0.001, 0.000001, 0.453592, 0.028350, 1000, 907.185],
    ref: [['1 kg', '2.205 lb'], ['1 lb', '453.6 g'], ['1 ton', '1000 kg'], ['1 oz', '28.35 g']]
  },
  temp: {
    units: ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)'],
    toBase: null, // special handling
    ref: [['0°C', '32°F / 273K'], ['100°C', '212°F / 373K'], ['37°C', '98.6°F (body)']]
  },
  area: {
    units: ['m²', 'km²', 'cm²', 'Hectare', 'Acre', 'ft²', 'in²', 'mi²'],
    toBase: [1, 1e6, 0.0001, 10000, 4046.86, 0.092903, 0.00064516, 2589988],
    ref: [['1 hectare', '10,000 m²'], ['1 acre', '4,047 m²'], ['1 km²', '100 ha']]
  },
  volume: {
    units: ['Liter (L)', 'Milliliter (mL)', 'm³', 'cm³', 'Gallon (US)', 'Quart', 'Pint', 'Cup', 'fl oz'],
    toBase: [1, 0.001, 1000, 0.001, 3.78541, 0.946353, 0.473176, 0.236588, 0.029574],
    ref: [['1 gallon', '3.785 L'], ['1 L', '33.81 fl oz'], ['1 m³', '1000 L']]
  },
  speed: {
    units: ['m/s', 'km/h', 'mph', 'knot', 'ft/s', 'Mach (sea level)'],
    toBase: [1, 0.27778, 0.44704, 0.51444, 0.3048, 343],
    ref: [['1 km/h', '0.621 mph'], ['1 knot', '1.852 km/h'], ['Speed of sound', '343 m/s']]
  },
  pressure: {
    units: ['Pascal (Pa)', 'kPa', 'Bar', 'PSI', 'atm', 'mmHg', 'Torr'],
    toBase: [1, 1000, 100000, 6894.76, 101325, 133.322, 133.322],
    ref: [['1 atm', '101.325 kPa'], ['1 bar', '100 kPa'], ['1 PSI', '6.895 kPa']]
  },
  energy: {
    units: ['Joule (J)', 'kJ', 'kWh', 'Calorie', 'kcal', 'BTU', 'eV'],
    toBase: [1, 1000, 3600000, 4.184, 4184, 1055.06, 1.60218e-19],
    ref: [['1 kWh', '3,600 kJ'], ['1 kcal', '4,184 J'], ['1 BTU', '1,055 J']]
  },
  power: {
    units: ['Watt (W)', 'Kilowatt (kW)', 'MW', 'Horsepower (hp)', 'BTU/hr', 'ft·lb/s'],
    toBase: [1, 1000, 1e6, 745.7, 0.29307, 1.35582],
    ref: [['1 hp', '745.7 W'], ['1 kW', '1,000 W'], ['1 MW', '1,000 kW']]
  }
};

function updateConvUnits() {
  const type   = document.getElementById('conv-type').value;
  const data   = UNITS[type];
  const fromEl = document.getElementById('conv-from');
  const toEl   = document.getElementById('conv-to');

  fromEl.innerHTML = data.units.map((u, i) => `<option value="${i}">${u}</option>`).join('');
  toEl.innerHTML   = data.units.map((u, i) => `<option value="${i}" ${i === 1 ? 'selected' : ''}>${u}</option>`).join('');

  renderRefTable(type);
  convertUnit();
}

function convertUnit() {
  const type  = document.getElementById('conv-type').value;
  const val   = parseFloat(document.getElementById('conv-value').value);
  const fromI = parseInt(document.getElementById('conv-from').value);
  const toI   = parseInt(document.getElementById('conv-to').value);
  const resEl = document.getElementById('conv-result-val');

  if (isNaN(val)) { resEl.textContent = '—'; return; }

  const data = UNITS[type];
  let result;

  if (type === 'temp') {
    result = convertTemp(val, fromI, toI);
  } else {
    const base = val * data.toBase[fromI];
    result = base / data.toBase[toI];
  }

  resEl.textContent = formatNum(result) + ' ' + data.units[toI].replace(/\(.*\)/, '').trim();
}

function convertTemp(val, fromI, toI) {
  // Convert to Celsius first
  let c;
  if      (fromI === 0) c = val;
  else if (fromI === 1) c = (val - 32) * 5/9;
  else                  c = val - 273.15;
  // Convert to target
  if      (toI === 0) return c;
  else if (toI === 1) return c * 9/5 + 32;
  else                return c + 273.15;
}

function formatNum(n) {
  if (Math.abs(n) >= 1e9)      return n.toExponential(4);
  if (Math.abs(n) < 0.0001 && n !== 0) return n.toExponential(4);
  if (Number.isInteger(n))     return n.toLocaleString();
  return parseFloat(n.toPrecision(8)).toLocaleString(undefined, { maximumFractionDigits: 8 });
}

function renderRefTable(type) {
  const data = UNITS[type];
  const el   = document.getElementById('ref-table');
  if (!data.ref) { el.innerHTML = '<span style="color:var(--text3)">No quick reference available</span>'; return; }
  el.innerHTML = `<div style="color:var(--text3);font-size:0.7rem;letter-spacing:.08em;margin-bottom:.5rem">QUICK REFERENCE</div>` +
    data.ref.map(([a, b]) => `<div class="ref-row"><span>${a}</span><span>= ${b}</span></div>`).join('');
}

// Init converter
updateConvUnits();

/* ════════════════════════════════════
   ⑤b ENGINEERING CALCULATOR
════════════════════════════════════ */

const CALC_CONFIGS = {
  ohm: {
    fields: [
      { id: 'ohm-v', label: 'Voltage (V) — leave blank to calculate', unit: 'V' },
      { id: 'ohm-i', label: 'Current (A) — leave blank to calculate', unit: 'A' },
      { id: 'ohm-r', label: 'Resistance (Ω) — leave blank to calculate', unit: 'Ω' }
    ],
    formula: 'V = I × R    |    I = V/R    |    R = V/I'
  },
  power: {
    fields: [
      { id: 'pw-p',  label: 'Power (P) — leave blank to calculate', unit: 'W' },
      { id: 'pw-i',  label: 'Current I (A)', unit: 'A' },
      { id: 'pw-v',  label: 'Voltage V (V)', unit: 'V' }
    ],
    formula: 'P = I × V    |    I = P/V    |    V = P/I'
  },
  area: {
    fields: [
      { id: 'ar-shape', label: 'Shape', type: 'select', options: ['Rectangle', 'Circle', 'Triangle', 'Trapezoid'] },
      { id: 'ar-a', label: 'Dimension A (length / radius / base)', unit: 'm' },
      { id: 'ar-b', label: 'Dimension B (width / height / height)', unit: 'm' }
    ],
    formula: 'Rect: A = l×w    Circle: A = π×r²    Triangle: A = ½×b×h'
  },
  bmi: {
    fields: [
      { id: 'bmi-w', label: 'Weight', unit: 'kg' },
      { id: 'bmi-h', label: 'Height', unit: 'm' }
    ],
    formula: 'BMI = weight(kg) / height(m)²'
  },
  percent: {
    fields: [
      { id: 'pct-part', label: 'Part value', unit: '' },
      { id: 'pct-total', label: 'Total value', unit: '' }
    ],
    formula: 'Percentage = (Part / Total) × 100'
  }
};

function renderCalc() {
  const type   = document.getElementById('calc-type').value;
  const config = CALC_CONFIGS[type];
  const form   = document.getElementById('calc-form');
  const fb     = document.getElementById('formula-box');

  form.innerHTML = config.fields.map(f => {
    if (f.type === 'select') {
      return `<div class="calc-field"><label class="label">${f.label}</label>
        <select class="select-input" id="${f.id}">${f.options.map(o => `<option>${o}</option>`).join('')}</select></div>`;
    }
    return `<div class="calc-field"><label class="label">${f.label}${f.unit ? ' (' + f.unit + ')' : ''}</label>
      <input type="number" class="select-input" id="${f.id}" placeholder="Enter value..." /></div>`;
  }).join('');

  fb.innerHTML = `<b>Formula:</b><br>${config.formula}`;
}

function getVal(id) { return parseFloat(document.getElementById(id)?.value); }

function runCalc() {
  const type = document.getElementById('calc-type').value;
  const resEl = document.getElementById('calc-result');
  let result = '—';

  try {
    if (type === 'ohm') {
      const V = getVal('ohm-v'), I = getVal('ohm-i'), R = getVal('ohm-r');
      if (!isNaN(I) && !isNaN(R)) result = `V = ${formatNum(I * R)} Volts`;
      else if (!isNaN(V) && !isNaN(R)) result = `I = ${formatNum(V / R)} Amperes`;
      else if (!isNaN(V) && !isNaN(I)) result = `R = ${formatNum(V / I)} Ohms`;
      else result = 'Enter any two values';

    } else if (type === 'power') {
      const P = getVal('pw-p'), I = getVal('pw-i'), V = getVal('pw-v');
      if (!isNaN(I) && !isNaN(V)) result = `P = ${formatNum(I * V)} Watts`;
      else if (!isNaN(P) && !isNaN(V)) result = `I = ${formatNum(P / V)} Amperes`;
      else if (!isNaN(P) && !isNaN(I)) result = `V = ${formatNum(P / I)} Volts`;
      else result = 'Enter any two values';

    } else if (type === 'area') {
      const shape = document.getElementById('ar-shape')?.value;
      const a = getVal('ar-a'), b = getVal('ar-b');
      if (isNaN(a)) { result = 'Enter Dimension A'; }
      else if (shape === 'Circle')    result = `Area = ${formatNum(Math.PI * a * a)} m²`;
      else if (shape === 'Triangle')  result = `Area = ${formatNum(0.5 * a * b)} m²`;
      else                            result = `Area = ${formatNum(a * b)} m²`;

    } else if (type === 'bmi') {
      const w = getVal('bmi-w'), h = getVal('bmi-h');
      if (!isNaN(w) && !isNaN(h) && h > 0) {
        const bmi = w / (h * h);
        const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
        result = `BMI = ${formatNum(bmi)}\n(${cat})`;
      }

    } else if (type === 'percent') {
      const part = getVal('pct-part'), total = getVal('pct-total');
      if (!isNaN(part) && !isNaN(total) && total !== 0) {
        result = `${formatNum((part / total) * 100)}%`;
      }
    }
  } catch (e) { result = 'Calculation error'; }

  resEl.textContent = result;
}

renderCalc(); // Init calculator

/* ════════════════════════════════════
   ⑤c TEXT TOOLS
════════════════════════════════════ */

function updateTextStats() {
  const text = document.getElementById('tt-input').value;
  document.getElementById('stat-words').textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById('stat-chars').textContent = text.length;
  document.getElementById('stat-lines').textContent = text.split('\n').length;
  document.getElementById('stat-sents').textContent = (text.match(/[.!?]+/g) || []).length;
}

function transformText(mode) {
  const input  = document.getElementById('tt-input').value;
  const output = document.getElementById('tt-output');

  if (!input.trim()) { showToast('Enter text first', 'error'); return; }

  let result = input;

  switch (mode) {
    case 'upper':   result = input.toUpperCase(); break;
    case 'lower':   result = input.toLowerCase(); break;
    case 'title':   result = input.replace(/\b\w/g, c => c.toUpperCase()); break;
    case 'camel':   result = input.trim().split(/[\s_-]+/).map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()).join(''); break;
    case 'snake':   result = input.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''); break;
    case 'trim':    result = input.split('\n').map(l => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n'); break;
    case 'reverse': result = input.split('').reverse().join(''); break;
    case 'slug':    result = input.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); break;
  }

  output.innerHTML = '';
  output.textContent = result;
  showToast('Text transformed ✓');
}

/* ════════════════════════════════════
   TOOLS TAB SWITCHING
════════════════════════════════════ */

function showTool(id) {
  document.querySelectorAll('.tool-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tool-' + id).classList.add('active');
  event.target.classList.add('active');
}

/* ════════════════════════════════════
   UTILITY
════════════════════════════════════ */
const sleep = ms => new Promise(r => setTimeout(r, ms));
