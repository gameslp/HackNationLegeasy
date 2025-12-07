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
  phaseOrder?: number;
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

export interface PhaseNameResult {
  id: string;
  type: PhaseType;
  name: string;
  lawId: string;
  lawName: string;
}

export interface PhaseListItem extends Phase {
  law: Pick<Law, 'id' | 'name' | 'author'>;
  _count: {
    stages: number;
  };
}

export interface StageListItem extends Stage {
  phase: {
    id: string;
    type: PhaseType;
    law: Pick<Law, 'id' | 'name'>;
  };
  _count: {
    files: number;
    discussions: number;
  };
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

// ==========================================
// ETAP 0 - PREKONSULTACJE (Pomysły ustaw)
// ==========================================

export type IdeaArea =
  | 'DIGITALIZATION'
  | 'HEALTH'
  | 'EDUCATION'
  | 'TRANSPORT'
  | 'ENVIRONMENT'
  | 'TAXES'
  | 'SECURITY'
  | 'SOCIAL'
  | 'ECONOMY'
  | 'OTHER';

export type IdeaStatus =
  | 'NEW'
  | 'COLLECTING'
  | 'SUMMARIZING'
  | 'CLOSED'
  | 'ARCHIVED'
  | 'CONVERTED';

export type IdeaStage = 'IDEA' | 'CONCEPT' | 'ASSUMPTIONS';

export type RespondentType = 'CITIZEN' | 'NGO' | 'COMPANY' | 'EXPERT';

export interface Idea {
  id: string;
  title: string;
  shortDescription: string;
  ministry: string;
  area: IdeaArea;
  status: IdeaStatus;
  stage: IdeaStage;
  problemDescription: string;
  proposedSolutions: string[];
  publishDate: string;
  opinionDeadline: string | null;
  closedDate: string | null;
  closureReason: string | null;
  lawId: string | null;
  aiSummary: string | null;
  aiSummaryDate: string | null;
  aiSummaryPublic: boolean;
  createdAt: string;
  updatedAt: string;
  totalOpinions?: number;
  totalSurveys?: number;
  _count?: {
    opinions: number;
    surveyResponses: number;
  };
}

export interface IdeaQuestion {
  id: string;
  ideaId: string;
  question: string;
  order: number;
  required: boolean;
  createdAt: string;
}

export interface IdeaTimelineEvent {
  id: string;
  ideaId: string;
  title: string;
  description: string | null;
  date: string;
  order: number;
  createdAt: string;
}

export interface IdeaAttachment {
  id: string;
  ideaId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface IdeaOpinion {
  id: string;
  ideaId: string;
  firstName: string;
  lastName: string;
  email: string;
  respondentType: RespondentType;
  organization: string | null;
  attachmentPath: string | null;
  attachmentName: string | null;
  createdAt: string;
  answers?: IdeaQuestionAnswer[];
}

export interface IdeaQuestionAnswer {
  id: string;
  questionId: string;
  opinionId: string;
  answer: string;
  createdAt: string;
  question?: IdeaQuestion;
}

export interface IdeaSurveyResponse {
  id: string;
  ideaId: string;
  firstName: string;
  lastName: string;
  email: string;
  support: number;
  importance: number;
  createdAt: string;
}

export interface IdeaWithDetails extends Idea {
  questions: IdeaQuestion[];
  timeline: IdeaTimelineEvent[];
  attachments: IdeaAttachment[];
  law?: { id: string; name: string } | null;
}

export interface IdeaStats {
  survey: {
    total: number;
    supportCounts: Record<number, number>;
    supportPercentages: {
      against: number;
      ratherAgainst: number;
      ratherFor: number;
      for: number;
    };
    importanceCounts: Record<number, number>;
    avgImportance: number;
  };
  opinions: {
    total: number;
    byType: Record<string, number>;
  };
}

export const IDEA_AREA_LABELS: Record<IdeaArea, string> = {
  DIGITALIZATION: 'Cyfryzacja',
  HEALTH: 'Zdrowie',
  EDUCATION: 'Edukacja',
  TRANSPORT: 'Transport',
  ENVIRONMENT: 'Środowisko',
  TAXES: 'Podatki',
  SECURITY: 'Bezpieczeństwo',
  SOCIAL: 'Polityka społeczna',
  ECONOMY: 'Gospodarka',
  OTHER: 'Inne',
};

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  NEW: 'Nowy',
  COLLECTING: 'Zbieramy opinie',
  SUMMARIZING: 'Podsumowujemy',
  CLOSED: 'Zamknięty',
  ARCHIVED: 'Zarchiwizowany',
  CONVERTED: 'Przekształcony w ustawę',
};

export const IDEA_STAGE_LABELS: Record<IdeaStage, string> = {
  IDEA: 'Pomysł',
  CONCEPT: 'Wstępna koncepcja',
  ASSUMPTIONS: 'Projekt założeń',
};

export const RESPONDENT_TYPE_LABELS: Record<RespondentType, string> = {
  CITIZEN: 'Osoba prywatna',
  NGO: 'Organizacja pozarządowa',
  COMPANY: 'Firma',
  EXPERT: 'Ekspert',
};

export const SUPPORT_LABELS: Record<number, string> = {
  1: 'Nie',
  2: 'Raczej nie',
  3: 'Raczej tak',
  4: 'Tak',
};

// ==========================================
// IMPACT RADAR - Analiza wpływu ustawy
// ==========================================

export interface ImpactCategoryDetails {
  benefits: string[];
  costs: string[];
  affectedGroups: string[];
  description: string;
}

export interface ImpactAnalysis {
  id: string;
  stageId: string;
  economicScore: number;
  socialScore: number;
  administrativeScore: number;
  technologicalScore: number;
  environmentalScore: number;
  overallScore: number;
  mainAffectedGroup: string | null;
  uncertaintyLevel: string | null;
  simpleSummary: string[];
  economicDetails: ImpactCategoryDetails | null;
  socialDetails: ImpactCategoryDetails | null;
  administrativeDetails: ImpactCategoryDetails | null;
  technologicalDetails: ImpactCategoryDetails | null;
  environmentalDetails: ImpactCategoryDetails | null;
  generatedAt: string;
  isPublished: boolean;
  editedByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StageWithImpact {
  stageId: string;
  stageName: string;
  stageDate: string;
  phaseId: string;
  phaseType: PhaseType;
  analysis: ImpactAnalysis;
}

export interface LawImpactResponse {
  law: {
    id: string;
    name: string;
    description: string;
  };
  analyses: StageWithImpact[];
}

export interface ImpactComparisonChange {
  category: string;
  before: number;
  after: number;
  change: number;
}

export interface ImpactComparison {
  sourceStage: {
    id: string;
    name: string;
    date: string;
  };
  targetStage: {
    id: string;
    name: string;
    date: string;
  };
  changes: ImpactComparisonChange[];
  overallChange: {
    before: number;
    after: number;
    change: number;
  };
}

export const IMPACT_CATEGORY_LABELS: Record<string, string> = {
  economic: 'Ekonomiczny',
  social: 'Społeczny',
  administrative: 'Administracyjny',
  technological: 'Technologiczny',
  environmental: 'Środowiskowy',
};

export const UNCERTAINTY_LABELS: Record<string, string> = {
  niska: 'Niska',
  średnia: 'Średnia',
  wysoka: 'Wysoka',
};
