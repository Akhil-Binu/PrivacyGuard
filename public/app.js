const { useState, useEffect, useRef, useMemo } = React;

function Icon({ name, size = 18, stroke = 'currentColor', className = '' }) {
  const paths = {
    shield: (
      <>
        <path d="M12 3 20 6v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.3 2.5 3.4 5.5 3.4 9s-1.1 6.5-3.4 9c-2.3-2.5-3.4-5.5-3.4-9S9.7 5.5 12 3Z" />
      </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M5 20h14" />
      </>
    ),
    fileText: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </>
    ),
    external: (
      <>
        <path d="M14 4h6v6M20 4l-9 9" />
        <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    cross: <path d="M18 6 6 18M6 6l12 12" />,
    alert: (
      <>
        <path d="M10.3 4.2 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4m0 3h.01" />
      </>
    ),
    copy: (
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
      </>
    ),
    slider: (
      <>
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </>
    )
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name] || paths.shield}
    </svg>
  );
}

function Header({ onNewScan, onDemo }) {
  return (
    <header className="h-[72px] border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-30 flex items-center px-6 lg:px-10 justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-sm">
          <Icon name="shield" size={22} />
        </div>
        <div>
          <span className="font-heading font-bold text-[20px] tracking-tight">
            Privacy<span className="text-accent">Guard</span>
          </span>
          <span className="hidden sm:inline-block ml-3 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-accent rounded-full border border-blue-100">
            v2.0 Compliance Suite
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Engine Ready
        </span>
        <button
          onClick={onDemo}
          className="text-xs font-semibold px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
        >
          View Sample Audit
        </button>
        <button
          onClick={onNewScan}
          className="rounded-lg bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-2 hover:bg-slate-800 transition shadow-sm"
        >
          New Scan <span className="ml-0.5">↗</span>
        </button>
      </div>
    </header>
  );
}

