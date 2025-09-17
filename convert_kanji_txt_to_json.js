// Convert data/raw/kanji.txt to JSON with enriched info from Mazii APIs
// - Reads each non-empty line as a word query
// - Calls word API to get phonetic (hiragana), short mean, romaji pronunciation
// - Calls kanji API per kanji character in the word to get meanings
// - Outputs array of entries to data/raw/kanji.json

const fs = require('fs');
const path = require('path');
const https = require('https');

const INPUT_PATH = process.argv[2] || path.join(__dirname, 'data', 'raw', 'kanji.txt');
const OUTPUT_PATH = process.argv[3] || path.join(__dirname, 'data', 'raw', 'kanji.json');

function readLines(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw.split(/\r?\n/).map((s) => s.trim()).filter((s) => s.length > 0);
}

function httpsJsonPost(hostname, pathName, payload) {
  const body = JSON.stringify(payload);
  const options = {
    method: 'POST',
    hostname,
    path: pathName,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (_) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.write(body);
    req.end();
  });
}

// Cache to avoid repeated API calls
const wordCache = new Map(); // key: query word, value: parsed info
const kanjiCache = new Map(); // key: kanji char, value: [{ kanji, mean }]

async function fetchWordInfo(query) {
  if (wordCache.has(query)) return wordCache.get(query);
  const payload = { dict: 'javi', type: 'word', query, page: 1 };
  const json = await httpsJsonPost('mazii.net', '/api/search/word', payload);
  let phonetic = '';
  let short_mean = '';
  let romaji = '';

  try {
    const words = json?.data?.words || json?.words || [];
    const first = Array.isArray(words) ? words[0] : null;
    if (first) {
      phonetic = first.phonetic || '';
      short_mean = Array.isArray(first.short_mean) ? first.short_mean.join('; ') : (first.short_mean || '');
      const trans = first.pronunciation?.transcriptions;
      // Some responses may have an array or object for transcriptions
      if (trans) {
        if (Array.isArray(trans)) {
          romaji = trans.find(t => t?.system === 'romaji')?.value || '';
        } else if (typeof trans === 'object') {
          romaji = trans.romaji || '';
        }
      }
    }
  } catch (_) {}

  const result = { phonetic, short_mean, romaji };
  wordCache.set(query, result);
  return result;
}

async function fetchKanjiMeaningsForChar(ch) {
  if (kanjiCache.has(ch)) return kanjiCache.get(ch);
  const payload = { dict: 'javi', type: 'kanji', query: ch, page: 1 };
  const json = await httpsJsonPost('mazii.net', '/api/search/kanji', payload);
  const results = Array.isArray(json?.results) ? json.results : [];
  const simplified = results
    .map((r) => ({ kanji: r.kanji, mean: r.mean }))
    .filter((r) => typeof r.kanji === 'string' && r.kanji.trim().length > 0);
  kanjiCache.set(ch, simplified);
  return simplified;
}

function extractKanjiCharacters(text) {
  if (!text) return [];
  const chars = Array.from(text).filter((c) => /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(c));
  // unique in order of appearance
  const seen = new Set();
  const ordered = [];
  for (const c of chars) {
    if (!seen.has(c)) {
      seen.add(c);
      ordered.push(c);
    }
  }
  return ordered;
}

async function processWord(word) {
  const info = await fetchWordInfo(word);
  const kanjiChars = extractKanjiCharacters(word);
  const kanjiResults = [];
  for (const ch of kanjiChars) {
    const res = await fetchKanjiMeaningsForChar(ch);
    // Take the first matching entry for that kanji char, or all if you prefer
    if (Array.isArray(res) && res.length > 0) {
      // Ensure we keep only items whose r.kanji equals the char
      const filtered = res.filter(r => r.kanji === ch);
      if (filtered.length > 0) kanjiResults.push(filtered[0]);
      else kanjiResults.push(res[0]);
    }
  }
  return {
    word,
    phonetic: info.phonetic || '',
    short_mean: info.short_mean || '',
    romaji: info.romaji || '',
    kanji_search_results: kanjiResults,
  };
}

async function main() {
  const words = readLines(INPUT_PATH);
  const unique = Array.from(new Set(words));
  const output = [];
  for (let i = 0; i < unique.length; i++) {
    const w = unique[i];
    process.stdout.write(`Processing (${i + 1}/${unique.length}): ${w}\r`);
    try {
      const entry = await processWord(w);
      output.push(entry);
    } catch (e) {
      output.push({ word: w, phonetic: '', short_mean: '', romaji: '', kanji_search_results: [] });
    }
    // Optional small delay to be polite to API
    await new Promise((r) => setTimeout(r, 120));
  }
  process.stdout.write("\n");
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${output.length} entries to ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


