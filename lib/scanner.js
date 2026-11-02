const dns = require('dns').promises;
const net = require('net');
const crypto = require('crypto');
const { chromium } = require('playwright');

// --- SSRF & Private IP Protection ---
function isPrivateIp(address) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split('.').map(Number);
    return (
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 0
    );
  }
  return (
    address === '::1' ||
    address.startsWith('fc') ||
    address.startsWith('fd') ||
    address.startsWith('fe80')
  );
}

async function validateUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Enter a valid website URL (e.g. https://example.com).');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
    throw new Error('Local network URLs cannot be scanned.');
  }
  const records = await dns.lookup(host, { all: true }).catch(() => []);
  if (!records.length) {
    throw new Error(`Could not resolve DNS records for hostname: ${host}`);
  }
  if (records.some(({ address }) => isPrivateIp(address))) {
    throw new Error('Private network and loopback URLs cannot be scanned.');
  }
  return url.href;
}

// --- Tracking Signatures & Categorization ---
const ADVERTISING_REGEX = /(_fbp|_fbc|fr|gcl|ide|doubleclick|adroll|__adroll|muc_ads|personalization_id|liap|bcookie|uuid|segment|taboola|outbrain|criteo|ads|snap|_ttp|tt_pixel|bing|msclkid|attribution)/i;
const ANALYTICS_REGEX = /(_ga|_gid|_gat|analytics|amplitude|mixpanel|matomo|hotjar|clarity|hubspot|intercom|optimizely|_hj|posthog|plausible|datadog|newrelic)/i;
const SESSION_REGEX = /(sess|session|auth|token|jwt|login|csrf|xsrf|user|account)/i;

