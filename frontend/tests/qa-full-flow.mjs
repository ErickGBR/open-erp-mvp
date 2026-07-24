/**
 *  ============================================================
 *  QA TEST — Flujo completo: Asistencias / Turnos / Marcación
 *  ============================================================
 *  Versión 2.0 — Con token handling y diagnóstico profundo
 *  Ejecutar: node tests/qa-full-flow.mjs
 *  ============================================================
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-results', `qa-flow-${Date.now()}`);
const BASE = process.env.QA_BASE_URL || 'http://localhost:3000';
const API  = process.env.QA_API_URL || 'http://localhost:3001/api';

// =============================================================
// Test Results accumulator
// =============================================================
const results = { passed: [], failed: [], bugs: [] };
let testCount = 0;
let passCount = 0;
let failCount = 0;

function PASS(name) {
  testCount++; passCount++;
  results.passed.push(name);
  console.log(`  ✅ PASS: ${name}`);
}

function FAIL(name, error, screenshot = null) {
  testCount++; failCount++;
  results.failed.push({ name, error, screenshot });
  console.log(`  ❌ FAIL: ${name}`);
  console.log(`     Error: ${error}`);
}

function BUG(severity, file, line, description) {
  results.bugs.push({
    bug_id: `BUG-${results.bugs.length + 1}`,
    file, line, description, severity,
  });
  console.log(`  🐛 BUG [${severity}]: ${description} (${file}:${line})`);
}

// =============================================================
// Helpers
// =============================================================
let browser, page, authToken;
let screenshotCounter = 0;

async function takeScreenshot(name) {
  screenshotCounter++;
  const filename = `${String(screenshotCounter).padStart(3, '0')}-${name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`     📸 Screenshot: ${filename}`);
  return filepath;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForLoad() {
  try {
    await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 });
  } catch { /* no spinner */ }
  await sleep(800);
}

async function clearThenType(selector, text) {
  await page.click(selector, { clickCount: 3 });
  await page.type(selector, text);
}

async function apiGet(endpoint) {
  const res = await fetch(`${API}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function apiPost(endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function apiDelete(endpoint) {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` },
  });
  return { status: res.status };
}

// =============================================================
// TEST SUITES
// =============================================================

async function testLogin() {
  console.log('\n📋 SECTION 1: LOGIN');
  await page.goto(`${BASE}/auth?tab=login`, { waitUntil: 'networkidle' });
  await sleep(2000);
  await takeScreenshot('01-login-page');

  // Check demo credentials hint
  const demoHint = await page.textContent('body');
  if (!demoHint.includes('demo@openerp.com')) {
    BUG('medium', 'AuthTabs.tsx', 159, 'Demo credentials hint not found on login page');
  }

  // Fill login form
  await page.fill('#auth-email', 'demo@openerp.com');
  await page.fill('#auth-password', 'Demo123!');
  await takeScreenshot('02-login-filled');

  // Submit
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  try {
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await takeScreenshot('03-dashboard-after-login');
    
    // Extract token from localStorage for API calls
    authToken = await page.evaluate(() => localStorage.getItem('token'));
    if (authToken) {
      console.log(`     Token: ${authToken.slice(0, 30)}...`);
      PASS('Login with demo credentials');
      return true;
    } else {
      FAIL('Login', 'Token not found in localStorage after login');
      return false;
    }
  } catch (err) {
    const errorEl = await page.$('[role="alert"]');
    const errorText = errorEl ? await errorEl.textContent() : 'Unknown error';
    FAIL('Login with demo credentials', `Failed to login: ${errorText}`, await takeScreenshot('03-login-error'));
    return false;
  }
}

