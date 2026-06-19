import fs from 'node:fs';
import path from 'node:path';

const distRoot = path.join(process.cwd(), 'dist');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function injectBeforeBodyEnd(html, snippet) {
  if (html.includes('id="fcaCrossHostLoginPatch"')) return html;
  return html.replace('</body>', `${snippet}\n</body>`);
}

const crossHostSnippet = `<script id="fcaCrossHostLoginPatch">(function(){
  function readRecordCookie(){
    try {
      var m = document.cookie.match(/(?:^|; )fca_customer_record=([^;]+)/);
      if (!m) return null;
      return JSON.parse(decodeURIComponent(m[1]));
    } catch { return null; }
  }

  function writeRecordCookie(record){
    try {
      var payload = encodeURIComponent(JSON.stringify(record || {}));
      var base = 'fca_customer_record=' + payload + '; path=/; max-age=31536000; SameSite=Lax';
      document.cookie = base;
      if ((location.hostname || '').includes('futurecontractorsofamerica.com')) {
        document.cookie = base + '; domain=.futurecontractorsofamerica.com';
      }
    } catch {}
  }

  try {
    var local = JSON.parse(localStorage.getItem('fca_customer_record') || 'null');
    var fromCookie = readRecordCookie();
    if (!local && fromCookie && fromCookie.email) {
      localStorage.setItem('fca_customer_record', JSON.stringify(fromCookie));
    }
    if (local && local.email) {
      writeRecordCookie(local);
    }
  } catch {}
})();</script>`;

function patchSpaRoot() {
  const file = path.join(distRoot, 'index.html');
  if (!fs.existsSync(file)) return;
  let html = read(file);
  html = injectBeforeBodyEnd(html, crossHostSnippet);
  if (!html.includes('Cross-host login continuity patch active')) {
    html = html.replace('<body>', '<body><!-- Cross-host login continuity patch active -->');
  }
  write(file, html);
}

function patchLegacyLogin() {
  const file = path.join(distRoot, 'login', 'index.html');
  if (!fs.existsSync(file)) return;
  let html = read(file);
  html = injectBeforeBodyEnd(html, crossHostSnippet);
  write(file, html);
}

function patchLegacyIntake() {
  const file = path.join(distRoot, 'intake', 'index.html');
  if (!fs.existsSync(file)) return;
  let html = read(file);
  html = injectBeforeBodyEnd(html, crossHostSnippet);
  write(file, html);
}

function main() {
  if (!fs.existsSync(distRoot)) {
    throw new Error('dist directory does not exist. Run build first.');
  }

  patchSpaRoot();
  patchLegacyLogin();
  patchLegacyIntake();

  console.log('Patched SPA and legacy login/intake continuity markers.');
}

main();
