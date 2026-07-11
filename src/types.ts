export interface MultilingualString {
  'zh-CN': string;
  'zh-TW'?: string;
  en?: string;
  ja?: string;
  ko?: string;
}

export interface PatternGene {
  id: string; // Document ID
  heCode: string; // HE-N-B-R01
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

  createdAt: string; // ISO String
  views: number;
}
