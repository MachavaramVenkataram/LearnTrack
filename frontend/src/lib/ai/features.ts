/**
 * LearnTrack Central AI Feature Registry
 *
 * Centrally declares all AI capabilities across the platform.
 * Enables granular feature-flagging and telemetry tagging.
 */

export const AI_FEATURES = {
  assistant: true,
  flashcards: true,
  studyPlan: true,
  insights: true,
  explanations: true,
  practice: true,
  examPrep: true,
  notebook: true,
  knowledgeBase: true,
  recommendations: true,
  simulator: true,
  career: true,
} as const;

export type AIFeatureName = keyof typeof AI_FEATURES;

export function isAIFeatureEnabled(feature: AIFeatureName): boolean {
  return Boolean(AI_FEATURES[feature]);
}