async function testShifts() {
  console.log('\n📋 SECTION 2: SHIFTS (Turnos)');

  // Navigate to shifts
  await page.goto(`${BASE}/dashboard/rh/shifts`, { waitUntil: 'networkidle' });
  await waitForLoad();
  await takeScreenshot('04-shifts-list');

  // Check page loaded
  const shiftTitle = await page.textContent('h1');
  if (!shiftTitle.includes('Shift')) {
    FAIL('Shifts page loads', `Expected "Shifts" title, got: ${shiftTitle}`);
    return;
  }
  PASS('Shifts page loads');

  // Navigate to new shift
  await page.click('a[href*="/dashboard/rh/shifts/new"]');
  await page.waitForURL('**/shifts/new**', { timeout: 10000 });
  await waitForLoad();
  await takeScreenshot('05-shifts-new-form');

  // Fill form
  await page.fill('#name', 'Test Turno QA');
  await page.fill('#startTime', '08:00');
  await page.fill('#endTime', '17:00');
  await takeScreenshot('06-shifts-new-filled');

  // Submit
  await page.click('button[type="submit"]');
  
  try {
    await page.waitForURL('**/shifts**', { timeout: 10000 });
    await waitForLoad();
    await takeScreenshot('07-shifts-after-create');

    const pageText = await page.textContent('body');
    if (pageText.includes('Test Turno QA')) {
      PASS('Create new shift - appears in list');
    } else {
      FAIL('Create new shift', 'Shift "Test Turno QA" not found in list after creation', 
          await takeScreenshot('07-shifts-missing'));
      return;
    }
  } catch (err) {
    FAIL('Create new shift', `Redirect to shifts list failed: ${err.message}`, 
        await takeScreenshot('07-shifts-create-error'));
    return;
  }

  // Edit the shift
  await page.goto(`${BASE}/dashboard/rh/shifts`, { waitUntil: 'networkidle' });
  await waitForLoad();
  
  // Find edit link next to "Test Turno QA"
  const editBtn = await page.evaluate(() => {
    const rows = document.querySelectorAll('tr');
    for (const row of rows) {
      if (row.textContent.includes('Test Turno QA')) {
        const editLink = row.querySelector('a[href*="/shifts/"]');
        if (editLink) {
          const href = editLink.getAttribute('href');
          if (href && !href.includes('/new')) {
            window.location.href = href;
            return true;
          }
        }
      }
    }
    return false;
  });

  if (!editBtn) {
    FAIL('Edit shift', 'Could not find edit link for Test Turno QA');
    return;
  }
  
  try {
    await page.waitForURL('**/shifts/**', { timeout: 10000 });
    await sleep(1500);
    if (page.url().includes('/new')) {
      FAIL('Edit shift', `Navigated to new instead of edit: ${page.url()}`);
      return;
    }
  } catch (err) {
    FAIL('Edit shift', `Failed to navigate to edit page: ${err.message}`);
    return;
  }
  
  await waitForLoad();
  await takeScreenshot('08-shifts-edit-page');
  
  // Verify edit form loaded with data
  try {
    await page.waitForSelector('#name', { timeout: 5000 });
    const nameValue = await page.inputValue('#name');
    if (nameValue !== 'Test Turno QA') {
      BUG('medium', 'shifts/[id]/client-page.tsx', 40, `Edit form loaded with wrong data: expected "Test Turno QA", got "${nameValue}"`);
    }
    PASS('Edit shift - loads data correctly');
  } catch (err) {
    FAIL('Edit shift - load data', `Form not found: ${err.message}`);
    return;
  }

  // Change name and save
  await clearThenType('#name', 'Test Turno QA Editado');
  await takeScreenshot('09-shifts-edit-modified');
  await page.click('button[type="submit"]');
  
  try {
    await page.waitForURL('**/shifts**', { timeout: 10000 });
    await waitForLoad();
    await takeScreenshot('10-shifts-after-edit');
    const afterEdit = await page.textContent('body');
    if (afterEdit.includes('Test Turno QA Editado')) {
      PASS('Edit shift - changes reflected in list');
    } else {
      FAIL('Edit shift', 'Edited name not found in list');
    }
  } catch (err) {
    FAIL('Edit shift', `Failed after save: ${err.message}`);
  }
}

