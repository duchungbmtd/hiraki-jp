// Reorder kanji_search_results to match the order of characters in `kanji`
// Applies to lesson files: data/lesson_1_vocabulary.json .. data/lesson_22_vocabulary.json

const fs = require('fs');
const path = require('path');

const LESSON_DIR = path.join(__dirname, 'data');
const FILE_PREFIX = 'lesson_';
const FILE_SUFFIX = '_vocabulary.json';
const START = 1;
const END = 22;

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  const content = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
}

function reorderKanjiResultsForEntry(entry) {
  const kanjiText = typeof entry.kanji === 'string' ? entry.kanji.trim() : '';
  const results = Array.isArray(entry.kanji_search_results) ? entry.kanji_search_results.slice() : null;
  if (!kanjiText || !results || results.length === 0) return false;

  // Build order mapping based on first occurrence of each kanji character in the string
  const order = [];
  for (const ch of kanjiText) {
    if (/\s/.test(ch)) continue; // skip spaces
    order.push(ch);
  }

  const used = new Array(results.length).fill(false);
  const ordered = [];

  // For each character in `kanji`, pick the first matching result not used yet
  for (const ch of order) {
    const idx = results.findIndex((r, i) => !used[i] && typeof r.kanji === 'string' && r.kanji === ch);
    if (idx !== -1) {
      ordered.push(results[idx]);
      used[idx] = true;
    }
  }

  // Append any remaining unmatched results at the end (stable order)
  for (let i = 0; i < results.length; i++) {
    if (!used[i]) ordered.push(results[i]);
  }

  // Only update if order changed
  const changed = JSON.stringify(results) !== JSON.stringify(ordered);
  if (changed) entry.kanji_search_results = ordered;
  return changed;
}

function processFile(filePath) {
  const data = readJson(filePath);
  if (!Array.isArray(data)) return { changed: false, count: 0 };
  let changedCount = 0;
  for (const entry of data) {
    if (reorderKanjiResultsForEntry(entry)) changedCount++;
  }
  if (changedCount > 0) writeJson(filePath, data);
  return { changed: changedCount > 0, count: changedCount };
}

function main() {
  let totalChanged = 0;
  for (let n = START; n <= END; n++) {
    const file = path.join(LESSON_DIR, `${FILE_PREFIX}${n}${FILE_SUFFIX}`);
    if (!fs.existsSync(file)) {
      console.warn(`Missing file: ${file}`);
      continue;
    }
    const { changed, count } = processFile(file);
    if (changed) {
      console.log(`Reordered ${count} entries in ${path.basename(file)}`);
      totalChanged += count;
    } else {
      console.log(`No changes in ${path.basename(file)}`);
    }
  }
  console.log(`Done. Total entries reordered: ${totalChanged}`);
}

main();