function categorizeCookie(cookie, pageHost) {
  const name = cookie.name || '';
  const domain = (cookie.domain || '').replace(/^\./, '').toLowerCase();
  const host = (pageHost || '').toLowerCase();
  const thirdParty = Boolean(domain && !host.endsWith(domain) && !domain.endsWith(host));

  let category = 'Essential';
  if (ADVERTISING_REGEX.test(name) || (thirdParty && /ad|track|pixel|sync/i.test(name))) {
    category = 'Advertising';
  } else if (ANALYTICS_REGEX.test(name) || /stats|metric|telemetry/i.test(name)) {
    category = 'Analytics';
  } else if (/pref|theme|lang|locale/i.test(name)) {
    category = 'Functional';
  }

  // Calculate lifespan in days
  let lifespanDays = null;
  let expiresDate = null;
  if (cookie.expires && cookie.expires > 0) {
    const expiresMs = cookie.expires > 1e11 ? cookie.expires : cookie.expires * 1000;
    expiresDate = new Date(expiresMs).toISOString();
    lifespanDays = Math.max(0, Math.round((expiresMs - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  // Security risk flags
  const isSessionCookie = SESSION_REGEX.test(name);
  const issues = [];
  if (!cookie.secure) issues.push('Missing Secure flag');
  if (isSessionCookie && !cookie.httpOnly) issues.push('Session cookie missing HttpOnly flag');
  if (!cookie.sameSite || cookie.sameSite.toLowerCase() === 'none') {
    if (!cookie.secure) issues.push('SameSite=None requires Secure flag');
  }
  if (lifespanDays !== null && lifespanDays > 395 && category !== 'Essential') {
    issues.push('Lifespan exceeds 13 months (ePrivacy/CNIL violation)');
  }

  return {
    name: cookie.name,
    domain: cookie.domain || pageHost,
    path: cookie.path || '/',
    category,
    thirdParty,
    secure: Boolean(cookie.secure),
    httpOnly: Boolean(cookie.httpOnly),
    sameSite: cookie.sameSite || 'None',
    expires: expiresDate,
    lifespanDays,
    issues
  };
}

// --- Remediation Code Generator ---
function generateRemediations(headers, cookies, isHttps) {
  const fixes = [];

  if (!isHttps) {
    fixes.push({
      id: 'https',
      title: 'Enforce HTTPS Encryption',
      severity: 'Critical',
      category: 'Encryption',
      description: 'The site transmits data over unencrypted HTTP. Enable an SSL/TLS certificate to protect user privacy.',
      snippets: {
        nginx: '# Redirect HTTP to HTTPS\nserver {\n  listen 80;\n  server_name example.com;\n  return 301 https://$host$request_uri;\n}'
      }
    });
  }

  if (!headers.csp) {
    fixes.push({
      id: 'csp',
      title: 'Add Content-Security-Policy (CSP)',
      severity: 'High',
      category: 'Headers',
      description: 'Mitigates Cross-Site Scripting (XSS) and data injection by strictly whitelisting authorized origins.',
      snippets: {
        nginx: "add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;\" always;",
        apache: "Header always set Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;\"",
        vercel: '{\n  "source": "/(.*)",\n  "headers": [\n    { "key": "Content-Security-Policy", "value": "default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: https:;" }\n  ]\n}',
        express: "app.use(helmet.contentSecurityPolicy({\n  directives: {\n    defaultSrc: [\"'self'\"],\n    scriptSrc: [\"'self'\", \"'unsafe-inline'\"],\n    imgSrc: [\"'self'\", \"data:\", \"https:\"]\n  }\n}));"
      }
    });
  }

  if (!headers.hsts && isHttps) {
    fixes.push({
      id: 'hsts',
      title: 'Enable HTTP Strict Transport Security (HSTS)',
      severity: 'High',
      category: 'Headers',
      description: 'Instructs browsers to never contact this domain over insecure HTTP for the specified duration.',
      snippets: {
        nginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
        apache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"',
        vercel: '{\n  "source": "/(.*)",\n  "headers": [\n    { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" }\n  ]\n}',
        express: 'app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));'
      }
    });
  }

  if (!headers.xFrameOptions) {
    fixes.push({
      id: 'xFrameOptions',
      title: 'Set X-Frame-Options or frame-ancestors',
      severity: 'Medium',
      category: 'Headers',
      description: 'Prevents clickjacking by controlling whether the site can be rendered inside an iframe or frame.',
      snippets: {
        nginx: 'add_header X-Frame-Options "SAMEORIGIN" always;',
        apache: 'Header always set X-Frame-Options "SAMEORIGIN"',
        vercel: '{\n  "source": "/(.*)",\n  "headers": [\n    { "key": "X-Frame-Options", "value": "SAMEORIGIN" }\n  ]\n}',
        express: "app.use(helmet.frameguard({ action: 'sameorigin' }));"
      }
    });
  }

  if (!headers.referrerPolicy) {
    fixes.push({
      id: 'referrerPolicy',
      title: 'Configure Referrer-Policy',
      severity: 'Medium',
      category: 'Headers',
      description: 'Restricts the amount of sensitive URL and query parameter data leaked to third-party endpoints in the Referer header.',
      snippets: {
        nginx: 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
        apache: 'Header always set Referrer-Policy "strict-origin-when-cross-origin"',
        vercel: '{\n  "source": "/(.*)",\n  "headers": [\n    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }\n  ]\n}',
        express: "app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));"
      }
    });
  }

  if (!headers.permissionsPolicy) {
    fixes.push({
      id: 'permissionsPolicy',
      title: 'Define Permissions-Policy',
      severity: 'Low',
      category: 'Headers',
      description: 'Restricts powerful browser hardware APIs (microphone, camera, geolocation) from unauthorized scripts.',
      snippets: {
        nginx: 'add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;',
        apache: 'Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"',
        vercel: '{\n  "source": "/(.*)",\n  "headers": [\n    { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }\n  ]\n}',
        express: "app.use((req, res, next) => {\n  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');\n  next();\n});"
      }
    });
  }

  const preConsentTrackers = cookies.filter(c => c.category !== 'Essential');
  if (preConsentTrackers.length > 0) {
    fixes.push({
      id: 'consent',
      title: 'Enforce Prior Consent for Non-Essential Cookies',
      severity: 'Critical',
      category: 'GDPR / ePrivacy',
      description: `${preConsentTrackers.length} advertising/analytics cookies are placed before user consent. Implement a Consent Management Platform (CMP) to delay script execution.`,
      snippets: {
        express: '// Do not set analytics/ad cookies until consent is confirmed\nif (userConsentGranted) {\n  res.cookie("_ga", clientId, { secure: true, sameSite: "lax" });\n}'
      }
    });
  }

  return fixes;
}

// --- Multi-Regulation Scorecard ---
function scoreScan(scan) {
  // 1. GDPR / ePrivacy Score (0 - 100)
  let gdpr = 100;
  const preConsentNonEssential = scan.cookies.filter(c => c.category !== 'Essential').length;
  gdpr -= Math.min(45, preConsentNonEssential * 12);
  if (!scan.consent.bannerPresent && preConsentNonEssential > 0) gdpr -= 20;
  if (scan.consent.postRejectTrackingFound) gdpr -= 25;
  const longLifeCookies = scan.cookies.filter(c => c.lifespanDays > 395 && c.category !== 'Essential').length;
  if (longLifeCookies > 0) gdpr -= Math.min(15, longLifeCookies * 5);
  if (!scan.legalLinks.privacyPolicy?.found) gdpr -= 15;
  gdpr = Math.max(0, Math.min(100, gdpr));

  // 2. CCPA / CPRA Score (0 - 100)
  let ccpa = 100;
  if (!scan.legalLinks.doNotSell?.found) ccpa -= 25;
  if (!scan.consent.gpcHonored && scan.cookies.some(c => c.category === 'Advertising')) ccpa -= 20;
  if (scan.cookies.filter(c => c.category === 'Advertising').length > 0 && !scan.legalLinks.privacyPolicy?.found) {
    ccpa -= 20;
  }
  if (!scan.legalLinks.privacyPolicy?.found) ccpa -= 20;
  ccpa = Math.max(0, Math.min(100, ccpa));

  // 3. Web Security Score (0 - 100)
  let security = 100;
  if (!scan.https) security -= 25;
  if (!scan.headers.csp) security -= 20;
  if (!scan.headers.hsts && scan.https) security -= 15;
  if (!scan.headers.xFrameOptions) security -= 10;
  if (!scan.headers.referrerPolicy) security -= 10;
  if (!scan.headers.permissionsPolicy) security -= 10;
  const insecureCookies = scan.cookies.filter(c => !c.secure).length;
  if (insecureCookies > 0) security -= Math.min(15, insecureCookies * 5);
  security = Math.max(0, Math.min(100, security));

  // Overall Score (Weighted: 40% GDPR, 30% CCPA, 30% Security)
  const overall = Math.round(gdpr * 0.4 + ccpa * 0.3 + security * 0.3);
  const grade =
    overall >= 95 ? 'A+' :
    overall >= 90 ? 'A' :
    overall >= 80 ? 'B' :
    overall >= 70 ? 'C' :
    overall >= 60 ? 'D' : 'F';

  return {
    score: overall,
    grade,
    breakdown: {
      gdpr: { score: gdpr, grade: gdpr >= 80 ? 'Good' : gdpr >= 60 ? 'Warning' : 'Critical' },
      ccpa: { score: ccpa, grade: ccpa >= 80 ? 'Good' : ccpa >= 60 ? 'Warning' : 'Critical' },
      security: { score: security, grade: security >= 80 ? 'Good' : security >= 60 ? 'Warning' : 'Critical' }
    }
  };
}

// --- Browser Engine: Playwright (Deep Audit) ---
async function scanWithPlaywright(target) {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const requestHosts = new Set();
  const adRequestsGpc = [];

  // Context 1: Pre-consent with GPC Signal test
  const context = await browser.newContext({
    serviceWorkers: 'block',
    extraHTTPHeaders: {
      'Sec-GPC': '1',
      'DNT': '1'
    }
  });

  const page = await context.newPage();

  page.on('request', request => {
    try {
      const parsed = new URL(request.url());
      requestHosts.add(parsed.hostname);
      if (ADVERTISING_REGEX.test(parsed.hostname) || ADVERTISING_REGEX.test(parsed.pathname)) {
        adRequestsGpc.push(parsed.hostname);
      }
    } catch {}
  });

  const started = Date.now();
  let response;
  try {
    response = await page.goto(target, { waitUntil: 'networkidle', timeout: 25000 });
  } catch (error) {
    await browser.close();
    throw new Error(`The target page could not be loaded: ${error.message}`);
  }

  const pageHost = new URL(target).hostname;
  const headers = response ? response.headers() : {};

  // Extract Pre-consent Cookies
  const rawCookies = await context.cookies();
  const cookies = rawCookies.map(c => categorizeCookie(c, pageHost));

  // Extract HTML5 Web Storage (localStorage & sessionStorage)
  let storage = { local: [], session: [] };
  try {
    storage = await page.evaluate(() => {
      const getStorageItems = storageObj => {
        const items = [];
        try {
          for (let i = 0; i < storageObj.length; i++) {
            const key = storageObj.key(i);
            const value = storageObj.getItem(key) || '';
            items.push({
              key,
              length: value.length,
              isTracking: /(_ga|_gid|ajs_|amplitude|mp_|fbp|_hj|_cl|hubspot|criteo|uuid)/i.test(key)
            });
          }
        } catch {}
        return items;
      };
      return {
        local: getStorageItems(window.localStorage),
        session: getStorageItems(window.sessionStorage)
      };
    });
  } catch {}

  // Detect Legal Links (Privacy, Terms, Do Not Sell)
  let legalLinks = { privacyPolicy: null, cookiePolicy: null, terms: null, doNotSell: null };
  try {
    legalLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const findLink = regex => {
        const el = links.find(a => regex.test(a.innerText || '') || regex.test(a.href || ''));
        return el ? { found: true, text: (el.innerText || '').trim().slice(0, 50), url: el.href } : { found: false, url: null };
      };
      return {
        privacyPolicy: findLink(/privacy\s*policy|datenschutz|politique\s*de\s*confidentialit/i),
        cookiePolicy: findLink(/cookie\s*policy|cookies/i),
        terms: findLink(/terms\s*(of\s*service|\s*and\s*conditions)?|conditions\s*d'utilisation/i),
        doNotSell: findLink(/do\s*not\s*sell|your\s*privacy\s*choices|opt\s*out/i)
      };
    });
  } catch {}

  // CMP Banner Detection & Reject All Testing
  let consent = {
    cmpDetected: null,
    bannerPresent: false,
    rejectTested: false,
    postRejectTrackingFound: false,
    gpcHonored: adRequestsGpc.length === 0
  };

  try {
    const cmpInfo = await page.evaluate(() => {
      let cmp = null;
      if (window.OneTrust || document.querySelector('#onetrust-banner-sdk')) cmp = 'OneTrust';
      else if (window.Cookiebot || document.querySelector('#CybotCookiebotDialog')) cmp = 'Cookiebot';
      else if (window.klaro) cmp = 'Klaro';
      else if (window.axeptioSDK) cmp = 'Axeptio';
      else if (window.Usercentrics) cmp = 'Usercentrics';
      else if (window.didomiOnReady) cmp = 'Didomi';
      else if (document.querySelector('.cmplz-cookiebanner')) cmp = 'Complianz';
      else if (document.querySelector('[id*="cookie"], [class*="cookie-banner"], [class*="consent-banner"]')) cmp = 'Custom Banner';
      return { cmp, hasBanner: Boolean(cmp) };
    });

    consent.cmpDetected = cmpInfo.cmp;
    consent.bannerPresent = cmpInfo.hasBanner;

    // Attempt to test "Reject All" button if banner detected
    if (cmpInfo.hasBanner) {
      const rejectButtonSelector = [
        'button:has-text("Reject All")',
        'button:has-text("Reject all")',
        'button:has-text("Reject")',
        'button:has-text("Decline")',
        'button:has-text("Decline all")',
        'button:has-text("Deny")',
        'button:has-text("Only necessary")',
        '#onetrust-reject-all-handler',
        '#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll'
      ].join(', ');

      const rejectBtn = page.locator(rejectButtonSelector).first();
      if ((await rejectBtn.count()) > 0 && (await rejectBtn.isVisible())) {
        consent.rejectTested = true;
        await rejectBtn.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(1500);

        // Check if non-essential cookies dropped after rejection
        const postCookies = await context.cookies();
        const leaked = postCookies.map(c => categorizeCookie(c, pageHost)).filter(c => c.category !== 'Essential');
        if (leaked.length > 0) {
          consent.postRejectTrackingFound = true;
        }
      }
    }
  } catch {}

  await browser.close();

  const isHttps = new URL(target).protocol === 'https:';
  const normalizedHeaders = {
    csp: Boolean(headers['content-security-policy']),
    hsts: Boolean(headers['strict-transport-security']),
    xFrameOptions: Boolean(headers['x-frame-options']),
    referrerPolicy: Boolean(headers['referrer-policy']),
    permissionsPolicy: Boolean(headers['permissions-policy'] || headers['feature-policy']),
    values: {
      csp: headers['content-security-policy'] || '',
      hsts: headers['strict-transport-security'] || '',
      xFrameOptions: headers['x-frame-options'] || '',
      referrerPolicy: headers['referrer-policy'] || '',
      permissionsPolicy: headers['permissions-policy'] || headers['feature-policy'] || ''
    }
  };

  const remediations = generateRemediations(normalizedHeaders, cookies, isHttps);

  const scan = {
    id: crypto.randomUUID(),
    engine: 'Playwright Deep Chromium',
    url: target,
    hostname: pageHost,
    scannedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    https: isHttps,
    status: response ? response.status() : 200,
    cookies,
    storage,
    legalLinks,
    consent,
    headers: normalizedHeaders,
    thirdParties: [...requestHosts].filter(h => h !== pageHost).slice(0, 30),
    remediations,
    score: null
  };

  scan.score = scoreScan(scan);
  return scan;
}

// --- Cloud / Edge Fast-Audit Engine (Zero Binary Dependency / Vercel Serverless) ---
async function scanWithFastAudit(target) {
  const started = Date.now();
  const pageUrl = new URL(target);
  const pageHost = pageUrl.hostname;
  const isHttps = pageUrl.protocol === 'https:';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let response;
  try {
    response = await fetch(target, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PrivacyGuard/2.0',
        'Sec-GPC': '1',
        'DNT': '1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow'
    });
  } catch (err) {
    clearTimeout(timeoutId);
    throw new Error(`Unable to reach website: ${err.message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  const rawHeaders = Object.fromEntries(response.headers.entries());
  const html = await response.text().catch(() => '');

  // Extract Cookies from Set-Cookie headers
  const setCookieHeaders = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
  const cookies = [];
  for (const str of setCookieHeaders) {
    const parts = str.split(';').map(p => p.trim());
    const [nameVal, ...attrs] = parts;
    const eqIdx = nameVal.indexOf('=');
    const name = eqIdx > -1 ? nameVal.slice(0, eqIdx) : nameVal;
    const value = eqIdx > -1 ? nameVal.slice(eqIdx + 1) : '';

    const lowerAttrs = attrs.map(a => a.toLowerCase());
    const secure = lowerAttrs.includes('secure');
    const httpOnly = lowerAttrs.includes('httponly');
    const sameSiteMatch = attrs.find(a => /^samesite=/i.test(a));
    const sameSite = sameSiteMatch ? sameSiteMatch.split('=')[1] : 'None';
    const maxAgeMatch = attrs.find(a => /^max-age=/i.test(a));
    const expiresMatch = attrs.find(a => /^expires=/i.test(a));

    let lifespanDays = null;
    let expiresDate = null;
    if (maxAgeMatch) {
      lifespanDays = Math.round(Number(maxAgeMatch.split('=')[1]) / 86400);
      expiresDate = new Date(Date.now() + lifespanDays * 86400 * 1000).toISOString();
    } else if (expiresMatch) {
      const exp = new Date(expiresMatch.split('=')[1]);
      if (!isNaN(exp.getTime())) {
        expiresDate = exp.toISOString();
        lifespanDays = Math.max(0, Math.round((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      }
    }

    cookies.push(categorizeCookie({
      name,
      value,
      domain: pageHost,
      path: '/',
      secure,
      httpOnly,
      sameSite,
      expires: expiresDate,
      lifespanDays
    }, pageHost));
  }

  // Extract Third Parties & Scripts from HTML
  const thirdPartyHosts = new Set();
  const scriptSrcRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = scriptSrcRegex.exec(html)) !== null) {
    try {
      const srcUrl = new URL(match[1], target);
      if (srcUrl.hostname !== pageHost) {
        thirdPartyHosts.add(srcUrl.hostname);
      }
    } catch {}
  }

  // Detect CMP presence via scripts & markup
  let cmpDetected = null;
  if (/optanon|onetrust/i.test(html)) cmpDetected = 'OneTrust';
  else if (/cookiebot/i.test(html)) cmpDetected = 'Cookiebot';
  else if (/usercentrics/i.test(html)) cmpDetected = 'Usercentrics';
  else if (/axeptio/i.test(html)) cmpDetected = 'Axeptio';
  else if (/klaro/i.test(html)) cmpDetected = 'Klaro';
  else if (/complianz/i.test(html)) cmpDetected = 'Complianz';
  else if (/cookie-consent|cookie-banner/i.test(html)) cmpDetected = 'Generic Banner';

  // Detect Legal Links
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  const links = [];
  while ((match = linkRegex.exec(html)) !== null) {
    links.push({ href: match[1], text: match[2].replace(/<[^>]+>/g, '').trim() });
  }

  const findLink = regex => {
    const found = links.find(l => regex.test(l.text) || regex.test(l.href));
    return found ? { found: true, text: found.text.slice(0, 50), url: found.href } : { found: false, url: null };
  };

  const legalLinks = {
    privacyPolicy: findLink(/privacy\s*policy|datenschutz/i),
    cookiePolicy: findLink(/cookie\s*policy|cookies/i),
    terms: findLink(/terms\s*(of\s*service|\s*and\s*conditions)?/i),
    doNotSell: findLink(/do\s*not\s*sell|your\s*privacy\s*choices|opt\s*out/i)
  };

  const normalizedHeaders = {
    csp: Boolean(rawHeaders['content-security-policy']),
    hsts: Boolean(rawHeaders['strict-transport-security']),
    xFrameOptions: Boolean(rawHeaders['x-frame-options']),
    referrerPolicy: Boolean(rawHeaders['referrer-policy']),
    permissionsPolicy: Boolean(rawHeaders['permissions-policy'] || rawHeaders['feature-policy']),
    values: {
      csp: rawHeaders['content-security-policy'] || '',
      hsts: rawHeaders['strict-transport-security'] || '',
      xFrameOptions: rawHeaders['x-frame-options'] || '',
      referrerPolicy: rawHeaders['referrer-policy'] || '',
      permissionsPolicy: rawHeaders['permissions-policy'] || rawHeaders['feature-policy'] || ''
    }
  };

  const remediations = generateRemediations(normalizedHeaders, cookies, isHttps);

  const scan = {
    id: crypto.randomUUID(),
    engine: 'Cloud Fast-Audit (Edge Engine)',
    url: target,
    hostname: pageHost,
    scannedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    https: isHttps,
    status: response.status,
    cookies,
    storage: { local: [], session: [] },
    legalLinks,
    consent: {
      cmpDetected,
      bannerPresent: Boolean(cmpDetected),
      rejectTested: false,
      postRejectTrackingFound: false,
      gpcHonored: true
    },
    headers: normalizedHeaders,
    thirdParties: [...thirdPartyHosts].slice(0, 30),
    remediations,
    score: null
  };

  scan.score = scoreScan(scan);
  return scan;
}

// Master Scan Dispatcher: Attempts Playwright first, falls back seamlessly to Cloud Fast-Audit
async function scanWebsite(target) {
  try {
    return await scanWithPlaywright(target);
  } catch (error) {
    console.warn(`Playwright scan failed (${error.message}). Running Fast-Audit engine fallback...`);
    return await scanWithFastAudit(target);
  }
}

module.exports = {
  validateUrl,
  scanWebsite,
  scoreScan,
  categorizeCookie
};
