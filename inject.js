/* App.Autopsy inject.js v5
   Hover  → dashed outline + panel preview
   Dblclick → solid outline + capture visual + full dissection (all roles)
   Results locked until next double-click
*/
(function () {
  'use strict';
  if (window.__APP_AUTOPSY) { alert('App.Autopsy is already active!'); return; }
  window.__APP_AUTOPSY = true;

  const ORIGIN = 'https://autopsy-ik.vercel.app';
  const SITE   = location.hostname.replace(/^www\./, '');

  /* ── IFRAME ────────────────────────────────────────────────────── */
  const iframe = document.createElement('iframe');
  iframe.id  = '__aa-iframe';
  iframe.src = ORIGIN + '/panel.html?v=' + Date.now();
  iframe.setAttribute('style', [
    'position:fixed!important',
    'top:68px!important',
    'right:0!important',
    'width:370px!important',
    'height:calc(100vh - 76px)!important',
    'min-height:460px!important',
    'border:none!important',
    'border-radius:16px 0 0 16px!important',
    'box-shadow:-12px 0 56px rgba(0,0,0,0.28)!important',
    'z-index:2147483647!important',
    'overflow:hidden!important'
  ].join(';'));
  document.body.appendChild(iframe);

  /* ── STATE ─────────────────────────────────────────────────────── */
  let ready    = false;
  let queue    = [];
  let hlEl     = null;
  let lockedEl = null;

  /* ── MESSAGING ─────────────────────────────────────────────────── */
  function send(msg) {
    if (!ready) { queue.push(msg); return; }
    try { iframe.contentWindow.postMessage(msg, ORIGIN); } catch (_) {}
  }
  function onMsg(e) {
    if (e.origin !== ORIGIN) return;
    if (e.data.type === 'ready') {
      ready = true;
      send({ type: 'init', site: SITE, title: document.title.slice(0, 60) });
      queue.forEach(m => { try { iframe.contentWindow.postMessage(m, ORIGIN); } catch(_){} });
      queue = [];
    }
    if (e.data.type === 'close') shutdown();
  }
  window.addEventListener('message', onMsg);

  /* ── HOVER ─────────────────────────────────────────────────────── */
  function onHover(e) {
    const el = e.target;
    if (!el || el.nodeType !== 1 || el === iframe) return;
    if (el === lockedEl) return;
    if (hlEl && hlEl !== el && hlEl !== lockedEl) clearHL(hlEl);
    setHL(el, 'dash');
    hlEl = el;
    send({ type: 'preview', d: describe(el), site: SITE });
  }
  document.addEventListener('mouseover', onHover, true);

  /* ── DOUBLE-CLICK ───────────────────────────────────────────────── */
  function onDblClick(e) {
    const el = e.target;
    if (!el || el.nodeType !== 1 || el === iframe) return;
    if (lockedEl && lockedEl !== el) clearHL(lockedEl);
    lockedEl = el;
    hlEl = el;
    setHL(el, 'solid');

    const d       = describe(el);
    const visual  = captureVisual(el);
    send({ type: 'analyze', d, site: SITE, title: document.title.slice(0, 60), visual });
  }
  document.addEventListener('dblclick', onDblClick, true);

  /* ── CAPTURE VISUAL (no external libs) ─────────────────────────── */
  function captureVisual(el) {
    try {
      const styles = window.getComputedStyle(el);
      const rect   = el.getBoundingClientRect();

      /* If element IS an image — grab src */
      if (el.tagName === 'IMG' && el.src) {
        return { type: 'img', src: el.src, alt: el.alt || '' };
      }

      /* If element CONTAINS a prominent image */
      const imgs = el.querySelectorAll('img');
      if (imgs.length) {
        const best = Array.from(imgs).sort((a,b) =>
          (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight)
        )[0];
        if (best && best.src) {
          return { type: 'img', src: best.src, alt: best.alt || '' };
        }
      }

      /* CSS visual snapshot */
      const bg     = styles.backgroundColor;
      const fg     = styles.color;
      const hasBg  = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
      const border = styles.borderRadius;
      const text   = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').replace(/\s+/g,' ').trim().slice(0, 120);
      const fSize  = parseFloat(styles.fontSize) || 14;

      return {
        type:     'snapshot',
        tag:      el.tagName.toLowerCase(),
        human:    describe(el).humanType,
        text,
        bg:       hasBg ? bg : null,
        fg,
        radius:   border,
        fontSize: Math.min(fSize, 18) + 'px',
        fw:       styles.fontWeight,
        w:        Math.round(rect.width),
        h:        Math.round(rect.height)
      };
    } catch(_) {
      return null;
    }
  }

  /* ── HIGHLIGHT ─────────────────────────────────────────────────── */
  function setHL(el, mode) {
    try {
      if (mode === 'dash') {
        el.style.setProperty('outline', '2px dashed #DC2626', 'important');
        el.style.setProperty('outline-offset', '2px', 'important');
        el.style.removeProperty('box-shadow');
      } else {
        el.style.setProperty('outline', '2.5px solid #DC2626', 'important');
        el.style.setProperty('outline-offset', '2px', 'important');
        el.style.setProperty('box-shadow', '0 0 0 5px rgba(220,38,38,0.14)', 'important');
      }
    } catch (_) {}
  }
  function clearHL(el) {
    try {
      el.style.removeProperty('outline');
      el.style.removeProperty('outline-offset');
      el.style.removeProperty('box-shadow');
    } catch (_) {}
  }

  /* ── SHUTDOWN ───────────────────────────────────────────────────── */
  function shutdown() {
    if (hlEl)     clearHL(hlEl);
    if (lockedEl) clearHL(lockedEl);
    iframe.remove();
    document.removeEventListener('mouseover', onHover, true);
    document.removeEventListener('dblclick', onDblClick, true);
    window.removeEventListener('message', onMsg);
    delete window.__APP_AUTOPSY;
  }

  /* ── DESCRIBE ELEMENT ───────────────────────────────────────────── */
  function describe(el) {
    const tag = el.tagName.toLowerCase();
    const TYPE = {
      img:'Image', input:'Input field', button:'Button', a:'Link',
      select:'Dropdown', textarea:'Text area', form:'Form',
      nav:'Navigation', header:'Header', footer:'Footer',
      video:'Video player', audio:'Audio player', dialog:'Dialog/Popup',
      h1:'Heading', h2:'Heading', h3:'Heading', h4:'Heading',
      ul:'List', ol:'Numbered list', li:'List item',
      table:'Table', p:'Paragraph', span:'Text element',
      main:'Main content', section:'Section', article:'Article',
      aside:'Sidebar', figure:'Image block', svg:'Icon/SVG'
    };
    let humanType = TYPE[tag] || tag;
    const role = el.getAttribute('role') || '';
    if (role === 'button')     humanType = 'Button';
    if (role === 'navigation') humanType = 'Navigation';
    if (role === 'search')     humanType = 'Search';
    if (role === 'banner')     humanType = 'Header/Banner';
    if (role === 'dialog')     humanType = 'Dialog/Popup';
    if (role === 'tab')        humanType = 'Tab';
    if (role === 'slider')     humanType = 'Slider';
    if (role === 'checkbox')   humanType = 'Checkbox';
    if (role === 'listbox')    humanType = 'List selector';

    const aria = el.getAttribute('aria-label') || el.getAttribute('title') || '';
    let text = '';
    if (tag === 'img')        text = el.alt || aria || '[image]';
    else if (tag === 'input') text = el.placeholder || aria || el.type + ' input';
    else                      text = (el.innerText || aria || '').replace(/\s+/g,' ').trim().slice(0, 90);
    if (!text && aria) text = aria;

    let section = '';
    let p = el.parentElement;
    for (let i = 0; i < 8 && p && p.tagName !== 'BODY'; i++) {
      const c = p.getAttribute('aria-label') ||
        (p.id && p.id.length > 2 && !/^\d/.test(p.id) ? p.id.replace(/[-_]/g,' ') : '') ||
        p.getAttribute('data-section') || '';
      if (c && c.length > 2 && c.length < 56) { section = c; break; }
      p = p.parentElement;
    }
    return { tag, humanType, text: text.slice(0, 90), section };
  }

})();
