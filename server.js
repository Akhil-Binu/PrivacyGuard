const express = require('express');
const path = require('path');
const { validateUrl, scanWebsite } = require('./lib/scanner');
const { generatePdfReport } = require('./lib/pdf');

const app = express();
const PORT = process.env.PORT || 3000;
const reports = new Map();

// Middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Mock / Demo report populated with all new features
const demoScan = {
  id: 'demo-report-privacyguard',
  engine: 'Playwright Deep Chromium',
  url: 'https://example-ecommerce-store.com',
  hostname: 'example-ecommerce-store.com',
  scannedAt: new Date().toISOString(),
  durationMs: 3420,
  https: true,
  status: 200,
  score: {
    score: 68,
    grade: 'D',
    breakdown: {
      gdpr: { score: 62, grade: 'Warning' },
      ccpa: { score: 55, grade: 'Critical' },
      security: { score: 85, grade: 'Good' }
    }
  },
  consent: {
    cmpDetected: 'OneTrust',
    bannerPresent: true,
    rejectTested: true,
    postRejectTrackingFound: true,
    gpcHonored: false
  },
  legalLinks: {
    privacyPolicy: { found: true, text: 'Privacy Policy', url: 'https://example-ecommerce-store.com/privacy' },
    cookiePolicy: { found: true, text: 'Cookie Settings', url: 'https://example-ecommerce-store.com/cookies' },
    terms: { found: true, text: 'Terms of Service', url: 'https://example-ecommerce-store.com/terms' },
    doNotSell: { found: false, url: null }
  },
  headers: {
    csp: false,
    hsts: true,
    xFrameOptions: true,
    referrerPolicy: true,
    permissionsPolicy: false,
    values: {
      csp: '',
      hsts: 'max-age=31536000; includeSubDomains',
      xFrameOptions: 'SAMEORIGIN',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: ''
    }
  },
  cookies: [
    { name: 'session_token', domain: 'example-ecommerce-store.com', path: '/', category: 'Essential', thirdParty: false, secure: true, httpOnly: true, sameSite: 'Lax', expires: null, lifespanDays: null, issues: [] },
    { name: '_fbp', domain: '.facebook.com', path: '/', category: 'Advertising', thirdParty: true, secure: true, httpOnly: false, sameSite: 'Lax', expires: new Date(Date.now() + 90 * 86400000).toISOString(), lifespanDays: 90, issues: ['Pre-consent tracking'] },
    { name: '_ga', domain: 'example-ecommerce-store.com', path: '/', category: 'Analytics', thirdParty: false, secure: true, httpOnly: false, sameSite: 'Lax', expires: new Date(Date.now() + 730 * 86400000).toISOString(), lifespanDays: 730, issues: ['Lifespan exceeds 13 months (ePrivacy/CNIL violation)'] },
    { name: '_gid', domain: 'example-ecommerce-store.com', path: '/', category: 'Analytics', thirdParty: false, secure: true, httpOnly: false, sameSite: 'Lax', expires: new Date(Date.now() + 1 * 86400000).toISOString(), lifespanDays: 1, issues: [] },
    { name: 'IDE', domain: '.doubleclick.net', path: '/', category: 'Advertising', thirdParty: true, secure: true, httpOnly: true, sameSite: 'None', expires: new Date(Date.now() + 390 * 86400000).toISOString(), lifespanDays: 390, issues: ['Third-party behavioral tracking'] },
    { name: 'cart_id', domain: 'example-ecommerce-store.com', path: '/', category: 'Essential', thirdParty: false, secure: false, httpOnly: false, sameSite: 'Lax', expires: null, lifespanDays: null, issues: ['Missing Secure flag'] }
  ],
  storage: {
    local: [
      { key: '_ga_session_id', length: 18, isTracking: true },
      { key: 'ajs_anonymous_id', length: 36, isTracking: true },
      { key: 'theme_preference', length: 5, isTracking: false }
    ],
    session: [
      { key: 'checkout_step', length: 1, isTracking: false },
      { key: 'mp_session_active', length: 4, isTracking: true }
    ]
  },
  thirdParties: [
    'www.google-analytics.com',
    'connect.facebook.net',
    'securepubads.g.doubleclick.net',
    'cdn.jsdelivr.net',
    'fonts.googleapis.com'
  ],
  remediations: [
    {
      id: 'consent',
      title: 'Enforce Prior Consent for Non-Essential Cookies',
      severity: 'Critical',
      category: 'GDPR / ePrivacy',
      description: '3 advertising and analytics cookies were set immediately upon landing before consent was confirmed.',
      snippets: {
        express: '// Delay analytics initialization until cookie consent event fires\nwindow.addEventListener("cookieConsentAccepted", () => loadAnalytics());'
      }
    },
    {
      id: 'donotsell',
      title: 'Add "Do Not Sell or Share My Info" Link',
      severity: 'High',
      category: 'CCPA / CPRA',
      description: 'Under CCPA/CPRA, websites utilizing third-party advertising trackers must provide an explicit opt-out mechanism in the footer.',
      snippets: {
        express: '<a href="/opt-out" id="privacy-choices">Do Not Sell or Share My Personal Info</a>'
      }
    },
    {
      id: 'csp',
      title: 'Implement Content-Security-Policy (CSP)',
      severity: 'High',
      category: 'Headers',
      description: 'No Content-Security-Policy header detected. Injecting a strict CSP prevents unauthorized cross-site scripting.',
      snippets: {
        nginx: "add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;\" always;",
        apache: "Header always set Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;\"",
        vercel: '{\n  "source": "/(.*)",\n  "headers": [\n    { "key": "Content-Security-Policy", "value": "default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: https:;" }\n  ]\n}',
        express: "app.use(helmet.contentSecurityPolicy({\n  directives: {\n    defaultSrc: [\"'self'\"],\n    scriptSrc: [\"'self'\", \"'unsafe-inline'\"],\n    imgSrc: [\"'self'\", \"data:\", \"https:\"]\n  }\n}));"
      }
    },
    {
      id: 'permissionsPolicy',
      title: 'Add Permissions-Policy Header',
      severity: 'Low',
      category: 'Headers',
      description: 'Permissions-Policy limits unauthorized browser hardware APIs such as camera, microphone, and geolocation.',
      snippets: {
        nginx: 'add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;',
        apache: 'Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"',
        vercel: '{\n  "source": "/(.*)",\n  "headers": [\n    { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }\n  ]\n}',
        express: "app.use((req, res, next) => {\n  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');\n  next();\n});"
      }
    }
  ]
};

