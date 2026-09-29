node -e "
const puppeteer = require('./backend/node_modules/puppeteer');
const fs = require('fs');

(async () => {
  const logoB64 = Buffer.from(fs.readFileSync('assets/smatal_logo.png')).toString('base64');
  
  const html = \`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset='utf-8'>
    <style>
      @page {
        size: A4;
        margin: 0;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        background-color: #ffffff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page-container {
        position: relative;
        width: 210mm;
        height: 297mm;
        padding: 14mm 20mm 18mm 20mm;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #ffffff;
        box-sizing: border-box;
      }
      /* Top Gradient Accent Bar */
      .top-accent-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6px;
        background: linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #f59e0b 100%);
      }
      /* Watermark */
      .watermark-container {
        position: absolute;
        top: 52%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 400px;
        height: 400px;
        opacity: 0.05;
        pointer-events: none;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .watermark-container img {
        width: 100%;
        height: auto;
      }
      /* Header */
      .letterhead-header {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        border-bottom: 2px solid #0f172a;
      }
      .brand-block {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .brand-logo {
        height: 58px;
        width: auto;
      }
      .brand-text h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.01em;
        color: #0f172a;
        line-height: 1.1;
      }
      .contact-block {
        text-align: right;
        font-size: 9.5px;
        line-height: 1.6;
        color: #475569;
        max-width: 300px;
      }
      .contact-block strong {
        color: #0f172a;
      }
      /* Body content */
      .letterhead-body {
        position: relative;
        z-index: 2;
        flex-grow: 1;
        padding: 28px 0;
        font-size: 13px;
        line-height: 1.7;
        color: #334155;
      }
      /* Footer */
      .letterhead-footer {
        position: relative;
        z-index: 2;
        border-top: 1px solid #cbd5e1;
        padding-top: 10px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        font-size: 9px;
        color: #64748b;
      }
      .footer-left {
        line-height: 1.5;
      }
      .footer-right {
        text-align: right;
        font-weight: 500;
        color: #334155;
        line-height: 1.5;
      }
      .bottom-accent-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);
      }
    </style>
  </head>
  <body>
    <div class='page-container'>
      <div class='top-accent-bar'></div>
      
      <!-- Subtle Watermark centered in document -->
      <div class='watermark-container'>
        <img src='data:image/png;base64,\${logoB64}' alt='Watermark' />
      </div>

      <!-- Header -->
      <header class='letterhead-header'>
        <div class='brand-block'>
          <img src='data:image/png;base64,\${logoB64}' alt='Smatal Logo' class='brand-logo' />
          <div class='brand-text'>
            <h1>SMATAL TECHNOLOGIES</h1>
          </div>
        </div>
        <div class='contact-block'>
          <div><strong>Registered Office:</strong> 2nd Floor, Hameedia Shopping Mall</div>
          <div>No. 108, Triplicane High Rd, Chennai - 600005, Tamil Nadu</div>
          <div><strong>Phone:</strong> +91 9649 9649 12 &nbsp;|&nbsp; +91 81248 59667</div>
          <div><strong>Web:</strong> www.smatal.com &nbsp;|&nbsp; <strong>Email:</strong> info@smatal.com</div>
        </div>
      </header>

      <!-- Document Body Area -->
      <main class='letterhead-body'>
        <div style='display: flex; justify-content: space-between; margin-bottom: 24px;'>
          <div>
            <div style='font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;'>Reference:</div>
            <div style='font-weight: 600; color: #0f172a;'>SMATAL/HR/DOC/2026/001</div>
          </div>
          <div style='text-align: right;'>
            <div style='font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;'>Date:</div>
            <div style='font-weight: 600; color: #0f172a;'>{{system.currentDate}}</div>
          </div>
        </div>

        <div style='text-align: center; margin: 28px 0 24px 0;'>
          <span style='font-size: 17px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #059669; padding-bottom: 4px;'>
            OFFICIAL DOCUMENT TEMPLATE
          </span>
        </div>

        <p><strong>To,</strong><br/>
        <strong>{{employee.fullName}}</strong><br/>
        {{employee.address}}</p>

        <p>Dear <strong>{{employee.firstName}}</strong>,</p>

        <p>This is the official corporate document template for <strong>Smatal Technologies</strong>.</p>

        <div style='margin-top: 48px; display: flex; justify-content: space-between; align-items: flex-end;'>
          <div>
            <div style='font-size: 11px; color: #64748b;'>Authorized Signatory:</div>
            <div style='margin-top: 35px; border-top: 1.5px solid #0f172a; width: 180px; padding-top: 4px;'>
              <div style='font-weight: 700; color: #0f172a;'>Abdul Razack</div>
              <div style='font-size: 11px; color: #64748b;'>Chief Executive Officer (CEO)</div>
              <div style='font-size: 10px; color: #059669; font-weight: 600;'>Smatal Technologies</div>
            </div>
          </div>
          <div style='text-align: right;'>
            <div style='font-size: 11px; color: #64748b;'>Company Seal:</div>
            <div style='margin-top: 15px; width: 75px; height: 75px; border: 1.5px dashed #94a3b8; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; color: #94a3b8; text-transform: uppercase;'>
              Seal
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class='letterhead-footer'>
        <div class='footer-left'>
          <div><strong>Smatal Technologies</strong> | Triplicane High Rd, Chennai - 600005, India</div>
          <div>Confidential &bull; Intended solely for the designated recipient.</div>
        </div>
        <div class='footer-right'>
          <div>www.smatal.com</div>
        </div>
      </footer>

      <div class='bottom-accent-bar'></div>
    </div>
  </body>
  </html>
  \`;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({
    path: 'Modern_Smatal_Technologies_Letterhead_Clean.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });
  await browser.close();
  console.log('Clean PDF generated successfully: Modern_Smatal_Technologies_Letterhead_Clean.pdf');
})();
"