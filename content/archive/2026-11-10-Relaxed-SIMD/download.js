// Download button: zips the post body (the rendered Markdown) as a bare, unstyled
// index.html, plus the post's scripts and screenshot, with links rewritten so the
// copy runs from the unzipped folder.
(() => {
  const $ = id => document.getElementById(id);
  const setStatus = text => { $('download-status').textContent = text; };

  function save(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  // Base name for the saved files, from the last path segment of the page URL.
  const baseName = (location.pathname.split('/').filter(Boolean).pop() || 'page')
    .replace(/\.html?$/i, '') || 'page';

  // The page source as the server sent it, not the live DOM, so it carries no probe results.
  async function fetchSource() {
    const res = await fetch(location.href, { cache: 'no-store' });
    if (!res.ok) throw new Error('page fetch failed (' + res.status + ')');
    return res.text();
  }

  // --- Minimal ZIP writer (store, no compression) ---
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  // files: [{ name: string, data: Uint8Array }]
  function makeZip(files) {
    const enc = new TextEncoder();
    const d = new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    const chunks = [];
    const central = [];
    let offset = 0;

    for (const file of files) {
      const name = enc.encode(file.name);
      const crc = crc32(file.data);
      const size = file.data.length;

      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034B50, true); // local file header signature
      local.setUint16(4, 20, true);         // version needed
      local.setUint16(6, 0x0800, true);     // flags: UTF-8 names
      local.setUint16(8, 0, true);          // method: store
      local.setUint16(10, time, true);
      local.setUint16(12, date, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, size, true);      // compressed size
      local.setUint32(22, size, true);      // uncompressed size
      local.setUint16(26, name.length, true);
      local.setUint16(28, 0, true);         // extra length
      chunks.push(local.buffer, name, file.data);

      const cen = new DataView(new ArrayBuffer(46));
      cen.setUint32(0, 0x02014B50, true);   // central directory signature
      cen.setUint16(4, 0x0314, true);       // version made by: Unix, spec 2.0 (so unzip applies the mode)
      cen.setUint16(6, 20, true);           // version needed
      cen.setUint16(8, 0x0800, true);
      cen.setUint16(10, 0, true);
      cen.setUint16(12, time, true);
      cen.setUint16(14, date, true);
      cen.setUint32(16, crc, true);
      cen.setUint32(20, size, true);
      cen.setUint32(24, size, true);
      cen.setUint16(28, name.length, true);
      cen.setUint32(38, ((file.name.endsWith('.sh') ? 0o100755 : 0o100644) << 16) >>> 0, true); // Unix file mode
      cen.setUint32(42, offset, true);      // local header offset (other fields stay 0)
      central.push(cen.buffer, name);

      offset += 30 + name.length + size;
    }

    const centralSize = central.reduce((n, part) => n + part.byteLength, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054B50, true);     // end of central directory signature
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);
    return new Blob([...chunks, ...central, end.buffer], { type: 'application/zip' });
  }

  // Folder of the current page, e.g. "/archive/relaxed-simd/".
  const pageDir = new URL('./', location.href);

  // Files shipped next to index.html in the zip.
  const BUNDLE = ['avx-probe.js', 'probe-ui.js', 'download.js', 'sw.js', 'macos-liberalwolf.png', 'serve.sh'];

  // The post body only (the rendered Markdown), without the site theme around it.
  // The post's own <script src="avx-probe.js"> sits inside the rendered Markdown,
  // so its parent element is the post content container.
  function postHtml(doc) {
    const anchor = doc.querySelector('script[src$="avx-probe.js"]');
    if (!anchor) throw new Error('post content not found');
    const body = anchor.parentElement;
    for (const el of body.querySelectorAll('img[src], script[src]')) {
      const attr = 'src';
      const name = new URL(el.getAttribute(attr), location.href).pathname.split('/').pop();
      if (BUNDLE.includes(name)) el.setAttribute(attr, name);
      el.removeAttribute('srcset');
    }
    const title = doc.querySelector('h1')?.textContent.trim() || doc.title;
    const h1 = doc.createElement('h1');
    h1.textContent = title;
    return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<title>' + h1.innerHTML + '</title>\n</head>\n<body>\n' +
      h1.outerHTML + '\n' + body.innerHTML + '\n</body>\n</html>\n';
  }

  $('download-zip').addEventListener('click', async () => {
    try {
      setStatus('Preparing...');
      const doc = new DOMParser().parseFromString(await fetchSource(), 'text/html');
      const files = [{ name: 'index.html', data: new TextEncoder().encode(postHtml(doc)) }];

      const missing = [];
      await Promise.all(BUNDLE.map(async name => {
        try {
          const res = await fetch(new URL(name, pageDir));
          if (!res.ok) throw new Error(res.status);
          files.push({ name, data: new Uint8Array(await res.arrayBuffer()) });
        } catch {
          missing.push(name);
        }
      }));

      save(makeZip(files), baseName + '.zip');
      setStatus(missing.length ? 'Saved; skipped: ' + missing.join(', ') : '');
    } catch (e) {
      setStatus('✗ ' + e.message);
    }
  });
})();
