/**
 * Kortana Wallet — Chrome Extension Build Script (v3)
 *
 * Fixes applied after `next build`:
 *  1. Rename _next/ → next/ (Chrome blocks underscore-prefixed dirs)
 *  2. Patch absolute /next/ paths → relative ./next/ paths in all files
 *  3. Extract inline <script> blocks to .js files (MV3 CSP)
 *  4. Patch Turbopack's getAssetPrefix() — uses document.currentScript
 *     which is NULL for async scripts in extensions → blank popup
 *  5. Inject popup sizing CSS (420×600) and base-URL script into index.html
 */

'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outDir = path.resolve(__dirname, '../out');

// ── helpers ───────────────────────────────────────────────────────────────────
function walkFiles(dir, cb) {
    for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        fs.statSync(full).isDirectory() ? walkFiles(full, cb) : cb(full);
    }
}

// ── STEP 1: build ─────────────────────────────────────────────────────────────
console.log('\n[1/5] Building Next.js ...');
execSync('npm run build', { stdio: 'inherit' });
console.log('✓ Build done.\n');

// ── STEP 2: rename _next → next ───────────────────────────────────────────────
console.log('[2/5] Renaming underscore dirs ...');

function renameDirs(dir) {
    // recurse depth-first so children are processed before parents
    for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) renameDirs(full);
    }
    for (const item of fs.readdirSync(dir)) {
        if (item.startsWith('_') && item !== '_locales') {
            const src = path.join(dir, item);
            const dst = path.join(dir, item.replace(/^_+/, ''));
            if (fs.existsSync(dst)) fs.rmSync(dst, { recursive: true, force: true });
            fs.renameSync(src, dst);
            console.log(`  ${item} → ${path.basename(dst)}`);
        }
    }
}
renameDirs(outDir);
console.log('✓ Rename done.\n');

// ── STEP 3: absolute-path fix ─────────────────────────────────────────────────
console.log('[3/5] Patching absolute paths ...');