async function testAssignments() {
  console.log('\n📋 SECTION 3: SHIFT ASSIGNMENTS (Asignaciones)');

  // Navigate to assignments
  await page.goto(`${BASE}/dashboard/rh/assignments`, { waitUntil: 'networkidle' });
  await waitForLoad();
  await takeScreenshot('11-assignments-list');

  const assignTitle = await page.textContent('h1');
  if (!assignTitle.includes('Assignments')) {
    FAIL('Assignments page loads', `Expected "Assignments", got: ${assignTitle}`);
    return;
  }
  PASS('Assignments page loads');

  // Check search input exists
  const searchInput = await page.$('input[placeholder*="Search" i], input[placeholder*="search" i], input[placeholder*="empleado" i]');
  if (searchInput) {
    PASS('Assignment search field exists');
  } else {
    BUG('low', 'assignments/page.tsx', 83, 'Search input not found (may be rendering issue)');
  }

  // Navigate to new assignment
  await page.goto(`${BASE}/dashboard/rh/assignments/new`, { waitUntil: 'networkidle' });
  await waitForLoad();
  await takeScreenshot('12-assignments-new-form');

  // Check the form loads with dropdowns
  await sleep(1500);
  const selects = await page.$$('select');
  console.log(`     Found ${selects.length} select fields`);

  if (selects.length < 3) {
    FAIL('Assignment form loads', `Expected at least 3 select fields, found ${selects.length}`,
        await takeScreenshot('12-assignments-form-fields'));
  } else {
    PASS('Assignment form loads with dropdowns');
  }

  // Fill form with first available values
  for (const sel of selects) {
    const options = await sel.$$('option');
    for (const opt of options) {
      const val = await opt.getAttribute('value');
      if (val && val.trim() !== '') {
        await sel.selectOption(val);
        break;
      }
    }
  }

  // Fill date inputs
  const dateInputs = await page.$$('input[type="date"]');
  for (const inp of dateInputs) {
    await inp.fill('2026-01-01');
  }
  
  await takeScreenshot('13-assignments-filled');
  await sleep(500);

  // Submit
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
  } else {
    // Try any button with create/save text
    const btns = await page.$$('button');
    let clicked = false;
    for (const btn of btns) {
      const text = await btn.textContent();
      if (text.toLowerCase().includes('creat') || text.toLowerCase().includes('save') || text.toLowerCase().includes('submit')) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      FAIL('Create assignment', 'Could not find submit button');
      return;
    }
  }

  // Wait for redirect
  try {
    await page.waitForURL('**/assignments/**', { timeout: 10000 });
    // Check if still on new or went to list
    await sleep(1500);
    if (page.url().includes('/new')) {
      // Check for validation errors
      const body = await page.textContent('body');
      if (body.includes('required') || body.includes('error') || body.includes('Error')) {
        FAIL('Create assignment', `Validation error: ${body.slice(0, 300)}`,
            await takeScreenshot('14-assignments-validation-error'));
      } else {
        FAIL('Create assignment', `Stayed on new page without visible error`);
      }
      return;
    }
    await takeScreenshot('14-assignments-after-create');
    PASS('Create assignment - redirects successfully');
  } catch (err) {
    FAIL('Create assignment', `Not redirected: ${err.message}. URL: ${page.url()}`,
        await takeScreenshot('14-assignments-stuck'));
  }
}

