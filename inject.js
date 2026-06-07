/* App.Autopsy — Live Website Overlay v2 */
(function () {
  'use strict';
  if (window.__APP_AUTOPSY) { alert('App.Autopsy is already active on this page!'); return; }
  window.__APP_AUTOPSY = true;

  const API = 'https://autopsy-ik.vercel.app/api/chat';
  const SITE = location.hostname.replace(/^www\./, '');
  const PAGE_TITLE = document.title.slice(0, 50);

  /* ─── CSS ─────────────────────────────────────────────────────── */
  const css = `
    #__aa{position:fixed!important;top:72px!important;right:0!important;width:340px!important;
      max-height:88vh!important;background:#ffffff!important;
      border-left:4px solid #DC2626!important;
      border-radius:16px 0 0 16px!important;
      box-shadow:-8px 4px 32px rgba(0,0,0,.22)!important;
      z-index:2147483647!important;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif!important;
      font-size:14px!important;line-height:1.5!important;color:#111!important;
      display:flex!important;flex-direction:column!important;overflow:hidden!important;
      transition:transform .3s cubic-bezier(.4,0,.2,1)!important;}
    #__aa.aa-min{transform:translateX(296px)!important;}
    #__aa *{box-sizing:border-box!important;font-family:inherit!important;}

    /* header */
    #__aa-hdr{background:#111827!important;padding:11px 14px!important;
      display:flex!important;align-items:center!important;justify-content:space-between!important;
      flex-shrink:0!important;cursor:pointer!important;user-select:none!important;}
    #__aa-brand{color:#fff!important;font-weight:800!important;font-size:14px!important;
      display:flex!important;align-items:center!important;gap:7px!important;}
    #__aa-brand em{color:#DC2626!important;font-style:normal!important;}
    #__aa-sitebadge{background:rgba(220,38,38,.22)!important;color:#fca5a5!important;
      font-size:10px!important;font-weight:800!important;padding:2px 8px!important;border-radius:10px!important;}
    .aa-hbtn{background:rgba(255,255,255,.12)!important;border:none!important;color:#fff!important;
      width:26px!important;height:26px!important;border-radius:6px!important;cursor:pointer!important;
      font-size:14px!important;display:flex!important;align-items:center!important;justify-content:center!important;}
    .aa-hbtn:hover{background:rgba(255,255,255,.24)!important;}

    /* body */
    #__aa-body{flex:1!important;overflow-y:auto!important;padding:16px!important;scroll-behavior:smooth!important;}

    /* idle */
    #__aa-idle{text-align:center!important;padding:20px 8px!important;}
    .aa-idle-icon{font-size:40px!important;margin-bottom:12px!important;}
    .aa-idle-title{font-weight:900!important;font-size:15px!important;color:#111!important;margin-bottom:8px!important;}
    .aa-idle-sub{font-size:13px!important;color:#888!important;line-height:1.7!important;}
    .aa-idle-tip{margin-top:12px!important;background:#F7F5F1!important;border-radius:10px!important;
      padding:10px!important;font-size:12px!important;color:#666!important;line-height:1.6!important;text-align:left!important;}

    /* element preview */
    #__aa-el{display:none!important;background:#F7F5F1!important;border-radius:10px!important;
      padding:10px 12px!important;margin-bottom:12px!important;border-left:3px solid #DC2626!important;}
    #__aa-el-name{font-weight:800!important;color:#111!important;font-size:13px!important;}
    #__aa-el-ctx{font-size:11px!important;color:#888!important;margin-top:3px!important;}

    /* loading */
    #__aa-load{display:none!important;text-align:center!important;padding:20px!important;}
    .aa-spin{font-size:32px!important;display:inline-block!important;
      animation:aaSpin 1.1s linear infinite!important;margin-bottom:8px!important;}
    @keyframes aaSpin{to{transform:rotate(360deg)!important;}}
    .aa-load-text{font-size:13px!important;color:#888!important;}

    /* results */
    #__aa-res{display:none!important;}
    .aa-rb{padding:12px 0!important;border-bottom:1px solid #F0F0F0!important;}
    .aa-rb:last-child{border-bottom:none!important;padding-bottom:4px!important;}
    .aa-rn{display:flex!important;align-items:center!important;gap:7px!important;
      font-weight:800!important;font-size:14px!important;color:#111!important;margin-bottom:5px!important;}
    .aa-rd{font-size:13px!important;color:#555!important;line-height:1.65!important;}
    .aa-gpill{font-size:10px!important;font-weight:900!important;padding:2px 8px!important;
      border-radius:10px!important;margin-left:auto!important;}

    /* error */
    .aa-err{background:#FEF2F2!important;border-radius:8px!important;padding:12px!important;
      color:#DC2626!important;font-size:13px!important;font-weight:700!important;line-height:1.6!important;}

    /* chat */
    #__aa-chat{border-top:1.5px solid #F0F0F0!important;padding:12px!important;
      background:#FAFAFA!important;flex-shrink:0!important;display:none!important;}
    #__aa-hist{max-height:130px!important;overflow-y:auto!important;margin-bottom:10px!important;}
    .aa-qmsg{background:#111827!important;color:#fff!important;font-size:12px!important;
      padding:7px 10px!important;border-radius:8px 8px 2px 8px!important;margin-bottom:6px!important;text-align:right!important;}
    .aa-amsg{background:#F0F0F0!important;color:#333!important;font-size:12px!important;
      padding:7px 10px!important;border-radius:2px 8px 8px 8px!important;margin-bottom:6px!important;line-height:1.6!important;}
    #__aa-row{display:flex!important;gap:8px!important;}
    #__aa-inp{flex:1!important;padding:9px 12px!important;border-radius:8px!important;
      border:1.5px solid #E5E5E5!important;font-size:13px!important;
      background:#fff!important;outline:none!important;color:#111!important;}
    #__aa-inp:focus{border-color:#DC2626!important;}
    #__aa-send{background:#111827!important;color:#fff!important;border:none!important;
      border-radius:8px!important;padding:9px 14px!important;cursor:pointer!important;
      font-size:12px!important;font-weight:800!important;white-space:nowrap!important;}
    #__aa-send:hover{background:#1f2937!important;}

    /* highlight */
    .aa-hl{outline:2.5px solid #DC2626!important;outline-offset:2px!important;
      box-shadow:0 0 0 4px rgba(220,38,38,.12)!important;}
  `;

  const styleEl = document.createElement('style');
  styleEl.id = '__aa-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ─── PANEL ───────────────────────────────────────────────────── */
  const panel = document.createElement('div');
  panel.id = '__aa';
  panel.innerHTML = `
    <div id="__aa-hdr">
      <div id="__aa-brand">🔬 App<em>.</em>Autopsy <span id="__aa-sitebadge">${SITE}</span></div>
      <div style="display:flex;gap:6px;" onclick="event.stopPropagation()">
        <button class="aa-hbtn" id="__aa-minbtn" title="Minimize">−</button>
        <button class="aa-hbtn" title="Close" onclick="__aaClose()">✕</button>
      </div>
    </div>
    <div id="__aa-body">
      <div id="__aa-idle">
        <div class="aa-idle-icon">🖱️</div>
        <div class="aa-idle-title">Hover to dissect</div>
        <div class="aa-idle-sub">Move your cursor over <strong>any element</strong> on this page — button, image, menu, search bar, anything — and I'll show you which tech roles built it.</div>
        <div class="aa-idle-tip">
          🕐 <strong>Hold for 0.6s</strong> to trigger analysis<br>
          💬 Ask follow-up questions in the chat below<br>
          📌 Click elements to lock the panel open
        </div>
      </div>
      <div id="__aa-el">
        <div id="__aa-el-name"></div>
        <div id="__aa-el-ctx"></div>
      </div>
      <div id="__aa-load">
        <div class="aa-spin">🔬</div>
        <div class="aa-load-text">Dissecting this element…</div>
      </div>
      <div id="__aa-res"></div>
    </div>
    <div id="__aa-chat">
      <div id="__aa-hist"></div>
      <div id="__aa-row">
        <input id="__aa-inp" placeholder="Ask anything about this…" autocomplete="off"
          onkeydown="if(event.key==='Enter')__aaAsk()">
        <button id="__aa-send" onclick="__aaAsk()">Ask →</button>
      </div>
    </div>`;
  document.body.appendChild(panel);

  /* ─── STATE ───────────────────────────────────────────────────── */
  let hlEl = null, timer = null, ctx = null, conv = [], isMin = false, locked = false;

  /* ─── HEADER CONTROLS ─────────────────────────────────────────── */
  document.getElementById('__aa-hdr').onclick = toggleMin;
  document.getElementById('__aa-minbtn').onclick = (e) => { e.stopPropagation(); toggleMin(); };

  function toggleMin() {
    isMin = !isMin;
    panel.classList.toggle('aa-min', isMin);
    document.getElementById('__aa-minbtn').textContent = isMin ? '+' : '−';
  }

  function __aaClose() {
    clearTimeout(timer);
    if (hlEl) hlEl.classList.remove('aa-hl');
    panel.remove();
    styleEl.remove();
    document.removeEventListener('mouseover', onHover, true);
    document.removeEventListener('click', onClick, true);
    delete window.__APP_AUTOPSY;
    delete window.__aaClose;
    delete window.__aaAsk;
  }
  window.__aaClose = __aaClose;

  /* ─── CLICK TO LOCK ───────────────────────────────────────────── */
  function onClick(e) {
    if (e.target.closest('#__aa')) return;
    if (!locked) {
      locked = true;
      analyze(e.target, describe(e.target));
    } else {
      locked = false;
    }
  }
  document.addEventListener('click', onClick, true);

  /* ─── HOVER ───────────────────────────────────────────────────── */
  function onHover(e) {
    if (e.target.closest('#__aa') || isMin || locked) return;
    clearTimeout(timer);
    const d = describe(e.target);
    showPreview(e.target, d);
    timer = setTimeout(() => analyze(e.target, d), 620);
  }
  document.addEventListener('mouseover', onHover, true);

  /* ─── DESCRIBE ELEMENT ────────────────────────────────────────── */
  function describe(el) {
    const tag = el.tagName.toLowerCase();
    let text = '';
    let humanType = '';
    const typeMap = {
      img:'Image', input:'Input field', button:'Button', a:'Link',
      select:'Dropdown', form:'Form', nav:'Navigation',
      header:'Header section', footer:'Footer section',
      video:'Video player', audio:'Audio player',
      h1:'Heading',h2:'Heading',h3:'Heading',h4:'Heading',
      ul:'List',li:'List item',table:'Data table',
      textarea:'Text area',span:'Text label',p:'Paragraph'
    };
    humanType = typeMap[tag] || el.getAttribute('role') || 'Section';
    if (el.getAttribute('role') === 'button') humanType = 'Button';
    if (el.getAttribute('role') === 'navigation') humanType = 'Navigation';

    const ariaLabel = el.getAttribute('aria-label') || el.getAttribute('title') || '';
    if (tag === 'img') text = el.alt || ariaLabel || 'image';
    else if (tag === 'input') text = el.placeholder || ariaLabel || el.type + ' input';
    else if (tag === 'a' || tag === 'button') text = (el.innerText || ariaLabel || '').trim().slice(0, 90);
    else text = (el.innerText || '').replace(/\s+/g,' ').trim().slice(0, 90);
    if (!text && ariaLabel) text = ariaLabel;

    // Find nearest meaningful section
    let section = '';
    let p = el.parentElement;
    for (let i = 0; i < 7 && p && p !== document.body; i++) {
      const cand = p.getAttribute('aria-label') || p.getAttribute('data-section') ||
        (p.id && p.id.length > 2 && p.id.length < 50 ? p.id.replace(/[-_]/g,' ') : '');
      if (cand && cand.length > 2) { section = cand; break; }
      p = p.parentElement;
    }

    return { tag, humanType, text: text.slice(0, 90), section };
  }

  /* ─── SHOW PREVIEW ────────────────────────────────────────────── */
  function showPreview(el, d) {
    document.getElementById('__aa-idle').style.display = 'none';
    const elEl = document.getElementById('__aa-el');
    elEl.style.display = 'block';
    const display = d.text
      ? `"${d.text.slice(0,55)}${d.text.length>55?'…':''}"`
      : `<${d.tag}>`;
    document.getElementById('__aa-el-name').textContent = `${d.humanType}: ${display}`;
    document.getElementById('__aa-el-ctx').textContent = d.section
      ? `📍 Inside: ${d.section}`
      : `← ${d.tag} element on ${SITE}`;

    // Highlight
    if (hlEl && hlEl !== el) hlEl.classList.remove('aa-hl');
    el.classList.add('aa-hl');
    hlEl = el;
  }

  /* ─── ANALYZE ─────────────────────────────────────────────────── */
  async function analyze(el, d) {
    ctx = `${d.humanType}: "${d.text}"${d.section ? ', inside "' + d.section + '"' : ''}`;
    conv = [];
    document.getElementById('__aa-load').style.display = 'block';
    document.getElementById('__aa-res').style.display = 'none';
    document.getElementById('__aa-chat').style.display = 'none';

    const elDesc = [
      `Element: ${d.humanType} (HTML tag: <${d.tag}>)`,
      d.text ? `Visible text / content: "${d.text}"` : '',
      d.section ? `This element lives inside section: "${d.section}"` : '',
      `Page: ${PAGE_TITLE} on ${SITE}`
    ].filter(Boolean).join('\n');

    const prompt = `A non-tech person is browsing ${SITE} and hovered over this element:
${elDesc}

Explain in very simple language (like talking to someone who knows nothing about tech):
Which 4-5 tech roles from the list below helped build this SPECIFIC element, and exactly what they did for it?
Be specific to "${d.text || d.humanType}" on ${SITE} — don't be generic.

Return ONLY a valid JSON array, no other text, no markdown:
[
  {
    "emoji": "🎨",
    "role": "Frontend Engineer",
    "group": "Builders",
    "contribution": "1-2 sentences in very simple everyday language about what they specifically did for this element on ${SITE}"
  }
]

Choose from these roles only (pick the most relevant 4-5):
Frontend Engineer (🎨, group:Builders), Backend Engineer (⚙️, group:Builders), Full Stack Engineer (🔄, group:Builders),
iOS Engineer (🍎, group:Builders), Android Engineer (🤖, group:Builders), Test/QA Engineer (🧪, group:Builders),
Machine Learning Engineer (🧠, group:Data), Data Engineer (🚰, group:Data), Data Scientist (🔬, group:Data), Data/Business Analyst (📈, group:Data),
Engineering Manager (👷, group:Leaders), Technical Program Manager (📋, group:Leaders), Product Manager (💡, group:Leaders),
Cloud Architect (☁️, group:Ops), Site Reliability Engineer (🔧, group:Ops), Cybersecurity Engineer (🔒, group:Ops), DevOps Engineer (🚀, group:Ops)`;

    try {
      const resp = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: 'You explain tech roles to people with zero tech background. Use everyday simple language. Return ONLY valid JSON arrays — no markdown, no backticks, no extra text.',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);

      let raw = data.content[0].text.trim()
        .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const roles = JSON.parse(raw);
      conv = [{ role: 'user', content: prompt }, { role: 'assistant', content: JSON.stringify(roles) }];

      document.getElementById('__aa-load').style.display = 'none';
      const resEl = document.getElementById('__aa-res');
      resEl.innerHTML = renderRoles(roles, d);
      resEl.style.display = 'block';
      document.getElementById('__aa-chat').style.display = 'block';
      document.getElementById('__aa-hist').innerHTML = '';

    } catch (e) {
      document.getElementById('__aa-load').style.display = 'none';
      document.getElementById('__aa-res').innerHTML = `<div class="aa-err">⚠️ ${esc(e.message.length < 200 ? e.message : 'Analysis failed. Check that ANTHROPIC_API_KEY is set in Vercel → Settings → Environment Variables.')}</div>`;
      document.getElementById('__aa-res').style.display = 'block';
    }
  }

  /* ─── RENDER ROLES ────────────────────────────────────────────── */
  const GP = { Builders:'#3B82F6', Data:'#10B981', Leaders:'#8B5CF6', Ops:'#F59E0B' };
  function renderRoles(roles, d) {
    const header = `<div style="font-size:11px;font-weight:900;color:#AAA;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px;">
      Who built: "${(d.text||d.humanType).slice(0,40)}"
    </div>`;
    const cards = roles.map(r => {
      const c = GP[r.group] || '#6B7280';
      return `<div class="aa-rb">
        <div class="aa-rn">
          <span style="font-size:18px;">${r.emoji}</span>
          <strong>${esc(r.role)}</strong>
          ${r.group ? `<span class="aa-gpill" style="background:${c}18;color:${c};">${r.group}</span>` : ''}
        </div>
        <div class="aa-rd">${esc(r.contribution)}</div>
      </div>`;
    }).join('');
    return header + cards;
  }

  /* ─── CHAT ────────────────────────────────────────────────────── */
  async function __aaAsk() {
    const inp = document.getElementById('__aa-inp');
    const q = inp.value.trim();
    if (!q) return;
    inp.value = '';
    const hist = document.getElementById('__aa-hist');
    hist.innerHTML += `<div class="aa-qmsg">${esc(q)}</div>`;
    const thinking = document.createElement('div');
    thinking.className = 'aa-amsg';
    thinking.textContent = '💭 …';
    hist.appendChild(thinking);
    hist.scrollTop = hist.scrollHeight;

    conv.push({ role: 'user', content: q });
    try {
      const resp = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 450,
          system: `You are App.Autopsy. Answer in simple, friendly language with zero jargon. User is on ${SITE}. ${ctx ? 'They are looking at: ' + ctx + '.' : ''} Keep answers short and clear.`,
          messages: conv
        })
      });
      const data = await resp.json();
      const reply = data.content[0].text;
      conv.push({ role: 'assistant', content: reply });
      thinking.textContent = reply;
    } catch (e) {
      thinking.textContent = '⚠️ Request failed.';
    }
    hist.scrollTop = hist.scrollHeight;
  }
  window.__aaAsk = __aaAsk;

  /* ─── UTILS ───────────────────────────────────────────────────── */
  function esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

})();
