// Augment lesson JSON files (1..22) with Mazii kanji search results
// For each entry with non-empty `kanji`, call Mazii API and attach
// `kanji_search_results`: [{ kanji: string, mean: string }]

const fs = require('fs');
const path = require('path');
const https = require('https');

const LESSON_DIR = path.join(__dirname, 'data');
const INTRO_FILE = 'introduction_vocabulary.json';
const LESSON_PREFIX = 'lesson_';
const LESSON_SUFFIX = '_vocabulary.json';
const START = 1;
const END = 22;

// Simple in-memory cache to avoid duplicate API calls within one run
const kanjiCache = new Map(); // key: kanji string, value: [{ kanji, mean }]

function readJsonFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

function writeJsonFile(filePath, data) {
    // Preserve 2-space indentation consistent with existing files
    const content = JSON.stringify(data, null, 2) + '\n';
    fs.writeFileSync(filePath, content, 'utf8');
}

function maziiRequestBody(kanjiText) {
    return JSON.stringify({
        dict: 'javi',
        type: 'kanji',
        query: kanjiText,
        page: 1,
    });
}

function callMazii(kanjiText) {
    if (!kanjiText || !kanjiText.trim()) return Promise.resolve([]);
    if (kanjiCache.has(kanjiText)) return Promise.resolve(kanjiCache.get(kanjiText));

    const body = maziiRequestBody(kanjiText);

    const options = {
        method: 'POST',
        hostname: 'mazii.net',
        path: '/api/search/kanji',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
        },
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const results = Array.isArray(json.results) ? json.results : [];
                    const simplified = results
                        .map((r) => ({ kanji: r.kanji, mean: r.mean }))
                        .filter((r) => typeof r.kanji === 'string' && r.kanji.trim().length > 0);
                    kanjiCache.set(kanjiText, simplified);
                    resolve(simplified);
                } catch (_) {
                    resolve([]);
                }
            });
        });

        req.on('error', () => resolve([]));
        req.write(body);
        req.end();
    });
}

async function augmentFile(filePath) {
    const data = readJsonFile(filePath);
    if (!Array.isArray(data)) {
        console.warn(`Skip non-array JSON: ${filePath}`);
        return;
    }

    for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        const kanjiText = typeof entry.kanji === 'string' ? entry.kanji.trim() : '';
        if (!kanjiText) continue;

        // If already present, skip to avoid re-calling and rewriting
        if (Array.isArray(entry.kanji_search_results) && entry.kanji_search_results.length > 0) continue;

        try {
            const results = await callMazii(kanjiText);
            if (results.length > 0) {
                entry.kanji_search_results = results;
            }
        } catch (_) {
            // Ignore errors, continue
        }
    }

    writeJsonFile(filePath, data);
}

async function main() {
    const targets = [];
    for (let n = START; n <= END; n++) {
        targets.push(path.join(LESSON_DIR, `${LESSON_PREFIX}${n}${LESSON_SUFFIX}`));
    }

    for (const file of targets) {
        if (!fs.existsSync(file)) {
            console.warn(`Missing file: ${file}`);
            continue;
        }
        console.log(`Augmenting: ${path.basename(file)}`);
        await augmentFile(file);
    }

    console.log('Done.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});