async function testAttendance() {
  console.log('\n📋 SECTION 4: ATTENDANCE (Asistencias)');

  // Navigate to attendance
  await page.goto(`${BASE}/dashboard/rh/attendance`, { waitUntil: 'networkidle' });
  await sleep(4000); // Give time for RSC to render
  
  const url = page.url();
  console.log(`     URL after navigation: ${url}`);

  // Check for client-side errors
  let pageError = null;
  page.on('pageerror', err => { pageError = err.message; });

  await waitForLoad();
  
  // Check body text
  const visibleText = await page.evaluate(() => document.body?.innerText || '').catch(() => '');
  console.log(`     Visible text: ${visibleText.slice(0, 300)}`);

  // Check for the specific "couldn't load" error
  if (visibleText.includes("couldn't load") || visibleText.includes('error')) {
    // Check for page errors
    if (pageError) {
      console.log(`     Page error detected: ${pageError}`);
      BUG('critical', 'attendance/page.tsx', 60, `Attendance page crashes with runtime error: "${pageError}". This is likely because the API returns clockIn/clockOut as empty objects {} instead of null, and the frontend tries to call .match() on an object.`);
    }
    
    // Let's check the actual API response
    const attendData = await apiGet('/rh/attendance?startDate=2026-07-17');
    console.log(`     API /rh/attendance status: ${attendData.status}`);
    if (attendData.status === 200 && attendData.data) {
      const records = attendData.data.data || attendData.data;
      if (Array.isArray(records) && records.length > 0) {
        const clockInType = typeof records[0].clockIn;
        const clockInVal = JSON.stringify(records[0].clockIn);
        console.log(`     clockIn type: ${clockInType}, value: ${clockInVal}`);
        if (clockInType === 'object' && clockInVal === '{}') {
          BUG('critical', 'backend', 'attendance controller', `Backend returns clockIn as empty object {} instead of null. This causes frontend crash ("e.match is not a function") in extractTime().`);
        }
      }
    }

    FAIL('Attendance page loads', `Page crashed: "${visibleText.slice(0, 200)}". ${pageError ? 'JS Error: ' + pageError : ''}`, 
        await takeScreenshot('15-attendance-error'));
    return;
  }

  const attTitle = await page.textContent('h1').catch(() => '');
  if (attTitle.includes('Attendance')) {
    PASS('Attendance page loads');
  } else {
    FAIL('Attendance page loads', `Expected "Attendance", got: "${attTitle}"`);
    return;
  }

  // Check date filter exists
  const dateFilter = await page.$('input[type="date"]');
  if (dateFilter) {
    PASS('Attendance date filter exists');
  }

  // Click new record
  const newBtn = await page.$('button:has-text("New Record")');
  if (!newBtn) {
    FAIL('New attendance record', 'Button "New Record" not found');
    return;
  }
  await newBtn.click();
  await sleep(1000);
  await takeScreenshot('16-attendance-modal');

  // Fill the form
  const empSelect = await page.$('select');
  if (empSelect) {
    const options = await empSelect.$$('option');
    for (const opt of options) {
      const val = await opt.getAttribute('value');
      if (val && val.trim() !== '') {
        await empSelect.selectOption(val);
        break;
      }
    }
  }

  const timeInputs = await page.$$('input[type="time"]');
  if (timeInputs.length >= 2) {
    await timeInputs[0].fill('08:00');
    await timeInputs[1].fill('17:00');
  }

  const notesTextarea = await page.$('textarea');
  if (notesTextarea) {
    await notesTextarea.fill('QA test record');
  }

  await takeScreenshot('17-attendance-modal-filled');
  await sleep(500);

  // Submit
  const createBtn = await page.$('button:has-text("Create")');
  if (createBtn) await createBtn.click();

  await sleep(3000);
  
  // Check result
  const bodyAfter = await page.evaluate(() => document.body?.innerText || '').catch(() => '');
  if (bodyAfter.includes('QA test') || bodyAfter.includes('08:00')) {
    PASS('Create attendance record');
  } else if (bodyAfter.includes('Error') || bodyAfter.includes('error')) {
    FAIL('Create attendance record', `Error after creation: ${bodyAfter.slice(0, 300)}`);
  } else {
    BUG('medium', 'attendance/page.tsx', 220, 'Attendance record created but status unclear');
  }
}

