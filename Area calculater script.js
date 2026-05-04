/* =============================================
   SURVEYOR PRO — CAD Edition
   Core Logic: Calculation, Drawing, Sharing
   ============================================= */

// ---- CALCULATION ----
function calcArea() {
    const raw = document.getElementById('areaInput').value.trim();
    if (!raw) {
        resetDisplay();
        return;
    }

    const lines = raw.split('\n');
    const pts = [];

    lines.forEach(line => {
        const p = line.split(',');
        const e = parseFloat(p[0]);
        const n = parseFloat(p[1]);
        if (!isNaN(e) && !isNaN(n)) pts.push({ e, n });
    });

    // Update point count
    document.getElementById('valPts').innerText = pts.length >= 1 ? pts.length : '—';

    if (pts.length < 2) {
        document.getElementById('valArea').innerText = '—';
        document.getElementById('valPeri').innerText = '—';
        document.getElementById('valPts').innerText = pts.length >= 1 ? pts.length : '—';
        return;
    }

    // Shoelace formula for area
    let area = 0;
    let peri = 0;
    for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        area += pts[i].e * pts[j].n - pts[j].e * pts[i].n;
        peri += Math.hypot(pts[j].e - pts[i].e, pts[j].n - pts[i].n);
    }
    area = Math.abs(area / 2);

    document.getElementById('valArea').innerText = formatNum(area);
    document.getElementById('valPeri').innerText = formatNum(peri);

    if (pts.length >= 3) {
        document.getElementById('canvasEmpty').classList.add('hidden');
        drawAdvancedShape(pts, area, peri);
    }
}

function formatNum(v) {
    if (v >= 10000) return v.toFixed(1);
    if (v >= 100)   return v.toFixed(2);
    return v.toFixed(3);
}

function resetDisplay() {
    document.getElementById('valArea').innerText = '—';
    document.getElementById('valPeri').innerText = '—';
    document.getElementById('valPts').innerText  = '—';
    document.getElementById('canvasEmpty').classList.remove('hidden');
    const canvas = document.getElementById('areaCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ---- DRAWING ----
function drawAdvancedShape(pts, area, peri) {
    const canvas = document.getElementById('areaCanvas');
    const ctx = canvas.getContext('2d');

    // High-DPI setup
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // ---- Background & Grid ----
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    drawGrid(ctx, W, H);

    // ---- Coordinate mapping ----
    const pad = 60;
    const minE = Math.min(...pts.map(p => p.e));
    const maxE = Math.max(...pts.map(p => p.e));
    const minN = Math.min(...pts.map(p => p.n));
    const maxN = Math.max(...pts.map(p => p.n));
    const rangeE = maxE - minE || 1;
    const rangeN = maxN - minN || 1;
    const scale = Math.min((W - pad * 2) / rangeE, (H - pad * 2) / rangeN);

    const getX = e => pad + (e - minE) * scale;
    const getY = n => H - pad - (n - minN) * scale;

    // ---- Polygon Fill ----
    ctx.beginPath();
    pts.forEach((p, i) => {
        i === 0 ? ctx.moveTo(getX(p.e), getY(p.n)) : ctx.lineTo(getX(p.e), getY(p.n));
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.10)';
    ctx.fill();

    // ---- Polygon Stroke ----
    ctx.beginPath();
    pts.forEach((p, i) => {
        i === 0 ? ctx.moveTo(getX(p.e), getY(p.n)) : ctx.lineTo(getX(p.e), getY(p.n));
    });
    ctx.closePath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1e3a5f';
    ctx.setLineDash([]);
    ctx.stroke();

    // ---- Side Length Labels ----
    ctx.save();
    pts.forEach((p, i) => {
        const j = (i + 1) % pts.length;
        const x1 = getX(p.e), y1 = getY(p.n);
        const x2 = getX(pts[j].e), y2 = getY(pts[j].n);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const dist = Math.hypot(pts[j].e - p.e, pts[j].n - p.n);
        const ang  = Math.atan2(y2 - y1, x2 - x1);

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(ang);

        // White pill background
        const label = dist.toFixed(3) + ' m';
        ctx.font = '600 11px "Segoe UI", Arial, sans-serif';
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        roundRect(ctx, -tw / 2 - 4, -17, tw + 8, 14, 4);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, -6);
        ctx.restore();
    });
    ctx.restore();

    // ---- Vertex Points, Numbers & Angles ----
    pts.forEach((p, i) => {
        const j = (i + 1) % pts.length;
        const k = (i - 1 + pts.length) % pts.length;
        const x = getX(p.e);
        const y = getY(p.n);

        // Point dot
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Vertex number label
        ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'left';
        const numLabel = String(i + 1);
        const nw = ctx.measureText(numLabel).width;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        roundRect(ctx, x + 7, y - 19, nw + 8, 15, 4);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.fillText(numLabel, x + 11, y - 8);

        // Interior angle — correct formula using screen vectors
        const ax = getX(pts[k].e) - x;
        const ay = getY(pts[k].n) - y;
        const bx = getX(pts[j].e) - x;
        const by = getY(pts[j].n) - y;
        const dot = ax * bx + ay * by;
        const magA = Math.hypot(ax, ay);
        const magB = Math.hypot(bx, by);
        let angle = 0;
        if (magA > 0 && magB > 0) {
            angle = Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB)))) * 180 / Math.PI;
        }

        // Angle label (blue)
        const aLabel = Math.round(angle) + '°';
        ctx.font = 'italic 11px "Segoe UI", Arial, sans-serif';
        const aw = ctx.measureText(aLabel).width;
        ctx.textAlign = 'center';

        // Offset angle label away from vertex
        const bisAngle = Math.atan2(ay + by, ax + bx);
        const offX = -Math.cos(bisAngle) * 22;
        const offY = -Math.sin(bisAngle) * 22;

        ctx.fillStyle = 'rgba(219,234,254,0.85)';
        roundRect(ctx, x + offX - aw / 2 - 3, y + offY - 12, aw + 6, 13, 4);
        ctx.fill();
        ctx.fillStyle = '#1d4ed8';
        ctx.fillText(aLabel, x + offX, y + offY - 2);
    });

    // ---- Centre Area Label ----
    const cx = pts.reduce((s, p) => s + getX(p.e), 0) / pts.length;
    const cy = pts.reduce((s, p) => s + getY(p.n), 0) / pts.length;

    const areaText = formatNum(area) + ' m²';
    const periText = 'P: ' + formatNum(peri) + ' m';
    ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    const lw = Math.max(ctx.measureText(areaText).width, ctx.measureText(periText).width);

    ctx.fillStyle = 'rgba(30,58,95,0.85)';
    roundRect(ctx, cx - lw / 2 - 8, cy - 20, lw + 16, 38, 7);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(areaText, cx, cy - 4);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Segoe UI", Arial, sans-serif';
    ctx.fillText(periText, cx, cy + 12);

    // ---- North Arrow ----
    drawNorthArrow(ctx, W - 30, 30);
}

