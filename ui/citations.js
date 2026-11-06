// Knowledge spaces and [N] citations of an answer -- the same rules as the
// Weave web chat (services/chat/src/lib/knowledge-spaces.ts and
// components/chat/citations.tsx) and Weave-API's `knowledge_spaces` metadata.

/** Colours available for knowledge spaces (style.css's `--space-1` ...). */
export const SPACE_COLOR_COUNT = 6;

/**
 * The knowledge spaces an answer draws on, in order of first appearance:
 * [{ collection, refs, notice, color }], `color` being the 1-based slot.
 */
export function answerSpaces(sources) {
  const spaces = new Map();
  for (const source of sources ?? []) {
    const key = source.collection ?? null;
    let space = spaces.get(key);
    if (!space) {
      space = { collection: key, refs: [], notice: null, color: (spaces.size % SPACE_COLOR_COUNT) + 1 };
      spaces.set(key, space);
    }
    if (typeof source.ref === 'number' && !space.refs.includes(source.ref)) space.refs.push(source.ref);
    const notice = source.notice?.trim();
    if (!space.notice && notice) space.notice = notice;
  }
  return [...spaces.values()];
}

/** `--space` for an element coloured by its knowledge space. */
export const spaceStyle = (color) => (color ? `--space: var(--space-${color})` : null);

/** Weave-Runtime's own citation pattern (`_CITATION_RE`). */
const CITATION_RE = /\[(?:source\s*)?(\d+(?:\s*[,;]\s*(?:source\s*)?\d+)*)\]/gi;
const INLINE = new Set(['A', 'B', 'BR', 'CODE', 'EM', 'I', 'SPAN', 'STRONG']);

function splitMarkers(value, refs) {
  const pieces = [];
  let last = 0;
  for (const match of value.matchAll(CITATION_RE)) {
    const known = (match[1].match(/\d+/g) ?? []).map(Number).filter((ref) => refs.has(ref));
    if (known.length === 0) continue;
    if (match.index > last) pieces.push(value.slice(last, match.index));
    pieces.push(known);
    last = match.index + match[0].length;
  }
  if (last < value.length) pieces.push(value.slice(last));
  return pieces;
}

/**
 * Marks an answer's known `[N]` citations inside `root` (the rendered
 * answer): each marker becomes a badge (`.cite-marker[data-ref]`), and the
 * run of text it ends -- from the previous marker or the start of its
 * paragraph/list item -- a passage (`.cite-passage[data-refs]`).
 * `colorOf(ref)` gives the space colour for an answer mixing spaces.
 */
export function markCitations(root, refs, colorOf = () => undefined) {
  if (refs.size === 0) return;
  const doc = root.ownerDocument;
  const marker = (ref) => {
    const badge = doc.createElement('span');
    badge.className = 'cite-marker';
    badge.dataset.ref = String(ref);
    const style = spaceStyle(colorOf(ref));
    if (style) badge.setAttribute('style', style);
    badge.textContent = String(ref);
    return badge;
  };
  for (const block of root.querySelectorAll('p, li, h3, h4, td, th')) {
    const out = [];
    let run = [];
    let lastPassage = null;
    const hasContent = () => run.some((node) => node.nodeType !== 3 || node.textContent.trim());
    const flush = (cited) => {
      if (cited && hasContent()) {
        lastPassage = doc.createElement('span');
        lastPassage.className = 'cite-passage';
        lastPassage.dataset.refs = cited.join(' ');
        const style = spaceStyle(colorOf(cited[0]));
        if (style) lastPassage.setAttribute('style', style);
        lastPassage.append(...run);
        out.push(lastPassage);
      } else {
        // "[1][2]": the second group backs the same passage.
        if (cited && lastPassage) lastPassage.dataset.refs += ` ${cited.join(' ')}`;
        else if (hasContent()) lastPassage = null;
        out.push(...run);
      }
      run = [];
    };
    for (const child of [...block.childNodes]) {
      if (child.nodeType === 3) {
        for (const piece of splitMarkers(child.textContent, refs)) {
          if (typeof piece === 'string') run.push(doc.createTextNode(piece));
          else {
            flush(piece);
            out.push(...piece.map(marker));
          }
        }
      } else if (child.nodeType === 1 && INLINE.has(child.tagName)) run.push(child);
      else {
        // A nested list (li > ul) ends the passage; it is marked on its own.
        flush();
        lastPassage = null;
        out.push(child);
      }
    }
    flush();
    block.replaceChildren(...out);
  }
}

/** Highlights the passages backing any of `refs` (numbers or strings) in `root`; `[]` clears. */
export function highlightCitations(root, refs) {
  const wanted = new Set(refs.map(String));
  for (const passage of root.querySelectorAll('.cite-passage')) {
    passage.classList.toggle('active', passage.dataset.refs.split(' ').some((ref) => wanted.has(ref)));
  }
  for (const badge of root.querySelectorAll('.cite-marker')) {
    badge.classList.toggle('active', wanted.has(badge.dataset.ref));
  }
}
