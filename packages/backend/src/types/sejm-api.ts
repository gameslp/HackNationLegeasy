// Typy dla Sejm API
// Dokumentacja: https://api.sejm.gov.pl/

export interface SejmVoting {
  abstain: number;
  date: string;
  description: string;
  kind: string;
  links: Array<{ href: string; rel: string }>;
  majorityType: string;
  majorityVotes: number;
  no: number;
  notParticipating: number;
  present: number;
  sitting: number;
  sittingDay: number;
  term: number;
  title: string;
  totalVoted: number;
  votingNumber: number;
  yes: number;
}

export interface SejmStageChild {
  date: string;
  stageName: string;
  committeeCode?: string;
  stageType: string;
  type?: string;
  voting?: SejmVoting;
}

export interface SejmStage {
  date: string | null;
  stageName: string;
  printNumber?: string;
  stageType: string;
  decision?: string;
  sittingNum?: number;
  children?: SejmStageChild[];
}

export interface SejmProcessResponse {
  ELI: string;
  UE: string;
  address?: string;
  changeDate?: string;
  closureDate?: string;
  displayAddress?: string;
  documentDate: string;
  documentType: string;
  documentTypeEnum: string;
  legislativeCommittee: boolean;
  links: Array<{ href: string; rel: string }>;
  number: string;
  passed: boolean;
  principleOfSubsidiarity: boolean;
  printsConsideredJointly?: string[];
  processStartDate: string;
  shortenProcedure: boolean;
  stages: SejmStage[];
  term: number;
  title: string;
  titleFinal?: string;
  urgencyStatus: string;
  webGeneratedDate: string;
}

export interface SejmPrint {
  number: string;
  title: string;
  documentDate: string;
  attachments: string[];
  processPrint: string[];
}

// Typy pomocnicze dla mapowania
export type PhaseType = 'PRECONSULTATION' | 'RCL' | 'SEJM' | 'SENAT' | 'PRESIDENT' | 'JOURNAL';

export interface MappedStage {
  name: string;
  date: Date | null;
  author: string | null;
  description: string | null;
  governmentLinks: string[];
  printNumber: string | null;
  order: number;
}

export interface MappedPhase {
  type: PhaseType;
  startDate: Date;
  endDate: Date | null;
  order: number;
  stages: MappedStage[];
}