function EmptyState({ onScan, onDemo }) {
  const [inputUrl, setInputUrl] = useState('');

  const submit = e => {
    e.preventDefault();
    if (inputUrl.trim()) onScan(inputUrl.trim());
  };

  return (
    <div className="min-h-[calc(100vh-72px)] grid-bg flex items-center justify-center px-4 py-16">
      <div className="max-w-[800px] w-full text-center fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-accent px-3 py-1.5 text-xs font-semibold mb-6 border border-blue-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
          Automated GDPR, CCPA/CPRA & Security Scanner
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.08] mb-5 font-heading">
          Instant compliance audit for your <br />
          <span className="text-accent">cookies, trackers & headers</span>
        </h1>
        <p className="text-slate-500 text-base sm:text-lg max-w-[620px] mx-auto leading-relaxed mb-9">
          Detect pre-consent tracking, verify cookie consent banners, test Global Privacy Control (GPC),
          audit HTTP security headers, and generate client-ready PDF & CSV reports in seconds.
        </p>

        {/* Scan Input Box */}
        <div className="glass border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl p-2.5 max-w-[640px] mx-auto">
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 bg-white/60 rounded-xl">
              <Icon name="globe" size={19} stroke="#94a3b8" />
              <input
                type="text"
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full py-3 bg-transparent outline-none text-sm placeholder:text-slate-400 font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-accent hover:bg-blue-700 text-white rounded-xl px-6 py-3 font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              Scan Website <Icon name="arrow" size={15} />
            </button>
          </form>
        </div>

        {/* Quick sample chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span className="text-slate-400">Try quick scan:</span>
          {['https://github.com', 'https://news.ycombinator.com', 'https://stripe.com'].map(site => (
            <button
              key={site}
              onClick={() => onScan(site)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:text-slate-900 transition"
            >
              {site.replace('https://', '')}
            </button>
          ))}
          <button
            onClick={onDemo}
            className="px-2.5 py-1 bg-blue-50 text-accent border border-blue-200 rounded-md font-medium hover:bg-blue-100 transition"
          >
            Explore Interactive Demo
          </button>
        </div>

        <div className="mt-7 flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Icon name="lock" size={13} /> Safe & Read-Only
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>Zero Installation Required</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>PDF, CSV & JSON Export</span>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[720px] mx-auto text-left">
          <div className="bg-white/80 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-accent mb-2">
              <Icon name="shield" size={20} />
            </div>
            <div className="font-semibold text-sm mb-1 text-slate-800">Pre-Consent & Banner Test</div>
            <div className="text-xs text-slate-500 leading-relaxed">
              Detects OneTrust, Cookiebot, and tests if tracking persists after clicking "Reject All".
            </div>
          </div>
          <div className="bg-white/80 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-accent mb-2">
              <Icon name="database" size={20} />
            </div>
            <div className="font-semibold text-sm mb-1 text-slate-800">Cookies & HTML5 Storage</div>
            <div className="text-xs text-slate-500 leading-relaxed">
              Inventories cookies, Secure/HttpOnly flags, lifespan >13mo, plus localStorage tracking keys.
            </div>
          </div>
          <div className="bg-white/80 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-accent mb-2">
              <Icon name="slider" size={20} />
            </div>
            <div className="font-semibold text-sm mb-1 text-slate-800">Multi-Regulation Scoring</div>
            <div className="text-xs text-slate-500 leading-relaxed">
              Dedicated GDPR, CCPA/CPRA, and Web Security scorecard with copy-paste server fixes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Loading({ url }) {
  const [step, setStep] = useState(0);
  const steps = [
    'Launching isolated Chromium sandbox...',
    'Navigating target and transmitting Sec-GPC signal...',
    'Auditing pre-consent cookies & HTML5 Web Storage...',
    'Detecting consent banner & testing Reject button...',
    'Auditing HTTP security headers and calculating scores...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[calc(100vh-72px)] grid-bg flex items-center justify-center px-4">
      <div className="text-center max-w-[480px]">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-accent flex items-center justify-center mx-auto mb-5 shadow-sm border border-blue-100">
          <Icon name="shield" size={32} />
        </div>
        <h2 className="text-2xl font-bold font-heading mb-2">Analyzing Privacy & Security</h2>
        <p className="text-slate-500 text-sm">
          Visiting <span className="font-semibold text-slate-800">{url}</span>
        </p>
        <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden mt-6 mx-auto">
          <div className="scan-line h-full w-1/2 bg-accent rounded-full"></div>
        </div>
        <div className="mt-4 text-xs font-medium text-accent bg-blue-50 px-3 py-1.5 rounded-full inline-block border border-blue-100">
          {steps[step]}
        </div>
      </div>
    </div>
  );
}

function CookieChart({ cookies }) {
  const ref = useRef();
  useEffect(() => {
    const values = ['Essential', 'Analytics', 'Advertising'].map(x => cookies.filter(c => c.category === x).length);
    const chart = new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: ['Essential', 'Analytics', 'Advertising'],
        datasets: [
          {
            data: values,
            backgroundColor: ['#16a34a', '#f59e0b', '#dc2626'],
            borderWidth: 0,
            hoverOffset: 4
          }
        ]
      },
      options: {
        responsive: true,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: { padding: 10, cornerRadius: 8 }
        }
      }
    });
    return () => chart.destroy();
  }, [cookies]);

  return (
    <div className="relative w-[150px] h-[150px] mx-auto">
      <canvas ref={ref}></canvas>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold font-heading">{cookies.length}</span>
        <span className="text-[11px] text-slate-400">total cookies</span>
      </div>
    </div>
  );
}

function CodeSnippetModal({ remediation, onClose }) {
  const [activeTab, setActiveTab] = useState('nginx');
  const [copied, setCopied] = useState(false);

  const snippets = remediation?.snippets || {};
  const availableTabs = Object.keys(snippets);

  const copyCode = () => {
    const code = snippets[activeTab] || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-[620px] w-full p-6 shadow-2xl border border-slate-200 fade-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-100 text-amber-800">
                {remediation.severity}
              </span>
              <span className="text-xs text-slate-400">{remediation.category}</span>
            </div>
            <h3 className="text-lg font-bold font-heading mt-1">{remediation.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <Icon name="cross" size={18} />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-5 leading-relaxed">{remediation.description}</p>

        {availableTabs.length > 0 ? (
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 mb-2">
              <div className="flex gap-2">
                {availableTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-semibold capitalize border-b-2 transition ${
                      activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-accent transition py-1"
              >
                <Icon name={copied ? 'check' : 'copy'} size={14} />
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed max-h-[220px]">
              <pre>{snippets[activeTab] || '// No snippet available'}</pre>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500">
            Refer to official compliance guidelines for remediation.
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ data, onNewScan }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [cookieSearch, setCookieSearch] = useState('');
  const [cookieCategoryFilter, setCookieCategoryFilter] = useState('All');
  const [activeModalSnippet, setActiveModalSnippet] = useState(null);

  const bd = data.score?.breakdown || {
    gdpr: { score: 70, grade: 'Warning' },
    ccpa: { score: 75, grade: 'Warning' },
    security: { score: 85, grade: 'Good' }
  };

  const counts = useMemo(
    () =>
      ['Essential', 'Analytics', 'Advertising'].map(category => ({
        category,
        count: data.cookies.filter(c => c.category === category).length
      })),
    [data.cookies]
  );

  const headerKeys = ['csp', 'hsts', 'xFrameOptions', 'referrerPolicy', 'permissionsPolicy'];
  const headerCount = headerKeys.filter(k => data.headers[k]).length;

  // Filtered Cookies
  const filteredCookies = useMemo(() => {
    return data.cookies.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(cookieSearch.toLowerCase()) ||
        c.domain.toLowerCase().includes(cookieSearch.toLowerCase());
      if (!matchesSearch) return false;
      if (cookieCategoryFilter === 'All') return true;
      if (cookieCategoryFilter === 'ThirdParty') return c.thirdParty;
      if (cookieCategoryFilter === 'Insecure') return !c.secure || !c.httpOnly || (c.issues && c.issues.length > 0);
      return c.category === cookieCategoryFilter;
    });
  }, [data.cookies, cookieSearch, cookieCategoryFilter]);

  const preConsentNonEssentialCount = data.cookies.filter(c => c.category !== 'Essential').length;

  return (
    <>
      <Header onNewScan={onNewScan} onDemo={() => {}} />

      <main className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8 fade-in">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5 font-medium">
              <span>Scans</span>
              <span>/</span>
              <span className="text-slate-700 font-semibold">{data.hostname}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                {data.engine || 'Chromium Deep Scan'}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight font-heading text-slate-900">Compliance Overview</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
              <span className={`w-2 h-2 rounded-full ${data.https ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <a href={data.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 font-medium text-slate-700">
                {data.url} <Icon name="external" size={12} stroke="#94a3b8" />
              </a>
              <span className="text-slate-300">·</span>
              <span>Duration: {(data.durationMs / 1000).toFixed(2)}s</span>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <a
              href={`/api/reports/${data.id}.csv`}
              download
              className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition shadow-sm"
            >
              <Icon name="fileText" size={14} /> Export CSV
            </a>
            <a
              href={`/api/reports/${data.id}.json`}
              download
              className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition shadow-sm"
            >
              <Icon name="copy" size={14} /> JSON
            </a>
            <a
              href={`/api/reports/${data.id}.pdf`}
              download
              className="flex items-center gap-1.5 bg-accent hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-semibold transition shadow-sm"
            >
              <Icon name="download" size={14} /> Export PDF Report
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Scorecard & Summary', icon: 'shield' },
            { id: 'cookies', label: `Cookies & Storage (${data.cookies.length})`, icon: 'database' },
            { id: 'consent', label: 'Consent & Legal Links', icon: 'lock' },
            { id: 'headers', label: `Security Headers (${headerCount}/5)`, icon: 'slider' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon name={tab.icon} size={16} stroke={activeTab === tab.id ? '#155eef' : '#94a3b8'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="fade-in space-y-6">
            {/* Top Score Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5">
              <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-7 shadow-sm">
                <div className="shrink-0">
                  <div
                    className="score-ring relative w-36 h-36 rounded-full flex items-center justify-center shadow-inner"
                    style={{ '--score': `${data.score.score * 3.6}deg` }}
                  >
                    <div className="text-center">
                      <div className="text-[40px] font-bold font-heading tracking-tight leading-none text-slate-900">
                        {data.score.score}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">out of 100</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        data.score.score >= 80
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : data.score.score >= 60
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      Grade {data.score.grade}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Compliance Index</span>
                  </div>
                  <h2 className="text-xl font-bold font-heading text-slate-900 mb-2">
                    {data.score.score >= 80 ? 'Robust Privacy Posture' : 'Action Required for Full Compliance'}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-[420px]">
                    {data.score.score >= 80
                      ? 'Target website conforms well to fundamental GDPR, CCPA/CPRA, and security header standards.'
                      : 'Non-essential cookies or security header vulnerabilities were identified. Review the priority actions below.'}
                  </p>
                  <div className="flex gap-4 mt-5 text-xs text-slate-500">
                    <span>
                      <b className="text-slate-800">{data.cookies.length}</b> cookies
                    </span>
                    <span>
                      <b className="text-slate-800">{data.thirdParties.length}</b> third parties
                    </span>
                    <span>
                      <b className="text-slate-800">{headerCount}/5</b> security headers
                    </span>
                  </div>
                </div>
              </section>

              {/* Priority Action Card */}
              <section className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="absolute -right-10 -top-12 w-48 h-48 rounded-full border-[24px] border-white/5 pointer-events-none"></div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-blue-300 text-xs font-bold uppercase tracking-wider">Priority Risk</div>
                      <h3 className="text-xl font-bold font-heading mt-1">
                        {preConsentNonEssentialCount > 0 ? 'Pre-Consent Tracking Leaks' : 'Security Header Hardening'}
                      </h3>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-amber-300">
                      <Icon name="alert" size={20} />
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    {preConsentNonEssentialCount > 0
                      ? `${preConsentNonEssentialCount} analytics or advertising cookies dropped before the visitor made a consent choice.`
                      : 'All non-essential cookies are properly guarded or none were set during initial load.'}
                  </p>
                </div>
                <div>
                  <div className="h-1.5 bg-white/15 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${preConsentNonEssentialCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, Math.max(10, preConsentNonEssentialCount * 25))}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Pre-Consent Guard</span>
                    <span className={preConsentNonEssentialCount > 0 ? 'text-amber-300' : 'text-emerald-300'}>
                      {preConsentNonEssentialCount > 0 ? 'Review Required' : 'Compliant'}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* 3 Regulatory Score Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* GDPR Pillar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">European Union</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      bd.gdpr.score >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {bd.gdpr.grade}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900">GDPR & ePrivacy</h3>
                <div className="text-3xl font-bold font-heading text-accent mt-2">{bd.gdpr.score}<span className="text-sm font-normal text-slate-400">/100</span></div>
                <ul className="mt-4 text-xs text-slate-500 space-y-2 border-t border-slate-100 pt-3">
                  <li className="flex items-center justify-between">
                    <span>Pre-consent cookies:</span>
                    <span className="font-semibold text-slate-800">{preConsentNonEssentialCount} detected</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Consent banner:</span>
                    <span className="font-semibold text-slate-800">
                      {data.consent.bannerPresent ? (data.consent.cmpDetected || 'Present') : 'Not Detected'}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Reject All test:</span>
                    <span className={`font-semibold ${data.consent.postRejectTrackingFound ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {data.consent.rejectTested
                        ? (data.consent.postRejectTrackingFound ? 'Trackers Persisted' : 'Passed')
                        : 'Not Tested'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* CCPA / CPRA Pillar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">United States</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      bd.ccpa.score >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {bd.ccpa.grade}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900">CCPA & CPRA</h3>
                <div className="text-3xl font-bold font-heading text-accent mt-2">{bd.ccpa.score}<span className="text-sm font-normal text-slate-400">/100</span></div>
                <ul className="mt-4 text-xs text-slate-500 space-y-2 border-t border-slate-100 pt-3">
                  <li className="flex items-center justify-between">
                    <span>"Do Not Sell" link:</span>
                    <span className={`font-semibold ${data.legalLinks?.doNotSell?.found ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {data.legalLinks?.doNotSell?.found ? 'Found' : 'Missing'}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Global Privacy Control (GPC):</span>
                    <span className={`font-semibold ${data.consent.gpcHonored ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {data.consent.gpcHonored ? 'Signals Honored' : 'Trackers Fired'}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Ad Tracker Disclosure:</span>
                    <span className="font-semibold text-slate-800">
                      {data.cookies.filter(c => c.category === 'Advertising').length} ad cookies
                    </span>
                  </li>
                </ul>
              </div>

              {/* Web Security Pillar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hardening</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      bd.security.score >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {bd.security.grade}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900">Web Security</h3>
                <div className="text-3xl font-bold font-heading text-accent mt-2">{bd.security.score}<span className="text-sm font-normal text-slate-400">/100</span></div>
                <ul className="mt-4 text-xs text-slate-500 space-y-2 border-t border-slate-100 pt-3">
                  <li className="flex items-center justify-between">
                    <span>HTTPS Encryption:</span>
                    <span className={`font-semibold ${data.https ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {data.https ? 'Active' : 'Insecure'}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Security Headers:</span>
                    <span className="font-semibold text-slate-800">{headerCount} / 5 passing</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Cookie Flags (Secure):</span>
                    <span className="font-semibold text-slate-800">
                      {data.cookies.filter(c => c.secure).length} / {data.cookies.length} secure
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Cookies & Third-Party Connection Quick Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-slate-900">Cookie Inventory</h3>
                    <p className="text-xs text-slate-400">Set on initial page visit</p>
                  </div>
                  <span className="p-2 bg-blue-50 text-accent rounded-lg">
                    <Icon name="shield" size={16} />
                  </span>
                </div>
                <CookieChart cookies={data.cookies} />
                <div className="mt-5 space-y-2.5">
                  {counts.map(({ category, count }) => (
                    <div key={category} className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            category === 'Essential'
                              ? 'bg-emerald-500'
                              : category === 'Analytics'
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                          }`}
                        ></span>
                        {category}
                      </span>
                      <span className="font-bold text-slate-800">{count}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-slate-900">Third-Party Network Hosts</h3>
                    <p className="text-xs text-slate-400">External domains contacted by the page</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-md text-slate-600">
                    {data.thirdParties.length} external hosts
                  </span>
                </div>
                {data.thirdParties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto">
                    {data.thirdParties.map(host => (
                      <div
                        key={host}
                        className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                      >
                        <span className="truncate font-mono text-slate-700">{host}</span>
                        <Icon name="external" size={12} stroke="#94a3b8" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-400">No external third-party requests detected.</div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* TAB 2: COOKIES & WEB STORAGE */}
        {activeTab === 'cookies' && (
          <div className="fade-in space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">Cookie Inventory & Security Flags</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Inspecting Secure, HttpOnly, SameSite, and maximum lifespan requirements (ePrivacy max 13 months).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cookieSearch}
                    onChange={e => setCookieSearch(e.target.value)}
                    placeholder="Search cookies or domains..."
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-accent w-48 sm:w-60"
                  />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['All', 'Advertising', 'Analytics', 'Essential', 'ThirdParty', 'Insecure'].map(pill => (
                  <button
                    key={pill}
                    onClick={() => setCookieCategoryFilter(pill)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      cookieCategoryFilter === pill
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pill === 'ThirdParty' ? 'Third Party Only' : pill === 'Insecure' ? 'Flagged / Insecure' : pill}
                  </button>
                ))}
              </div>

              {/* Cookie Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="font-semibold py-3 px-2">Cookie Name</th>
                      <th className="font-semibold py-3 px-2">Domain</th>
                      <th className="font-semibold py-3 px-2">Category</th>
                      <th className="font-semibold py-3 px-2">Origin</th>
                      <th className="font-semibold py-3 px-2">Secure</th>
                      <th className="font-semibold py-3 px-2">HttpOnly</th>
                      <th className="font-semibold py-3 px-2">SameSite</th>
                      <th className="font-semibold py-3 px-2">Lifespan</th>
                      <th className="font-semibold py-3 px-2">Audit Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {filteredCookies.length > 0 ? (
                      filteredCookies.map((c, i) => (
                        <tr key={c.name + c.domain + i} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-2 font-mono font-semibold text-slate-800">{c.name}</td>
                          <td className="py-3 px-2 text-slate-500 truncate max-w-[150px]">{c.domain}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.category === 'Essential'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : c.category === 'Analytics'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {c.category}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-600">{c.thirdParty ? 'Third Party' : '1st Party'}</td>
                          <td className="py-3 px-2">
                            <span className={c.secure ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
                              {c.secure ? '✓' : '✗'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={c.httpOnly ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                              {c.httpOnly ? '✓' : '—'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-600 font-mono">{c.sameSite || 'None'}</td>
                          <td className="py-3 px-2 text-slate-600 font-mono">
                            {c.lifespanDays !== null ? `${c.lifespanDays}d` : 'Session'}
                          </td>
                          <td className="py-3 px-2">
                            {c.issues && c.issues.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {c.issues.map((issue, idx) => (
                                  <span key={idx} className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                    {issue}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-medium">Clean</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-slate-400">
                          No cookies matching the active filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* HTML5 Web Storage Audit */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">HTML5 Web Storage Audit (localStorage & sessionStorage)</h3>
                  <p className="text-xs text-slate-400">
                    Trackers frequently use HTML5 Web Storage to circumvent third-party cookie restrictions.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                  {(data.storage?.local?.length || 0) + (data.storage?.session?.length || 0)} keys inspected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LocalStorage */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-700 font-mono">window.localStorage</span>
                    <span className="text-[11px] text-slate-400">{data.storage?.local?.length || 0} entries</span>
                  </div>
                  {data.storage?.local && data.storage.local.length > 0 ? (
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                      {data.storage.local.map(item => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
                        >
                          <span className="font-mono text-slate-800 truncate">{item.key}</span>
                          {item.isTracking ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-50 text-rose-600">
                              Tracker Identifier
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">App State</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 py-4 text-center">No localStorage items set during scan.</div>
                  )}
                </div>

                {/* SessionStorage */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-700 font-mono">window.sessionStorage</span>
                    <span className="text-[11px] text-slate-400">{data.storage?.session?.length || 0} entries</span>
                  </div>
                  {data.storage?.session && data.storage.session.length > 0 ? (
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                      {data.storage.session.map(item => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
                        >
                          <span className="font-mono text-slate-800 truncate">{item.key}</span>
                          {item.isTracking ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-50 text-rose-600">
                              Tracker Identifier
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Session State</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 py-4 text-center">No sessionStorage items set during scan.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONSENT & LEGAL LINKS */}
        {activeTab === 'consent' && (
          <div className="fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* CMP Banner Verification Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-bold text-lg text-slate-900">Consent Management Platform (CMP)</h3>
                  <span className="p-2 bg-blue-50 text-accent rounded-lg">
                    <Icon name="lock" size={17} />
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-xs text-slate-400">Detected CMP Framework</div>
                      <div className="font-bold text-sm text-slate-800 mt-0.5">
                        {data.consent.cmpDetected || (data.consent.bannerPresent ? 'Generic / Custom Banner' : 'None Detected')}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        data.consent.bannerPresent ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {data.consent.bannerPresent ? 'Banner Present' : 'No Banner'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-xs text-slate-400">Reject All / Decline Button Test</div>
                      <div className="font-bold text-sm text-slate-800 mt-0.5">
                        {data.consent.rejectTested
                          ? (data.consent.postRejectTrackingFound ? 'Failed: Trackers persisted after Reject' : 'Passed: Tracking blocked upon Reject')
                          : 'Not Tested / No Direct Reject Button Located'}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        data.consent.rejectTested
                          ? (data.consent.postRejectTrackingFound ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700')
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {data.consent.rejectTested ? (data.consent.postRejectTrackingFound ? 'Violation' : 'Compliant') : 'Untested'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-xs text-slate-400">Global Privacy Control (Sec-GPC)</div>
                      <div className="font-bold text-sm text-slate-800 mt-0.5">
                        {data.consent.gpcHonored ? 'Signals Honored (Zero ad beacons fired)' : 'Ad trackers contacted despite GPC signal'}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        data.consent.gpcHonored ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {data.consent.gpcHonored ? 'Honored' : 'Warning'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal & Policy Links Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-bold text-lg text-slate-900">Legal Policies & CCPA Opt-Out Links</h3>
                  <span className="p-2 bg-blue-50 text-accent rounded-lg">
                    <Icon name="fileText" size={17} />
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Privacy Policy', data: data.legalLinks?.privacyPolicy, desc: 'Mandatory under GDPR Art. 13 & CCPA' },
                    { label: 'Cookie Policy', data: data.legalLinks?.cookiePolicy, desc: 'Detailed cookie purpose disclosure' },
                    { label: 'Terms of Service', data: data.legalLinks?.terms, desc: 'User rights and contract terms' },
                    { label: 'Do Not Sell / Share My Info', data: data.legalLinks?.doNotSell, desc: 'Mandatory California CPRA opt-out link' }
                  ].map(item => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{item.label}</div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                        {item.data?.url && (
                          <a
                            href={item.data.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-accent hover:underline flex items-center gap-1 mt-1 truncate max-w-[280px]"
                          >
                            {item.data.url} <Icon name="external" size={10} />
                          </a>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                          item.data?.found ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.data?.found ? 'Found' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY HEADERS & REMEDIATIONS */}
        {activeTab === 'headers' && (
          <div className="fade-in space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Header Status List */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-bold text-lg text-slate-900">HTTP Response Protection Audit</h3>
                  <span className="text-xs font-semibold text-slate-500">{headerCount} of 5 passing</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {[
                    ['csp', 'Content-Security-Policy', 'Protects against script injection and XSS'],
                    ['hsts', 'Strict-Transport-Security', 'Enforces encrypted HTTPS connections'],
                    ['xFrameOptions', 'X-Frame-Options', 'Prevents clickjacking frame exploits'],
                    ['referrerPolicy', 'Referrer-Policy', 'Limits URL and search query leakage'],
                    ['permissionsPolicy', 'Permissions-Policy', 'Blocks unauthorized hardware APIs (mic, cam, geo)']
                  ].map(([key, name, desc]) => (
                    <div key={key} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            data.headers[key] ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                          }`}
                        >
                          <Icon name={data.headers[key] ? 'check' : 'alert'} size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          data.headers[key] ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {data.headers[key] ? 'Pass' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation Fix-it Generator */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-bold text-lg text-slate-900">Actionable Remediation Recipes</h3>
                  <span className="text-xs text-accent font-semibold">{data.remediations?.length || 0} recommendations</span>
                </div>

                {data.remediations && data.remediations.length > 0 ? (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {data.remediations.map(rem => (
                      <div key={rem.id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  rem.severity === 'Critical'
                                    ? 'bg-rose-100 text-rose-800'
                                    : rem.severity === 'High'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {rem.severity}
                              </span>
                              <span className="text-xs font-semibold text-slate-700">{rem.title}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{rem.description}</p>
                          </div>
                          {rem.snippets && Object.keys(rem.snippets).length > 0 && (
                            <button
                              onClick={() => setActiveModalSnippet(rem)}
                              className="shrink-0 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-accent hover:bg-blue-50 transition"
                            >
                              Get Fix Code →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-emerald-600 font-semibold">
                    All evaluated security headers and privacy standards passed!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Snippet Modal */}
      {activeModalSnippet && (
        <CodeSnippetModal remediation={activeModalSnippet} onClose={() => setActiveModalSnippet(null)} />
      )}
    </>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runScan = async url => {
    if (!url) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to scan target.');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reports/demo.json');
      if (res.ok) {
        const demoData = await res.json();
        setData(demoData);
      } else {
        // Fallback demo
        setData(window.demoScanFallback);
      }
    } catch {
      setData(window.demoScanFallback);
    } finally {
      setLoading(false);
    }
  };

  const newScan = () => {
    setData(null);
    setError('');
  };

  if (loading) return <Loading url="target website" />;
  if (data) return <Dashboard data={data} onNewScan={newScan} />;

  return (
    <>
      <Header onNewScan={newScan} onDemo={loadDemo} />
      <EmptyState onScan={runScan} onDemo={loadDemo} />
      {error && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-rose-600 text-white rounded-xl px-5 py-3 text-sm shadow-xl flex items-center gap-3 z-50">
          <Icon name="alert" size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-2 font-bold opacity-80 hover:opacity-100">
            ✕
          </button>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
