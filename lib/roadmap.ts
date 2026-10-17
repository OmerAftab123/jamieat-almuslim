import type { MatchResult } from '@/lib/matching';

/**
 * Roadmap templates. Every step is labelled with its kind so users can tell an official
 * deadline from a checklist item or a suggested personal target. No calendar dates are invented.
 */

export type StepKind = 'official-deadline' | 'checklist' | 'suggested-personal';

export type RoadmapStep = {
  id: string;
  phase: string;
  title: string;
  detail: string;
  kind: StepKind;
  timing: string;
};

export const KIND_LABEL: Record<StepKind, string> = {
  'official-deadline': 'Official deadline (check the source for the date)',
  checklist: 'Checklist item',
  'suggested-personal': 'Suggested personal target (you set the date)',
};

export const ROADMAP_TEMPLATE: RoadmapStep[] = [
  {
    id: 'eligibility',
    phase: '1. Assess',
    title: 'Check academic eligibility',
    detail: 'Compare your secondary-school subjects and results with the official requirements for the degree and university. Note any gaps.',
    kind: 'checklist',
    timing: 'Start now',
  },
  {
    id: 'gaps',
    phase: '1. Assess',
    title: 'Close prerequisite gaps and book required tests',
    detail: 'Missing subjects, prerequisite courses, English-language tests and any aptitude or entrance tests named by the university.',
    kind: 'checklist',
    timing: 'As early as possible; test dates are set by the test provider',
  },
  {
    id: 'academic-prep',
    phase: '2. Prepare',
    title: 'Build subject strength and evidence of interest',
    detail: 'Independent projects, reading and practice in the subjects of your degree. Choose depth over number of activities.',
    kind: 'suggested-personal',
    timing: 'Your own schedule',
  },
  {
    id: 'extracurricular',
    phase: '2. Prepare',
    title: 'Develop meaningful, verifiable activities',
    detail: 'Volunteering, competitions, research or work related to your degree. Keep records and references of what you did.',
    kind: 'suggested-personal',
    timing: 'Your own schedule',
  },
  {
    id: 'shortlist',
    phase: '3. Decide',
    title: 'Finalise your university shortlist',
    detail: 'Use only records whose programme and requirements are verified. Keep a safety option as well as ambitious choices.',
    kind: 'checklist',
    timing: 'Before application deadlines',
  },
  {
    id: 'funding-research',
    phase: '3. Decide',
    title: 'Research and rank funding routes',
    detail: 'Separate tuition-only awards from full cost-of-attendance awards. Keep interest-bearing loans out of the free-education route unless you decide otherwise.',
    kind: 'checklist',
    timing: 'Before application deadlines',
  },
  {
    id: 'documents',
    phase: '4. Apply',
    title: 'Collect documents and certified translations',
    detail: 'Transcripts, certificates, English test results, passport and any required attestations or translations. Confirm the exact list on the official portal.',
    kind: 'checklist',
    timing: 'Several months before deadlines (official list governs)',
  },
  {
    id: 'essays-references',
    phase: '4. Apply',
    title: 'Draft essays and request references',
    detail: 'Only where the university requires them. Give referees enough notice and a summary of your activities.',
    kind: 'checklist',
    timing: 'Before the earliest official deadline',
  },
  {
    id: 'submit-admissions',
    phase: '4. Apply',
    title: 'Submit admissions applications',
    detail: 'Submit through the official portal before the published deadline. Keep the confirmation.',
    kind: 'official-deadline',
    timing: 'Official deadline (see university source)',
  },
  {
    id: 'submit-scholarships',
    phase: '4. Apply',
    title: 'Submit scholarship applications and attend any interviews',
    detail: 'Some awards need a separate form (for example a financial-aid profile) and deadlines can differ from admissions.',
    kind: 'official-deadline',
    timing: 'Official deadline (see funder source)',
  },
  {
    id: 'verify-award',
    phase: '5. Confirm',
    title: 'Verify award terms and the remaining gap',
    detail: 'Read renewal conditions, minimum GPA rules and what the award excludes. Compare the remaining cost with your budget.',
    kind: 'checklist',
    timing: 'When offers arrive',
  },
  {
    id: 'visa',
    phase: '5. Confirm',
    title: 'Prepare visa and immigration documents',
    detail: 'Use the official government visa website for your destination. Requirements, fees and processing times change; check them then.',
    kind: 'checklist',
    timing: 'After admission is confirmed (check official timelines)',
  },
  {
    id: 'pre-departure',
    phase: '6. Depart',
    title: 'Arrange accommodation, insurance, travel and banking',
    detail: 'Plan accommodation, health insurance, flights and the way you will receive money. Check whether any of these are covered by an award.',
    kind: 'suggested-personal',
    timing: 'Before departure',
  },
  {
    id: 'enrolment',
    phase: '6. Depart',
    title: 'Confirm enrolment and plan your first year',
    detail: 'Complete enrolment, attend orientation, and plan your first-year courses and prayer, food and community arrangements.',
    kind: 'checklist',
    timing: 'As set by the university',
  },
];

/** Build a roadmap for a specific degree–university match. Adds only steps the evidence supports. */
export function buildRoadmap(match: MatchResult): RoadmapStep[] {
  const steps: RoadmapStep[] = ROADMAP_TEMPLATE.map((s) => ({ ...s }));
  if (match.program.status !== 'program-verified') {
    steps.unshift({
      id: 'verify-programme',
      phase: '1. Assess',
      title: `Verify that ${match.degree.name} is offered at ${match.university.name}`,
      detail: 'No verified undergraduate record exists yet. Check the official course list before planning further.',
      kind: 'checklist',
      timing: 'Start now',
    });
  }
  if (match.funding.matches.length === 0) {
    steps.push({
      id: 'funding-gap',
      phase: '5. Confirm',
      title: 'Plan for an unfunded or unverified cost gap',
      detail: 'No verified award is recorded for this profile. Budget for the full cost or research more funding routes.',
      kind: 'suggested-personal',
      timing: 'Before accepting an offer',
    });
  }
  return steps;
}

/** Stable storage key for progress checkboxes. */
export const ROADMAP_STORAGE_KEY = 'jamieat-roadmap-progress-v1';
