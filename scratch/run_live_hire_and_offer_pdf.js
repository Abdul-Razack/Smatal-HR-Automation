/**
 * Live Browser Execution:
 * Single Company -> Hire One Employee -> Generate Offer Letter -> Download Final PDF
 */
const puppeteer = require('/home/abdul-razack-a/Work/Smatal/Smatal Onboard/smatal-hr-system/backend/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = '/home/abdul-razack-a/.gemini/antigravity-ide/brain/dc231fcb-9db1-4995-86ce-6d189b4ec597/scratch/live_hire_screenshots';
const DOWNLOAD_DIR = '/home/abdul-razack-a/.gemini/antigravity-ide/brain/dc231fcb-9db1-4995-86ce-6d189b4ec597/scratch/live_hire_downloads';

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

// Clear prior downloads
fs.readdirSync(DOWNLOAD_DIR).forEach(f => fs.unlinkSync(path.join(DOWNLOAD_DIR, f)));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findElementByText(page, selector, text) {
  const elements = await page.$$(selector);
  for (const el of elements) {
    const t = await page.evaluate(node => node.textContent, el);
    if (t && t.trim().includes(text)) {
      return el;
    }
  }
  return null;
}

async function clickElementByText(page, selector, text) {
  const el = await findElementByText(page, selector, text);
  if (el) {
    await el.click();
    return true;
  }
  return false;
}

async function saveInterceptedBlobs(page, targetDir) {
  await sleep(2500);
  const blobs = await page.evaluate(() => {
    const list = window.__downloadedBlobs || [];
    window.__downloadedBlobs = [];
    return list;
  });
  console.log(`Intercepted ${blobs.length} browser blob(s)`);
  for (let i = 0; i < blobs.length; i++) {
    const b = blobs[i];
    if (b && b.dataUrl && b.dataUrl.includes('base64,')) {
      const base64Data = b.dataUrl.split('base64,')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = b.filename && b.filename.endsWith('.pdf') ? b.filename : `Offer_Letter_${Date.now()}.pdf`;
      fs.writeFileSync(path.join(targetDir, filename), buffer);
      console.log(`Saved intercepted PDF to ${filename}, size: ${buffer.length} bytes`);
    }
  }
}

(async () => {
  let browser;
  try {
    console.log('1. Launching real Chromium browser...');
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
      defaultViewport: { width: 1280, height: 900 },
    });

    const page = await browser.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') console.log('Browser Error:', msg.text());
    });

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: DOWNLOAD_DIR,
    });

    await page.evaluateOnNewDocument(() => {
      window.__downloadedBlobs = [];
      const origCreate = window.URL.createObjectURL;
      window.URL.createObjectURL = function(blob) {
        const url = origCreate.call(window.URL, blob);
        const reader = new FileReader();
        reader.onload = () => {
          window.__downloadedBlobs.push({
            url,
            type: blob.type,
            size: blob.size,
            filename: window.__lastDownloadName || 'document.pdf',
            dataUrl: reader.result,
          });
        };
        reader.readAsDataURL(blob);
        return url;
      };

      const origSetAttribute = HTMLAnchorElement.prototype.setAttribute;
      HTMLAnchorElement.prototype.setAttribute = function(name, value) {
        if (name === 'download') {
          window.__lastDownloadName = value;
        }
        return origSetAttribute.apply(this, arguments);
      };
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 1: LOGIN AS ADMIN
    // ─────────────────────────────────────────────────────────────
    console.log('2. Logging into Smatal HR System...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    await page.type('#email', 'admin@smatal.com');
    await page.type('#password', 'password');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_dashboard.png') });

    // ─────────────────────────────────────────────────────────────
    // STEP 2: VERIFY COMPANY SETTINGS & MASTER SETUP
    // ─────────────────────────────────────────────────────────────
    console.log('3. Checking Company Settings (Acme Corporation)...');
    await page.goto('http://localhost:3000/master/organization', { waitUntil: 'networkidle2' });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_company_organization.png') });

    // ─────────────────────────────────────────────────────────────
    // STEP 3: VERIFY OFFER LETTER TEMPLATE
    // ─────────────────────────────────────────────────────────────
    console.log('4. Checking Offer Letter Template...');
    await page.goto('http://localhost:3000/documents/templates', { waitUntil: 'networkidle2' });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_templates_list.png') });

    // ─────────────────────────────────────────────────────────────
    // STEP 4: HIRE ONE EMPLOYEE (Jordan Miller)
    // ─────────────────────────────────────────────────────────────
    console.log('5. Navigating to Employees directory to hire Jordan Miller...');
    await page.goto('http://localhost:3000/hr/employees', { waitUntil: 'networkidle2' });
    await sleep(2000);

    const addEmpBtn = await findElementByText(page, 'button', 'Add Employee');
    if (addEmpBtn) {
      await addEmpBtn.click();
      await sleep(1500);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_add_employee_modal.png') });

    const empCode = 'EMP-0001';
    const empEmail = 'jordan.miller@example.com';

    await page.type('#firstName', 'Jordan');
    await page.type('#lastName', 'Miller');
    await page.type('#personalEmail', empEmail);
    await page.type('#phone', '+1 555-987-6543');
    await page.type('#employeeNumber', empCode);
    await page.type('#salary', '145000');

    const triggerSelect = async (triggerId, targetText) => {
      try {
        const trigger = await page.$(`#${triggerId}`);
        if (trigger) {
          await trigger.click();
          await sleep(500);
          const items = await page.$$('[role="option"]');
          for (const item of items) {
            const txt = await page.evaluate(el => el.textContent, item);
            if (txt && txt.toLowerCase().includes(targetText.toLowerCase())) {
              await item.click();
              await sleep(300);
              return true;
            }
          }
          if (items.length > 0) {
            await items[0].click();
            await sleep(300);
            return true;
          }
        }
      } catch (err) {}
      return false;
    };

    await triggerSelect('departmentId', 'Software Engineering');
    await triggerSelect('designationId', 'Senior Full Stack Engineer');
    await triggerSelect('branchId', 'Headquarters');
    await triggerSelect('status', 'PROBATION');

    const todayStr = new Date().toISOString().split('T')[0];
    const probationEnd = new Date();
    probationEnd.setMonth(probationEnd.getMonth() + 3);
    const probationStr = probationEnd.toISOString().split('T')[0];

    await page.evaluate((val) => {
      const el = document.getElementById('joinedDate');
      if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
    }, todayStr);

    await page.evaluate((val) => {
      const el = document.getElementById('probationEndDate');
      if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
    }, probationStr);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_add_employee_filled.png') });

    const submitEmpBtn = await page.$('button[type="submit"]');
    if (submitEmpBtn) {
      await submitEmpBtn.click();
      await sleep(3500);
    }

    await page.goto('http://localhost:3000/hr/employees', { waitUntil: 'networkidle2' });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_employee_directory_with_jordan.png') });

    // Open Jordan's profile
    const jordanRowLink = await page.evaluate((code) => {
      const rows = document.querySelectorAll('table tbody tr');
      for (const row of rows) {
        if (row.innerText.includes(code) || row.innerText.includes('Jordan')) {
          const link = row.querySelector('a');
          if (link) return link.getAttribute('href');
        }
      }
      return null;
    }, empCode);

    console.log('Jordan profile link:', jordanRowLink);
    const empProfileUrl = `http://localhost:3000${jordanRowLink}`;
    await page.goto(empProfileUrl, { waitUntil: 'networkidle2' });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_jordan_profile_overview.png') });

    // ─────────────────────────────────────────────────────────────
    // STEP 5: OPEN DOCUMENTS TAB & GENERATE OFFER LETTER
    // ─────────────────────────────────────────────────────────────
    console.log('6. Opening Documents tab on Jordan Miller profile...');
    await clickElementByText(page, 'button[role="tab"]', 'Documents');
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_jordan_docs_tab.png') });

    console.log('7. Clicking Generate Document button...');
    const genDocBtn = await findElementByText(page, 'button', 'Generate Document') || await findElementByText(page, 'button', 'Generate New');
    if (genDocBtn) {
      await genDocBtn.click();
      await sleep(1500);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_generate_doc_dialog_opened.png') });

    // Select Offer Letter in modal dropdown
    console.log('8. Selecting Employment Offer Letter in dropdown...');
    const modalSelectTrigger = await page.$('div[role="dialog"] button[role="combobox"]') || await page.$('div[role="dialog"] [data-state]');
    if (modalSelectTrigger) {
      await modalSelectTrigger.click();
      await sleep(500);
      const options = await page.$$('[role="option"]');
      for (const opt of options) {
        const text = await page.evaluate(el => el.textContent, opt);
        if (text && (text.includes('Offer Letter') || text.includes('OFFER_LETTER'))) {
          await opt.click();
          break;
        }
      }
      await sleep(500);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_generate_doc_dialog_selected.png') });

    console.log('9. Submitting document generation...');
    const submitGenBtn = await page.$('div[role="dialog"] button[type="submit"]');
    if (submitGenBtn) {
      await submitGenBtn.click();
      await sleep(5000);
    }

    if (page.url().includes('/hr/documents/')) {
      console.log('Document viewer loaded:', page.url());
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_generated_doc_viewer.png') });
      await page.goto(empProfileUrl, { waitUntil: 'networkidle2' });
      await sleep(1500);
      await clickElementByText(page, 'button[role="tab"]', 'Documents');
      await sleep(2000);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_documents_tab_with_offer_letter.png') });

    // ─────────────────────────────────────────────────────────────
    // STEP 6: DOWNLOAD & VALIDATE FINAL PDF
    // ─────────────────────────────────────────────────────────────
    console.log('10. Clicking Download button to retrieve final PDF...');
    const downloadBtn = await findElementByText(page, 'button', 'Download');
    if (downloadBtn) {
      await downloadBtn.click();
      await sleep(3500);
      await saveInterceptedBlobs(page, DOWNLOAD_DIR);
    }

    // Inspect downloaded file
    const downloadedFiles = fs.readdirSync(DOWNLOAD_DIR);
    console.log('Files in download dir:', downloadedFiles);

    const pdfFile = downloadedFiles.find(f => f.endsWith('.pdf'));
    if (pdfFile) {
      const filePath = path.join(DOWNLOAD_DIR, pdfFile);
      const buf = fs.readFileSync(filePath);
      const header = buf.toString('utf8', 0, 5);
      console.log('\n========================================');
      console.log('     OFFER LETTER PDF VERIFICATION      ');
      console.log('========================================');
      console.log(`Filename:    ${pdfFile}`);
      console.log(`File Size:   ${buf.length} bytes`);
      console.log(`Magic Header: ${header}`);
      console.log(`Valid PDF:   ${header.startsWith('%PDF-') && buf.length > 500 ? 'YES (PASS)' : 'NO (FAIL)'}`);
      console.log('========================================\n');
    } else {
      console.error('Error: No PDF file found in download directory.');
    }

  } catch (error) {
    console.error('Execution Error:', error);
  } finally {
    if (browser) await browser.close();
  }
})();
