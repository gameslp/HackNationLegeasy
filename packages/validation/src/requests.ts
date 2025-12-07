import { z } from 'zod';

// ============ ENUMS ============
export const PhaseTypeSchema = z.enum([
  'PRECONSULTATION',
  'RCL',
  'SEJM',
  'SENAT',
  'PRESIDENT',
  'JOURNAL',
]);

export const FileTypeSchema = z.enum(['LAW_PDF', 'LAW_TXT', 'RELATED']);

// ============ LAWS ============
export const CreateLawRequestSchema = z.object({
  name: z.string().min(1).max(500),
  author: z.string().min(1).max(255),
  description: z.string().min(1),
  startDate: z.string().datetime(),
  publishDate: z.string().datetime().nullable().optional(),
});

export const UpdateLawRequestSchema = z.object({
  name: z.string().max(500).optional(),
  author: z.string().max(255).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  publishDate: z.string().datetime().nullable().optional(),
});

export const GetLawsQuerySchema = z.object({
  search: z.string().optional(),
  phaseType: PhaseTypeSchema.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ============ PHASES ============
export const CreatePhaseRequestSchema = z.object({
  type: PhaseTypeSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  order: z.number().int().positive().optional(),
});

export const UpdatePhaseRequestSchema = z.object({
  type: PhaseTypeSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().nullable().optional(),
  order: z.number().int().positive().optional(),
});

// ============ STAGES ============
export const CreateStageRequestSchema = z.object({
  name: z.string().min(1).max(500),
  date: z.string().datetime(),
  author: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  governmentLinks: z.array(z.string().url()).optional().default([]),
  lawTextContent: z.string().nullable().optional(),
  order: z.number().int().positive().optional(),
});

export const UpdateStageRequestSchema = z.object({
  name: z.string().max(500).optional(),
  date: z.string().datetime().optional(),
  author: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  governmentLinks: z.array(z.string().url()).optional(),
  lawTextContent: z.string().nullable().optional(),
  order: z.number().int().positive().optional(),
});

// ============ FILES ============
export const UploadFileRequestSchema = z.object({
  fileType: FileTypeSchema,
});

export const ImportFileFromLinkRequestSchema = z.object({
  url: z.string().url(),
  fileType: FileTypeSchema.default('RELATED'),
  name: z.string().max(500).optional(),
  stageName: z.string().max(500).optional(),
});

// ============ DISCUSSIONS ============
export const CreateDiscussionRequestSchema = z.object({
  nickname: z.string().min(1).max(100),
  content: z.string().min(1),
});

// ============ DIFF ============
export const DiffQuerySchema = z.object({
  sourceStageId: z.string().min(1),
  targetStageId: z.string().min(1),
});

// ============ AI ANALYSIS ============
export const AnalyzeRequestSchema = z.object({
  fileId: z.string().nullable().optional(),
});

// ============ PARAMS ============
export const PhaseIdParamsSchema = z.object({
  phaseId: z.string().min(1),
});

// ============ UTILS ============
export const ScanLinksRequestSchema = z.object({
  link: z.string().url(),
  phaseName: z.string().min(1),
  stageName: z.string().min(1),
});

// ============ TYPES ============
export type CreateLawRequest = z.infer<typeof CreateLawRequestSchema>;
export type UpdateLawRequest = z.infer<typeof UpdateLawRequestSchema>;
export type GetLawsQuery = z.infer<typeof GetLawsQuerySchema>;

export type CreatePhaseRequest = z.infer<typeof CreatePhaseRequestSchema>;
export type UpdatePhaseRequest = z.infer<typeof UpdatePhaseRequestSchema>;

export type CreateStageRequest = z.infer<typeof CreateStageRequestSchema>;
export type UpdateStageRequest = z.infer<typeof UpdateStageRequestSchema>;

export type UploadFileRequest = z.infer<typeof UploadFileRequestSchema>;
export type ImportFileFromLinkRequest = z.infer<typeof ImportFileFromLinkRequestSchema>;

export type CreateDiscussionRequest = z.infer<typeof CreateDiscussionRequestSchema>;

export type DiffQuery = z.infer<typeof DiffQuerySchema>;

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export type PhaseIdParams = z.infer<typeof PhaseIdParamsSchema>;

export type ScanLinksRequest = z.infer<typeof ScanLinksRequestSchema>;

// ============ SEJM IMPORT ============
export const ImportSejmProcessSchema = z.object({
  term: z.number().int().positive().min(1).max(20),
  processNumber: z.string().min(1).max(50),
  lawId: z.string().optional(), // Opcjonalne ID istniejącej ustawy do zaimportowania danych
});

export type ImportSejmProcessRequest = z.infer<typeof ImportSejmProcessSchema>;
