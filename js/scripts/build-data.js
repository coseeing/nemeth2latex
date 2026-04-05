import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEMETH_DATA_DIR = path.join(__dirname, '..', '..', 'nemeth', 'data');
const OUTPUT_DIR = path.join(__dirname, '..', 'data');

function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Handle CSV fields with commas inside quotes
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    values.push(current);

    const row = {};
    headers.forEach((h, idx) => {
      // Don't trim values — preserves space characters that are meaningful
      // (e.g., the space symbol ' ' in symbol.csv)
      row[h.trim()] = values[idx] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

/**
 * Replicates nemeth/utils.py nemeth2symbol_with_priority() logic.
 *
 * 1. Read CSV rows
 * 2. Group by nemeth key; skip empty nemeth
 * 3. If ingore-braille-space=True, add space-stripped variant with priority+100
 * 4. For each key, pick lowest priority entry
 * 5. If latex starts with '\', use latex + ' '; otherwise use symbol field
 */
function nemeth2symbolWithPriority(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  const data = {}; // nemeth -> [{latex, symbol, priority}, ...]

  for (const row of rows) {
    if (!row.nemeth || row.nemeth === '') continue;

    const entry = {
      latex: row.latex || '',
      symbol: row.symbol || '',
      priority: parseInt(row.priority, 10) || 0,
    };

    if (!data[row.nemeth]) data[row.nemeth] = [];
    data[row.nemeth].push(entry);

    // Handle ingore-braille-space (note: typo preserved from original)
    if (
      row['ingore-braille-space'] === 'True' &&
      row.nemeth.includes('\u2800')
    ) {
      const stripped = row.nemeth.replace(/\u2800/g, '');
      if (stripped && stripped !== row.nemeth) {
        if (!data[stripped]) data[stripped] = [];
        data[stripped].push({
          ...entry,
          priority: entry.priority + 100,
        });
      }
    }
  }

  const result = {};
  for (const [key, entries] of Object.entries(data)) {
    const sorted =
      entries.length > 1
        ? entries.sort((a, b) => a.priority - b.priority)
        : entries;
    const best = sorted[0];
    if (best.latex.startsWith('\\')) {
      result[key] = best.latex + ' ';
    } else {
      result[key] = best.symbol;
    }
  }

  return result;
}

// Build all three data files as ES modules for browser compatibility
for (const name of ['symbol', 'letter', 'number']) {
  const csvPath = path.join(NEMETH_DATA_DIR, `${name}.csv`);
  const mapping = nemeth2symbolWithPriority(csvPath);
  const outputPath = path.join(OUTPUT_DIR, `${name}.js`);
  const content = `export default ${JSON.stringify(mapping, null, 2)};\n`;
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(
    `${name}.js: ${Object.keys(mapping).length} entries written to ${outputPath}`
  );
}
