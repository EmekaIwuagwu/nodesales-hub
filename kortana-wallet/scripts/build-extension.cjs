/**
 * Kortana Wallet — Chrome Extension Build Script
 *
 * Problem: Next.js static export produces:
 *   - A `_next/` directory (forbidden by Chrome — underscore prefix is reserved)
 *   - Absolute paths like `/next/static/...` (break in extension:// context)
 *   - Inline <script> blocks (forbidden by Chrome ManifestV3 CSP)
 *
 * This script fixes all three issues after `next build`.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outDir = path.resolve(__dirname, '../out');

// ─────────────────────────────────────────────
// STEP 1 — Build
// ─────────────────────────────────────────────
console.log('\n[1/5] Building Next.js project...');
execSync('npm run build', { stdio: 'inherit' });
console.log('✓ Build complete.\n');

// ─────────────────────────────────────────────
// STEP 2 — Rename _next → next
// ─────────────────────────────────────────────
console.log('[2/5] Renaming _next → next ...');

function renameUnderscoreDirs(dir) {
    // Process deepest-first to avoid renaming a parent before its children
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) renameUnderscoreDirs(fullPath);
    }
    for (const item of fs.readdirSync(dir)) {
        if (item.startsWith('_') && item !== '_locales') {
            const oldPath = path.join(dir, item);
            const newName = item.replace(/^_+/, '');
            const newPath = path.join(dir, newName);
            if (fs.existsSync(newPath)) {
                fs.rmSync(newPath, { recursive: true, force: true });
            }
            fs.renameSync(oldPath, newPath);
            console.log(`  Renamed: ${item} → ${newName}`);
        }
    }
}
renameUnderscoreDirs(outDir);
console.log('✓ Rename done.\n');

// ─────────────────────────────────────────────
// STEP 3 — Fix all absolute paths → relative
// ─────────────────────────────────────────────
console.log('[3/5] Patching absolute paths → relative ...');

function walkFiles(dir, callback) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            walkFiles(fullPath, callback);
        } else {
            callback(fullPath);
        }
    }
}

const EXTENSIONS_TO_PATCH = ['.html', '.js', '.css', '.txt', '.json'];

walkFiles(outDir, (filePath) => {
    if (!EXTENSIONS_TO_PATCH.some(ext => filePath.endsWith(ext))) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // The depth of this file relative to outDir — we need the right number of "../"
    const relativeDirFromOut = path.relative(outDir, path.dirname(filePath));
    const depth = relativeDirFromOut === '' ? 0 : relativeDirFromOut.split(path.sep).length;
    const prefix = depth === 0 ? './' : '../'.repeat(depth);

    // Replace all absolute references to /next/... → ./next/... (or with proper depth)
    // Also catch /_next (if the rename didn't catch all string references in JS)
    content = content
        // Absolute paths with leading slash: "/next/..." → "./next/..." (or depth-relative)
        .replace(/(?<=['"(\s,])\/next\//g, `${prefix}next/`)
        // Also handle /_next (fallback in case any JS still references it)
        .replace(/(?<=['"(\s,])\/_next\//g, `${prefix}next/`)
        // href="/next and src="/next patterns in HTML attributes
        .replace(/(href|src)="\/next\//g, `$1="${prefix}next/`)
        .replace(/(href|src)="\/_next\//g, `$1="${prefix}next/`)
        // CSS url() references
        .replace(/url\(\/next\//g, `url(${prefix}next/`)
        .replace(/url\(\/_next\//g, `url(${prefix}next/`)
        // /images/ references
        .replace(/(href|src)="\/images\//g, `$1="${prefix}images/`)
        // /not-found paths
        .replace(/\/_not-found/g, `${prefix}not-found`)
        // Bare /next/ in JS strings (e.g. JSON, JS template literals)
        .replace(/"\/next\//g, `"${prefix}next/`);

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  Patched: ${path.relative(outDir, filePath)}`);
    }
});
console.log('✓ Path patching done.\n');

// ─────────────────────────────────────────────
// STEP 4 — Extract inline scripts (CSP fix)
// ─────────────────────────────────────────────
console.log('[4/5] Extracting inline scripts for CSP compliance ...');

walkFiles(outDir, (filePath) => {
    if (!filePath.endsWith('.html')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const fileDir = path.dirname(filePath);
    const baseName = path.basename(filePath, '.html');
    let counter = 0;

    const patched = content.replace(
        /<script(?![^>]*\bsrc\b)([^>]*)>([\s\S]*?)<\/script>/gi,
        (match, attrs, body) => {
            if (!body.trim()) return match;
            counter++;
            const scriptName = `${baseName}-inline-${counter}.js`;
            fs.writeFileSync(path.join(fileDir, scriptName), body, 'utf8');
            console.log(`  Extracted: ${scriptName}`);
            return `<script src="./${scriptName}"${attrs}></script>`;
        }
    );

    if (patched !== content) {
        fs.writeFileSync(filePath, patched, 'utf8');
    }
});
console.log('✓ CSP extraction done.\n');

// ─────────────────────────────────────────────
// STEP 5 — Patch Next.js path-assertion invariants in JS
// ─────────────────────────────────────────────
console.log('[5/5] Patching Next.js runtime path assertions ...');

walkFiles(outDir, (filePath) => {
    if (!filePath.endsWith('.js')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Next.js (Turbopack) does a startsWith / indexOf check on the script src
    // to ensure assets are loaded from the expected prefix. In a chrome-extension://
    // context the URL does not start with "/" so we patch the assertion away.
    content = content
        .replace(/if\(-1===([a-zA-Z0-9_$]+)\.indexOf\("(?:\.\/|\/)?next\/"\)\)/g,
            'if(false)')
        .replace(/if\(-1===([a-zA-Z0-9_$]+)\)throw/g,
            'if(false&&-1===$1)throw');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  Patched invariant: ${path.relative(outDir, filePath)}`);
    }
});
console.log('✓ Invariant patching done.\n');

// ─────────────────────────────────────────────
// STEP 6 — Inject popup sizing into index.html
// Chrome measures popup size from the DOM before JS runs.
// We inject a <style> block that hard-codes 420×600 into the root.
// ─────────────────────────────────────────────
console.log('[6/6] Injecting extension popup sizing ...');

const indexHtml = path.join(outDir, 'index.html');
if (fs.existsSync(indexHtml)) {
    let html = fs.readFileSync(indexHtml, 'utf8');

    const popupStyle = `
<style id="ext-popup-sizing">
  /* Chrome Extension Popup: force 420×600 so the popup is a proper size */
  html, body {
    width: 420px !important;
    min-width: 420px !important;
    max-width: 420px !important;
    height: 600px !important;
    min-height: 600px !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #0a0e27 !important;
  }
  main {
    width: 420px !important;
    height: 600px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
</style>`;

    // Inject right after <head>
    if (!html.includes('id="ext-popup-sizing"')) {
        html = html.replace('<head>', '<head>' + popupStyle);
        fs.writeFileSync(indexHtml, html, 'utf8');
        console.log('  ✓ Popup sizing injected into index.html');
    } else {
        console.log('  (already injected, skipping)');
    }
}
console.log('✓ Sizing injection done.\n');

// ─────────────────────────────────────────────
// DONE
// ─────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════');
console.log('  Extension build complete!');
console.log('  → Load the "out/" folder in chrome://extensions/');
console.log('  → Popup will be 420×600px');
console.log('═══════════════════════════════════════════════════\n');

