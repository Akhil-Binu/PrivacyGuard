const PDFDocument = require('pdfkit');

function generatePdfReport(scan, res) {
  const doc = new PDFDocument({
    margin: 45,
    size: 'A4',
    bufferPages: true,
    info: {
      Title: `PrivacyGuard Audit - ${scan.hostname}`,
      Author: 'PrivacyGuard Compliance Intelligence'
    }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="privacyguard-${scan.hostname}.pdf"`);
  doc.pipe(res);

  const navy = '#0f172a';
  const slate = '#64748b';
  const accent = '#155eef';
  const green = '#16a34a';
  const red = '#dc2626';
  const amber = '#d97706';

  // --- Header ---
  doc.fillColor(navy).fontSize(22).font('Helvetica-Bold').text('PrivacyGuard', { continued: true });
  doc.fillColor(accent).fontSize(22).font('Helvetica-Bold').text(' Audit Report');
  doc.fillColor(slate).fontSize(10).font('Helvetica').text('Automated GDPR, CCPA/CPRA & Security Compliance Assessment');
  doc.moveDown(0.8);

  // Target Meta Box
  doc.roundedRect(45, doc.y, 505, 50, 6).fill('#f8fafc').stroke('#e2e8f0');
  doc.fillColor(navy).fontSize(13).font('Helvetica-Bold').text(scan.hostname, 58, doc.y - 40);
  doc.fillColor(slate).fontSize(9).font('Helvetica').text(`URL: ${scan.url}  |  Scanned: ${new Date(scan.scannedAt).toUTCString()}`);
  doc.fillColor(slate).fontSize(8).text(`Engine: ${scan.engine || 'Chromium Deep Scan'}  |  Duration: ${(scan.durationMs / 1000).toFixed(2)}s`);
  doc.y += 18;

  // --- Overall Score & Breakdown Card ---
  const cardY = doc.y;
  doc.roundedRect(45, cardY, 505, 80, 8).fill('#eff6ff');

  // Overall Score Circle/Text
  doc.fillColor(accent).fontSize(34).font('Helvetica-Bold').text(`${scan.score.score}`, 65, cardY + 15);
  doc.fillColor(slate).fontSize(9).font('Helvetica').text('/100 Overall', 65, cardY + 54);

  doc.fillColor(navy).fontSize(13).font('Helvetica-Bold').text(`Grade ${scan.score.grade}`, 135, cardY + 18);
  doc.fillColor(slate).fontSize(9).font('Helvetica').text('Compliance Maturity Rating', 135, cardY + 34);

  // Vertical Divider
  doc.moveTo(270, cardY + 10).lineTo(270, cardY + 70).stroke('#cbd5e1');

  // Breakdown Pillars
  const bd = scan.score.breakdown || {};
  const gdprScore = bd.gdpr?.score ?? 80;
  const ccpaScore = bd.ccpa?.score ?? 85;
  const secScore = bd.security?.score ?? 90;

  doc.fillColor(navy).fontSize(10).font('Helvetica-Bold').text('Regulatory Breakdown:', 290, cardY + 15);
  doc.fillColor(gdprScore >= 80 ? green : amber).fontSize(9).text(`• GDPR / ePrivacy: ${gdprScore}/100 (${bd.gdpr?.grade || 'Pass'})`, 295, cardY + 32);
  doc.fillColor(ccpaScore >= 80 ? green : amber).fontSize(9).text(`• CCPA / CPRA: ${ccpaScore}/100 (${bd.ccpa?.grade || 'Pass'})`, 295, cardY + 46);
  doc.fillColor(secScore >= 80 ? green : amber).fontSize(9).text(`• Web Security: ${secScore}/100 (${bd.security?.grade || 'Pass'})`, 295, cardY + 60);

  doc.y = cardY + 95;

  // --- Consent & Legal Links Summary ---
  doc.fillColor(navy).fontSize(13).font('Helvetica-Bold').text('Consent Management & Legal Policies');
  doc.moveDown(0.3);

  const cmpName = scan.consent.cmpDetected ? scan.consent.cmpDetected : (scan.consent.bannerPresent ? 'Generic Banner' : 'None Detected');
  const rejectStatus = scan.consent.rejectTested
    ? (scan.consent.postRejectTrackingFound ? 'FAILED (Trackers persisted after rejection)' : 'PASSED (Tracking suppressed)')
    : 'Not Tested / No Direct Reject Button';

  doc.fontSize(9).font('Helvetica');
  doc.fillColor(navy).text(`CMP Platform: `, { continued: true }).font('Helvetica-Bold').text(cmpName, { continued: true });
  doc.font('Helvetica').text(`  |  Reject Test: `, { continued: true }).font('Helvetica-Bold').text(rejectStatus);

  const pp = scan.legalLinks?.privacyPolicy?.found ? 'Found' : 'Missing';
  const cp = scan.legalLinks?.cookiePolicy?.found ? 'Found' : 'Missing';
  const dns = scan.legalLinks?.doNotSell?.found ? 'Found (CCPA Compliant)' : 'Missing (CCPA Warning)';
  doc.font('Helvetica').fillColor(slate).text(`Privacy Policy: ${pp}  •  Cookie Policy: ${cp}  •  "Do Not Sell": ${dns}`);
  doc.moveDown(0.8);

  // --- Security Headers Table ---
  doc.fillColor(navy).fontSize(13).font('Helvetica-Bold').text('HTTP Security Headers Audit');
  doc.moveDown(0.3);

  const headerList = [
    ['Content-Security-Policy', scan.headers.csp, 'Mitigates XSS and content injection'],
    ['Strict-Transport-Security', scan.headers.hsts, 'Enforces HTTPS encryption'],
    ['X-Frame-Options', scan.headers.xFrameOptions, 'Prevents clickjacking frame attacks'],
    ['Referrer-Policy', scan.headers.referrerPolicy, 'Restricts URL referrer leakage'],
    ['Permissions-Policy', scan.headers.permissionsPolicy, 'Restricts camera/mic/geo hardware access']
  ];

  headerList.forEach(([name, present, desc]) => {
    const isPass = Boolean(present);
    doc.fillColor(isPass ? green : red).fontSize(9).font('Helvetica-Bold').text(isPass ? '✓ PASS' : '✗ FAIL', 50, doc.y, { continued: true });
    doc.fillColor(navy).font('Helvetica-Bold').text(`  ${name}`, { continued: true });
    doc.fillColor(slate).font('Helvetica').text(` — ${desc}`);
    doc.y += 3;
  });
  doc.moveDown(0.8);

  // --- Cookie & Storage Findings ---
  doc.fillColor(navy).fontSize(13).font('Helvetica-Bold').text(`Detected Cookies & Trackers (${scan.cookies.length} Cookies)`);
  doc.moveDown(0.3);

  const essentialCount = scan.cookies.filter(c => c.category === 'Essential').length;
  const analyticsCount = scan.cookies.filter(c => c.category === 'Analytics').length;
  const adCount = scan.cookies.filter(c => c.category === 'Advertising').length;

  doc.fontSize(9).font('Helvetica').fillColor(slate).text(
    `Categorization: ${essentialCount} Essential  •  ${analyticsCount} Analytics  •  ${adCount} Advertising  |  Third-party Hosts: ${scan.thirdParties.length}`
  );
  doc.moveDown(0.4);

  // Cookie Table Header
  const tableY = doc.y;
  doc.roundedRect(45, tableY, 505, 18, 2).fill('#f1f5f9');
  doc.fillColor(navy).fontSize(8).font('Helvetica-Bold');
  doc.text('Cookie Name', 52, tableY + 5);
  doc.text('Category', 180, tableY + 5);
  doc.text('Origin', 250, tableY + 5);
  doc.text('Security Flags', 340, tableY + 5);
  doc.text('Lifespan', 460, tableY + 5);
  doc.y = tableY + 22;

  const cookiesToShow = scan.cookies.slice(0, 10);
  cookiesToShow.forEach((c, idx) => {
    if (doc.y > 720) doc.addPage();
    const rowY = doc.y;
    if (idx % 2 === 1) doc.rect(45, rowY - 2, 505, 16).fill('#f8fafc');

    doc.fillColor(navy).fontSize(8).font('Helvetica-Bold').text(c.name.slice(0, 24), 52, rowY);
    doc.fillColor(c.category === 'Essential' ? green : (c.category === 'Analytics' ? amber : red))
      .font('Helvetica').text(c.category, 180, rowY);
    doc.fillColor(slate).text(c.thirdParty ? 'Third Party' : '1st Party', 250, rowY);

    const flags = [];
    if (c.secure) flags.push('Secure');
    if (c.httpOnly) flags.push('HttpOnly');
    flags.push(c.sameSite ? `SameSite=${c.sameSite}` : 'No SameSite');
    doc.text(flags.join(', '), 340, rowY);

    doc.text(c.lifespanDays !== null ? `${c.lifespanDays}d` : 'Session', 460, rowY);
    doc.y = rowY + 16;
  });

  if (scan.cookies.length > 10) {
    doc.fillColor(slate).fontSize(8).font('Helvetica-Oblique').text(`+ ${scan.cookies.length - 10} more cookies documented in CSV/JSON export.`, 52, doc.y + 4);
    doc.moveDown(0.6);
  } else {
    doc.moveDown(0.6);
  }

  // --- Remediation Checklist ---
  if (doc.y > 660) doc.addPage();
  doc.fillColor(navy).fontSize(13).font('Helvetica-Bold').text('Recommended Remediation Steps');
  doc.moveDown(0.3);

  const fixes = scan.remediations && scan.remediations.length > 0
    ? scan.remediations
    : [{ title: 'All primary compliance checks passed', description: 'Maintain current security policies and monitor updates.' }];

  fixes.forEach(item => {
    if (doc.y > 740) doc.addPage();
    doc.fillColor(accent).fontSize(9).font('Helvetica-Bold').text(`• [${item.severity || 'Notice'}] ${item.title}`);
    doc.fillColor(slate).fontSize(8).font('Helvetica').text(`   ${item.description}`, { paragraphGap: 4 });
  });

  doc.moveDown(1);
  doc.fillColor('#94a3b8').fontSize(7).text(
    'Disclaimer: PrivacyGuard automated scans provide technical compliance metrics and security indicators. They do not constitute formal legal counsel.',
    { align: 'center' }
  );

  doc.end();
}

module.exports = {
  generatePdfReport
};
