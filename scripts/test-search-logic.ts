import { executeComplexSearch } from "../services/listing/search.service";
import { db as prisma } from "../lib/db";

async function runTests() {
  console.log("==========================================");
  console.log("🔍 STARTING SEARCH ENGINE DIAGNOSTICS");
  console.log("==========================================\n");

  // ------------------------------------------------------------------
  // TEST 1: STRICT FILTERING (BEDSPACE, UNDER 2000)
  // ------------------------------------------------------------------
  console.log("▶ TEST 1: Strict Filtering (Bedspace under ₱2000)");
  const params1 = {
    roomType: "BEDSPACE",
    maxPrice: "2000",
  };

  const result1 = await executeComplexSearch(params1);
  console.log(`- Relaxed Mode Triggered: ${result1.relaxed}`);
  console.log(`- Listings Found: ${result1.data.length}`);
  
  if (result1.data.length > 0) {
    console.log(`- Sample Match: [${result1.data[0].id}] ${result1.data[0].title} (Price: ₱${result1.data[0].price})`);
  }
  
  if (!result1.relaxed && result1.data.length > 0) {
    console.log("✅ TEST 1 PASSED: Strict filters successfully narrowed down the database.\n");
  } else {
    console.log("❌ TEST 1 FAILED: Expected strict mode matches but didn't find any or relaxed mode triggered.\n");
  }

  // ------------------------------------------------------------------
  // TEST 2: STRICT AMENITIES AND RULES (Female Only)
  // ------------------------------------------------------------------
  console.log("▶ TEST 2: Strict Rules (Female Only)");
  const params2 = {
    femaleOnly: "true"
  };

  const result2 = await executeComplexSearch(params2);
  console.log(`- Relaxed Mode Triggered: ${result2.relaxed}`);
  console.log(`- Listings Found: ${result2.data.length}`);

  if (!result2.relaxed) {
    console.log("✅ TEST 2 PASSED: Successfully filtered female-only properties.\n");
  } else {
    console.log("❌ TEST 2 FAILED.\n");
  }

  // ------------------------------------------------------------------
  // TEST 3: AI FALLBACK (IMPOSSIBLE COMBINATION)
  // ------------------------------------------------------------------
  console.log("▶ TEST 3: AI Fallback / Relaxed Mode (Solo Room under ₱500)");
  const params3 = {
    roomType: "SOLO",
    maxPrice: "500",
  };

  const result3 = await executeComplexSearch(params3);
  console.log(`- Relaxed Mode Triggered: ${result3.relaxed}`);
  console.log(`- Fallback Listings Found: ${result3.data.length}`);

  if (result3.relaxed) {
    console.log("✅ TEST 3 (PART A) PASSED: System correctly identified 0 strict matches and fell back to relaxed mode.");
    
    // Simulate hitting the AI endpoint like the frontend does when it sees relaxed: true
    console.log("\n▶ TEST 3 (PART B): Hitting Gemini AI Recommendation Endpoint...");
    try {
      const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const aiRes = await fetch(`${host}/api/ai/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchParams: params3, results: result3.data.slice(0, 5) })
      });
      
      const aiData = await aiRes.json();
      console.log(`- AI Response Status: ${aiRes.status}`);
      console.log(`- AI Empathetic Message: "${aiData.message}"`);
      
      if (aiData.message) {
        console.log("✅ TEST 3 (PART B) PASSED: Gemini successfully generated a contextual fallback message.");
      } else {
        console.log("❌ TEST 3 (PART B) FAILED: AI did not return a message string.");
      }
    } catch (e: any) {
      console.log(`❌ TEST 3 (PART B) FAILED: Error reaching AI endpoint (${e.message})`);
      console.log("Note: Make sure your local dev server (npm run dev) is running so we can hit the /api/ai/recommend endpoint!");
    }
    
  } else {
    console.log("❌ TEST 3 FAILED: System did not trigger relaxed mode. (Did you actually add a Solo room under ₱500?)");
  }

  console.log("\n==========================================");
  console.log("🏁 DIAGNOSTICS COMPLETE");
  console.log("==========================================");
  
  await prisma.$disconnect();
}

runTests().catch(console.error);
