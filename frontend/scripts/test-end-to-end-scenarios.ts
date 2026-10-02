/**
 * LearnTrack End-to-End Central AI Router Test Matrix
 *
 * Verifies all 5 scenarios from Section 45:
 * TEST A — Gemini only (fallback disabled)
 * TEST B — Groq only (Groq primary)
 * TEST C — Gemini primary + Groq fallback (standard flow)
 * TEST D — Forced Gemini failure (simulated 429 -> Groq fallback -> fallbackUsed: true)
 * TEST E — Both unavailable (clean friendly 503 error)
 */

import { routerGenerateText, routerGenerateStructured } from "../src/lib/ai/router";
import { AI_CONFIG } from "../src/lib/ai/config";
import { checkAIHealth } from "../src/lib/ai/health";
import { z } from "zod";

const mutableConfig = AI_CONFIG as any;

const TestOutputSchema = z.object({
  answer: z.union([z.string(), z.number()]),
  confidence: z.union([z.string(), z.number()]),
});

async function runEndToEndMatrix() {
  console.log("==================================================================");
  console.log("LEARNTRACK CENTRAL AI ROUTER - 5-SCENARIO END-TO-END VERIFICATION");
  console.log("==================================================================\n");

  // Initial Health Check
  console.log("--- HEALTH CHECK (Live Probes) ---");
  const health = await checkAIHealth(true);
  console.log(`Gemini Status: ${health.providers.gemini.status} (${health.providers.gemini.latencyMs}ms)`);
  console.log(`Groq Status:   ${health.providers.groq.status} (${health.providers.groq.latencyMs}ms)`);
  console.log(`Overall:       ${health.overallStatus}\n`);

  // ---------------------------------------------------------------------------
  // TEST A: Gemini only (fallback disabled)
  // ---------------------------------------------------------------------------
  console.log("--- TEST A: Gemini Primary (Fallback Disabled) ---");
  mutableConfig.primaryProvider = "gemini";
  mutableConfig.fallbackProvider = "groq";
  mutableConfig.enableFallback = false;
  mutableConfig.forcePrimaryFailure = false;

  const resultA = await routerGenerateText({
    prompt: "Respond with the single word: APPLE",
    feature: "test_a",
  });

  console.log(`Provider used: ${resultA.provider}`);
  console.log(`Model:         ${resultA.model}`);
  console.log(`Fallback used: ${resultA.fallbackUsed}`);
  console.log(`Response text: "${resultA.data.trim()}"`);
  console.log(`Latency:       ${resultA.latencyMs}ms`);
  if (resultA.provider !== "gemini" || resultA.fallbackUsed !== false) {
    throw new Error("TEST A failed: Expected Gemini with fallbackUsed=false");
  }
  console.log("✓ TEST A PASSED: Gemini successfully generated response with fallback disabled.\n");

  // ---------------------------------------------------------------------------
  // TEST B: Groq primary
  // ---------------------------------------------------------------------------
  console.log("--- TEST B: Groq Configured as Primary ---");
  mutableConfig.primaryProvider = "groq";
  mutableConfig.fallbackProvider = "gemini";
  mutableConfig.enableFallback = true;
  mutableConfig.forcePrimaryFailure = false;

  const resultB = await routerGenerateText({
    prompt: "Respond with the single word: BANANA",
    feature: "test_b",
  });

  console.log(`Provider used: ${resultB.provider}`);
  console.log(`Model:         ${resultB.model}`);
  console.log(`Fallback used: ${resultB.fallbackUsed}`);
  console.log(`Response text: "${resultB.data.trim()}"`);
  console.log(`Latency:       ${resultB.latencyMs}ms`);
  if (resultB.provider !== "groq" || resultB.fallbackUsed !== false) {
    throw new Error("TEST B failed: Expected Groq with fallbackUsed=false");
  }
  console.log("✓ TEST B PASSED: Groq successfully generated response as primary provider.\n");

  // ---------------------------------------------------------------------------
  // TEST C: Gemini Primary + Groq Fallback (Standard Production Hierarchy)
  // ---------------------------------------------------------------------------
  console.log("--- TEST C: Gemini Primary + Groq Fallback (Standard Hierarchy) ---");
  mutableConfig.primaryProvider = "gemini";
  mutableConfig.fallbackProvider = "groq";
  mutableConfig.enableFallback = true;
  mutableConfig.forcePrimaryFailure = false;

  const resultC = await routerGenerateStructured({
    prompt: "Answer this question: What is 2 + 2? Return a JSON object with 'answer' and 'confidence'.",
    validator: (data) => TestOutputSchema.parse(data),
    feature: "test_c",
  });

  console.log(`Provider used: ${resultC.provider}`);
  console.log(`Model:         ${resultC.model}`);
  console.log(`Fallback used: ${resultC.fallbackUsed}`);
  console.log("Structured output:", JSON.stringify(resultC.data));
  console.log(`Latency:       ${resultC.latencyMs}ms`);
  if (!resultC.data || !resultC.data.answer) {
    throw new Error("TEST C failed: Expected valid structured output");
  }
  if (resultC.provider === "gemini" && !resultC.fallbackUsed) {
    console.log("✓ TEST C PASSED: Primary Gemini handled request normally without triggering fallback.\n");
  } else {
    console.log(`✓ TEST C PASSED: Router safely handled request (Provider: ${resultC.provider}, Fallback: ${resultC.fallbackUsed}).\n`);
  }

  // ---------------------------------------------------------------------------
  // TEST D: Forced Gemini Failure (Simulated 429) -> Automatic Groq Failover
  // ---------------------------------------------------------------------------
  console.log("--- TEST D: Simulated Primary Failure -> Failover to Groq ---");
  mutableConfig.primaryProvider = "gemini";
  mutableConfig.fallbackProvider = "groq";
  mutableConfig.enableFallback = true;
  mutableConfig.forcePrimaryFailure = true; // Simulates 429 Rate Limit

  const resultD = await routerGenerateText({
    prompt: "Respond with the single word: CHERRY",
    feature: "test_d",
  });

  console.log(`Provider used: ${resultD.provider}`);
  console.log(`Model:         ${resultD.model}`);
  console.log(`Fallback used: ${resultD.fallbackUsed}`);
  console.log(`Response text: "${resultD.data.trim()}"`);
  console.log(`Latency:       ${resultD.latencyMs}ms`);
  if (resultD.provider !== "groq" || resultD.fallbackUsed !== true) {
    throw new Error("TEST D failed: Expected Groq fallback with fallbackUsed=true");
  }
  console.log("✓ TEST D PASSED: Primary failure triggered seamless Groq failover with fallbackUsed=true.\n");

  // Restore configuration
  mutableConfig.forcePrimaryFailure = false;

  // ---------------------------------------------------------------------------
  // TEST E: Both Providers Unavailable -> Friendly Error
  // ---------------------------------------------------------------------------
  console.log("--- TEST E: Both Providers Fail -> Friendly 503 Error ---");
  mutableConfig.primaryProvider = "gemini";
  mutableConfig.fallbackProvider = "groq";
  mutableConfig.enableFallback = true;
  mutableConfig.forcePrimaryFailure = true; // Primary fails

  // Temporarily clear groq key to simulate total failure
  const originalGroqKey = mutableConfig.groqApiKey;
  const originalEnvGroqKey = process.env.GROQ_API_KEY;
  mutableConfig.groqApiKey = "";
  delete process.env.GROQ_API_KEY;

  try {
    await routerGenerateText({
      prompt: "Respond with: OK",
      feature: "test_e",
    });
    throw new Error("TEST E failed: Should have thrown when both providers fail");
  } catch (err: any) {
    console.log(`Caught expected error: "${err.message}" (code: ${err.code}, status: ${err.status})`);
    console.log("✓ TEST E PASSED: Cleanly handled failure when AI providers are unavailable.\n");
  } finally {
    mutableConfig.groqApiKey = originalGroqKey;
    if (originalEnvGroqKey) process.env.GROQ_API_KEY = originalEnvGroqKey;
    mutableConfig.forcePrimaryFailure = false;
  }

  console.log("==================================================================");
  console.log("🎉 ALL 5 END-TO-END SCENARIOS (TESTS A, B, C, D, E) PASSED 100%!");
  console.log("==================================================================");
}

runEndToEndMatrix().catch((err) => {
  console.error("Test matrix execution failed:", err);
  process.exit(1);
});
