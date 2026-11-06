// Shared UI helpers for the tray panel and the settings window. No framework, no build step.
export const { invoke, Channel } = window.__TAURI__.core;
export const { listen } = window.__TAURI__.event;

export const english = !navigator.language.toLowerCase().startsWith('de');

const EN = {
  'Weave einrichten': 'Set up Weave',
  'Tragen Sie die Adresse Ihres Weave-Servers ein.': 'Enter the address of your Weave server.',
  'Einstellungen öffnen': 'Open settings',
  'Bei Weave anmelden': 'Sign in to Weave',
  'Die Anmeldung läuft über das SSO Ihrer Organisation im Browser.': "You sign in through your organisation's SSO in the browser.",
  'Anmelden': 'Sign in',
  'Anmeldung im Browser läuft …': 'Signing in in the browser …',
  'Abbrechen': 'Cancel',
  'Fragen': 'Ask',
  'Suchen': 'Search',
  'Alle Wissensräume': 'All knowledge spaces',
  'Verlauf leeren': 'Clear history',
  'Im Web öffnen': 'Open on the web',
  'Frühere Fragen im Web': 'Earlier questions on the web',
  'Einstellungen': 'Settings',
  'Frage an Weave …': 'Ask Weave …',
  'In Weave suchen …': 'Search Weave …',
  'Senden': 'Send',
  'Stopp': 'Stop',
  'Kein Agent verfügbar': 'No agent available',
  'Was möchten Sie wissen?': 'What would you like to know?',
  'Ein Agent liest die passenden Dokumente und antwortet in eigenen Worten – mit Quellen. Gut für Erklärungen, Abläufe und Zusammenfassungen; Folgefragen bauen aufeinander auf.': 'An agent reads the matching documents and answers in its own words – with sources. Good for explanations, procedures and summaries; follow-up questions build on each other.',
  'Findet passende Textstellen direkt in allen Wissensräumen, die Sie lesen dürfen – ohne KI-Antwort. Gut, um ein Dokument, einen Begriff oder eine Nummer schnell wiederzufinden.': 'Finds matching passages directly in every knowledge space you may read – no AI answer. Good for quickly finding a document, a term or a number again.',
  'Modus': 'Mode',
  'Ziehen zum Verschieben · Doppelklick: zurück zur Mitte': 'Drag to move · Double-click: back to the centre',
  'Keine Treffer.': 'No results.',
  'Öffnen': 'Open',
  'S. %@': 'p. %@',
  'Quellen': 'Sources',
  'Kennzeichnung der Antwort': 'Answer flag',
  'Wissensräume': 'Knowledge spaces',
  'ohne Wissensraum': 'no knowledge space',
  'Zusammenfassung': 'Summary',
  'Bereichs-Übersicht': 'Space overview',
  'Abgebrochen.': 'Stopped.',
  'Weave denkt nach …': 'Weave is thinking …',
  'Sitzung abgelaufen – bitte neu anmelden.': 'Session expired – please sign in again.',
  'Server': 'Server',
  'API-Adresse': 'API address',
  'Öffentliche Adresse von weave-api – dieselbe, auf die der Browser bei der Chat-Anmeldung weiterleitet (ohne /v1).': 'Public address of weave-api – the one the browser is sent to when signing in to the chat (without /v1).',
  'Verbindung testen': 'Test connection',
  'Erreichbar': 'Reachable',
  'Von der IT vorgegeben': 'Managed by IT',
  'Konto': 'Account',
  'Angemeldet als %@': 'Signed in as %@',
  'Angemeldet': 'Signed in',
  'Nicht angemeldet': 'Not signed in',
  'Abmelden': 'Sign out',
  'Bedienung': 'Usage',
  'Tastenkürzel': 'Hotkey',
  'Öffnet das Fragefenster von überall, z. B. CmdOrCtrl+Shift+Space. Leer = aus.': 'Opens the ask window from anywhere, e.g. CmdOrCtrl+Shift+Space. Empty = off.',
  'Standard-Agent': 'Default agent',
  'Erster verfügbarer': 'First available',
  'Nach der Anmeldung wählbar': 'Available after sign-in',
  'Beim Anmelden am Computer starten': 'Start when I log in to this computer',
  'Speichern': 'Save',
  'Einrichtung aus Weave-Chat': 'Setup from Weave Chat',
  'Ein Link aus Weave-Chat schlägt diesen Server vor. Nur übernehmen, wenn Sie den Link selbst geöffnet haben.': 'A link from Weave Chat proposes this server. Accept it only if you opened the link yourself.',
  'Ein Link aus Weave-Chat schlägt einen Server vor; die Adresse ist aber von der IT vorgegeben und bleibt unverändert.': 'A link from Weave Chat proposes a server, but the address is managed by IT and stays unchanged.',
  'Übernehmen': 'Accept',
  'Ablehnen': 'Dismiss',
  'Schließen': 'Close',
  'Gespeichert': 'Saved',
  'Weave fragen': 'Ask Weave',
  'Über Weave': 'About Weave',
  'Version': 'Version',
  'Nach Updates suchen': 'Check for updates',
  'Suche nach Updates …': 'Checking for updates …',
  'Weave ist aktuell.': 'Weave is up to date.',
  'Version %@ ist verfügbar.': 'Version %@ is available.',
  'Jetzt installieren': 'Install now',
  'Update wird installiert – Weave startet danach neu …': 'Installing the update – Weave restarts afterwards …',
  'Updates verteilt Ihre IT.': 'Your IT distributes updates.',
  'Update auf %@': 'Update to %@',
};

