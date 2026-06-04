import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "PDZ 04.06.2026.txt");
const gasDir = path.join(root, "gas");
const target = path.join(gasDir, "Code.gs");

const text = fs.readFileSync(source, "utf8");
if (!text.includes("function onOpen")) {
  console.error("Source file missing onOpen — unexpected PDZ script shape");
  process.exit(1);
}

fs.mkdirSync(gasDir, { recursive: true });
const prev = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
if (prev !== text) {
  fs.writeFileSync(target, text, "utf8");
  console.log("Synced", path.relative(root, target), "from PDZ source");
} else {
  console.log("gas/Code.gs already matches PDZ source");
}

console.log("Lines:", text.split(/\n/).length);