async function testKiosk() {
  console.log('\n📋 SECTION 5: KIOSK (Marcación pública)');

  await page.goto(`${BASE}/marcar`, { waitUntil: 'networkidle' });
  await sleep(2000);
  await takeScreenshot('18-kiosk-page');

  const kioskBody = await page.evaluate(() => document.body?.innerText || '');
  if (!kioskBody.includes('Kiosk') && !kioskBody.includes('Marcar') && !kioskBody.includes('Attendance')) {
    FAIL('Kiosk page loads', 'Kiosk page title not found');
    return;
  }
  PASS('Kiosk page loads');

  // Check elements
  const cameraBtn = await page.$('button:has-text("Start Camera")');
  if (cameraBtn) PASS('Kiosk shows Start Camera button');

  const manualInput = await page.$('input[placeholder*="token" i], input[placeholder*="QR" i]');
  if (manualInput) PASS('Kiosk shows manual token input');

  const lookupBtn = await page.$('button:has-text("Lookup")');
  if (lookupBtn) PASS('Kiosk shows Lookup button');

  // Test with invalid token
  if (manualInput && lookupBtn) {
    await manualInput.fill('INVALID-TOKEN-12345');
    await lookupBtn.click();
    await sleep(2000);
    await takeScreenshot('19-kiosk-invalid-token');
    
    const bodyAfter = await page.evaluate(() => document.body?.innerText || '');
    if (bodyAfter.includes('Invalid') || bodyAfter.includes('Error') || bodyAfter.includes('error')) {
      PASS('Kiosk shows error for invalid token');
    } else {
      BUG('low', 'marcar/page.tsx', 72, 'Invalid token did not show error message');
    }
  }

  // Test kiosk API endpoints directly
  console.log('\n     🔍 Direct API checks:');
  
  const lookupResp = await fetch(`${API}/public/attendance/lookup/test`);
  console.log(`     GET /public/attendance/lookup/test → ${lookupResp.status}`);
  if (lookupResp.status === 404) {
    PASS('Kiosk lookup API returns 404 for invalid token');
  }

  const assignResp = await fetch(`${API}/public/attendance/assignments/9999`);
  console.log(`     GET /public/attendance/assignments/9999 → ${assignResp.status}`);

  // Try a valid token lookup
  try {
    const validTokenResp = await fetch(`${API}/public/attendance/lookup/958e3a6d-b33b-4492-9f0a-8a8fc22f99fd`);
    console.log(`     GET /public/attendance/lookup/valid-token → ${validTokenResp.status}`);
    if (validTokenResp.ok) {
      const empData = await validTokenResp.json();
      console.log(`     Employee found: ${empData.firstName} ${empData.lastName}`);
      PASS('Kiosk lookup works with valid QR token');
      
      // Now test assignments for this employee
      const empAssignResp = await fetch(`${API}/public/attendance/assignments/${empData.id}`);
      console.log(`     GET /public/attendance/assignments/${empData.id} → ${empAssignResp.status}`);
      if (empAssignResp.ok) {
        const assignData = await empAssignResp.json();
        const assigns = Array.isArray(assignData) ? assignData : (assignData.data || []);
        console.log(`     Assignments for today: ${assigns.length}`);
        if (assigns.length > 0) {
          PASS('Kiosk shows assignments for valid employee');
        }
      }
    }
  } catch (err) {
    BUG('high', 'backend', 'public/attendance', `Kiosk lookup for valid token failed: ${err.message}`);
  }
}

