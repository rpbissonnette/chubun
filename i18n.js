const translations = {
  en: {
    title: "Mandarin Pronunciation Trainer",
    tone1: "First Tone",
    tone2: "Second Tone",
    tone3: "Third Tone",
    tone4: "Fourth Tone",
    labials: "Labials",
    alveolars: "Alveolars",
    velars: "Velars",
    selectSyllable: "Select a syllable",
    selectSyllableDesc: "Choose a syllable to practice",
    playReference: "Play Reference",
    record: "Record",
    pitchAnalysis: "Pitch Analysis",
    reference: "Reference",
    yourRecording: "Your Recording",
    progress: "Progress",
    syllablesPracticed: "Syllables Practiced:",
    recordingQuality: "Recording Quality:",
    toneAccuracy: "Tone Accuracy:",
    debugReady: "Debug: Ready to start...",
    feedback: {
      overallGood: "Good attempt!",
      pitchLow: "Try to speak with a slightly higher pitch.",
      pitchHigh: "Try to lower your pitch slightly.",
      pitchGood: "Your pitch level is good!",
      toneExcellent:
        "Excellent tone contour! Your pronunciation matches the target tone very well.",
      toneGood:
        "Good tone contour. With a bit more practice, you'll have it perfect.",
      toneNeedsWork:
        "The tone contour needs some work. Listen to the reference audio again.",
      overallExcellent: "Excellent pronunciation! 🎉",
      overallGoodProgress: "Good pronunciation! Keep practicing. 👍",
      overallNeedsWork: "Keep practicing! Focus on the tone pattern.",
      suggestionPitchLow: "Practice speaking from your chest rather than your throat.",
      suggestionPitchHigh: "Relax your vocal cords and speak more naturally.",
      suggestionTone: "Try humming the tone pattern first, then add the syllable.",
      suggestionClarity: "Speak a bit louder and more clearly.",
      suggestionArticulation: "Try to articulate more clearly.",
    },
  },
  zh: {
    title: "普通话发音教练",
    tone1: "第一声",
    tone2: "第二声",
    tone3: "第三声",
    tone4: "第四声",
    labials: "唇音",
    alveolars: "舌尖音",
    velars: "舌根音",
    selectSyllable: "请选择音节",
    selectSyllableDesc: "选择一个音节进行练习",
    playReference: "播放参考",
    record: "录音",
    pitchAnalysis: "音高分析",
    reference: "参考",
    yourRecording: "你的录音",
    progress: "练习进度",
    syllablesPracticed: "已练习音节:",
    recordingQuality: "录音质量:",
    toneAccuracy: "声调准确度:",
    debugReady: "调试: 准备开始...",
    feedback: {
      overallGood: "不错的尝试！",
      pitchLow: "请试着稍微提高一点音高。",
      pitchHigh: "请试着稍微降低一点音高。",
      pitchGood: "你的音高水平很好！",
      toneExcellent: "声调曲线非常棒！你的发音与目标声调非常匹配。",
      toneGood: "声调曲线不错。再稍加练习，你会更完美。",
      toneNeedsWork: "声调曲线需要一些练习。请再听一遍参考音频。",
      overallExcellent: "发音非常棒！🎉",
      overallGoodProgress: "发音不错！继续练习。👍",
      overallNeedsWork: "继续练习！专注于声调模式。",
      suggestionPitchLow: "练习从胸腔发声，而不是喉咙。",
      suggestionPitchHigh: "放松声带，更自然地说话。",
      suggestionTone: "先试着哼出声调，然后再念出音节。",
      suggestionClarity: "请说得更大声、更清晰一些。",
      suggestionArticulation: "请尝试更清晰地发音。",
    },
  },
  ja: {
    title: "北京語発音トレーナー",
    tone1: "第一声",
    tone2: "第二声",
    tone3: "第三声",
    tone4: "第四声",
    labials: "唇音",
    alveolars: "歯茎音",
    velars: "軟口蓋音",
    selectSyllable: "音節を選択してください",
    selectSyllableDesc: "練習する音節を選択",
    playReference: "参照音声を再生",
    record: "録音",
    pitchAnalysis: "ピッチ分析",
    reference: "参照",
    yourRecording: "あなたの録音",
    progress: "進捗",
    syllablesPracticed: "練習した音節:",
    recordingQuality: "録音品質:",
    toneAccuracy: "声調の正確さ:",
    debugReady: "デバッグ: 開始準備完了...",
    feedback: {
      overallGood: "良い試みです！",
      pitchLow: "もう少し高いピッチで話してみてください。",
      pitchHigh: "もう少し低いピッチで話してみてください。",
      pitchGood: "ピッチのレベルは良好です！",
      toneExcellent:
        "素晴らしい声調の輪郭です！あなたの発音は目標のトーンと非常によく一致しています。",
      toneGood: "良い声調の輪郭です。もう少し練習すれば完璧になります。",
      toneNeedsWork:
        "声調の輪郭には練習が必要です。もう一度参照音声を聞いてください。",
      overallExcellent: "素晴らしい発音です！🎉",
      overallGoodProgress: "良い発音です！練習を続けてください。👍",
      overallNeedsWork: "練習を続けてください！声調のパターンに集中してください。",
      suggestionPitchLow: "喉からではなく、胸から話すように練習してください。",
      suggestionPitchHigh: "声帯をリラックスさせて、もっと自然に話してください。",
      suggestionTone:
        "最初にトーンパターンをハミングしてから、音節を加えてみてください。",
      suggestionClarity: "もう少し大きな声ではっきりと話してください。",
      suggestionArticulation: "もっとはっきりと発音するよ��にしてください。",
    },
  },
};

const setLanguage = (language) => {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const translation = key
      .split(".")
      .reduce((obj, k) => (obj ? obj[k] : undefined), translations[language]);
    if (translation) {
      element.textContent = translation;
    }
  });
  document.documentElement.lang = language;
};

document.addEventListener("DOMContentLoaded", () => {
  const langButtons = document.querySelectorAll(".lang-btn");

  const getBestAvailableLanguage = () => {
    const availableLangs = Object.keys(translations);
    // navigator.languages is an array of preferred languages, e.g., ["en-US", "en", "zh-CN"]
    for (const lang of navigator.languages) {
      if (availableLangs.includes(lang)) {
        return lang; // Exact match, e.g., "en"
      }
      // Check for base language match, e.g., "en-US" should match "en"
      const baseLang = lang.split("-")[0];
      if (availableLangs.includes(baseLang)) {
        return baseLang;
      }
    }
    return "en"; // Default to English
  };

  let currentLanguage = getBestAvailableLanguage();

  const getTranslation = (key) => {
    return key
      .split(".")
      .reduce(
        (obj, k) => (obj ? obj[k] : undefined),
        translations[currentLanguage]
      );
  };

  window.getTranslation = getTranslation;

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const language = button.getAttribute("data-lang");
      currentLanguage = language;
      langButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      setLanguage(language);
    });
  });

  // Set initial language based on browser settings or default to English
  const initialLangNode = document.querySelector(
    `.lang-btn[data-lang="${currentLanguage}"]`
  );
  if (initialLangNode) {
    initialLangNode.classList.add("active");
  }
  setLanguage(currentLanguage);
});
