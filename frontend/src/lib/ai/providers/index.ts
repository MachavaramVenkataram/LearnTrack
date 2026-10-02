/**
 * LearnTrack AI Providers Registry
 *
 * Central registry mapping provider names to their concrete AIProvider implementations.
 * Enables runtime lookup without individual feature components directly instantiating providers.
 */

import { AIProvider } from "../provider";
import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";

export * from "../provider";
export { GeminiProvider } from "./gemini";
export { GroqProvider } from "./groq";

const providerRegistry = new Map<string, AIProvider>();

/**
 * Retrieves an instantiated AIProvider by name.
 * Throws a descriptive error if the provider is unsupported.
 */
export function getAIProvider(name: string): AIProvider {
  const normalized = name.toLowerCase().trim();
  if (providerRegistry.has(normalized)) {
    return providerRegistry.get(normalized)!;
  }

  if (normalized === "gemini") {
    const provider = new GeminiProvider();
    providerRegistry.set(normalized, provider);
    return provider;
  }

  if (normalized === "groq") {
    const provider = new GroqProvider();
    providerRegistry.set(normalized, provider);
    return provider;
  }

  throw new Error(`Unsupported AI provider: "${name}". Valid providers are "gemini" and "groq".`);
}

/**
 * Registers an AIProvider instance into the registry.
 * Useful for mocking providers in tests or adding future providers.
 */
export function registerAIProvider(name: string, provider: AIProvider): void {
  providerRegistry.set(name.toLowerCase().trim(), provider);
}

/**
 * Clears the provider registry (useful in test teardown).
 */
export function clearProviderRegistry(): void {
  providerRegistry.clear();
}