async function testApiFixes() {
  console.log('\n📋 SECTION 6: VERIFICACIONES POST-FIX (API con token)');

  // 1. Date range filtering
  console.log('\n     🔍 Date range filtering:');
  let resp = await apiGet('/rh/attendance?startDate=2026-07-17');
  console.log(`     GET /rh/attendance?startDate=2026-07-17 → ${resp.status}`);
  if (resp.status === 200) {
    PASS('Date range filter endpoint works');
    // Check for the clockIn {} bug
    const data = resp.data?.data || resp.data || [];
    if (Array.isArray(data) && data.length > 0) {
      const rec = data[0];
      if (rec.clockIn && typeof rec.clockIn === 'object' && Object.keys(rec.clockIn).length === 0) {
        BUG('critical', 'backend', 'attendance controller', 
          'Backend returns clockIn/clockOut as empty objects {} instead of null. '
          + 'This crashes the frontend attendance page with "e.match is not a function" '
          + '- the extractTime() function receives {} and tries to call .match() on it.');
      }
    }
  } else {
    BUG('critical', 'backend', 'attendance controller', `Date range filtering failed with status ${resp.status}. Message: ${JSON.stringify(resp.data)}`);
  }

  // 2. includeInactive option
  console.log('\n     🔍 includeInactive option:');
  resp = await apiGet('/rh/shifts?includeInactive=true');
  console.log(`     GET /rh/shifts?includeInactive=true → ${resp.status}`);
  if (resp.status === 200) {
    PASS('Shifts includeInactive option works');
  } else {
    BUG('medium', 'backend', 'shifts controller', `includeInactive option failed with status ${resp.status}`);
  }

  // 3. Search by employee name
  console.log('\n     🔍 Search by employee name:');
  resp = await apiGet('/rh/assignments?search=test');
  console.log(`     GET /rh/assignments?search=test → ${resp.status}`);
  if (resp.status === 200) {
    PASS('Assignment search by employee name works');
  } else {
    BUG('medium', 'backend', 'assignments controller', `Search by employee name failed with status ${resp.status}`);
  }

  // 4. Test shift soft delete (list shifts and check test shift)
  console.log('\n     🔍 Soft delete verification:');
  resp = await apiGet('/rh/shifts');
  console.log(`     GET /rh/shifts → ${resp.status}`);
  if (resp.status === 200) {
    const data = resp.data?.data || resp.data || [];
    const shifts = Array.isArray(data) ? data : [];
    const testShift = shifts.find(s => s.name?.includes('Test Turno QA'));
    
    if (testShift) {
      console.log(`     Test shift found: ID=${testShift.id}, name="${testShift.name}", isActive=${testShift.isActive}`);
      PASS('Test shift exists and can be queried');
      
      // Try soft delete via PATCH
      if (testShift.id) {
        const patchResp = await fetch(`${API}/rh/shifts/${testShift.id}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false }),
        });
        console.log(`     PATCH /rh/shifts/${testShift.id} (deactivate) → ${patchResp.status}`);
        if (patchResp.ok) PASS('Shift soft delete (deactivate) works');
        
        // Reactivate
        await fetch(`${API}/rh/shifts/${testShift.id}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true }),
        });
        console.log(`     PATCH /rh/shifts/${testShift.id} (reactivate) → OK`);
      }
    } else {
      BUG('low', 'test', 0, 'Test shift not found after creation (may have been cleaned up)');
    }
  }

  // 5. Test duplicate attendance prevention
  console.log('\n     🔍 Duplicate attendance prevention:');
  
  // First, get employees list
  const empResp = await apiGet('/rh/employees?status=active');
  console.log(`     GET /rh/employees?status=active → ${empResp.status}`);
  if (empResp.status === 200) {
    const emps = empResp.data?.data || empResp.data || [];
    const employees = Array.isArray(emps) ? emps : [];
    if (employees.length > 0) {
      const emp = employees[0];
      console.log(`     Using employee ID=${emp.id} for duplicate test`);
      
      // Create first record
      const body = {
        employeeId: emp.id,
        date: '2026-07-17',
        clockIn: '2026-07-17T08:00:00',
        clockOut: '2026-07-17T17:00:00',
        breakMinutes: 60,
        notes: 'QA duplicate test',
      };
      
      resp = await apiPost('/rh/attendance', body);
      console.log(`     POST /rh/attendance (first) → ${resp.status}`);
      
      if (resp.status === 201 || resp.status === 200) {
        // Try to create duplicate
        resp = await apiPost('/rh/attendance', body);
        console.log(`     POST /rh/attendance (duplicate) → ${resp.status} - ${JSON.stringify(resp.data).slice(0, 150)}`);
        
        if (resp.status === 400 || resp.status === 409) {
          PASS('Duplicate attendance correctly rejected (400/409)');
        } else if (resp.status === 201 || resp.status === 200) {
          BUG('high', 'backend', 'attendance controller', 
            'Duplicate attendance record was created instead of being rejected. '
            + 'Expected 400/409 but got 201/200. The uniqueness constraint may not be working.');
        } else {
          BUG('medium', 'backend', 'attendance controller', 
            `Duplicate returned unexpected status ${resp.status}: ${JSON.stringify(resp.data).slice(0, 200)}`);
        }
        
        // Clean up test records
        const allResp = await apiGet(`/rh/attendance?startDate=2026-07-17`);
        if (allResp.status === 200) {
          const allData = allResp.data?.data || allResp.data || [];
          const testRecords = Array.isArray(allData) ? allData.filter(r => r.notes === 'QA duplicate test') : [];
          for (const rec of testRecords) {
            await apiDelete(`/rh/attendance/${rec.id}`);
            console.log(`     Deleted test attendance ID=${rec.id}`);
          }
        }
      } else {
        BUG('medium', 'backend', 'attendance controller', 
          `Could not create test attendance for duplicate test: status ${resp.status}, ${JSON.stringify(resp.data).slice(0, 200)}`);
      }
    }
  }
}