function drawGrid(ctx, W, H) {
    const step = 40;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.8;
    for (let x = 0; x <= W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
}

function drawNorthArrow(ctx, x, y) {
    const r = 14;
    ctx.save();
    ctx.translate(x, y);

    // Circle
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30,58,95,0.85)';
    ctx.fill();

    // Arrow
    ctx.beginPath();
    ctx.moveTo(0, -r + 3);
    ctx.lineTo(4, 2);
    ctx.lineTo(-4, 2);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    // N label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('N', 0, r - 3);
    ctx.restore();
}

// Helper: rounded rect path
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ---- SHARE (text + drawing image) ----
async function shareResult() {
    const area = document.getElementById('valArea').innerText;
    const peri = document.getElementById('valPeri').innerText;
    const pts  = document.getElementById('valPts').innerText;

    if (area === '—') {
        showResult('Enter coordinates first, then share.', false);
        return;
    }

    const text = `📐 Surveyor Pro Result\n\nArea:      ${area} m²\nPerimeter: ${peri} m\nVertices:  ${pts} points\n\n— Generated by Surveyor Pro App`;

    const canvas = document.getElementById('areaCanvas');

    // Try sharing image + text (supported on mobile)
    if (navigator.share) {
        try {
            // Convert canvas to blob
            canvas.toBlob(async (blob) => {
                if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'survey.png', { type: 'image/png' })] })) {
                    const file = new File([blob], 'survey_drawing.png', { type: 'image/png' });
                    await navigator.share({ title: 'Survey Result', text, files: [file] });
                } else {
                    // Fallback: share text only
                    await navigator.share({ title: 'Survey Result', text });
                }
            }, 'image/png');
        } catch (err) {
            if (err.name !== 'AbortError') {
                showResult('Share failed. Try downloading the drawing instead.', false);
            }
        }
    } else {
        // Desktop fallback: copy text + trigger download
        try {
            await navigator.clipboard.writeText(text);
            downloadCanvas();
            showResult('Results copied to clipboard. Drawing downloaded!', true);
        } catch {
            alert('Share not supported.\n\n' + text);
        }
    }
}

// ---- DOWNLOAD CANVAS ----
function downloadCanvas() {
    const canvas = document.getElementById('areaCanvas');
    const area = document.getElementById('valArea').innerText;
    if (area === '—') {
        showResult('Nothing to download yet. Enter coordinates first.', false);
        return;
    }
    const link = document.createElement('a');
    link.download = 'surveyor_pro_drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ---- CLEAR ----
function clearAll() {
    document.getElementById('areaInput').value = '';
    resetDisplay();
    document.getElementById('res13').innerHTML = '';
    document.getElementById('res13').className = 'result-box';
}

// ---- HELP PANEL ----
function toggleHelp() {
    const panel   = document.getElementById('helpPanel');
    const overlay = document.getElementById('helpOverlay');
    const isOpen  = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
    overlay.classList.toggle('open', !isOpen);
}

// ---- RESULT MESSAGE ----
function showResult(msg, success) {
    const box = document.getElementById('res13');
    box.textContent = msg;
    box.className = 'result-box' + (success !== false ? ' has-content' : '');
}
