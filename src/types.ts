export interface MultilingualString {
  'zh-CN': string;
  'zh-TW'?: string;
  en?: string;
  ja?: string;
  ko?: string;
}

export interface PatternVisualAnalysis {
  originalPattern: MultilingualString;
  outlineExtraction: MultilingualString;
  mainColorRatio: MultilingualString;
  patternUnit: MultilingualString;
  symmetry: MultilingualString;
  repetition: MultilingualString;
  compositionCenter: MultilingualString;
  structureDescription: MultilingualString;
}

export interface StitchTechnique {
  name: string;
  enName: string;
  category?: string;
  enCategory?: string;
  aliases?: string[];
  imageUrl: string;
  summary: MultilingualString;
  origin?: MultilingualString;
  features?: MultilingualString;
  usage?: MultilingualString;
  source: string;
}

export interface PatternGene {
  id: string; // Document ID
  heCode: string; // HE-N-B-R01
  patternCategory?: string;
  meaningCategory?: string;
  colorCategory?: string;
  sequence?: number;
  name: MultilingualString;
  imageUrl: string; // Main transparent PNG
  originalImageUrl?: string; // Pre-digitalization photo
  categoryLabels: MultilingualString[];
  era: string;
  carrier: string;
  region: string;
  copyrightOwner: string;
  format: string; // e.g. 'PNG'
  resolution: string; // e.g. '8K'
  
  // Interpretation
  craft: MultilingualString;
  symbolism: MultilingualString;
  origin: MultilingualString;
  scenario: MultilingualString;
  literature: MultilingualString;
  inheritor: MultilingualString;
  visualAnalysis?: PatternVisualAnalysis;

  createdAt: string; // ISO String
  views: number;
}
