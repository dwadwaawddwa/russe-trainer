const DEFAULTS = {
  enabled: true,
  lang: "ru",
  levelLetters: true,
  levelWords: true,
  levelPhrases: true,
  percent: 30,
  percentWords: 100,
  groupLetters: true,
  reveal: "hover"
};

const EXAMPLES = {
  ru: { letters: "alphabet & sons (a→а, ch→ш, ou→у…)", words: "chat→кот, merci→спасибо…", phrases: "au revoir→до свидания…" },
  ja: { letters: "sons en katakana (bonjour→ボンジョウル)", words: "chat→猫 (neko), eau→水 (mizu)…", phrases: "au revoir→さようなら…" }
};

const el = (id) => document.getElementById(id);
const FIELDS = ["enabled", "lang", "levelLetters", "levelWords", "levelPhrases", "percent", "percentWords", "groupLetters", "reveal"];

function read() {
  return {
    enabled: el("enabled").checked,
    lang: el("lang").value,
    levelLetters: el("levelLetters").checked,
    levelWords: el("levelWords").checked,
    levelPhrases: el("levelPhrases").checked,
    percent: parseInt(el("percent").value, 10),
    percentWords: parseInt(el("percentWords").value, 10),
    groupLetters: el("groupLetters").checked,
    reveal: el("reveal").value
  };
}

function fill(cfg) {
  el("enabled").checked = cfg.enabled;
  el("lang").value = cfg.lang;
  el("levelLetters").checked = cfg.levelLetters;
  el("levelWords").checked = cfg.levelWords;
  el("levelPhrases").checked = cfg.levelPhrases;
  el("percent").value = cfg.percent;
  el("percentWords").value = cfg.percentWords;
  el("groupLetters").checked = cfg.groupLetters;
  el("reveal").value = cfg.reveal;
  el("pctVal").textContent = cfg.percent + "%";
  el("pctWordsVal").textContent = cfg.percentWords + "%";
  updateVisibility();
}

// Affiche les bonnes barres et les exemples selon la langue/niveaux.
function updateVisibility() {
  el("lettersPct").hidden = !el("levelLetters").checked;
  el("wordsPct").hidden = !(el("levelWords").checked || el("levelPhrases").checked);
  const ex = EXAMPLES[el("lang").value] || EXAMPLES.ru;
  el("descLetters").textContent = ex.letters;
  el("descWords").textContent = ex.words;
  el("descPhrases").textContent = ex.phrases;
}

function save() {
  const cfg = read();
  el("pctVal").textContent = cfg.percent + "%";
  el("pctWordsVal").textContent = cfg.percentWords + "%";
  updateVisibility();
  chrome.storage.sync.set(cfg);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;
    chrome.tabs.sendMessage(tab.id, { type: "rul-update", cfg }, () => {
      if (chrome.runtime.lastError) {
        // Le content script n'est pas encore chargé (page ouverte avant l'install) :
        // on l'injecte, il lira la config et s'appliquera tout seul.
        if (!chrome.scripting) return;
        chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["content.css"] }, () => chrome.runtime.lastError);
        chrome.scripting.executeScript(
          { target: { tabId: tab.id }, files: ["dico.js", "content.js"] },
          () => chrome.runtime.lastError
        );
      }
    });
  });
}

chrome.storage.sync.get(DEFAULTS, (v) => fill({ ...DEFAULTS, ...v }));
FIELDS.forEach((id) => {
  el(id).addEventListener("change", save);
  el(id).addEventListener("input", save);
});
