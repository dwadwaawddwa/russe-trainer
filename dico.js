// dico.js — données de transformation, deux langues : RU (russe) et JA (japonais)
// Structure commune par langue :
//   DIGRAPHS : [seq_latine, cible, note]  (séquences testées AVANT les lettres, plus longues d'abord)
//   LETTERS  : { lettre_latine: [cible, note] }  (fallback lettre seule)
//   WORDS    : { mot_fr: [cible, prononciation] }
//   PHRASES  : [ [expr_fr, cible, prononciation] ]
// Exposé en global window.RUL = { RU, JA }.

window.RUL = (function () {

  /* =====================================================================
   *  RUSSE
   * ===================================================================== */
  const RU = {
    DIGRAPHS: [
      ["eau", "о", "son « o »"],
      ["ou", "у", "son « ou »"],
      ["ch", "ш", "son « ch » (comme chat)"],
      ["ph", "ф", "son « f »"],
      ["au", "о", "son « o »"],
      ["ai", "э", "son « è »"],
      ["ei", "э", "son « è »"],
      ["oi", "уа", "son « oi »"],
      ["gn", "нь", "son « gn »"],
      ["qu", "к", "son « k »"],
      ["on", "он", "son « on » (nasal approx.)"],
      ["om", "ом", "son « on » (nasal approx.)"],
      ["an", "ан", "son « an » (nasal approx.)"],
      ["am", "ам", "son « an » (nasal approx.)"],
      ["en", "ан", "son « en » (nasal approx.)"],
      ["in", "эн", "son « in » (nasal approx.)"],
      ["un", "эн", "son « un » (nasal approx.)"],
      ["eu", "ё", "son « eu » approx."]
    ],
    LETTERS: {
      a: ["а", "a"], b: ["б", "b"], c: ["к", "k (dur)"], d: ["д", "d"],
      e: ["е", "yé / e"], f: ["ф", "f"], g: ["г", "g (dur)"], h: ["", "muet"],
      i: ["и", "i"], j: ["ж", "son « j » (comme jour)"], k: ["к", "k"], l: ["л", "l"],
      m: ["м", "m"], n: ["н", "n"], o: ["о", "o"], p: ["п", "p"], q: ["к", "k"],
      r: ["р", "r roulé"], s: ["с", "s"], t: ["т", "t"], u: ["у", "ou"], v: ["в", "v"],
      w: ["в", "v"], x: ["кс", "ks"], y: ["й", "y bref"], z: ["з", "z"],
      "é": ["е", "son « é »"], "è": ["э", "son « è »"], "ê": ["э", "son « è »"],
      "ë": ["е", "e"], "à": ["а", "a"], "â": ["а", "a"], "ô": ["о", "o"],
      "û": ["у", "ou"], "ù": ["у", "ou"], "î": ["и", "i"], "ï": ["и", "i"],
      "ü": ["у", "ou"], "ç": ["с", "son « s »"], "œ": ["ё", "eu approx."]
    },
    WORDS: {
      "bonjour": ["здравствуйте", "zdrastvouïtié"], "salut": ["привет", "priviet"],
      "merci": ["спасибо", "spassiba"], "oui": ["да", "da"], "non": ["нет", "niet"],
      "et": ["и", "i"], "ou": ["или", "ili"], "je": ["я", "ya"], "tu": ["ты", "ty"],
      "il": ["он", "on"], "elle": ["она", "ana"], "nous": ["мы", "my"], "vous": ["вы", "vy"],
      "ils": ["они", "ani"], "elles": ["они", "ani"], "maison": ["дом", "dom"],
      "eau": ["вода", "vada"], "chat": ["кот", "kot"], "chien": ["собака", "sabaka"],
      "ami": ["друг", "drougue"], "amie": ["подруга", "padrouga"], "amour": ["любовь", "lioubov"],
      "jour": ["день", "dièn"], "nuit": ["ночь", "notch"], "bien": ["хорошо", "kharacho"],
      "mal": ["плохо", "plokha"], "grand": ["большой", "balchoï"], "petit": ["маленький", "malènkiï"],
      "homme": ["мужчина", "moujtchina"], "femme": ["женщина", "jenchina"], "enfant": ["ребёнок", "ribionak"],
      "temps": ["время", "vriémia"], "travail": ["работа", "rabota"], "livre": ["книга", "kniga"],
      "monde": ["мир", "mir"], "pays": ["страна", "strana"], "ville": ["город", "gorad"],
      "manger": ["есть", "yest"], "boire": ["пить", "pit"], "parler": ["говорить", "gavarit"],
      "comprendre": ["понимать", "panimat"], "aimer": ["любить", "lioubit"], "pourquoi": ["почему", "patchimou"],
      "comment": ["как", "kak"], "quand": ["когда", "kagda"], "où": ["где", "gdié"],
      "qui": ["кто", "kto"], "quoi": ["что", "chto"], "aujourd'hui": ["сегодня", "sivodnia"],
      "demain": ["завтра", "zavtra"], "hier": ["вчера", "vtchira"], "beaucoup": ["много", "mnoga"],
      "peu": ["мало", "mala"], "toujours": ["всегда", "vsigda"], "jamais": ["никогда", "nikagda"]
    },
    PHRASES: [
      ["s'il vous plaît", "пожалуйста", "pajalousta"],
      ["s'il te plaît", "пожалуйста", "pajalousta"],
      ["je t'aime", "я тебя люблю", "ya tibia liubliou"],
      ["comment ça va", "как дела", "kak diéla"],
      ["ça va", "всё хорошо", "vsio kharacho"],
      ["au revoir", "до свидания", "da svidania"],
      ["bonne nuit", "спокойной ночи", "spakoïnaï notchi"],
      ["bonne journée", "хорошего дня", "kharochiva dnia"],
      ["de rien", "не за что", "nié za chto"],
      ["je ne sais pas", "я не знаю", "ya nié znaïou"],
      ["je ne comprends pas", "я не понимаю", "ya nié panimaïou"]
    ]
  };

  /* =====================================================================
   *  JAPONAIS (katakana pour les sons, kanji/kana courants pour les mots)
   * ===================================================================== */
  // Table syllabique : le français est découpé en syllabes -> 1 kana.
  // Séquences plus longues d'abord.
  const JA_SYLL = [
    // combinaisons de voyelles / sons spéciaux (3 puis 2 lettres)
    ["eau", "オー", "ô"], ["tch", "ッチ", "tch"],
    ["ch", "シ", "sh"], ["sh", "シ", "sh"], ["ph", "フ", "f"], ["gn", "ニ", "ny"],
    ["qu", "ク", "ku"], ["ou", "ウ", "u"], ["au", "オー", "ô"], ["ai", "エ", "e"],
    ["ei", "エ", "e"], ["oi", "オイ", "oi"], ["eu", "ウ", "u"],
    ["on", "オン", "on"], ["om", "オム", "om"], ["an", "アン", "an"], ["am", "アム", "am"],
    ["en", "アン", "an"], ["in", "アン", "an"], ["un", "アン", "an"],
    // consonne + voyelle (CV) -> mora
    ["ka", "カ", "ka"], ["ki", "キ", "ki"], ["ku", "ク", "ku"], ["ke", "ケ", "ke"], ["ko", "コ", "ko"],
    ["ca", "カ", "ka"], ["co", "コ", "ko"], ["cu", "ク", "ku"], ["ce", "セ", "se"], ["ci", "シ", "shi"],
    ["sa", "サ", "sa"], ["si", "シ", "shi"], ["su", "ス", "su"], ["se", "セ", "se"], ["so", "ソ", "so"],
    ["ta", "タ", "ta"], ["ti", "チ", "chi"], ["tu", "ツ", "tsu"], ["te", "テ", "te"], ["to", "ト", "to"],
    ["na", "ナ", "na"], ["ni", "ニ", "ni"], ["nu", "ヌ", "nu"], ["ne", "ネ", "ne"], ["no", "ノ", "no"],
    ["ha", "ハ", "ha"], ["hi", "ヒ", "hi"], ["hu", "フ", "fu"], ["he", "ヘ", "he"], ["ho", "ホ", "ho"],
    ["ma", "マ", "ma"], ["mi", "ミ", "mi"], ["mu", "ム", "mu"], ["me", "メ", "me"], ["mo", "モ", "mo"],
    ["ya", "ヤ", "ya"], ["yu", "ユ", "yu"], ["yo", "ヨ", "yo"],
    ["ra", "ラ", "ra"], ["ri", "リ", "ri"], ["ru", "ル", "ru"], ["re", "レ", "re"], ["ro", "ロ", "ro"],
    ["la", "ラ", "ra"], ["li", "リ", "ri"], ["lu", "ル", "ru"], ["le", "レ", "re"], ["lo", "ロ", "ro"],
    ["wa", "ワ", "wa"], ["wo", "ヲ", "wo"],
    ["ga", "ガ", "ga"], ["gi", "ギ", "gi"], ["gu", "グ", "gu"], ["ge", "ゲ", "ge"], ["go", "ゴ", "go"],
    ["za", "ザ", "za"], ["zi", "ジ", "ji"], ["zu", "ズ", "zu"], ["ze", "ゼ", "ze"], ["zo", "ゾ", "zo"],
    ["ja", "ジャ", "ja"], ["ji", "ジ", "ji"], ["ju", "ジュ", "ju"], ["je", "ジェ", "je"], ["jo", "ジョ", "jo"],
    ["da", "ダ", "da"], ["di", "ディ", "di"], ["du", "ドゥ", "du"], ["de", "デ", "de"], ["do", "ド", "do"],
    ["ba", "バ", "ba"], ["bi", "ビ", "bi"], ["bu", "ブ", "bu"], ["be", "ベ", "be"], ["bo", "ボ", "bo"],
    ["pa", "パ", "pa"], ["pi", "ピ", "pi"], ["pu", "プ", "pu"], ["pe", "ペ", "pe"], ["po", "ポ", "po"],
    ["fa", "ファ", "fa"], ["fi", "フィ", "fi"], ["fu", "フ", "fu"], ["fe", "フェ", "fe"], ["fo", "フォ", "fo"],
    ["va", "ヴァ", "va"], ["vi", "ヴィ", "vi"], ["vu", "ヴ", "vu"], ["ve", "ヴェ", "ve"], ["vo", "ヴォ", "vo"]
  ];

  const JA = {
    DIGRAPHS: JA_SYLL,
    LETTERS: {
      // voyelles seules
      a: ["ア", "a"], i: ["イ", "i"], u: ["ウ", "u"], e: ["エ", "e"], o: ["オ", "o"],
      // consonnes seules -> kana en « ou »
      b: ["ブ", "bu"], c: ["ク", "ku"], d: ["ド", "do"], f: ["フ", "fu"], g: ["グ", "gu"],
      h: ["", "muet"], j: ["ジュ", "ju"], k: ["ク", "ku"], l: ["ル", "ru"], m: ["ム", "mu"],
      n: ["ン", "n"], p: ["プ", "pu"], q: ["ク", "ku"], r: ["ル", "ru"], s: ["ス", "su"],
      t: ["ト", "to"], v: ["ヴ", "vu"], w: ["ウ", "u"], x: ["クス", "kusu"], y: ["イ", "i"],
      z: ["ズ", "zu"],
      // accents
      "é": ["エ", "e"], "è": ["エ", "e"], "ê": ["エ", "e"], "ë": ["エ", "e"],
      "à": ["ア", "a"], "â": ["ア", "a"], "ô": ["オ", "o"], "û": ["ウ", "u"],
      "ù": ["ウ", "u"], "î": ["イ", "i"], "ï": ["イ", "i"], "ü": ["ウ", "u"], "ç": ["ス", "su"]
    },
    WORDS: {
      "bonjour": ["こんにちは", "konnichiwa"], "salut": ["やあ", "yaa"],
      "merci": ["ありがとう", "arigatô"], "oui": ["はい", "hai"], "non": ["いいえ", "iie"],
      "et": ["と", "to"], "je": ["私", "watashi"], "tu": ["あなた", "anata"], "vous": ["あなた", "anata"],
      "il": ["彼", "kare"], "elle": ["彼女", "kanojo"], "nous": ["私たち", "watashitachi"],
      "maison": ["家", "ie"], "eau": ["水", "mizu"], "chat": ["猫", "neko"], "chien": ["犬", "inu"],
      "ami": ["友達", "tomodachi"], "amie": ["友達", "tomodachi"], "amour": ["愛", "ai"],
      "jour": ["日", "hi"], "nuit": ["夜", "yoru"], "bien": ["いい", "ii"], "mal": ["悪い", "warui"],
      "grand": ["大きい", "ôkii"], "petit": ["小さい", "chiisai"], "homme": ["男", "otoko"],
      "femme": ["女", "onna"], "enfant": ["子供", "kodomo"], "temps": ["時間", "jikan"],
      "travail": ["仕事", "shigoto"], "livre": ["本", "hon"], "monde": ["世界", "sekai"],
      "pays": ["国", "kuni"], "ville": ["町", "machi"], "manger": ["食べる", "taberu"],
      "boire": ["飲む", "nomu"], "parler": ["話す", "hanasu"], "comprendre": ["分かる", "wakaru"],
      "aimer": ["好き", "suki"], "pourquoi": ["なぜ", "naze"], "comment": ["どう", "dô"],
      "quand": ["いつ", "itsu"], "où": ["どこ", "doko"], "qui": ["誰", "dare"], "quoi": ["何", "nani"],
      "aujourd'hui": ["今日", "kyô"], "demain": ["明日", "ashita"], "hier": ["昨日", "kinô"],
      "beaucoup": ["たくさん", "takusan"], "peu": ["少し", "sukoshi"], "toujours": ["いつも", "itsumo"],
      "jamais": ["決して", "kesshite"], "argent": ["お金", "okane"], "soleil": ["太陽", "taiyô"],
      "lune": ["月", "tsuki"], "fleur": ["花", "hana"], "arbre": ["木", "ki"], "école": ["学校", "gakkô"],
      "professeur": ["先生", "sensei"], "étudiant": ["学生", "gakusei"], "voiture": ["車", "kuruma"],
      "train": ["電車", "densha"], "nourriture": ["食べ物", "tabemono"], "riz": ["ご飯", "gohan"],
      "thé": ["お茶", "ocha"], "café": ["コーヒー", "kôhî"], "beau": ["美しい", "utsukushii"],
      "content": ["嬉しい", "ureshii"], "triste": ["悲しい", "kanashii"], "fort": ["強い", "tsuyoi"],
      "faible": ["弱い", "yowai"], "nouveau": ["新しい", "atarashii"], "vieux": ["古い", "furui"],
      "chaud": ["暑い", "atsui"], "froid": ["寒い", "samui"]
    },
    PHRASES: [
      ["s'il vous plaît", "お願いします", "onegai shimasu"],
      ["s'il te plaît", "お願いします", "onegai shimasu"],
      ["merci beaucoup", "どうもありがとう", "dômo arigatô"],
      ["je t'aime", "愛してる", "aishiteru"],
      ["comment ça va", "元気ですか", "genki desu ka"],
      ["ça va", "元気です", "genki desu"],
      ["au revoir", "さようなら", "sayônara"],
      ["bonne nuit", "おやすみ", "oyasumi"],
      ["de rien", "どういたしまして", "dô itashimashite"],
      ["excusez-moi", "すみません", "sumimasen"],
      ["pardon", "ごめんなさい", "gomen nasai"],
      ["je ne sais pas", "分かりません", "wakarimasen"],
      ["je ne comprends pas", "分かりません", "wakarimasen"]
    ]
  };

  return { RU, JA };
})();
