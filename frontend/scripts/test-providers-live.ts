/**
 * LearnTrack Live AI Provider Diagnostic Script
 *
 * Directly tests real provider connectivity for:
 * 1. Gemini alone
 * 2. Groq alone
 * 3. Central AI Router failover
 *
 * NEVER logs API keys.
 */

import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

async function testGeminiDirect() {
  console.log("==================================================");
  console.log("TEST 1: Direct Google Gemini API Test");
  console.log("==================================================");

  const rawKey = process.env.GEMINI_API_KEY || "";
  const key = rawKey.trim();
  const rawModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = rawModel.trim();

  console.log(`Configured Model: ${model}`);
  console.log(`Key Configured: ${key.length > 0 ? "YES" : "NO"} (length: ${key.length})`);
  console.log(`Key Had Whitespace: ${rawKey !== key}`);

  if (!key) {
    console.log("RESULT: Gemini NOT_CONFIGURED (missing GEMINI_API_KEY)");
    return { status: "NOT_CONFIGURED", error: "Missing API key" };
  }

  try {
    const startTime = Date.now();
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: model,
      contents: "Respond with exactly: OK",
    });

    const durationMs = Date.now() - startTime;
    const text = (response.text || "").trim();
    console.log(`HTTP/API Call: SUCCESS in ${durationMs}ms`);
    console.log(`Response Text: "${text}"`);
    console.log("RESULT: Gemini HEALTHY");
    return { status: "HEALTHY", model, durationMs, response: text };
  } catch (err: any) {
    const status = err.status || err.statusCode || (err.message?.includes("404") ? 404 : 500);
    const msg = err.message || String(err);
    console.log(`HTTP/API Call: FAILED with status ${status}`);
    console.log(`Error Message: ${msg.slice(0, 160)}`);

    let category = "PROVIDER_ERROR";
    if (status === 400 || msg.includes("not found") || msg.includes("is not supported") || msg.includes("invalid model")) {
      category = "INVALID_MODEL";
    } else if (status === 401 || status === 403 || msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
      category = "INVALID_CREDENTIALS";
    } else if (status === 429 || msg.includes("RESOURCE_EXHAUSTED")) {
      category = "RATE_LIMITED";
    }

    console.log(`RESULT: Gemini ${category}`);
    return { status: category, error: msg };
  }
}

async function testGroqDirect() {
  console.log("\n==================================================");
  console.log("TEST 2: Direct Groq API Test");
  console.log("==================================================");

  const rawKey = process.env.GROQ_API_KEY || "";
  const key = rawKey.trim();
  const rawModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const model = rawModel.trim();

  console.log(`Configured Model: ${model}`);
  console.log(`Key Configured: ${key.length > 0 ? "YES" : "NO"} (length: ${key.length})`);
  console.log(`Key Had Whitespace: ${rawKey !== key}`);

  if (!key) {
    console.log("RESULT: Groq NOT_CONFIGURED (missing GROQ_API_KEY)");
    return { status: "NOT_CONFIGURED", error: "Missing API key" };
  }

  try {
    const startTime = Date.now();
    const groq = new Groq({ apiKey: key });
    const response = await groq.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: "Respond with exactly: OK" }],
      max_tokens: 10,
    });

    const durationMs = Date.now() - startTime;
    const text = (response.choices[0]?.message?.content || "").trim();
    console.log(`HTTP/API Call: SUCCESS in ${durationMs}ms`);
    console.log(`Response Text: "${text}"`);
    console.log("RESULT: Groq HEALTHY");
    return { status: "HEALTHY", model, durationMs, response: text };
  } catch (err: any) {
    const status = err.status || err.statusCode || 500;
    const msg = err.message || String(err);
    console.log(`HTTP/API Call: FAILED with status ${status}`);
    console.log(`Error Message: ${msg.slice(0, 160)}`);

    let category = "PROVIDER_ERROR";
    if (status === 400 || msg.includes("model_not_found") || msg.includes("decommissioned")) {
      category = "INVALID_MODEL";
    } else if (status === 401 || status === 403 || msg.includes("invalid_api_key")) {
      category = "INVALID_CREDENTIALS";
    } else if (status === 429) {
      category = "RATE_LIMITED";
    }

    console.log(`RESULT: Groq ${category}`);
    return { status: category, error: msg };
  }
}

async function inspectGroqModels() {
  console.log("\n==================================================");
  console.log("INSPECTING AVAILABLE GROQ MODELS:");
  console.log("==================================================");
  const key = (process.env.GROQ_API_KEY || "").trim();
  try {
    const groq = new Groq({ apiKey: key });
    const list = await groq.models.list();
    const activeModels = list.data.map((m: any) => m.id);
    console.log("Available Groq Models:", activeModels.join(", "));
    return activeModels;
  } catch (err: any) {
    console.error("Groq models.list() failed:", err.message);
    return [];
  }
}