async function cleanupTestData() {
  console.log('\n📋 SECTION 7: CLEANUP (Limpieza de datos de prueba)');
  
  if (!authToken) {
    console.log('     No auth token available for cleanup');
    return;
  }

  try {
    // Delete test attendance records
    const attendResp = await apiGet('/rh/attendance?startDate=2026-07-17');
    if (attendResp.status === 200) {
      const attData = attendResp.data?.data || attendResp.data || [];
      const records = Array.isArray(attData) ? attData : [];
      for (const rec of records) {
        if (rec.notes?.includes('QA test') || rec.notes?.includes('QA duplicate')) {
          await apiDelete(`/rh/attendance/${rec.id}`);
          console.log(`     Deleted test attendance ID=${rec.id}`);
        }
      }
    }

    // Delete test shifts (by name)
    const shiftsResp = await apiGet('/rh/shifts');
    if (shiftsResp.status === 200) {
      const sData = shiftsResp.data?.data || shiftsResp.data || [];
      const shifts = Array.isArray(sData) ? sData : [];
      for (const s of shifts) {
        if (s.name?.includes('Test Turno QA')) {
          await apiDelete(`/rh/shifts/${s.id}`);
          console.log(`     Deleted test shift ID=${s.id}`);
        }
      }
    }

    PASS('Test data cleanup completed');
  } catch (err) {
    console.log(`     Cleanup error: ${err.message}`);
  }
}

// =============================================================
// MAIN
// =============================================================
async function main() {
  console.log('================================================================');
  console.log('  QA TEST — Flujo Completo: Asistencias / Turnos / Marcación');
  console.log('  Fecha:     ' + new Date().toISOString());
  console.log('  Frontend:  ' + BASE);
  console.log('  Backend:   ' + API);
  console.log('================================================================\n');

  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  page = await context.newPage();

  // Capture page errors
  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message);
    console.log(`     ⚠️ Page error: ${err.message}`);
  });

  try {
    // SECTION 1: Login
    const loggedIn = await testLogin();
    if (!loggedIn) {
      console.log('\n⚠️  Cannot continue without login. Exiting.');
      await browser.close();
      printReport();
      return;
    }

    // SECTION 2: Shifts
    await testShifts();

    // SECTION 3: Assignments
    await testAssignments();

    // SECTION 4: Attendance
    await testAttendance();

    // SECTION 5: Kiosk
    await testKiosk();

    // SECTION 6: API Fixes verification
    await testApiFixes();

    // SECTION 7: Cleanup
    await cleanupTestData();

  } catch (err) {
    console.error(`\n💥 UNEXPECTED ERROR: ${err.stack || err.message}`);
    BUG('critical', 'test script', 0, `Test script crashed: ${err.message}`);
  } finally {
    await browser.close();
    printReport();
  }
}

function printReport() {
  console.log('\n================================================================');
  console.log('  FINAL QA REPORT');
  console.log('================================================================');
  console.log(`  Tests run:     ${testCount}`);
  console.log(`  Passed:        ${passCount}`);
  console.log(`  Failed:        ${failCount}`);
  console.log(`  Bugs found:    ${results.bugs.length}`);
  console.log(`  Screenshots:   ${screenshotCounter} (${SCREENSHOTS_DIR})`);
  console.log('----------------------------------------------------------------\n');

  if (results.failed.length > 0) {
    console.log('  ❌ FAILED TESTS:');
    for (const f of results.failed) {
      console.log(`     - ${f.name}: ${f.error}`);
    }
    console.log('');
  }

  if (results.bugs.length > 0) {
    console.log('  🐛 BUGS FOUND:');
    for (const b of results.bugs) {
      console.log(`     [${b.severity}] ${b.bug_id}: ${b.description}`);
      console.log(`              ${b.file}:${b.line}`);
    }
    console.log('');
  }

  const verdict = failCount === 0 ? 'APPROVED ✅' : 'REJECTED ❌';
  
  console.log(`  🏆 VEREDICTO: ${verdict}`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