walkFiles(outDir, (file) => {
    if (!/\.(html|js|css|txt|json)$/.test(file)) return;

    const raw = fs.readFileSync(file, 'utf8');

    // depth from outDir → determines how many "../" to prepend
    const rel = path.relative(outDir, path.dirname(file));
    const depth = rel === '' ? 0 : rel.split(path.sep).length;
    const p = depth === 0 ? './' : '../'.repeat(depth);

    const fixed = raw
        .replace(/(href|src)="\/next\//g, `$1="${p}next/`)
        .replace(/(href|src)="\/_next\//g, `$1="${p}next/`)
        .replace(/url\(\/next\//g, `url(${p}next/`)
        .replace(/url\(\/_next\//g, `url(${p}next/`)
        .replace(/(href|src)="\/images\//g, `$1="${p}images/`)
        .replace(/\/_not-found/g, `${p}not-found`)
        .replace(/"\/next\//g, `"${p}next/`);

    if (fixed !== raw) {
        fs.writeFileSync(file, fixed, 'utf8');
        console.log(`  ${path.relative(outDir, file)}`);
    }
});
console.log('✓ Path patching done.\n');

// ── STEP 4: extract inline scripts ────────────────────────────────────────────
console.log('[4/5] Extracting inline scripts ...');

walkFiles(outDir, (file) => {
    if (!file.endsWith('.html')) return;

    const raw = fs.readFileSync(file, 'utf8');
    const dir = path.dirname(file);
    const base = path.basename(file, '.html');
    let n = 0;

    const out = raw.replace(
        /<script(?![^>]*\bsrc\b)([^>]*)>([\s\S]*?)<\/script>/gi,
        (_, attrs, body) => {
            if (!body.trim()) return _;
            const name = `${base}-inline-${++n}.js`;
            fs.writeFileSync(path.join(dir, name), body, 'utf8');
            return `<script src="./${name}"${attrs}></script>`;
        }
    );

    if (out !== raw) {
        fs.writeFileSync(file, out, 'utf8');
        console.log(`  ${path.relative(outDir, file)} (${n} scripts)`);
    }
});
console.log('✓ CSP extraction done.\n');

// ── STEP 5: patch Turbopack runtime + inject sizing ───────────────────────────
console.log('[5/5] Patching runtime & injecting popup sizing ...');

/*
 * THE ROOT CAUSE OF THE BLANK POPUP:
 *
 * Turbopack generates a function like this in ff523c3d*.js:
 *
 *   function l() {
 *     let e = document.currentScript;   // ← NULL for async="" scripts!
 *     …
 *     let n = t.indexOf("/_next/");
 *     return t.slice(0, n);            // n=-1 → returns "" → wrong base
 *   }
 *
 * When getAssetPrefix() returns "" every dynamic chunk load resolves to
 * the wrong URL and React never mounts → black popup.
 *
 * We find the function using a brace-counting parser (works regardless of
 * what inner strings the minifier produces) and replace it.
 */
const PATCHED_FN =
    'function l(){' +
    'if(typeof chrome!=="undefined"&&chrome.runtime&&chrome.runtime.getURL){' +
    'return chrome.runtime.getURL("/")}' +
    'var sc=document.currentScript;' +
    'if(!sc||!sc.src){return window.__EXT_BASE__||"./"}' +
    'var u=new URL(sc.src);var i=u.pathname.indexOf("/next/");' +
    'if(i===-1){i=u.pathname.lastIndexOf("/")+1}' +
    'return u.origin+u.pathname.slice(0,i)}';

let patchedFiles = 0;

walkFiles(outDir, (file) => {
    if (!file.endsWith('.js')) return;

    let src = fs.readFileSync(file, 'utf8');
    const orig = src;

    // ── patch getAssetPrefix (brace-count method — works on any minification) ──
    const NEEDLE = 'function l(){let e=document.currentScript';
    const start = src.indexOf(NEEDLE);
    if (start !== -1) {
        let depth = 0, i = start, end = -1;
        while (i < src.length) {
            if (src[i] === '{') depth++;
            else if (src[i] === '}') { if (--depth === 0) { end = i + 1; break; } }
            i++;
        }
        if (end !== -1) {
            src = src.slice(0, start) + PATCHED_FN + src.slice(end);
            console.log(`  ✓ Patched getAssetPrefix: ${path.relative(outDir, file)}`);
        }
    }

    // ── patch the Turbopack chunk-base variable ──
    // Matches:  let t="../../../next/"
    src = src.replace(
        /\blet t="\.\.\/\.\.\/\.\.\/next\/"/g,
        `let t=(typeof chrome!=="undefined"&&chrome.runtime&&chrome.runtime.getURL)?chrome.runtime.getURL("next/"):"./next/"`
    );

    // ── patch throw-guards ──
    src = src
        .replace(/if\(-1===([A-Za-z0-9_$]+)\.indexOf\("(?:\.\/|\/)?next\/"\)\)/g, 'if(false)')
        .replace(/if\(-1===([A-Za-z0-9_$]+)\)throw/g, 'if(false&&-1===$1)throw');

    if (src !== orig) {
        fs.writeFileSync(file, src, 'utf8');
        patchedFiles++;
    }
});

// ── inject popup sizing + base-URL script into index.html ──
// IMPORTANT: Chrome MV3 CSP blocks ALL inline <script> content.
// The base-URL helper must be a separate .js file referenced via src=.
const indexHtml = path.join(outDir, 'index.html');
if (fs.existsSync(indexHtml)) {
    let html = fs.readFileSync(indexHtml, 'utf8');

    if (!html.includes('id="ext-sizing"')) {
        // Write the chrome.runtime base helper as a standalone JS file
        const extBaseJs = path.join(outDir, 'ext-base.js');
        fs.writeFileSync(extBaseJs,
            '// Chrome Extension base URL helper\n' +
            '// Must run BEFORE any Turbopack chunks load\n' +
            'if(typeof chrome!=="undefined"&&chrome.runtime&&chrome.runtime.getURL){\n' +
            '  window.__EXT_BASE__=chrome.runtime.getURL("/");\n' +
            '}\n',
            'utf8'
        );
        console.log('  ✓ Wrote ext-base.js');

        // Inject: <style> for sizing + <script src=ext-base.js> (no inline JS!)
        const inject =
            '<style id="ext-sizing">' +
            'html,body{width:420px!important;min-width:420px!important;max-width:420px!important;' +
            'height:600px!important;min-height:600px!important;overflow:hidden!important;' +
            'margin:0!important;padding:0!important;background:#0a0e27!important}' +
            'main{width:420px!important;height:600px!important;overflow-y:auto!important;overflow-x:hidden!important}' +
            '</style>' +
            '<script src="./ext-base.js"></script>';   // ← NO inline JS = CSP safe

        html = html.replace('<head>', '<head>' + inject);
        fs.writeFileSync(indexHtml, html, 'utf8');
        console.log('  ✓ Popup sizing + ext-base.js injected into index.html');
    }
}

console.log(`✓ Done (${patchedFiles} JS files patched).\n`);
console.log('═══════════════════════════════════════════════════');
console.log('  Extension build complete!');
console.log('  Load the "out/" folder in chrome://extensions/');
console.log('  Popup: 420 × 600 px');
console.log('═══════════════════════════════════════════════════\n');

