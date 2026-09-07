const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const jsonPath = path.join(root, "data", "detections.json");
const apiUrl = "https://jiaotongguanli.pages.dev/api/detections";

async function main() {
  const raw = fs.readFileSync(jsonPath, "utf8");
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) {
    throw new Error("data/detections.json must be a JSON array");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(items)
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text);
  }

  console.log(text);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