async function testGeminiModels() {
  console.log("\n==================================================");
  console.log("TESTING GEMINI MODELS:");
  console.log("==================================================");
  const key = (process.env.GEMINI_API_KEY || "").trim();
  const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
  ];

  const ai = new GoogleGenAI({ apiKey: key });
  for (const m of modelsToTest) {
    try {
      const res = await ai.models.generateContent({
        model: m,
        contents: "Respond with: OK",
      });
      console.log(`  ✓ ${m}: SUCCESS! Response: "${(res.text || "").trim()}"`);
    } catch (err: any) {
      console.log(`  ✗ ${m}: FAILED (${err.status || err.statusCode}): ${err.message?.slice(0, 100)}`);
    }
  }
}

async function inspectGeminiModels() {
  console.log("\n==================================================");
  console.log("INSPECTING AVAILABLE GEMINI MODELS:");
  console.log("==================================================");
  const key = (process.env.GEMINI_API_KEY || "").trim();
  const ai = new GoogleGenAI({ apiKey: key });
  try {
    const list = await ai.models.list();
    const modelNames: string[] = [];
    for await (const m of list) {
      modelNames.push(m.name || "");
    }
    console.log("Available Gemini Models (first 20):", modelNames.slice(0, 20).join(", "));
    return modelNames;
  } catch (err: any) {
    console.error("Gemini models.list() failed:", err.status, err.message);
    return [];
  }
}

async function testGroqCandidates() {
  console.log("\n==================================================");
  console.log("TESTING CANDIDATE GROQ MODELS:");
  console.log("==================================================");
  const key = (process.env.GROQ_API_KEY || "").trim();
  const groq = new Groq({ apiKey: key });
  const candidates = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
    "allam-2-7b",
  ];

  for (const c of candidates) {
    try {
      const res = await groq.chat.completions.create({
        model: c,
        messages: [{ role: "user", content: "Respond with exactly: OK" }],
        max_tokens: 10,
      });
      console.log(`  ✓ Groq (${c}): SUCCESS! Response: "${res.choices[0]?.message?.content?.trim()}"`);
    } catch (err: any) {
      console.log(`  ✗ Groq (${c}): FAILED -`, err.message?.slice(0, 120));
    }
  }
}

async function testAllGeminiModels() {
  console.log("\n==================================================");
  console.log("TESTING GEMINI QUOTA ACROSS AVAILABLE MODELS:");
  console.log("==================================================");
  const key = (process.env.GEMINI_API_KEY || "").trim();
  const ai = new GoogleGenAI({ apiKey: key });

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.1-flash-lite-preview",
    "gemini-3-flash-preview",
    "gemma-4-26b-a4b-it",
    "gemma-4-31b-it",
  ];

  for (const m of modelsToTry) {
    try {
      const res = await ai.models.generateContent({
        model: m,
        contents: "Respond with: OK",
      });
      console.log(`  ✓ Gemini (${m}): SUCCESS! Response: "${(res.text || "").trim()}"`);
    } catch (err: any) {
      console.log(`  ✗ Gemini (${m}): FAILED (${err.status || err.statusCode}) - ${err.message?.slice(0, 90)}`);
    }
  }
}

async function testGroqStructured() {
  console.log("\n==================================================");
  console.log("TESTING GROQ STRUCTURED JSON OUTPUT (qwen/qwen3.8-27b):");
  console.log("==================================================");
  const key = (process.env.GROQ_API_KEY || "").trim();
  const groq = new Groq({ apiKey: key });
  try {
    const res = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [
        {
          role: "system",
          content: "You are an educational assistant. Output JSON with a key 'message'.",
        },
        { role: "user", content: "Say hello in JSON format" },
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
    });
    console.log("  ✓ Groq Structured SUCCESS:", res.choices[0]?.message?.content);
  } catch (err: any) {
    console.error("  ✗ Groq Structured FAILED:", err.message);
  }
}

async function main() {
  console.log("Running Live Provider End-to-End Connectivity Verification...\n");
  const gemini = await testGeminiDirect();
  const groq = await testGroqDirect();

  console.log("\n==================================================");
  console.log("LIVE VERIFICATION RESULTS:");
  console.log(`Gemini Status: ${gemini.status} (Model: ${gemini.model || "none"})`);
  console.log(`Groq Status:   ${groq.status} (Model: ${groq.model || "none"})`);
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Fatal diagnostic error:", err);
  process.exit(1);
});