/** Translates a German source string and fills its `%@` placeholders in order. */
export function t(key, ...args) {
  const text = english ? EN[key] ?? key : key;
  let i = 0;
  return text.replace(/%@/g, () => (i < args.length ? String(args[i++]) : '%@'));
}

const PROPS = new Set(['value', 'checked', 'disabled', 'selected', 'hidden', 'required']);

export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else if (key === 'class') el.className = value;
    else if (PROPS.has(key)) el[key] = value;
    else el.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

const ICONS = {
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  arrowUp: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  external: '<path d="M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  warning: '<path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17h.01"/>',
};

export function icon(name) {
  const span = document.createElement('span');
  span.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
  return span.firstChild;
}

export const spinner = () => h('span', { class: 'spinner', role: 'status' });

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, (_, star, underscore) => `<strong>${star ?? underscore}</strong>`)
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a data-href="$2">$1</a>')
    .replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, '<a data-href="$1">$1</a>')
    // Models put HTML line breaks into table cells; raw HTML is otherwise shown escaped.
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>');
}

const TABLE_SEPARATOR = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const tableCells = (row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
const LIST_ITEM = /^(\s*)(?:([-*+•◦▪‣])|(\d+)[.)])\s+(.*)$/;

/**
 * A safe Markdown subset for answers: paragraphs (single line breaks kept),
 * headings, nested and numbered lists (numbering kept across interruptions),
 * tables, block quotes, rules, code, bold, italics, http(s) links. Everything
 * is HTML-escaped first; only the tags built here are produced.
 */
