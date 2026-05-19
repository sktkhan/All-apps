/**
 * =====================================================
 * AKHTAR ENGINEERING HUB — CONFIG
 * =====================================================
 * Add your API keys here.
 * For GitHub Pages: use demo mode (no keys needed).
 * For Replit / local server: add real keys below.
 * =====================================================
 */

const AEH_CONFIG = {

  // ── ANTHROPIC (Claude AI) ──────────────────────────
  // Get a free key at: https://console.anthropic.com
  // For GitHub Pages deployment, leave as "" to use demo mode
  ANTHROPIC_API_KEY: "",

  // ── UNSPLASH (Free image API) ─────────────────────
  // Get free key at: https://unsplash.com/developers
  UNSPLASH_ACCESS_KEY: "",

  // ── PICSUM (Always-free placeholder images) ───────
  // No key needed — used as image fallback
  USE_PICSUM_FALLBACK: true,

  // ── DEMO MODE ─────────────────────────────────────
  // true  = use built-in demo responses (no API keys)
  // false = use real APIs (requires keys above)
  DEMO_MODE: true,    // ← flip to false when you have keys

  // ── BACKEND URL ───────────────────────────────────
  // If running Node.js server locally:
  BACKEND_URL: "http://localhost:3000",

  // ── APP SETTINGS ──────────────────────────────────
  APP_NAME: "Akhtar Engineering Hub",
  VERSION:  "1.0.0"
};

// Auto-detect: if keys are present, disable demo mode
if (AEH_CONFIG.ANTHROPIC_API_KEY && AEH_CONFIG.ANTHROPIC_API_KEY.length > 10) {
  AEH_CONFIG.DEMO_MODE = false;
}
