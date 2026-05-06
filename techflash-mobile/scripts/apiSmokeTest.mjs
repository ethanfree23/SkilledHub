import fs from 'node:fs';
import path from 'node:path';

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv(path.resolve('.env'));

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
const creds = {
  admin: {
    email: process.env.QA_ADMIN_EMAIL,
    password: process.env.QA_ADMIN_PASSWORD,
  },
  company: {
    email: process.env.QA_COMPANY_EMAIL,
    password: process.env.QA_COMPANY_PASSWORD,
  },
  technician: {
    email: process.env.QA_TECH_EMAIL,
    password: process.env.QA_TECH_PASSWORD,
  },
};

function assertCreds() {
  const missing = [];
  for (const [role, c] of Object.entries(creds)) {
    if (!c.email) {
      if (role === 'technician') missing.push('QA_TECH_EMAIL');
      else missing.push(`QA_${role.toUpperCase()}_EMAIL`);
    }
    if (!c.password) {
      if (role === 'technician') missing.push('QA_TECH_PASSWORD');
      else missing.push(`QA_${role.toUpperCase()}_PASSWORD`);
    }
  }
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

async function req(endpoint, opts = {}, token) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${endpoint} -> ${JSON.stringify(json).slice(0, 200)}`);
  }
  return json;
}

async function login(email, password) {
  const body = JSON.stringify({ email, password });
  const data = await req('/auth/login', { method: 'POST', body });
  const token = data?.token;
  if (!token) throw new Error('Login returned no token');
  return { token, user: data?.user || {} };
}

async function runRoleChecks(role, token) {
  const checks = [];
  const add = async (name, fn) => {
    try {
      await fn();
      checks.push({ name, status: 'pass' });
    } catch (e) {
      checks.push({ name, status: 'fail', error: e instanceof Error ? e.message : String(e) });
    }
  };

  await add('GET /users/me', async () => {
    await req('/users/me', {}, token);
  });

  await add('GET /jobs', async () => {
    await req('/jobs', {}, token);
  });

  await add('GET /conversations', async () => {
    await req('/conversations', {}, token);
  });

  if (role === 'admin') {
    await add('GET /admin/users', async () => {
      await req('/admin/users', {}, token);
    });
    await add('GET /admin/crm_leads', async () => {
      await req('/admin/crm_leads', {}, token);
    });
  }

  if (role === 'company' || role === 'technician') {
    await add('GET /membership', async () => {
      await req('/membership', {}, token);
    });
  }

  if (role === 'technician') {
    await add('POST /settings/create_connect_account_link', async () => {
      await req(
        '/settings/create_connect_account_link',
        { method: 'POST', body: JSON.stringify({ base_url: 'https://techflash.app' }) },
        token
      );
    });
  }

  return checks;
}

async function main() {
  assertCreds();
  const out = { baseUrl: BASE_URL, roles: {} };
  for (const role of ['admin', 'company', 'technician']) {
    const { email, password } = creds[role];
    process.stdout.write(`\n[${role}] login + checks...`);
    const { token } = await login(email, password);
    const checks = await runRoleChecks(role, token);
    out.roles[role] = checks;
    process.stdout.write(' done');
  }

  const file = path.resolve('docs', 'api-smoke-last-results.json');
  fs.writeFileSync(file, JSON.stringify(out, null, 2));

  console.log('\n\n=== API Smoke Summary ===');
  let failCount = 0;
  for (const [role, checks] of Object.entries(out.roles)) {
    const roleFails = checks.filter((c) => c.status === 'fail');
    console.log(`${role}: ${checks.length - roleFails.length}/${checks.length} passed`);
    for (const f of roleFails) {
      failCount += 1;
      console.log(`  - FAIL ${f.name}: ${f.error}`);
    }
  }
  console.log(`\nResults saved: ${file}`);
  if (failCount > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(`\nSmoke test failed: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