export function markdown(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let paragraph = [];
  /** Open lists, innermost last: { tag, indent }. */
  const lists = [];
  const flushParagraph = () => {
    if (paragraph.length) out.push(`<p>${paragraph.map(inline).join('<br>')}</p>`);
    paragraph = [];
  };
  const closeLists = (indent = -1) => {
    while (lists.length && lists.at(-1).indent > indent) out.push(`</li></${lists.pop().tag}>`);
  };
  const closeBlocks = () => { flushParagraph(); closeLists(); };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      closeBlocks();
      const code = [];
      while (++i < lines.length && !/^\s*(```|~~~)/.test(lines[i])) code.push(lines[i]);
      out.push(`<pre>${escapeHtml(code.join('\n'))}</pre>`);
      continue;
    }
    if (!line.trim()) {
      // A blank line keeps an open list open: the next item or indented line continues it.
      flushParagraph();
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      closeBlocks();
      out.push('<hr>');
      continue;
    }
    const item = line.match(LIST_ITEM);
    if (item) {
      flushParagraph();
      const indent = item[1].replace(/\t/g, '    ').length;
      const tag = item[3] ? 'ol' : 'ul';
      closeLists(indent);
      const top = lists.at(-1);
      if (top && top.indent === indent && top.tag !== tag) closeLists(indent - 1);
      const current = lists.at(-1);
      if (current && current.indent === indent) out.push('</li><li>');
      else {
        const start = tag === 'ol' && item[3] !== '1' ? ` start="${Number(item[3])}"` : '';
        out.push(`<${tag}${start}><li>`);
        lists.push({ tag, indent });
      }
      out.push(inline(item[4]));
      continue;
    }
    // An indented line under a list item continues that item.
    if (lists.length && /^\s+/.test(line)) {
      out.push(`<br>${inline(line.trim())}`);
      continue;
    }
    if (lists.length) closeBlocks();
    const heading = line.match(/^(#{1,6})\s+(.*)/);
    if (heading) {
      flushParagraph();
      out.push(heading[1].length <= 2 ? `<h3>${inline(heading[2])}</h3>` : `<h4>${inline(heading[2])}</h4>`);
    } else if (/^\s*>/.test(line)) {
      flushParagraph();
      const quote = [];
      for (; i < lines.length && /^\s*>/.test(lines[i]); i++) quote.push(lines[i].replace(/^\s*>\s?/, ''));
      i--;
      out.push(`<blockquote>${markdown(quote.join('\n'))}</blockquote>`);
    } else if (line.includes('|') && i + 1 < lines.length && TABLE_SEPARATOR.test(lines[i + 1])) {
      flushParagraph();
      const head = tableCells(line);
      const rows = [];
      for (i += 2; i < lines.length && lines[i].includes('|') && lines[i].trim(); i++) rows.push(tableCells(lines[i]));
      i--;
      out.push(`<table><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr></thead>`
        + `<tbody>${rows.map((row) => `<tr>${head.map((_, col) => `<td>${inline(row[col] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
    } else paragraph.push(line.trim());
  }
  closeBlocks();
  return out.join('');
}

/** Opens `data-href` links inside `root` in the default browser. */
export function wireLinks(root) {
  root.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-href]');
    if (link) { event.preventDefault(); invoke('open_url', { url: link.dataset.href }); }
  });
}

/* --- The Weave mark and its motions ----------------------------------------
   The same inline SVG as the web apps' WeaveLogo (the weft rows and knots
   need class hooks, so a plain <img src="weave.svg"> can only turn or flip).
   While Weave works, one of four motions runs -- 'weave' (the weft rows
   unweave and shuttle back in), 'turn' (a half turn; the mark is symmetric,
   so 180° looks like 0°), 'flip' (a half turn around the vertical axis) or
   'shuttle' (the mark sways while the weft rows slide through) -- picked at
   random, never the one that ran last, remembered across windows and
   restarts through localStorage. Mirrors services/chat/src/lib/weave-motion.ts;
   the canonical mark and keyframes live in packages/weave-mark. */
export const WEAVE_MOTIONS = ['weave', 'turn', 'flip', 'shuttle'];
const MOTION_KEY = 'weave-motion-last';
let motionLast = null;

export function nextWeaveMotion(random = Math.random) {
  let last = motionLast;
  try {
    const stored = localStorage.getItem(MOTION_KEY);
    if (WEAVE_MOTIONS.includes(stored)) last = stored;
  } catch { /* storage blocked: the in-memory memory still prevents repeats */ }
  const candidates = WEAVE_MOTIONS.filter((motion) => motion !== last);
  const next = candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
  motionLast = next;
  try { localStorage.setItem(MOTION_KEY, next); } catch { /* ignore */ }
  return next;
}

const WEAVE_MARK = `
  <rect width="64" height="64" rx="15" fill="#0f8a64"/>
  <g fill="#bfe7d4"><rect x="12" y="8" width="8" height="48" rx="4"/><rect x="28" y="8" width="8" height="48" rx="4"/><rect x="44" y="8" width="8" height="48" rx="4"/></g>
  <g fill="#f7fcf9" class="weave-weft"><rect data-row="0" x="8" y="12" width="48" height="8" rx="4"/><rect data-row="1" x="8" y="28" width="48" height="8" rx="4"/><rect data-row="2" x="8" y="44" width="48" height="8" rx="4"/></g>
  <g fill="#bfe7d4" class="weave-knots"><rect data-row="0" x="12" y="12" width="8" height="8"/><rect data-row="0" x="44" y="12" width="8" height="8"/><rect data-row="1" x="28" y="28" width="8" height="8"/><rect data-row="2" x="12" y="44" width="8" height="8"/><rect data-row="2" x="44" y="44" width="8" height="8"/></g>
  <g stroke="#0b6f52" stroke-width="1" opacity=".28" class="weave-knots"><path data-row="0" d="M12 11.5h8M12 20.5h8M44 11.5h8M44 20.5h8"/><path data-row="1" d="M28 27.5h8M28 36.5h8"/><path data-row="2" d="M12 43.5h8M12 52.5h8M44 43.5h8M44 52.5h8"/></g>`;

/** The mark as an inline <svg class="weave-logo ...">. `motion` (one of
    WEAVE_MOTIONS) makes it move -- `mode` 'loop' until re-rendered without a
    motion, 'finite' for five rounds that end in a soft settle; null renders
    the static mark. `onCycle` runs on a click (the easter egg: switch to the
    next motion); `onSettled` once a finite run has come to rest. */
export function weaveLogo(motion, extraClass = '', mode = 'loop', { onCycle, onSettled } = {}) {
  const holder = document.createElement('span');
  const classes = ['weave-logo', motion && `weave-logo--${mode}`, motion && `weave-logo--motion-${motion}`, extraClass].filter(Boolean).join(' ');
  holder.innerHTML = `<svg viewBox="0 0 64 64" class="${classes}" aria-hidden="true">${WEAVE_MARK}</svg>`;
  const svg = holder.firstElementChild;
  if (onCycle) svg.addEventListener('click', onCycle);
  // The settle class stays once applied: removing it would re-apply (and so
  // restart) the run's own animation. Every render builds a fresh element.
  svg.addEventListener('animationend', (event) => {
    if (event.animationName === 'weave-settle') { onSettled?.(); return; }
    if (mode === 'finite' && motion) svg.classList.add('weave-logo--settle');
  });
  return svg;
}
