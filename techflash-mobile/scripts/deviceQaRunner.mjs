import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const runbookPath = path.resolve('docs', 'device-qa-runbook.md');

function parseRunbook(md) {
  const lines = md.split('\n');
  const items = [];
  let section = 'General';
  let subsection = '';

  for (const line of lines) {
    if (line.startsWith('## ')) {
      section = line.replace(/^##\s+/, '').trim();
      subsection = '';
      continue;
    }
    if (line.startsWith('### ')) {
      subsection = line.replace(/^###\s+/, '').trim();
      continue;
    }
    const match = line.match(/^\s*-\s\[\s\]\s(.+)$/);
    if (match) {
      items.push({
        section,
        subsection,
        text: match[1].trim(),
      });
    }
  }
  return items;
}

function groupHeader(item) {
  return `${item.section}${item.subsection ? ` > ${item.subsection}` : ''}`;
}

function printSummary(results) {
  const passed = results.filter((r) => r.status === 'pass');
  const failed = results.filter((r) => r.status === 'fail');
  const skipped = results.filter((r) => r.status === 'skip');

  console.log('\n=== Device QA Summary ===');
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Skipped: ${skipped.length}`);

  if (failed.length > 0) {
    console.log('\n--- Failures to send back ---');
    failed.forEach((f, idx) => {
      console.log(`\n${idx + 1})`);
      console.log(`Role: ${f.role || 'unknown'}`);
      console.log(`Flow: ${groupHeader(f.item)} -> ${f.item.text}`);
      console.log(`Expected: ${f.expected || ''}`);
      console.log(`Actual: ${f.actual || ''}`);
      console.log(`Error text/screenshot: ${f.error || ''}`);
    });
  }
}

function inferRole(sectionName) {
  const s = sectionName.toLowerCase();
  if (s.includes('admin')) return 'admin';
  if (s.includes('company')) return 'company';
  if (s.includes('technician')) return 'technician';
  return '';
}

async function run() {
  if (!fs.existsSync(runbookPath)) {
    console.error(`Runbook not found: ${runbookPath}`);
    process.exit(1);
  }

  const markdown = fs.readFileSync(runbookPath, 'utf8');
  const checklist = parseRunbook(markdown);
  if (checklist.length === 0) {
    console.error('No checklist items found in runbook.');
    process.exit(1);
  }

  const rl = readline.createInterface({ input, output });
  const results = [];
  let lastHeader = '';

  console.log('\nTechFlash Mobile Device QA Runner');
  console.log(`Loaded ${checklist.length} checklist items from docs/device-qa-runbook.md`);
  console.log("Answer: [p]ass, [f]ail, [s]kip, [q]uit\n");

  for (let i = 0; i < checklist.length; i += 1) {
    const item = checklist[i];
    const header = groupHeader(item);
    if (header !== lastHeader) {
      console.log(`\n# ${header}`);
      lastHeader = header;
    }

    const answer = (
      await rl.question(`${i + 1}/${checklist.length} ${item.text}\n[p/f/s/q]: `)
    )
      .trim()
      .toLowerCase();

    if (answer === 'q') break;
    if (!['p', 'f', 's'].includes(answer)) {
      console.log('Invalid input. Marked as skip.');
      results.push({ status: 'skip', item, role: inferRole(item.section) });
      continue;
    }

    if (answer === 'p') {
      results.push({ status: 'pass', item, role: inferRole(item.section) });
      continue;
    }
    if (answer === 's') {
      results.push({ status: 'skip', item, role: inferRole(item.section) });
      continue;
    }

    const role = (await rl.question('Role (admin/company/technician): ')).trim() || inferRole(item.section);
    const expected = (await rl.question('Expected: ')).trim();
    const actual = (await rl.question('Actual: ')).trim();
    const error = (await rl.question('Error text/screenshot: ')).trim();
    results.push({ status: 'fail', item, role, expected, actual, error });
  }

  rl.close();
  printSummary(results);

  const outPath = path.resolve('docs', 'device-qa-last-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved detailed results to ${outPath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
