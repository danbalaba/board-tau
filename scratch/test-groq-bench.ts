import dotenv from 'dotenv';
dotenv.config();

const models = [
  'groq/compound-mini',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b',
  'groq/compound'
];

async function testModel(modelName: string) {
  try {
    const start = Date.now();
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        response_format: { type: "json_object" },
        max_tokens: 350,
        messages: [
          { role: "system", content: "You are a JSON generator. You MUST return JSON: {\"reply\": string, \"suggestedPrompts\": string[]}" },
          { role: "user", content: "Compare Room A (₱2500) and Room B (₱3000)." }
        ],
        temperature: 0.1,
      }),
    });
    const elapsed = Date.now() - start;
    if (res.ok) {
      const json = await res.json();
      console.log(`✅ [${modelName}] (${elapsed}ms):`, json.choices?.[0]?.message?.content?.substring(0, 100));
    } else {
      const err = await res.text();
      console.log(`❌ [${modelName}] (${res.status}):`, err);
    }
  } catch (e: any) {
    console.log(`❌ [${modelName}] Error:`, e.message);
  }
}

async function run() {
  for (const m of models) {
    await testModel(m);
  }
}
run();
