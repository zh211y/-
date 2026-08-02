const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");

const excludedNames = new Set([
  ".git",
  ".wrangler",
  "dist",
  "node_modules",
  "scripts",
  "functions",
  "docx_render",
  ".gitattributes",
  ".gitignore",
  "package.json",
  "package-lock.json",
  "server.js"
]);

const excludedExtensions = new Set([
  ".psd",
  ".ai",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx"
]);

function shouldCopy(name, fullPath) {
  if (excludedNames.has(name)) {
    return false;
  }

  const stat = fs.statSync(fullPath);
  if (stat.isFile() && excludedExtensions.has(path.extname(name).toLowerCase())) {
    return false;
  }

  return true;
}

function copyEntry(source, target) {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      const childSource = path.join(source, entry);
      if (shouldCopy(entry, childSource)) {
        copyEntry(childSource, path.join(target, entry));
      }
    }
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of fs.readdirSync(root)) {
  const source = path.join(root, entry);
  if (shouldCopy(entry, source)) {
    copyEntry(source, path.join(outDir, entry));
  }
}

console.log("Static site built to dist");
