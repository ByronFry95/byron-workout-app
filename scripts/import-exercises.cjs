// One-off importer: reads megaGymDataset.csv, filters to the top-rated exercises,
// dedupes near-identical rows/variants, and emits a JS array to merge into lib/exerciseLibrary.js.
// Re-run with `node scripts/import-exercises.cjs [count]` if we want a bigger cut later.
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', 'megaGymDataset.csv');
const LIBRARY_PATH = path.join(__dirname, '..', 'lib', 'exerciseLibrary.js');
const TOP_N = Number(process.argv[2]) || 40;

// --- minimal RFC4180 CSV parser (handles quoted fields, embedded commas/quotes/newlines) ---
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += char;
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field); field = '';
    } else if (char === '\n') {
      row.push(field); field = '';
      rows.push(row); row = [];
    } else if (char === '\r') {
      // skip, \n handles the row break
    } else {
      field += char;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const raw = fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, '');
const rows = parseCsv(raw);
const headers = rows[0];
const idx = name => headers.indexOf(name);
const iTitle = idx('Title'), iDesc = idx('Desc'), iType = idx('Type'), iBodyPart = idx('BodyPart'), iEquipment = idx('Equipment'), iLevel = idx('Level'), iRating = idx('Rating');

const records = rows.slice(1)
  .filter(r => r.length >= headers.length && r[iTitle])
  .map(r => ({
    name: r[iTitle].trim(),
    desc: (r[iDesc] || '').trim(),
    type: (r[iType] || '').trim(),
    bodyPart: (r[iBodyPart] || '').trim(),
    equipment: (r[iEquipment] || '').trim(),
    level: (r[iLevel] || '').trim(),
    rating: parseFloat(r[iRating]) || 0,
  }));

console.log(`Parsed ${records.length} data rows.`);

const rated = records.filter(r => r.rating > 0);
console.log(`Rows with a positive rating: ${rated.length}`);

// --- colloquial body part + equipment mapping ---
const bodyPartMap = {
  Abdominals: 'Abs',
  Quadriceps: 'Quads',
  'Middle Back': 'Upper Back',
  'Lower Back': 'Lower Back',
  Adductors: 'Adductors',
  Abductors: 'Abductors',
  Lats: 'Lats',
  Traps: 'Traps',
  Glutes: 'Glutes',
  Hamstrings: 'Hamstrings',
  Calves: 'Calves',
  Forearms: 'Forearms',
  Neck: 'Neck',
  Chest: 'Chest',
  Shoulders: 'Shoulders',
  Biceps: 'Biceps',
  Triceps: 'Triceps',
};
const equipmentMap = {
  'Body Only': 'Bodyweight',
  Bands: 'Bands',
  Barbell: 'Barbell',
  Dumbbell: 'Dumbbell',
  Kettlebells: 'Kettlebell',
  Cable: 'Cable',
  Machine: 'Machine',
  'E-Z Curl Bar': 'EZ Bar',
  'Exercise Ball': 'Exercise Ball',
  'Medicine Ball': 'Medicine Ball',
  'Foam Roll': 'Foam Roller',
  Other: 'Other',
  None: 'Other',
};

// Best-effort movement tag inferred from the name — approximate, flagged for review.
function inferMovement(name) {
  const n = name.toLowerCase();
  if (/(squat|lunge|step-up|step up)/.test(n)) return 'Squat';
  if (/(deadlift|hinge|good morning|hip thrust)/.test(n)) return 'Hinge';
  if (/(press|push-up|pushup|dip|jerk)/.test(n)) return 'Push';
  if (/(row|pull-up|pullup|chin-up|pulldown|pull-down|curl|clean|snatch)/.test(n)) return 'Pull';
  return 'Isolation';
}

// Strips the noisy "program branding" prefixes/suffixes that pad this dataset with near-duplicates.
const NOISE_PATTERN = /^(HM|FYR2?|UN S?|UNS|AM|UP|TBS|KV|King Maker|Holman|MetaBurn|Total Fitness|Muscle Beach|Robertson|Jordan Shallow|Rusin|Boss Everline|Taylor|Tyler Holt|ACFT|\d+)\s+/i;
const SUFFIX_PATTERN = /\s*-\s*(gethin variation|with bands|with chains|multiple response|single response)\s*$/i;

