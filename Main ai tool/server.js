/**
 * =====================================================
 * AKHTAR ENGINEERING HUB — NODE.JS BACKEND (server.js)
 * Simple Express server for PDF tools + API proxying
 * 
 * Run: node server.js
 * Port: 3000 by default
 * =====================================================
 */

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const multer  = require('multer');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));  // Serve frontend files

// ── FILE UPLOAD ──
const upload = multer({ dest: 'uploads/' });

// ══════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════

// Health check
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── TEXT GENERATION PROXY ──
// Forwards request to Anthropic API (keeps key server-side)
app.post('/api/generate-text', async (req, res) => {
  const { prompt, category, tone, length } = req.body;
  const API_KEY = process.env.ANTHROPIC_API_KEY || '';

  if (!API_KEY) {
    return res.status(400).json({ error: 'ANTHROPIC_API_KEY not set in environment' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: length === 'long' ? 1000 : 600,
        system: `You are an expert ${category} copywriter. Tone: ${tone}.`,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    res.json({ text: data.content?.[0]?.text || 'No response generated' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PDF MERGE (requires: npm install pdf-lib) ──
app.post('/api/pdf/merge', upload.array('files'), async (req, res) => {
  try {
    // Dynamic import to avoid error if pdf-lib not installed
    const { PDFDocument } = require('pdf-lib');
    const merged = await PDFDocument.create();

    for (const file of req.files) {
      const bytes  = fs.readFileSync(file.path);
      const doc    = await PDFDocument.load(bytes);
      const pages  = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
      fs.unlinkSync(file.path); // cleanup
    }

    const pdfBytes = await merged.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(Buffer.from(pdfBytes));

  } catch (err) {
    // pdf-lib not installed — return helpful message
    res.status(500).json({
      error: 'PDF tools require pdf-lib: run "npm install pdf-lib"',
      details: err.message
    });
  }
});

// ── SERVE FRONTEND ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── START ──
app.listen(PORT, () => {
  console.log(`\n⬡ Akhtar Engineering Hub — Backend`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Status:  http://localhost:${PORT}/api/status\n`);
});

module.exports = app;
