/**
 * Screenshot capture script for Open ERP
 * Run: node tests/screenshots.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const API = process.env.API_URL || 'http://localhost:3002/api';

// Ensure screenshots dir exists
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function shot(page, name) {
  const p = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  console.log(`  📸 ${name}.png`);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForLoad(page, ms = 2000) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await sleep(ms);
}

(async () => {
  console.log(`\n📸 SCREENSHOT CAPTURE — Open ERP`);
  console.log(`   Frontend: ${FRONTEND}`);
  console.log(`   API:      ${API}`);
  console.log(`   Output:   ${SCREENSHOTS_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    // ── 0. Landing Page ────────────────────────────────────
    console.log('Section 0: Landing Page');
    await page.goto(FRONTEND, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page, 3000);
    await shot(page, 'landing-hero');

    // Scroll down for features
    await page.evaluate(() => window.scrollTo(0, 600));
    await sleep(1000);
    await shot(page, 'landing-features');

    // Scroll to download section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1000);
    await shot(page, 'landing-download');

    // ── 1. Login ──────────────────────────────────────────
    console.log('Section 1: Login');
    await page.goto(`${FRONTEND}/auth?tab=login`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page);
    await shot(page, 'login-page');

    // Login with demo credentials
    await page.fill('#auth-email', 'demo@openerp.com');
    await page.fill('#auth-password', 'Demo123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await waitForLoad(page, 3000);
    await shot(page, 'dashboard-overview');

    // ── 2. Dashboard Navigation ────────────────────────────
    console.log('Section 2: Dashboard Modules');

    // Products
    await page.goto(`${FRONTEND}/dashboard/products`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page, 3000);
    await shot(page, 'dashboard-products');

    // Warehouse
    await page.goto(`${FRONTEND}/dashboard/warehouses`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page, 3000);
    await shot(page, 'dashboard-warehouses');

    // Customers
    await page.goto(`${FRONTEND}/dashboard/customers`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page, 3000);
    await shot(page, 'dashboard-customers');

    // Sales
    await page.goto(`${FRONTEND}/dashboard/sales`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page, 3000);
    await shot(page, 'dashboard-sales');

    // POS
    await page.goto(`${FRONTEND}/dashboard/pos`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page, 3000);
    await shot(page, 'dashboard-pos');

    // ── 3. RH Module ──────────────────────────────────────
    console.log('Section 3: RH Module');

    await page.goto(`${FRONTEND}/dashboard/rh`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page, 3000);
    await shot(page, 'dashboard-rh');

    await page.goto(`${FRONTEND}/dashboard/rh/employees`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page, 3000);
    await shot(page, 'dashboard-rh-employees');

    await page.goto(`${FRONTEND}/dashboard/rh/payroll`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page, 3000);
    await shot(page, 'dashboard-rh-payroll');

    // ── 4. Accounting ─────────────────────────────────────
    console.log('Section 4: Accounting');

    await page.goto(`${FRONTEND}/dashboard/accounts`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page, 3000);
    await shot(page, 'dashboard-accounts');

    // ── 5. Company + Settings ─────────────────────────────
    console.log('Section 5: Company & Settings');

    await page.goto(`${FRONTEND}/dashboard/company`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page, 3000);
    await shot(page, 'dashboard-company');

    await page.goto(`${FRONTEND}/dashboard/settings`, { waitUntil: 'networkidle', timeout: 30000 });
    await waitForLoad(page, 3000);
    await shot(page, 'dashboard-settings');

    console.log('\n✅ All screenshots captured successfully!');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    // Take error screenshot
    await shot(page, 'error-state');
  } finally {
    await browser.close();
  }
})();
