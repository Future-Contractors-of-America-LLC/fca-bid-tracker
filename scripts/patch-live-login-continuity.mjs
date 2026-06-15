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

function patchIntake() {
  const file = path.join(distRoot, 'intake', 'index.html');
  if (!fs.existsSync(file)) return;
  let html = read(file);

  const snippet = `<script id="fcaCrossHostLoginPatch">(function(){
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

  var form = document.getElementById('intakeForm');
  if (!form) return;

  form.addEventListener('submit', function(){
    try {
      var record = JSON.parse(localStorage.getItem('fca_customer_record') || '{}');
      if (record && record.email) writeRecordCookie(record);
    } catch {}
  }, true);
})();</script>`;

  html = injectBeforeBodyEnd(html, snippet);
  write(file, html);
}

function patchLogin() {
  const file = path.join(distRoot, 'login', 'index.html');
  if (!fs.existsSync(file)) return;
  let html = read(file);

  const snippet = `<script id="fcaCrossHostLoginPatch">(function(){
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
      var emailEl = document.getElementById('email');
      if (emailEl && !emailEl.value) emailEl.value = fromCookie.email;
    }
    if (local && local.email) {
      writeRecordCookie(local);
    }
  } catch {}
})();</script>`;

  html = injectBeforeBodyEnd(html, snippet);
  write(file, html);
}

function patchHomeBanner() {
  const file = path.join(distRoot, 'index.html');
  if (!fs.existsSync(file)) return;
  let html = read(file);

  const marker = '<span class="pill">Cross-host login continuity patch active</span>';
  if (!html.includes(marker)) {
    html = html.replace('</div><div class="cta-row">', `${marker}</div><div class="cta-row">`);
    write(file, html);
  }
}

function main() {
  if (!fs.existsSync(distRoot)) {
    throw new Error('dist directory does not exist. Run build first.');
  }

  patchIntake();
  patchLogin();
  patchHomeBanner();

  console.log('Patched dist login/intake continuity and homepage visibility marker.');
}

main();
