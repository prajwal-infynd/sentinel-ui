const fs = require('fs');

async function run() {
  const crawlerData = JSON.parse(fs.readFileSync('C:/Users/Prajwal/Downloads/infynd-payload (2).json', 'utf8'));
  const payload = { crawlerData };
  
  console.log("Sending request to local backend...");
  
  try {
    const res = await fetch("http://localhost:3002/api/agent/portfolio-enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      console.log("Error:", res.status, await res.text());
      return;
    }
    
    const data = await res.json();
    console.log("\n====== AGENT STUDIO RESPONSE ======\n");
    console.log(JSON.stringify(data, null, 2));
    console.log("\n===================================\n");
  } catch (err) {
    console.error("Fetch failed", err);
  }
}

run();
