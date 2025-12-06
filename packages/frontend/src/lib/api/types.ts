export type PhaseType =
  | 'PRECONSULTATION'
  | 'RCL'
  | 'SEJM'
  | 'SENAT'
  | 'PRESIDENT'
  | 'JOURNAL';

export type FileType = 'LAW_PDF' | 'LAW_TXT' | 'RELATED';

export interface Law {
  id: string;
  name: string;
  author: string;
  description: string;
  startDate: string;
  publishDate: string | null;
  createdAt: string;
  updatedAt: string;
  currentPhase?: PhaseType | null;
}

export interface Phase {
  id: string;
  lawId: string;
  type: PhaseType;
  startDate: string;
  endDate: string | null;
  order: number;
  createdAt: string;
}

export interface Stage {
  id: string;
  phaseId: string;
  name: string;
  date: string;
  author: string | null;
  description: string | null;
  governmentLinks: string[];
  lawPdfPath: string | null;
  lawPdfName: string | null;
  lawTextContent: string | null;
  order: number;
  createdAt: string;
  phaseType?: PhaseType;
}

export interface StageFile {
  id: string;
  stageId: string;
  fileName: string;
  filePath: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface Discussion {
  id: string;
  stageId: string;
  nickname: string;
  content: string;
  createdAt: string;
}

export interface LawWithPhases extends Law {
  phases: Phase[];
}

export interface PhaseWithStages extends Phase {
  stages: Stage[];
}

export interface StageDetail extends Stage {
  files: StageFile[];
  discussions: Discussion[];
}

export interface DiffResult {
  sourceStage: Stage;
  targetStage: Stage;
  diff: string;
  additions: number;
  deletions: number;
}

export interface AnalysisResult {
  summary: string;
  changes: string[];
  effects: string[];
  simplifiedExplanation: string;
}

export interface DiffAnalysisResult {
  explanation: string;
  keyChanges: string[];
  impact: string;
}

export interface AdminStats {
  totalLaws: number;
  totalPhases: number;
  totalStages: number;
  totalDiscussions: number;
  lawsByPhase: Record<string, number>;
}

export const PHASE_LABELS: Record<PhaseType, string> = {
  PRECONSULTATION: 'Prekonsultacje',
  RCL: 'RCL',
  SEJM: 'Sejm',
  SENAT: 'Senat',
  PRESIDENT: 'Prezydent',
  JOURNAL: 'Dziennik Ustaw',
};

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  LAW_PDF: 'PDF Ustawy',
  LAW_TXT: 'Tekst Ustawy',
  RELATED: 'Plik powiązany',
};
