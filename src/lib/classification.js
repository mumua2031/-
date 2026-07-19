const patternCategories = [
  { code: "N", zh: "\u81EA\u7136\u7EB9\u6837", en: "Nature Pattern" },
  { code: "H", zh: "\u4EBA\u6587 / \u6C11\u4FD7\u7EB9\u6837", en: "Humanities Pattern" },
  { code: "G", zh: "\u51E0\u4F55 / \u62BD\u8C61\u7EB9\u6837", en: "Geometry Pattern" }
];
const meaningCategories = [
  { code: "B", zh: "\u5409\u7965\u7948\u798F\u7C7B", en: "Blessing" },
  { code: "S", zh: "\u7CBE\u795E\u4FE1\u4EF0\u7C7B", en: "Spiritual Belief" },
  { code: "L", zh: "\u751F\u6D3B\u5FD7\u8DA3\u7C7B", en: "Lifestyle" }
];
const colorCategories = [
  { code: "R", zh: "\u7EA2\u8272\u7CFB", en: "Red" },
  { code: "G", zh: "\u7EFF\u8272\u7CFB", en: "Green" },
  { code: "B", zh: "\u84DD\u8272\u7CFB", en: "Blue" },
  { code: "A", zh: "\u91D1\u94F6\u8272\u7CFB", en: "Gold and Silver" },
  { code: "M", zh: "\u591A\u8272\u7CFB", en: "Multicolor" }
];
const archiveTopFilters = [
  { key: "all", zh: "\u5168\u90E8", en: "All" },
  { key: "nature", zh: "\u81EA\u7136\u5927\u7C7B", en: "Nature", categoryType: "pattern", code: "N" },
  { key: "humanities", zh: "\u4EBA\u6587\u5927\u7C7B", en: "Humanities", categoryType: "pattern", code: "H" },
  { key: "geometry", zh: "\u51E0\u4F55\u5927\u7C7B", en: "Geometry", categoryType: "pattern", code: "G" },
  { key: "meaning", zh: "\u5BD3\u610F\u5927\u7C7B", en: "Meaning", categoryType: "meaning" },
  { key: "color", zh: "\u8272\u5F69\u5927\u7C7B", en: "Color", categoryType: "color" }
];
const heCodePattern = /^HE-([NHG])-([BSL])-([RGBAM])(\d{2,})$/;
const legacyHeCodePattern = /^HE-([NHG])([BSL])-([RGBAM])(\d{2,})$/;
const classificationCache = /* @__PURE__ */ new WeakMap();
const reviewedLegacyHECodeAliases = {
  "HE-NB-B14": "HE-N-B-G14",
  "HE-N-B-B14": "HE-N-B-G14",
  "HE-NB-B13": "HE-N-B-G13",
  "HE-N-B-B13": "HE-N-B-G13",
  "HE-NL-B01": "HE-N-L-R01",
  "HE-N-L-B01": "HE-N-L-R01",
  "HE-HS-M12": "HE-N-B-M12",
  "HE-H-S-M12": "HE-N-B-M12",
  "HE-NS-M04": "HE-H-S-M04",
  "HE-N-S-M04": "HE-H-S-M04",
  "HE-NL-A13": "HE-N-B-A13",
  "HE-N-L-A13": "HE-N-B-A13",
  "HE-HB-R09": "HE-N-B-R21",
  "HE-H-B-R09": "HE-N-B-R21",
  "HE-NL-M01": "HE-N-B-M22",
  "HE-N-L-M01": "HE-N-B-M22",
  "HE-NS-B04": "HE-N-B-B12",
  "HE-N-S-B04": "HE-N-B-B12",
  "HE-HL-A14": "HE-N-B-A14",
  "HE-H-L-A14": "HE-N-B-A14",
  "HE-HB-A12": "HE-N-B-A12",
  "HE-H-B-A12": "HE-N-B-A12",
  "HE-GB-M02": "HE-G-S-M02",
  "HE-G-B-M02": "HE-G-S-M02",
  "HE-HB-R19": "HE-H-S-R19",
  "HE-H-B-R19": "HE-H-S-R19",
  "HE-HB-R20": "HE-H-S-R20",
  "HE-H-B-R20": "HE-H-S-R20",
  "HE-HS-M02": "HE-N-S-M02",
  "HE-H-S-M02": "HE-N-S-M02",
  "HE-HS-M04": "HE-H-L-M04",
  "HE-NB-G01": "HE-N-L-G01",
  "HE-N-B-G01": "HE-N-L-G01",
  "HE-NB-M12": "HE-N-L-M12"
};
const classificationTextLabels = {
  pattern: {
    N: ["\u81EA\u7136\u7EB9\u6837"],
    H: ["\u4EBA\u6587 / \u6C11\u4FD7\u7EB9\u6837", "\u4EBA\u6587/\u6C11\u4FD7\u7EB9\u6837", "\u4EBA\u6587\u6C11\u4FD7\u7EB9\u6837"],
    G: ["\u51E0\u4F55 / \u62BD\u8C61\u7EB9\u6837", "\u51E0\u4F55/\u62BD\u8C61\u7EB9\u6837", "\u51E0\u4F55\u62BD\u8C61\u7EB9\u6837"]
  },
  meaning: {
    B: ["\u5409\u7965\u7948\u798F\u7C7B"],
    S: ["\u7CBE\u795E\u4FE1\u4EF0\u7C7B"],
    L: ["\u751F\u6D3B\u5FD7\u8DA3\u7C7B"]
  },
  color: {
    R: ["\u7EA2\u8272\u7CFB"],
    G: ["\u7EFF\u8272\u7CFB"],
    B: ["\u84DD\u8272\u7CFB"],
    A: ["\u91D1\u94F6\u8272\u7CFB"],
    M: ["\u591A\u8272\u7CFB"]
  }
};
function cleanCode(code) {
  return code.trim().replace(/\s+/g, "").toUpperCase();
}
function isPatternCategory(code) {
  return patternCategories.some((category) => category.code === code);
}
function isMeaningCategory(code) {
  return meaningCategories.some((category) => category.code === code);
}
function isColorCategory(code) {
  return colorCategories.some((category) => category.code === code);
}
function formatSequence(sequence) {
  if (sequence === null || sequence === void 0 || sequence === "") return "";
  const numericSequence = Number.parseInt(String(sequence).trim(), 10);
  if (!Number.isFinite(numericSequence) || numericSequence < 0) return "";
  return String(numericSequence).padStart(2, "0");
}
function validateHECode(code) {
  return heCodePattern.test(cleanCode(code));
}
function parseHECode(code) {
  const normalizedCode = cleanCode(code);
  const match = normalizedCode.match(heCodePattern);
  if (!match) {
    return {
      prefix: normalizedCode.startsWith("HE-") ? "HE" : "",
      patternCategory: "",
      meaningCategory: "",
      colorCategory: "",
      sequence: null,
      isValid: false
    };
  }
  return {
    prefix: "HE",
    patternCategory: match[1],
    meaningCategory: match[2],
    colorCategory: match[3],
    sequence: Number.parseInt(match[4], 10),
    isValid: true
  };
}
function parseLegacyHECode(code) {
  const match = cleanCode(code).match(legacyHeCodePattern);
  if (!match) {
    return {
      patternCategory: "",
      meaningCategory: "",
      colorCategory: "",
      sequence: null,
      isValidHECode: false
    };
  }
  return {
    patternCategory: match[1],
    meaningCategory: match[2],
    colorCategory: match[3],
    sequence: Number.parseInt(match[4], 10),
    isValidHECode: false
  };
}
function buildHECode(data) {
  const patternCategory = data.patternCategory?.trim().toUpperCase() || "";
  const meaningCategory = data.meaningCategory?.trim().toUpperCase() || "";
  const colorCategory = data.colorCategory?.trim().toUpperCase() || "";
  const sequence = formatSequence(data.sequence);
  if (!isPatternCategory(patternCategory) || !isMeaningCategory(meaningCategory) || !isColorCategory(colorCategory) || !sequence) {
    return "";
  }
  return `HE-${patternCategory}-${meaningCategory}-${colorCategory}${sequence}`;
}
function formatHECodeForDisplay(code) {
  const normalizedCode = cleanCode(code);
  const reviewedCode = reviewedLegacyHECodeAliases[normalizedCode];
  if (reviewedCode) return reviewedCode;
  const parsed = parseHECode(code);
  if (parsed.isValid) {
    return buildHECode(parsed);
  }
  const legacyParsed = parseLegacyHECode(code);
  if (legacyParsed.patternCategory && legacyParsed.meaningCategory && legacyParsed.colorCategory && legacyParsed.sequence !== null) {
    return buildHECode(legacyParsed);
  }
  return cleanCode(code);
}
function resolvePatternHECode(heCode, previousHeCode) {
  const normalizedPreviousCode = previousHeCode ? cleanCode(previousHeCode) : "";
  if (normalizedPreviousCode && reviewedLegacyHECodeAliases[normalizedPreviousCode]) {
    return reviewedLegacyHECodeAliases[normalizedPreviousCode];
  }
  return formatHECodeForDisplay(heCode);
}
function getLegacyHECodeAliases(code) {
  const canonicalCode = formatHECodeForDisplay(code);
  const aliases = new Set([canonicalCode]);
  const parsed = parseHECode(canonicalCode);
  if (parsed.isValid) {
    const compactAlias = `HE-${parsed.patternCategory}${parsed.meaningCategory}-${parsed.colorCategory}${formatSequence(parsed.sequence)}`;
    if (formatHECodeForDisplay(compactAlias) === canonicalCode) aliases.add(compactAlias);
  }
  Object.entries(reviewedLegacyHECodeAliases).forEach(([legacyCode, reviewedCode]) => {
    if (reviewedCode === canonicalCode) aliases.add(legacyCode);
  });
  return [...aliases];
}
function normalizePatternClassificationText(pattern) {
  const targets = [
    ["pattern", pattern.patternCategory],
    ["meaning", pattern.meaningCategory],
    ["color", pattern.colorCategory]
  ];
  const normalizeText = (value) => targets.reduce((text, [type, currentCode]) => {
    const labels = classificationTextLabels[type];
    const currentLabel = currentCode ? labels[currentCode]?.[0] : "";
    if (!currentLabel || !currentCode) return text;
    return Object.entries(labels).reduce((nextText, [code, variants]) => {
      if (code === currentCode) return nextText;
      return variants.reduce((updatedText, label) => updatedText.replaceAll(`${label}\uFF08${code}\uFF09`, `${currentLabel}\uFF08${currentCode}\uFF09`).replaceAll(`${label}(${code})`, `${currentLabel}(${currentCode})`).replaceAll(label, currentLabel), nextText);
    }, text);
  }, value);
  const normalizeField = (field) => Object.fromEntries(
    Object.entries(field).map(([language, value]) => [language, normalizeText(value || "")])
  );
  return {
    ...pattern,
    craft: normalizeField(pattern.craft),
    symbolism: normalizeField(pattern.symbolism),
    origin: normalizeField(pattern.origin),
    scenario: normalizeField(pattern.scenario),
    literature: normalizeField(pattern.literature)
  };
}
function getPatternClassification(pattern) {
  const cachedClassification = classificationCache.get(pattern);
  if (cachedClassification) return cachedClassification;
  let classification;
  if (pattern.patternCategory && pattern.meaningCategory && pattern.colorCategory && pattern.sequence !== void 0) {
    classification = {
      patternCategory: isPatternCategory(pattern.patternCategory) ? pattern.patternCategory : "",
      meaningCategory: isMeaningCategory(pattern.meaningCategory) ? pattern.meaningCategory : "",
      colorCategory: isColorCategory(pattern.colorCategory) ? pattern.colorCategory : "",
      sequence: Number.isFinite(Number(pattern.sequence)) ? Number(pattern.sequence) : null,
      isValidHECode: validateHECode(pattern.heCode)
    };
  } else {
    const parsed = parseHECode(pattern.heCode);
    classification = parsed.isValid ? {
      patternCategory: parsed.patternCategory,
      meaningCategory: parsed.meaningCategory,
      colorCategory: parsed.colorCategory,
      sequence: parsed.sequence,
      isValidHECode: true
    } : parseLegacyHECode(pattern.heCode);
  }
  classificationCache.set(pattern, classification);
  return classification;
}
function getCanonicalHECode(pattern) {
  const classification = getPatternClassification(pattern);
  return buildHECode({
    patternCategory: classification.patternCategory,
    meaningCategory: classification.meaningCategory,
    colorCategory: classification.colorCategory,
    sequence: classification.sequence
  }) || formatHECodeForDisplay(pattern.heCode);
}
function getCategoryLabel(categoryType, code, language = "zh") {
  const source = categoryType === "pattern" ? patternCategories : categoryType === "meaning" ? meaningCategories : colorCategories;
  const option = source.find((category) => category.code === code);
  return option ? option[language] : "";
}
function matchesArchiveTopFilter(pattern, filterKey) {
  const classification = getPatternClassification(pattern);
  switch (filterKey) {
    case "all":
      return true;
    case "nature":
      return classification.patternCategory === "N";
    case "humanities":
      return classification.patternCategory === "H";
    case "geometry":
      return classification.patternCategory === "G";
    case "meaning":
      return Boolean(classification.meaningCategory);
    case "color":
      return Boolean(classification.colorCategory);
    default:
      return true;
  }
}
function hasDuplicateHECodes(patterns) {
  const seen = /* @__PURE__ */ new Set();
  const duplicates = /* @__PURE__ */ new Set();
  patterns.forEach((pattern) => {
    const code = cleanCode(pattern.heCode);
    if (seen.has(code)) duplicates.add(code);
    seen.add(code);
  });
  return [...duplicates];
}
function hasDuplicateCategorySequences(patterns) {
  const seen = /* @__PURE__ */ new Set();
  const duplicates = /* @__PURE__ */ new Set();
  patterns.forEach((pattern) => {
    const classification = getPatternClassification(pattern);
    if (!classification.patternCategory || !classification.meaningCategory || !classification.colorCategory || classification.sequence === null) {
      return;
    }
    const key = `${classification.patternCategory}${classification.meaningCategory}-${classification.colorCategory}${formatSequence(classification.sequence)}`;
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  });
  return [...duplicates];
}
export {
  archiveTopFilters,
  buildHECode,
  colorCategories,
  formatHECodeForDisplay,
  formatSequence,
  getCanonicalHECode,
  getCategoryLabel,
  getLegacyHECodeAliases,
  getPatternClassification,
  normalizePatternClassificationText,
  hasDuplicateCategorySequences,
  hasDuplicateHECodes,
  matchesArchiveTopFilter,
  meaningCategories,
  parseHECode,
  patternCategories,
  resolvePatternHECode,
  validateHECode
};
