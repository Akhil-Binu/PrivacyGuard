# PrivacyGuard 🛡️

> **Automated GDPR, CCPA/CPRA, and HTTP Security Compliance Scanner** powered by headless Playwright browser automation, deep cookie and HTML5 Web Storage telemetry, consent verification, and executive PDF/CSV report generation.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Engine-Playwright%20Chromium-orange.svg)](https://playwright.dev/)
[![Compliance](https://img.shields.io/badge/Compliance-GDPR%20%7C%20CCPA%20%7C%20ePrivacy-blueviolet.svg)](#regulatory-alignment)

---

## 📋 Overview

**PrivacyGuard** evaluates any public website’s privacy posture and security readiness in under 10 seconds. It launches a sandboxed browser context, audits cookies and HTML5 storage, verifies consent banners, inspects critical HTTP security headers, and generates actionable executive PDF and CSV reports.

Whether you are preparing for a security audit, verifying marketing tracking scripts, or auditing GDPR/CCPA readiness, PrivacyGuard surfaces hidden compliance gaps with instant copy-paste remediation recipes.

---

## ✨ Features

### 1. 🍪 Cookie & HTML5 Web Storage Inventory
- **Automated Cookie Categorization**: Heuristic classification into **Essential**, **Analytics**, and **Advertising** cookies.
- **First-Party vs. Third-Party**: Distinguishes tracking cookies dropped by external domains (e.g., Meta Pixel, Google Ads, Criteo) from native application cookies.
- **Cookie Security Attributes**: Evaluates `Secure`, `HttpOnly`, and `SameSite` flags. Flags insecure transmission over plain HTTP and session cookies exposed to JavaScript (XSS theft risk).
- **13-Month Lifespan Enforcer**: Detects non-essential cookies whose expiration exceeds 395 days, a direct violation of EU ePrivacy and CNIL guidelines.
- **HTML5 Web Storage Audit**: Scans `window.localStorage` and `window.sessionStorage` for zero-cookie tracking identifiers (e.g. `ajs_user_id`, `_ga`, Amplitude IDs).

### 2. 🛡️ Consent Management (CMP) & "Reject All" Verification
- **CMP Detection**: Automatically recognizes leading Consent Management Platforms, including **OneTrust**, **Cookiebot**, **Usercentrics**, **Axeptio**, **Klaro**, **Didomi**, and **Complianz**.
- **Automated "Reject All" Testing**: Simulates user interaction with "Reject", "Decline", or "Only Necessary" buttons and verifies whether tracking scripts continue dropping cookies post-rejection.
- **Global Privacy Control (GPC)**: Transmits `Sec-GPC: 1` and `DNT: 1` browser headers and flags third-party ad beacons that ignore the signal.

### 3. ⚖️ Multi-Regulation Compliance Scorecard
PrivacyGuard computes 3 weighted regulatory sub-scores alongside an overall letter grade (**A+** through **F**):
- **GDPR & ePrivacy (40%)**: Pre-consent tracking suppression, banner presence, post-rejection leakage, cookie lifespan, and privacy policy accessibility.
- **CCPA / CPRA (30%)**: Verification of mandatory *"Do Not Sell or Share My Personal Information"* links, GPC header adherence, and commercial tracker disclosures.
- **Web Security Hardening (30%)**: HTTPS encryption enforcement, HTTP security headers, and cookie flag hygiene.

### 4. 🔒 HTTP Security Headers & Remediation Snippets
Audits the presence and configuration of 5 core defense-in-depth headers:
- `Content-Security-Policy` (CSP)
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options` (Clickjacking defense)
- `Referrer-Policy` (URL data leakage control)
- `Permissions-Policy` (Browser hardware API shielding)

Provides one-click copyable remediation configurations tailored for **Nginx**, **Apache (`.htaccess`)**, **Vercel (`vercel.json`)**, and **Node.js/Express (`helmet`)**.

### 5. 📄 Multi-Format Client-Ready Exports
- **Executive PDF Report**: Built via `PDFKit` with executive summary, regulatory pillar badges, detailed cookie tables, and remediation checklists.
- **Audit CSV**: Formatted spreadsheet of all discovered cookies, origins, attributes, and issues for Data Protection Officers (DPOs) and Records of Processing Activities (ROPA).
- **JSON API**: Machine-readable payload for CI/CD DevSecOps automation.

### 6. ⚡ Dual-Engine Architecture
- **Deep Playwright Engine**: Runs full headless Chromium for JavaScript execution, banner interaction, DOM inspection, and Web Storage extraction.
- **Edge Fast-Audit Engine**: Automatic zero-binary fallback for lightweight serverless environments (such as Vercel functions), inspecting HTTP response headers, Set-Cookie attributes, and HTML markup without memory spikes.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18.0.0 or later
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Akhil-Binu/PrivacyGuard.git
cd PrivacyGuard

# Install dependencies
npm install

# Install Playwright browser binary
npx playwright install chromium
```

### Start Local Server

```bash
npm start
```

Open your browser at **`http://localhost:3000`**.

---

## ☁️ Deploy to Vercel

PrivacyGuard includes first-class support for Vercel Serverless Functions via [`vercel.json`](vercel.json) and [`api/index.js`](api/index.js).

### Option A: One-Click GitHub Import
1. Push your code to your GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import the `PrivacyGuard` repository.
4. Keep all default build settings (`Framework: Other`, `Root Directory: ./`).
5. Click **Deploy**.

### Option B: Deploy via Vercel CLI
```bash
# Install or run Vercel CLI
npx vercel

# Deploy directly to production
npx vercel --prod
```

> **Note on Serverless Environments**: When deployed to serverless environments without native Chromium binaries, PrivacyGuard's intelligent dispatcher seamlessly activates its **Edge Fast-Audit Engine**, providing instantaneous header, cookie, and markup compliance audits under 3 seconds without timing out.

---

## 📡 REST API Reference

### 1. Trigger a Scan
```http
POST /api/scan
Content-Type: application/json

{
  "url": "https://example.com"
}
```

#### Sample Response:
```json
{
  "id": "c1f7a0b2-38d5-4a1c-8b8a-9f5b4d7e1234",
  "engine": "Playwright Deep Chromium",
  "url": "https://example.com",
  "hostname": "example.com",
  "https": true,
  "score": {
    "score": 85,
    "grade": "B",
    "breakdown": {
      "gdpr": { "score": 90, "grade": "Good" },
      "ccpa": { "score": 75, "grade": "Warning" },
      "security": { "score": 90, "grade": "Good" }
    }
  },
  "consent": {
    "cmpDetected": "OneTrust",
    "bannerPresent": true,
    "rejectTested": true,
    "postRejectTrackingFound": false,
    "gpcHonored": true
  },
  "cookies": [ ... ],
  "storage": { "local": [ ... ], "session": [ ... ] },
  "headers": { "csp": true, "hsts": true, ... },
  "remediations": [ ... ]
}
```

### 2. Export Formats
- **PDF Report**: `GET /api/reports/:id.pdf`
- **CSV Data**: `GET /api/reports/:id.csv`
- **JSON Data**: `GET /api/reports/:id.json`

---

## 🔒 Security & SSRF Protection

PrivacyGuard actively defends against Server-Side Request Forgery (SSRF) and intranet enumeration:
- Resolves all hostnames against system DNS before initiating network requests.
- Strictly blocks loopback (`127.0.0.1`, `::1`), private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local addresses (`169.254.0.0/16`), and local domains (`.local`, `.localhost`).
- Runs Playwright in isolated temporary browser contexts with blocked service workers.

---

## 📊 Regulatory Alignment

| Requirement | Regulatory Article | PrivacyGuard Verification |
| :--- | :--- | :--- |
| **Prior Consent** | GDPR Art. 6 / ePrivacy Dir. | Identifies non-essential cookies dropped prior to visitor consent. |
| **Right to Reject** | GDPR Recital 32 / EDPB | Simulates clicking CMP "Reject All" button and detects persisting cookies. |
| **Cookie Lifespan** | ePrivacy / CNIL Guidelines | Flags tracking cookies with expiration exceeding 13 months. |
| **Do Not Sell Link** | CCPA § 1798.120 / CPRA | Scans DOM for conspicuous opt-out mechanisms. |
| **GPC Signal** | California Civil Code 1798.135 | Tests compliance with `Sec-GPC: 1` browser headers. |
| **Data in Transit** | GDPR Art. 32 / HIPAA | Evaluates HTTPS and HSTS configuration. |
| **Injection Defense** | OWASP Top 10 | Checks CSP, X-Frame-Options, and Referrer-Policy headers. |

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express 4
- **Automation**: Playwright (Chromium)
- **Reporting**: PDFKit
- **Frontend**: React 18, Tailwind CSS, Space Grotesk & DM Sans typography
- **Data Visualizations**: Chart.js

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

Developed with care by **Akhil Binu**.
