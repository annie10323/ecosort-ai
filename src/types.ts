export type WasteCategory =
  | 'RECYCLABLE_PLASTIC'
  | 'RECYCLABLE_PAPER'
  | 'RECYCLABLE_PAPER_CONTAINER'
  | 'RECYCLABLE_GLASS'
  | 'RECYCLABLE_METAL'
  | 'RECYCLABLE_ELECTRONIC'
  | 'RECYCLABLE_FABRIC'
  | 'FOOD_WASTE_RAW'
  | 'FOOD_WASTE_COOKED'
  | 'GENERAL_WASTE'
  | 'HAZARDOUS_WASTE'
  | 'BULKY_WASTE';

export interface ComponentBreakdown {
  partName: string;
  material: string;
  targetBin: string;
  actionNote: string;
}

export interface WasteAnalysisResult {
  itemName: string;
  englishName: string;
  category: WasteCategory;
  categoryName: string;
  targetBinColor: 'blue' | 'yellow' | 'red' | 'green' | 'amber' | 'stone' | 'purple';
  confidence: number;
  summary: string;
  disposalSteps: string[];
  componentsBreakdown: ComponentBreakdown[];
  recyclingCode?: string;
  ecoImpact: string;
  commonMistakes: string;
  warningNote?: string;
  cleanlinessRequirement: string;
  wasteReductionTips: string[];
}

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  result: WasteAnalysisResult;
  completedAt?: number;
  ecoPoints: number;
}

export interface GuideItem {
  id: string;
  name: string;
  category: WasteCategory;
  categoryName: string;
  binColor: 'blue' | 'yellow' | 'red' | 'green' | 'amber' | 'stone' | 'purple';
  tags: string[];
  preparation: string;
  trapWarning?: string;
  recyclingCode?: string;
  components?: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  categoryName: string;
}