reports.set('demo', demoScan);
reports.set(demoScan.id, demoScan);

// API Endpoints
app.post('/api/scan', async (req, res) => {
  try {
    const rawUrl = req.body?.url;
    if (!rawUrl) {
      return res.status(400).json({ error: 'Please enter a website URL.' });
    }
    const target = await validateUrl(rawUrl);
    const scan = await scanWebsite(target);
    reports.set(scan.id, scan);
    res.json(scan);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Unable to scan this website.' });
  }
});

// PDF Report Download
app.get('/api/reports/:id.pdf', (req, res) => {
  const scan = reports.get(req.params.id);
  if (!scan) {
    return res.status(404).json({ error: 'Report not found. Please run a new scan.' });
  }
  generatePdfReport(scan, res);
});

// JSON Report Export
app.get('/api/reports/:id.json', (req, res) => {
  const scan = reports.get(req.params.id);
  if (!scan) {
    return res.status(404).json({ error: 'Report not found.' });
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="privacyguard-${scan.hostname}.json"`);
  res.json(scan);
});

// CSV Report Export (Cookies & Storage)
app.get('/api/reports/:id.csv', (req, res) => {
  const scan = reports.get(req.params.id);
  if (!scan) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  const csvRows = [
    ['Type', 'Name/Key', 'Domain/Source', 'Category', 'Origin', 'Secure', 'HttpOnly', 'SameSite', 'LifespanDays', 'Issues']
  ];

  scan.cookies.forEach(c => {
    csvRows.push([
      'Cookie',
      `"${c.name}"`,
      `"${c.domain}"`,
      c.category,
      c.thirdParty ? 'ThirdParty' : 'FirstParty',
      c.secure ? 'Yes' : 'No',
      c.httpOnly ? 'Yes' : 'No',
      c.sameSite,
      c.lifespanDays !== null ? c.lifespanDays : 'Session',
      `"${(c.issues || []).join('; ')}"`
    ]);
  });

  (scan.storage?.local || []).forEach(item => {
    csvRows.push([
      'LocalStorage',
      `"${item.key}"`,
      'Origin',
      item.isTracking ? 'Tracking/Analytics' : 'Functional',
      'FirstParty',
      'N/A',
      'N/A',
      'N/A',
      'Persistent',
      item.isTracking ? '"Tracking key identified in localStorage"' : '""'
    ]);
  });

  (scan.storage?.session || []).forEach(item => {
    csvRows.push([
      'SessionStorage',
      `"${item.key}"`,
      'Origin',
      item.isTracking ? 'Tracking/Analytics' : 'Functional',
      'FirstParty',
      'N/A',
      'N/A',
      'N/A',
      'Session',
      item.isTracking ? '"Tracking key identified in sessionStorage"' : '""'
    ]);
  });

  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="privacyguard-${scan.hostname}-inventory.csv"`);
  res.send(csvContent);
});

// Fallback to React Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`PrivacyGuard server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
