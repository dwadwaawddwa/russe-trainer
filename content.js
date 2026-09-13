// content.js — applique les transformations et gère les bulles.
(function () {
  const MARK = "rul-tok"; // classe des morceaux transformés

  const DEFAULTS = {
    enabled: true,
    lang: "ru",         // "ru" (russe) | "ja" (japonais)
    levelLetters: true,
    levelWords: true,
    levelPhrases: true,
    percent: 30,        // % lettres (0..100)
    percentWords: 100,  // % mots & phrases (0..100)
    groupLetters: true, // même lettre d'un mot = même décision
    reveal: "hover"     // "hover" | "alt"
  };

  let cfg = { ...DEFAULTS };
  let D = window.RUL.RU;               // jeu de données de la langue courante
  function setLang() { D = (cfg.lang === "ja") ? window.RUL.JA : window.RUL.RU; }
  let applied = false;

  // Ne pas toucher à ces éléments.
  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT",
    "CODE", "PRE", "KBD", "SAMP"
  ]);

  // Décision DÉTERMINISTE (même texte -> même résultat) : évite le clignotement
  // quand la page se re-rend. Utilisé uniquement pour le niveau lettres.
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function pick(key) {
    return (hashStr(key) % 100) < cfg.percent;
  }
  function pickWords(key) {
    return (hashStr(key) % 100) < cfg.percentWords;
  }

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Applique le remplacement lettre par lettre sur un fragment de texte pur.
  // On traite mot par mot : ainsi, quand l'option "groupLetters" est active,
  // toutes les occurrences d'une même lettre dans UN mot suivent la même décision.
  // Retourne un tableau de tokens {ru, orig, note} ou {plain}.
  function transformLetters(text) {
    const out = [];
    const wordRe = /[A-Za-zÀ-ÿœ]+/g;
    let last = 0, m;
    while ((m = wordRe.exec(text)) !== null) {
      if (m.index > last) out.push({ plain: text.slice(last, m.index) });
      transformWord(out, m[0]);
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ plain: text.slice(last) });
    return out;
  }

  function transformWord(out, word) {
    let plainBuf = "";
    const flushPlain = () => { if (plainBuf) { out.push({ plain: plainBuf }); plainBuf = ""; } };
    const lower = word.toLowerCase();
    // Clé de décision :
    //  - groupLetters ON  -> "mot|séquence"  (même lettre du mot = même décision)
    //  - groupLetters OFF -> "mot#position"  (décision par position, comme avant)
    const keyFor = (seq, i) => cfg.groupLetters ? (lower + "|" + seq) : (lower + "#" + i);

    let i = 0;
    while (i < word.length) {
      const rest = lower.slice(i);

      // digrammes d'abord
      let matched = null;
      for (const [seq, ru, note] of D.DIGRAPHS) {
        if (rest.startsWith(seq)) { matched = { seq, ru, note }; break; }
      }
      if (matched) {
        const orig = word.substr(i, matched.seq.length);
        if (matched.ru && pick(keyFor(matched.seq, i))) {
          flushPlain();
          out.push({ ru: matchCase(matched.ru, orig), orig, note: matched.note });
        } else {
          plainBuf += orig;
        }
        i += matched.seq.length;
        continue;
      }

      const ch = word[i];
      const low = ch.toLowerCase();
      const entry = D.LETTERS[low];
      if (entry) {
        const [ru, note] = entry;
        if (ru !== "" && pick(keyFor(low, i))) {
          flushPlain();
          out.push({ ru: matchCase(ru, ch), orig: ch, note });
        } else {
          plainBuf += ch;
        }
      } else {
        plainBuf += ch;
      }
      i++;
    }
    flushPlain();
  }

  function matchCase(ru, orig) {
    if (orig && orig[0] === orig[0].toUpperCase() && orig[0] !== orig[0].toLowerCase()) {
      return ru.charAt(0).toUpperCase() + ru.slice(1);
    }
    return ru;
  }

  // Découpe un texte en tokens en appliquant phrases -> mots -> lettres.
  function tokenize(text) {
    // segments = liste de {plain} (à traiter) ou tokens finaux
    let segs = [{ plain: text }];

    if (cfg.levelPhrases) segs = applyPhrases(segs);
    if (cfg.levelWords) segs = applyWords(segs);
    if (cfg.levelLetters) {
      const expanded = [];
      for (const s of segs) {
        if (s.plain !== undefined) expanded.push(...transformLetters(s.plain));
        else expanded.push(s);
      }
      segs = expanded;
    }
    return segs;
  }

  function applyPhrases(segs) {
    for (const [fr, ru, pron] of D.PHRASES) {
      const re = new RegExp(escapeRe(fr), "gi");
      segs = splitByRegex(segs, re, (m) =>
        pickWords(m.toLowerCase()) ? { ru: matchCase(ru, m), orig: m, note: pron } : { plain: m }
      );
    }
    return segs;
  }

  function applyWords(segs) {
    // Un seul passage : on scanne chaque mot et on regarde s'il est au dico.
    const wordRe = /[A-Za-zÀ-ÿ']+/g;
    const out = [];
    for (const s of segs) {
      if (s.plain === undefined) { out.push(s); continue; }
      const text = s.plain;
      let last = 0, m;
      while ((m = wordRe.exec(text)) !== null) {
        const word = m[0];
        const key = word.toLowerCase();
        const hit = D.WORDS[key];
        if (hit && pickWords(key)) {
          if (m.index > last) out.push({ plain: text.slice(last, m.index) });
          out.push({ ru: matchCase(hit[0], word), orig: word, note: hit[1] });
          last = m.index + word.length;
        }
      }
      if (last < text.length) out.push({ plain: text.slice(last) });
    }
    return out;
  }

  function splitByRegex(segs, re, makeToken) {
    const out = [];
    for (const s of segs) {
      if (s.plain === undefined) { out.push(s); continue; }
      const text = s.plain;
      let last = 0, m;
      re.lastIndex = 0;
      while ((m = re.exec(text)) !== null) {
        if (m.index > last) out.push({ plain: text.slice(last, m.index) });
        out.push(makeToken(m[0]));
        last = m.index + m[0].length;
        if (m[0].length === 0) re.lastIndex++; // sécurité
      }
      if (last < text.length) out.push({ plain: text.slice(last) });
    }
    return out;
  }

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // --- Application sur le DOM ---
  function acceptText(node) {
    if (!node.nodeValue || !node.nodeValue.trim()) return false;
    let p = node.parentElement;
    while (p) {
      if (SKIP_TAGS.has(p.tagName)) return false;
      if (p.isContentEditable) return false;
      if (p.classList && p.classList.contains(MARK)) return false;
      if (p.id === "rul-bubble") return false;
      p = p.parentElement;
    }
    return true;
  }

  function collectTextNodes(root) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => acceptText(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  let observer = null;
  let pending = new Set();
  let flushTimer = null;

  function makeFrag(node) {
    const tokens = tokenize(node.nodeValue);
    if (!tokens.some(t => t.plain === undefined)) return null; // rien changé
    const frag = document.createDocumentFragment();
    for (const t of tokens) {
      if (t.plain !== undefined) {
        frag.appendChild(document.createTextNode(t.plain));
      } else {
        const span = document.createElement("span");
        span.className = MARK;
        span.textContent = t.ru;
        span.dataset.orig = t.orig;
        span.dataset.note = t.note || "";
        frag.appendChild(span);
      }
    }
    return frag;
  }

  // Transforme une liste de nœuds texte. On coupe l'observateur pendant
  // nos propres écritures pour ne pas boucler.
  function processNodes(nodes) {
    if (observer) observer.disconnect();
    for (const node of nodes) {
      if (!node.parentNode) continue;
      const frag = makeFrag(node);
      if (frag) node.parentNode.replaceChild(frag, node);
    }
    if (cfg.enabled) startObserver();
  }

  function startObserver() {
    if (!observer) {
      observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const n of m.addedNodes) pending.add(n);
        }
        if (pending.size && !flushTimer) flushTimer = setTimeout(flushPending, 200);
      });
    }
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function flushPending() {
    flushTimer = null;
    const roots = [...pending];
    pending.clear();
    if (!cfg.enabled) return;
    const nodes = [];
    for (const r of roots) {
      if (!r.isConnected) continue;
      if (r.nodeType === Node.TEXT_NODE) {
        if (acceptText(r)) nodes.push(r);
      } else if (r.nodeType === Node.ELEMENT_NODE) {
        if (r.id === "rul-bubble" || (r.classList && r.classList.contains(MARK))) continue;
        nodes.push(...collectTextNodes(r));
      }
    }
    if (nodes.length) processNodes(nodes);
  }

  function apply() {
    if (observer) observer.disconnect();
    // re-tirage propre : on remet le texte d'origine avant de re-transformer
    document.querySelectorAll("." + MARK).forEach(span => {
      span.replaceWith(document.createTextNode(span.dataset.orig));
    });
    processNodes(collectTextNodes(document.body));
    applied = true;
    document.body.classList.toggle("rul-reveal-alt", cfg.reveal === "alt");
    startObserver();
  }

  function restore() {
    if (observer) observer.disconnect();
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    pending.clear();
    document.querySelectorAll("." + MARK).forEach(span => {
      span.replaceWith(document.createTextNode(span.dataset.orig));
    });
    applied = false;
  }

  // --- Bulle explicative ---
  let bubble;
  let altDown = false;

  function ensureBubble() {
    if (bubble) return bubble;
    bubble = document.createElement("div");
    bubble.id = "rul-bubble";
    bubble.hidden = true;
    document.documentElement.appendChild(bubble);
    return bubble;
  }

  function showBubble(span) {
    ensureBubble();
    const orig = span.dataset.orig || "";
    const note = span.dataset.note || "";
    bubble.innerHTML =
      '<div class="rul-b-ru">' + esc(span.textContent) + "</div>" +
      '<div class="rul-b-orig">« ' + esc(orig) + " »</div>" +
      (note ? '<div class="rul-b-note">' + esc(note) + "</div>" : "");
    const r = span.getBoundingClientRect();
    bubble.hidden = false;
    const bw = bubble.offsetWidth;
    let left = r.left + window.scrollX + r.width / 2 - bw / 2;
    left = Math.max(6, Math.min(left, window.scrollX + document.documentElement.clientWidth - bw - 6));
    let top = r.top + window.scrollY - bubble.offsetHeight - 8;
    if (top < window.scrollY + 4) top = r.bottom + window.scrollY + 8; // sinon en dessous
    bubble.style.left = left + "px";
    bubble.style.top = top + "px";
  }

  function hideBubble() { if (bubble) bubble.hidden = true; }

  function onOver(e) {
    const span = e.target.closest && e.target.closest("." + MARK);
    if (!span) return;
    if (cfg.reveal === "alt" && !altDown) return;
    showBubble(span);
  }
  function onOut(e) {
    if (e.target.closest && e.target.closest("." + MARK)) hideBubble();
  }
  document.addEventListener("mouseover", onOver, true);
  document.addEventListener("mouseout", onOut, true);
  window.addEventListener("keydown", (e) => { if (e.key === "Alt") altDown = true; });
  window.addEventListener("keyup", (e) => { if (e.key === "Alt") { altDown = false; hideBubble(); } });
  window.addEventListener("scroll", hideBubble, true);

  // --- Chargement config + messages ---
  function load() {
    chrome.storage.sync.get(DEFAULTS, (v) => {
      cfg = { ...DEFAULTS, ...v };
      setLang();
      if (cfg.enabled) apply(); else restore();
    });
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === "rul-update") {
      cfg = { ...DEFAULTS, ...msg.cfg };
      setLang();
      // On repart toujours du texte d'origine (utile si on change de langue).
      restore();
      if (cfg.enabled) apply();
    }
  });

  load();
})();
