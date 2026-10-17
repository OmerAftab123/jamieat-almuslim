import { z } from 'zod';

/**
 * Validation schemas for every dataset under data/.
 * Datasets are validated when the data layer loads (lib/data.ts), so a malformed
 * record fails loudly with a readable message instead of rendering wrong results.
 */

export const CRITERION_KEYS = [
  'islamic',
  'benefit',
  'financial',
  'futureResilience',
  'aiResilience',
  'employmentStability',
  'flexibility',
] as const;
export type CriterionKey = (typeof CRITERION_KEYS)[number];

export const scoreSchema = z.number().int().min(0).max(4);

export const sourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.string().url(),
  type: z.enum([
    'primary-official',
    'credible-secondary-research',
    'islamic-primary',
    'anecdotal',
  ]),
  publishedOrRevised: z.string(),
  lastChecked: z.string(),
  verificationMethod: z.string().min(1),
  supports: z.array(z.string()),
});

export const sourcesFileSchema = z.object({
  datasetVersion: z.string(),
  sources: z.array(sourceSchema),
});

export const degreeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  family: z.string().min(1),
  aliases: z.array(z.string()),
  origin: z.enum(['seed', 'expansion']),
});

export const degreesFileSchema = z.object({
  datasetVersion: z.string(),
  normalizationPolicy: z.string(),
  degrees: z.array(degreeSchema),
});

const criterionScoreSchema = z.object({
  score: scoreSchema,
  rationale: z.string().min(10),
});

export const familySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string(),
  pathways: z.array(z.string()).min(1),
  scores: z.object(
    Object.fromEntries(CRITERION_KEYS.map((k) => [k, criterionScoreSchema])) as Record<
      CriterionKey,
      typeof criterionScoreSchema
    >,
  ),
  confidence: z.enum(['low', 'medium', 'high']),
  sources: z.array(z.string()),
  assumptions: z.array(z.string()),
  changeFactors: z.array(z.string()),
  additionalQualifications: z.string().nullable(),
});

export const familiesFileSchema = z.object({
  datasetVersion: z.string(),
  researchStatus: z.string(),
  researchStatusNote: z.string(),
  families: z.array(familySchema),
});

export const universitySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  alternateNames: z.array(z.string()),
  qsRank: z.object({
    display: z.string().regex(/^=?\d+$/),
    position: z.number().int().positive(),
    tied: z.boolean(),
  }),
  qsOverallScore: z.number().min(0).max(100),
  qsEdition: z.string(),
  qsSourceId: z.string(),
  qsProfileUrl: z.string().url(),
  country: z.string(),
  city: z.string(),
  officialWebsite: z.string().url().nullable(),
  dataStatus: z.object({
    qsRank: z.string(),
    programs: z.string(),
    admissions: z.string(),
    scholarships: z.string(),
    costs: z.string(),
  }),
  lastVerified: z.string(),
  programs: z.array(z.unknown()),
  admissions: z.unknown().nullable(),
  costs: z
    .object({
      totalCostOfAttendance2026_27USD: z.number().positive(),
      sourceId: z.string(),
      note: z.string(),
    })
    .nullable(),
  scholarshipIds: z.array(z.string()),
  notes: z.array(z.string()),
});

export const universitiesFileSchema = z.object({
  datasetVersion: z.string(),
  coverage: z.object({
    source: z.string(),
    edition: z.string(),
    rankRangeTranscribed: z.string(),
    rankRangePending: z.string(),
    crossCheckStatus: z.string(),
    verificationDate: z.string(),
  }),
  universities: z.array(universitySchema),
});

export const scholarshipSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  universityId: z.string(),
  name: z.string().min(1),
  funder: z.string(),
  awardType: z.enum(['need-based', 'merit-based', 'mixed', 'nomination', 'external', 'unknown']),
  classification: z.enum(['full-tuition', 'full-ride', 'full-cost-of-attendance', 'partial', 'unconfirmed']),
  classificationNote: z.string(),
  coverage: z.record(z.string(), z.string()),
  eligibility: z.object({
    applicantScope: z.enum(['all-applicants', 'international-only', 'nationalities']),
    applicantScopeNote: z.string(),
    nationalities: z.array(z.string()).optional(),
    requiresFinancialNeed: z.boolean(),
    degreeFamilyScope: z.union([z.literal('any'), z.array(z.string())]),
    programmeScopeNote: z.string(),
    citizenshipOrResidency: z.string(),
    nonUsApplicantNote: z.string(),
    academicConditions: z.string(),
    renewalConditions: z.string(),
  }),
  requiredDocuments: z.array(z.string()),
  applicationMethod: z.string(),
  deadlines: z.record(z.string(), z.string()),
  selectionStatistics: z.string(),
  uncoveredCosts: z.array(z.string()),
  loansIncluded: z.boolean(),
  loansNote: z.string(),
  sources: z.array(z.string()).min(1),
  lastVerified: z.string(),
  verificationStatus: z.enum([
    'official-sources-verified',
    'official-sources-partially-verified',
    'unverified',
  ]),
  verificationNote: z.string(),
});

export const scholarshipsFileSchema = z.object({
  datasetVersion: z.string(),
  classificationDefinitions: z.record(z.string(), z.string()),
  scholarships: z.array(scholarshipSchema),
});

export const fxRateSchema = z.object({
  quote: z.string().regex(/^[A-Z]{3}$/),
  label: z.string().min(1),
  /** Units of the quote currency per 1 USD. */
  rate: z.number().positive(),
  rateType: z.string(),
  rateDate: z.string(),
  sourceId: z.string(),
  sourceUrl: z.string().url(),
  retrievedVia: z.string(),
  note: z.string(),
});

export const fxSchema = z.object({
  base: z.literal('USD'),
  datasetVersion: z.string(),
  note: z.string(),
  rates: z.array(fxRateSchema).min(1),
});

export type Source = z.infer<typeof sourceSchema>;
export type Degree = z.infer<typeof degreeSchema>;
export type Family = z.infer<typeof familySchema>;
export type University = z.infer<typeof universitySchema>;
export type Scholarship = z.infer<typeof scholarshipSchema>;
export type FxRate = z.infer<typeof fxRateSchema>;
export type FxFile = z.infer<typeof fxSchema>;