function normalizeBaseName(name) {
  return name
    .replace(NOISE_PATTERN, '')
    .replace(SUFFIX_PATTERN, '')
    .replace(/[-–]\s*$/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normalizeDesc(desc) {
  return desc.trim().toLowerCase();
}

// Words that describe equipment/loading rather than the movement itself — stripped before
// comparing against the hand-curated list so "Barbell Deadlift" still matches "Deadlift".
const QUALIFIER_WORDS = /\b(barbell|dumbbell|kettlebell|kettlebells|cable|machine|smith|ez-bar|band|bands|bodyweight|body only|weighted|full|standing|seated|lying|single-arm|single arm|two-arm)\b/g;

function coreMovementKey(name) {
  return normalizeBaseName(name).replace(QUALIFIER_WORDS, '').replace(/\s+/g, ' ').trim();
}

function matchesExisting(baseName, coreKey, existingNames, existingCoreKeys) {
  if (existingNames.has(baseName)) return true;
  if (!coreKey) return false;
  // Exact core-movement match only (e.g. "squat" === "squat") — avoids false positives like
  // "wrist curl" vs "curl" getting excluded just for sharing a word.
  return existingCoreKeys.includes(coreKey);
}

// Read existing hand-curated names/ids so we never introduce duplicate content.
const existingSource = fs.readFileSync(LIBRARY_PATH, 'utf8');
const existingRawNames = [...existingSource.matchAll(/name: '([^']+)'/g)].map(m => m[1]);
const existingNames = new Set(existingRawNames.map(normalizeBaseName));
const existingCoreKeys = existingRawNames.map(coreMovementKey);
const existingIds = new Set([...existingSource.matchAll(/id: '([^']+)'/g)].map(m => m[1]));

rated.sort((a, b) => b.rating - a.rating);

const seenDesc = new Set();
const seenNameKey = new Set();
const seenCoreKey = new Set();
const kept = [];

for (const record of rated) {
  const baseName = normalizeBaseName(record.name);
  const coreKey = coreMovementKey(record.name);
  if (matchesExisting(baseName, coreKey, existingNames, existingCoreKeys)) continue; // already in our hand-curated set
  if (coreKey && seenCoreKey.has(coreKey)) continue; // near-duplicate movement already kept from the dataset

  const nameKey = `${baseName}|${record.bodyPart}|${record.equipment}`;
  if (seenNameKey.has(nameKey)) continue;

  const descKey = normalizeDesc(record.desc);
  if (descKey && seenDesc.has(descKey)) continue;

  seenNameKey.add(nameKey);
  if (coreKey) seenCoreKey.add(coreKey);
  if (descKey) seenDesc.add(descKey);
  kept.push(record);
  if (kept.length >= TOP_N) break;
}

console.log(`Kept ${kept.length} deduped exercises (target ${TOP_N}).`);

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const SMALL_WORDS = new Set(['a', 'an', 'and', 'the', 'of', 'with', 'over', 'to', 'on', 'in', 'from', 'vs', 'or']);
const ACRONYMS = { ez: 'EZ', trx: 'TRX' };
function titleCase(name) {
  const cleaned = name.replace(/-+$/, '').trim();
  return cleaned.split(' ').map((word, index) => {
    if (!word) return word;
    const lower = word.toLowerCase();
    if (index !== 0 && SMALL_WORDS.has(lower)) return lower;
    return word.split('-').map(part => {
      if (!part) return part;
      if (ACRONYMS[part.toLowerCase()]) return ACRONYMS[part.toLowerCase()];
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join('-');
  }).join(' ');
}

const usedIds = new Set(existingIds);
const output = kept.map(record => {
  const displayName = titleCase(record.name);
  let id = slugify(displayName);
  let suffix = 2;
  while (usedIds.has(id)) { id = `${slugify(displayName)}-${suffix}`; suffix++; }
  usedIds.add(id);

  return {
    id,
    name: displayName,
    bodyPart: bodyPartMap[record.bodyPart] || record.bodyPart || 'Other',
    movement: inferMovement(record.name),
    equipment: equipmentMap[record.equipment] || record.equipment || 'Other',
    category: record.type || 'Strength',
    level: record.level || 'Intermediate',
    rating: record.rating,
    description: record.desc || '',
  };
});

const outDir = path.join(__dirname, 'output');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'dataset-exercises.json'), JSON.stringify(output, null, 2));

console.log('\nTop picks:');
output.forEach(item => console.log(`${item.rating.toFixed(1)}  ${item.name}  [${item.bodyPart} / ${item.equipment}]`));

// --- write the entries straight into lib/exerciseLibrary.js, right before getExerciseById ---
if (process.argv.includes('--apply')) {
  const esc = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const marker = '\n// --- Imported from megaGymDataset.csv (top-rated cut, see scripts/import-exercises.cjs) ---\n';
  const entryLines = output.map(e =>
    `  { id: '${e.id}', name: '${esc(e.name)}', bodyPart: '${e.bodyPart}', movement: '${e.movement}', equipment: '${e.equipment}', category: '${e.category}', level: '${e.level}', rating: ${e.rating}, description: '${esc(e.description)}' },`
  );
  const block = marker + entryLines.join('\n') + '\n';
  const insertBefore = ']\n\nexport function getExerciseById';
  const normalizedSource = existingSource.replace(/\r\n/g, '\n');
  if (!normalizedSource.includes(insertBefore)) {
    console.error('Could not find insertion point in lib/exerciseLibrary.js — aborting write.');
    process.exit(1);
  }
  const updated = normalizedSource.replace(insertBefore, block + insertBefore);
  fs.writeFileSync(LIBRARY_PATH, updated);
  console.log(`\nApplied: wrote ${output.length} exercises into ${LIBRARY_PATH}`);
}
