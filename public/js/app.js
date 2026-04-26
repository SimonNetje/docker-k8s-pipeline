var API_BASE = '';

// ── Auth state (persisted across pages) ──────────
function getToken() { return localStorage.getItem('ph_token'); }
function getUser()  { try { return JSON.parse(localStorage.getItem('ph_user')); } catch(e) { return null; } }
function isLoggedIn() { return !!getToken(); }
function setAuth(token, user) {
  localStorage.setItem('ph_token', token);
  localStorage.setItem('ph_user', JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem('ph_token');
  localStorage.removeItem('ph_user');
  localStorage.removeItem('ph_logged_in');
}

// ── Language (English / Dutch) ───────────────────
var LANG_KEY = 'ph_lang';
var FALLBACK_LANG = 'en';
var LANGS = { en: true, nl: true };
var currentLanguage = detectLanguage();

var I18N = {
  en: {
    index_title: 'Concreto - Deploy with precision',
    index_hero_eyebrow: 'Built for teams that release every day',
    index_hero_line1: 'Reduce release risk.',
    index_hero_line2_accent: 'Ship faster,',
    index_hero_line2_muted: 'with confidence.',
    index_hero_sub: 'Connect your Git repository and deploy in seconds. Concreto gives your team reliable Kubernetes infrastructure, instant rollback paths, and production-grade observability without expanding your DevOps headcount.',
    index_hero_cta_primary: 'Start free deployment',
    index_hero_cta_secondary: 'Read the docs',
    index_hero_note: 'No credit card required · Free tier available · Migration support included',

    index_proof_label_1: 'Deployments this month',
    index_proof_label_2: 'Platform uptime',
    index_proof_label_3: 'Avg. deploy time',
    index_proof_label_4: 'Kubernetes cluster',

    index_brand_label: 'Trusted by teams at',

    index_how_eyebrow: 'How it works',
    index_how_title: 'From Git to live in three steps',
    index_how_desc: "No DevOps expertise required. We handle the Kubernetes orchestration so you don't have to.",
    index_step_1_title: 'Connect your Git repository',
    index_step_1_desc: 'Provide your Git repository URL. We clone it, detect the runtime automatically, and support Node.js, Python, Go, and static sites out of the box.',
    index_step_2_title: 'Configure and deploy',
    index_step_2_desc: 'Review the auto-detected build command and environment config. One click triggers ArgoCD to sync and deploy your app into the Kubernetes cluster.',
    index_step_3_title: 'Monitor and scale',
    index_step_3_desc: 'Track build logs in real time via Grafana and Loki. Kubernetes auto-scales under traffic spikes and self-heals failed pods automatically.',

    index_features_eyebrow: 'Features',
    index_features_title: 'Everything you need to ship confidently',
    index_feature_1_title: 'Git-based deploys',
    index_feature_1_desc: 'Provide your repository URL. ArgoCD syncs and deploys your app automatically - no manual uploads, no build scripts to maintain.',
    index_feature_2_title: 'Environment isolation',
    index_feature_2_desc: 'Each deploy runs in its own sandboxed container. No cross-project interference, no shared state.',
    index_feature_3_title: 'Deploy history',
    index_feature_3_desc: 'Every deployment is logged. Roll back to any previous version with a single click, anytime.',
    index_feature_4_title: 'Auto scaling',
    index_feature_4_desc: 'Kubernetes scales your containers up under traffic spikes and back down when load drops - automatically, no manual intervention.',
    index_feature_5_title: 'Instant HTTPS',
    index_feature_5_desc: 'Free SSL certificates provisioned automatically for every deployment. No manual cert management.',
    index_feature_6_title: 'Grafana monitoring',
    index_feature_6_desc: 'Prometheus and Loki collect metrics and logs from every container. Visualise CPU, memory, requests per second, and more in Grafana dashboards.',

    index_stack_eyebrow: 'Tech Stack',
    index_stack_title: 'Powered by proven open source',
    index_stack_desc: 'Every layer of our infrastructure runs on battle-tested, community-trusted technology.',
    index_stack_hint: 'Hold and drag to rotate',

    index_testimonials_eyebrow: 'What teams say',
    index_testimonials_title: 'Loved by developers who ship',
    index_testimonials_desc: 'From solo founders to engineering teams - Concreto fits how you work.',
    index_testimonial_1_quote: '"We went from a 45-minute CI/CD pipeline to an 18-second Concreto deploy. The team did not believe it until they saw the build logs."',
    index_testimonial_2_quote: '"The rollback feature alone is worth it. We have recovered from broken deploys in under 10 seconds. No drama, just a click."',
    index_testimonial_3_quote: '"I am a solo founder. Concreto gives me the infra confidence of a full DevOps team at a fraction of the cost. My first deploy took under 2 minutes."',

    index_cta_title: 'Ready to deploy your first project?',
    index_cta_sub: "Deploy smarter with Concreto's Kubernetes-backed hosting. Free tier includes 3 applications and 50 deployments per month.",
    index_cta_primary: 'Create free account',
    index_cta_secondary: 'View pricing',

    index_footer_status: 'Status',
    index_footer_privacy: 'Privacy',

    docs_title: 'Docs - Concreto',
    pricing_title: 'Pricing - Concreto',
    dashboard_title: 'Dashboard - Concreto',
    nav_product: 'Product',
    nav_docs: 'Docs',
    nav_pricing: 'Pricing',
    nav_login: 'Log in',
    nav_get_started: 'Get started',
    nav_dashboard: 'Dashboard',
    nav_logout_title: 'Log out',
    lang_toggle_aria: 'Switch language',
    lang_toggle_title: 'Switch language',

    login_title: 'Sign in - Concreto',
    login_welcome_back: 'Welcome back',
    login_sub: 'Sign in to your Concreto account',
    login_email_label: 'Email',
    login_email_placeholder: 'you@company.com',
    login_password_label: 'Password',
    login_password_placeholder: '........',
    login_submit: 'Sign in',
    login_or: 'or',
    login_no_account: "Don't have an account?",
    login_create_one: 'Create one',

    register_title: 'Create account - Concreto',
    register_create_account: 'Create your account',
    register_sub: 'Start deploying in under a minute',
    register_full_name_label: 'Full name',
    register_full_name_placeholder: 'Simon Gielen',
    register_work_email_label: 'Work email',
    register_work_email_placeholder: 'you@company.com',
    register_password_label: 'Password',
    register_password_placeholder: 'Min. 8 characters',
    register_password_hint: 'Use at least 8 characters with a mix of letters and numbers.',
    register_submit: 'Create account',
    register_or: 'or',
    register_have_account: 'Already have an account?',
    register_sign_in: 'Sign in',

    dashboard_source_github: 'GitHub URL',
    dashboard_recommended: 'Recommended',

    toast_email_required: 'Email is required',
    toast_password_required: 'Password is required',
    toast_signed_in: 'Signed in successfully',
    toast_name_required: 'Name is required',
    toast_password_min: 'Password must be at least 8 characters',
    toast_account_created: 'Account created successfully',
    toast_signed_out: 'Signed out'
  },
  nl: {
    index_title: 'Concreto - Deploy met precisie',
    index_hero_eyebrow: 'Gebouwd voor teams die elke dag releasen',
    index_hero_line1: 'Verlaag releaserisico.',
    index_hero_line2_accent: 'Ship sneller,',
    index_hero_line2_muted: 'met vertrouwen.',
    index_hero_sub: 'Koppel je Git-repository en deploy in seconden. Concreto geeft je team betrouwbare Kubernetes-infra, directe rollback-paden en production-grade observability zonder je DevOps-team uit te breiden.',
    index_hero_cta_primary: 'Start gratis deployment',
    index_hero_cta_secondary: 'Lees de docs',
    index_hero_note: 'Geen creditcard nodig · Gratis tier beschikbaar · Migratieondersteuning inbegrepen',

    index_proof_label_1: 'Deployments deze maand',
    index_proof_label_2: 'Platform uptime',
    index_proof_label_3: 'Gem. deploytijd',
    index_proof_label_4: 'Kubernetes-cluster',

    index_brand_label: 'Vertrouwd door teams bij',

    index_how_eyebrow: 'Hoe het werkt',
    index_how_title: 'Van Git naar live in drie stappen',
    index_how_desc: 'Geen DevOps-expertise nodig. Wij regelen de Kubernetes-orchestratie voor je.',
    index_step_1_title: 'Koppel je Git-repository',
    index_step_1_desc: 'Voer je Git-repository URL in. Wij klonen de code, detecteren automatisch de runtime en ondersteunen standaard Node.js, Python, Go en statische sites.',
    index_step_2_title: 'Configureer en deploy',
    index_step_2_desc: 'Controleer de automatisch gedetecteerde build-opdracht en omgeving. Een klik laat ArgoCD synchroniseren en je app naar het Kubernetes-cluster deployen.',
    index_step_3_title: 'Monitor en schaal',
    index_step_3_desc: 'Volg buildlogs in realtime via Grafana en Loki. Kubernetes schaalt automatisch bij piekverkeer en herstelt mislukte pods vanzelf.',

    index_features_eyebrow: 'Features',
    index_features_title: 'Alles wat je nodig hebt om met vertrouwen te shippen',
    index_feature_1_title: 'Git-gebaseerde deploys',
    index_feature_1_desc: 'Geef je repository URL op. ArgoCD synchroniseert en deployt je app automatisch - geen handmatige uploads en geen buildscripts om te onderhouden.',
    index_feature_2_title: 'Omgevingsisolatie',
    index_feature_2_desc: 'Elke deploy draait in een eigen geisoleerde container. Geen interferentie tussen projecten, geen gedeelde state.',
    index_feature_3_title: 'Deploygeschiedenis',
    index_feature_3_desc: 'Elke deployment wordt gelogd. Rol op elk moment met een klik terug naar een eerdere versie.',
    index_feature_4_title: 'Autoscaling',
    index_feature_4_desc: 'Kubernetes schaalt je containers op bij piekverkeer en weer terug bij minder belasting - volledig automatisch.',
    index_feature_5_title: 'Direct HTTPS',
    index_feature_5_desc: 'Gratis SSL-certificaten worden automatisch voor elke deployment aangemaakt. Geen handmatig certificaatbeheer.',
    index_feature_6_title: 'Grafana-monitoring',
    index_feature_6_desc: 'Prometheus en Loki verzamelen metrics en logs van elke container. Visualiseer CPU, geheugen, requests per seconde en meer in Grafana-dashboards.',

    index_stack_eyebrow: 'Tech stack',
    index_stack_title: 'Gebouwd op bewezen open source',
    index_stack_desc: 'Elke laag van onze infrastructuur draait op battle-tested technologie die door de community wordt vertrouwd.',
    index_stack_hint: 'Vasthouden en slepen om te roteren',

    index_testimonials_eyebrow: 'Wat teams zeggen',
    index_testimonials_title: 'Geliefd bij developers die shippen',
    index_testimonials_desc: 'Van solo founders tot engineeringteams - Concreto past bij hoe jij werkt.',
    index_testimonial_1_quote: '"We gingen van een CI/CD-pipeline van 45 minuten naar een Concreto-deploy van 18 seconden. Het team geloofde het pas toen ze de buildlogs zagen."',
    index_testimonial_2_quote: '"Alleen al de rollback-feature is het waard. We hebben kapotte deploys in minder dan 10 seconden hersteld. Geen drama, gewoon een klik."',
    index_testimonial_3_quote: '"Ik ben een solo founder. Concreto geeft me de infra-zekerheid van een volledig DevOps-team voor een fractie van de kosten. Mijn eerste deploy duurde minder dan 2 minuten."',

    index_cta_title: 'Klaar om je eerste project te deployen?',
    index_cta_sub: 'Deploy slimmer met Kubernetes-hosting van Concreto. De gratis tier bevat 3 applicaties en 50 deployments per maand.',
    index_cta_primary: 'Maak gratis account',
    index_cta_secondary: 'Bekijk prijzen',

    index_footer_status: 'Status',
    index_footer_privacy: 'Privacy',

    docs_title: 'Documentatie - Concreto',
    pricing_title: 'Prijzen - Concreto',
    dashboard_title: 'Dashboard - Concreto',
    nav_product: 'Product',
    nav_docs: 'Documentatie',
    nav_pricing: 'Prijzen',
    nav_login: 'Inloggen',
    nav_get_started: 'Starten',
    nav_dashboard: 'Dashboard',
    nav_logout_title: 'Uitloggen',
    lang_toggle_aria: 'Wissel taal',
    lang_toggle_title: 'Wissel taal',

    login_title: 'Inloggen - Concreto',
    login_welcome_back: 'Welkom terug',
    login_sub: 'Log in op je Concreto-account',
    login_email_label: 'E-mail',
    login_email_placeholder: 'jij@bedrijf.com',
    login_password_label: 'Wachtwoord',
    login_password_placeholder: '........',
    login_submit: 'Inloggen',
    login_or: 'of',
    login_no_account: 'Nog geen account?',
    login_create_one: 'Maak er een',

    register_title: 'Account aanmaken - Concreto',
    register_create_account: 'Maak je account aan',
    register_sub: 'Begin met deployen in minder dan een minuut',
    register_full_name_label: 'Volledige naam',
    register_full_name_placeholder: 'Simon Gielen',
    register_work_email_label: 'Werk e-mail',
    register_work_email_placeholder: 'jij@bedrijf.com',
    register_password_label: 'Wachtwoord',
    register_password_placeholder: 'Min. 8 tekens',
    register_password_hint: 'Gebruik minstens 8 tekens met een mix van letters en cijfers.',
    register_submit: 'Account aanmaken',
    register_or: 'of',
    register_have_account: 'Heb je al een account?',
    register_sign_in: 'Inloggen',

    dashboard_source_github: 'GitHub URL',
    dashboard_recommended: 'Aanbevolen',

    toast_email_required: 'E-mail is verplicht',
    toast_password_required: 'Wachtwoord is verplicht',
    toast_signed_in: 'Succesvol ingelogd',
    toast_name_required: 'Naam is verplicht',
    toast_password_min: 'Wachtwoord moet minimaal 8 tekens bevatten',
    toast_account_created: 'Account succesvol aangemaakt',
    toast_signed_out: 'Uitgelogd'
  }
};

var NL_STATIC_TEXT = {
  'sign in - concreto': 'inloggen - concreto',
  'create account - concreto': 'account aanmaken - concreto',
  'dashboard - concreto': 'dashboard - concreto',
  'pricing - concreto': 'prijzen - concreto',
  'docs - concreto': 'documentatie - concreto',

  'cloning repository...': 'repository klonen...',
  'repository cloned': 'repository gekloond',
  'build pipeline triggered': 'build-pipeline gestart',
  'kubernetes pod provisioned': 'kubernetes-pod aangemaakt',
  'running': 'draait',
  'build successful': 'build geslaagd',
  'live at': 'live op',
  'total deploy time: 21s': 'totale deploytijd: 21s',

  'what teams say': 'wat teams zeggen',
  'loved by developers who ship': 'geliefd bij developers die shippen',
  'from solo founders to engineering teams - concreto fits how you work.': 'van solo founders tot engineeringteams - concreto past bij hoe jij werkt.',

  'trusted by teams at': 'vertrouwd door teams bij',
  'tech stack': 'tech stack',
  'powered by proven open source': 'gebouwd op bewezen open source',
  'every layer of our infrastructure runs on battle-tested, community-trusted technology.': 'elke laag van onze infrastructuur draait op battle-tested technologie die door de community wordt vertrouwd.',
  'hold and drag to rotate': 'vasthouden en slepen om te roteren',

  'status': 'status',
  'privacy': 'privacy',

  'getting started': 'aan de slag',
  'quick start': 'snelle start',
  'installation & cli': 'installatie en cli',
  'deploy your first app': 'deploy je eerste app',
  'configuration': 'configuratie',
  'runtime options': 'runtime-opties',
  'environment variables': 'omgevingsvariabelen',
  'build & start commands': 'build- en startopdrachten',
  'ports & networking': 'poorten en netwerk',
  'domains & https': 'domeinen en https',
  'custom domains': 'eigen domeinen',
  'wildcard subdomains': 'wildcard-subdomeinen',
  'ssl certificates': 'ssl-certificaten',
  'deployments': 'deployments',
  'deploy history': 'deploygeschiedenis',
  'instant rollback': 'direct rollback',
  'webhooks & notifications': 'webhooks en notificaties',
  'reference': 'referentie',
  'cli reference': 'cli-referentie',
  'rest api': 'rest api',
  'runtime limits': 'runtime-limieten',
  'docs': 'documentatie',
  'on this page': 'op deze pagina',
  'prerequisites': 'vereisten',
  'deploy via dashboard': 'deploy via dashboard',
  'deploy via cli': 'deploy via cli',
  'your project is live': 'je project is live',
  "what's next": 'wat nu',
  'before you begin, make sure you have:': 'voor je begint, zorg dat je het volgende hebt:',
  'the easiest way to get started is through the web dashboard - no terminal required.': 'de makkelijkste manier om te starten is via het webdashboard - geen terminal nodig.',
  'sign in and open the dashboard': 'log in en open het dashboard',
  'enter your git repository url': 'voer de url van je git-repository in',
  'click deploy': 'klik op deploy',
  'your app is live': 'je app is live',
  'for faster iteration and ci/cd integration, use the concreto cli.': 'voor snellere iteraties en ci/cd-integratie gebruik je de concreto cli.',
  'install the cli': 'installeer de cli',
  'authenticate': 'authenticeer',
  'deploy your project': 'deploy je project',
  'example concreto.json': 'voorbeeld concreto.json',
  'next -': 'volgende -',

  'simple, transparent pricing': 'simpele, transparante prijzen',
  'start free and scale as your team grows. no hidden fees, no surprises - ever.': 'start gratis en schaal mee met je team. geen verborgen kosten, geen verrassingen - nooit.',
  'monthly': 'maandelijks',
  'annual': 'jaarlijks',
  'save 20%': 'bespaar 20%',
  'free': 'gratis',
  'perfect for side projects and learning.': 'perfect voor side-projects en leren.',
  'get started free': 'start gratis',
  'most popular': 'meest gekozen',
  'for growing teams shipping production apps.': 'voor groeiende teams die productie-apps shippen.',
  'start pro trial': 'start pro-trial',
  'business': 'business',
  'for serious workloads at any scale.': 'voor serieuze workloads op elke schaal.',
  'contact sales': 'contacteer sales',
  'compare all features': 'vergelijk alle features',
  'feature': 'feature',
  'deployment': 'deployment',
  'projects': 'projecten',
  'deployments/month': 'deployments/maand',
  'deploy history': 'deploygeschiedenis',
  'infrastructure': 'infrastructuur',
  'ram per container': 'ram per container',
  'cluster': 'cluster',
  'auto https / ssl': 'auto https / ssl',
  'team & security': 'team en beveiliging',
  'team members': 'teamleden',
  'audit logs': 'auditlogs',
  'sso / saml': 'sso / saml',
  'support': 'support',
  'community forum': 'communityforum',
  'email support': 'e-mail support',
  'priority support + sla': 'prioriteitssupport + sla',
  'frequently asked questions': 'veelgestelde vragen',
  'can i switch plans at any time?': 'kan ik op elk moment van plan wisselen?',
  'what counts as a deployment?': 'wat telt als deployment?',
  'is there a free trial for paid plans?': 'is er een gratis proefperiode voor betaalde plannen?',
  'what payment methods do you accept?': 'welke betaalmethoden accepteren jullie?',
  'what happens when i exceed my deployment limit?': 'wat gebeurt er als ik mijn deploymentlimiet overschrijd?',
  'start deploying in minutes': 'begin binnen minuten met deployen',
  'free tier is always available. no credit card required to get started.': 'de gratis tier blijft altijd beschikbaar. geen creditcard nodig om te starten.',
  'read the docs': 'lees de docs',

  'platform': 'platform',
  'applications': 'applicaties',
  'metrics': 'metrics',
  'manage your hosted applications': 'beheer je gehoste applicaties',
  '+ new application': '+ nieuwe applicatie',
  'new application': 'nieuwe applicatie',
  'application name': 'applicatienaam',
  'source': 'bron',
  'github url': 'github-url',
  'upload zip': 'upload zip',
  'repository url': 'repository-url',
  'project zip file': 'project-zipbestand',
  'drop zip here or click to browse': 'sleep zip hierheen of klik om te bladeren',
  'create application': 'applicatie maken',
  'your applications': 'jouw applicaties',
  'name': 'naam',
  'repository': 'repository',
  'last deploy': 'laatste deploy',
  'no applications yet. create your first one above.': 'nog geen applicaties. maak hierboven je eerste applicatie.',
  'deployment history across all applications': 'deploymentgeschiedenis over alle applicaties',
  'building...': 'bouwen...',
  'all deployments': 'alle deployments',
  'application': 'applicatie',
  'started': 'gestart',
  'last log': 'laatste log',
  'no deployments yet.': 'nog geen deployments.',
  'real-time resource usage - updates every 2 seconds': 'realtime resourcegebruik - updates elke 2 seconden',
  'no applications yet. create an application first.': 'nog geen applicaties. maak eerst een applicatie.',

  'welcome back': 'welkom terug',
  'sign in to your concreto account': 'log in op je concreto-account',
  'email': 'e-mail',
  'password': 'wachtwoord',
  'sign in': 'inloggen',
  'or': 'of',
  "don't have an account?": 'nog geen account?',
  'create one': 'maak er een',

  'create your account': 'maak je account aan',
  'start deploying in under a minute': 'begin met deployen in minder dan een minuut',
  'full name': 'volledige naam',
  'work email': 'werk e-mail',
  'min. 8 characters': 'min. 8 tekens',
  'use at least 8 characters with a mix of letters and numbers.': 'gebruik minstens 8 tekens met een mix van letters en cijfers.',
  'create account': 'account aanmaken',
  'already have an account?': 'heb je al een account?'
};

var NL_STATIC_TEXT_NORM = null;
var EN_STATIC_TEXT_NORM = null;

function normalizeI18nText(value) {
  return String(value || '')
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function buildStaticTextMaps() {
  if (NL_STATIC_TEXT_NORM && EN_STATIC_TEXT_NORM) return;
  NL_STATIC_TEXT_NORM = {};
  EN_STATIC_TEXT_NORM = {};
  Object.keys(NL_STATIC_TEXT).forEach(function(key) {
    var normKey = normalizeI18nText(key);
    var val = NL_STATIC_TEXT[key];
    NL_STATIC_TEXT_NORM[normKey] = val;
    EN_STATIC_TEXT_NORM[normalizeI18nText(val)] = key;
  });
}

function replaceTextNodePreservePadding(node, replacement) {
  var raw = node.nodeValue || '';
  var left = raw.match(/^\s*/);
  var right = raw.match(/\s*$/);
  var padLeft = left ? left[0] : '';
  var padRight = right ? right[0] : '';
  node.nodeValue = padLeft + replacement + padRight;
}

function applyStaticPageTranslations() {
  buildStaticTextMaps();
  var map = currentLanguage === 'nl' ? NL_STATIC_TEXT_NORM : EN_STATIC_TEXT_NORM;
  if (!document.body) return;

  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  var node;
  while ((node = walker.nextNode())) {
    if (!node || !node.parentElement) continue;
    var tag = node.parentElement.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') continue;
    var raw = node.nodeValue;
    if (!raw || !raw.trim()) continue;
    var norm = normalizeI18nText(raw);
    var translated = map[norm];
    if (translated) replaceTextNodePreservePadding(node, translated);
  }
}

function normalizeLanguage(input) {
  var value = (input || '').toLowerCase();
  if (value.indexOf('nl') === 0) return 'nl';
  if (value.indexOf('en') === 0) return 'en';
  return FALLBACK_LANG;
}

function detectLanguage() {
  var stored = localStorage.getItem(LANG_KEY);
  if (stored && LANGS[normalizeLanguage(stored)]) {
    return normalizeLanguage(stored);
  }
  return normalizeLanguage(navigator.language || navigator.userLanguage || FALLBACK_LANG);
}

function t(key) {
  var active = I18N[currentLanguage] || I18N[FALLBACK_LANG];
  var fallback = I18N[FALLBACK_LANG];
  return active[key] || fallback[key] || key;
}

function setLanguage(lang) {
  currentLanguage = normalizeLanguage(lang);
  localStorage.setItem(LANG_KEY, currentLanguage);
  applyTranslations();
}

function applyTranslations() {
  document.documentElement.setAttribute('lang', currentLanguage);

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-placeholder');
    if (key) el.setAttribute('placeholder', t(key));
  });

  document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-title');
    if (key) el.setAttribute('title', t(key));
  });

  var toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.textContent = currentLanguage.toUpperCase();
    toggle.setAttribute('aria-label', t('lang_toggle_aria'));
    toggle.setAttribute('title', t('lang_toggle_title'));
  }

  applyStaticPageTranslations();
}

function initLanguageToggle() {
  var toggle = document.getElementById('lang-toggle');
  if (toggle && !toggle.dataset.bound) {
    toggle.dataset.bound = '1';
    toggle.addEventListener('click', function() {
      setLanguage(currentLanguage === 'en' ? 'nl' : 'en');
    });
  }
  applyTranslations();
}

window.setLanguage = setLanguage;
window.getCurrentLanguage = function() { return currentLanguage; };
window.t = t;

// ── Nav rendering ─────────────────────────────────
function renderNav() {
  const loggedIn = isLoggedIn();
  const authArea = document.getElementById('nav-auth-btns');
  const userArea = document.getElementById('nav-user');
  if (authArea) authArea.style.display = loggedIn ? 'none' : 'flex';
  if (!userArea) return;

  userArea.classList.toggle('hidden', !loggedIn);
  userArea.style.display = loggedIn ? 'flex' : 'none';

  var avatar = userArea.querySelector('.avatar');
  if (avatar) {
    var user = getUser();
    var initials = (user && user.name)
      ? user.name.split(' ').map(function(p) { return p[0]; }).join('').toUpperCase().slice(0, 2)
      : '?';
    avatar.textContent = initials;
    avatar.removeAttribute('onclick');
    avatar.removeAttribute('title');
    avatar.style.cursor = 'default';
  }

  if (loggedIn && !userArea.querySelector('[data-nav-logout]')) {
    var logoutBtn = document.createElement('button');
    logoutBtn.className = 'nav-link';
    logoutBtn.type = 'button';
    logoutBtn.setAttribute('data-nav-logout', '1');
    logoutBtn.textContent = t('nav_logout_title');
    logoutBtn.addEventListener('click', logout);
    userArea.insertBefore(logoutBtn, userArea.querySelector('.avatar') || null);
  }
}

// ── Auth actions ──────────────────────────────────
function doLogin() {
  var emailEl = document.getElementById('login-email');
  var passEl  = document.getElementById('login-pass');
  if (emailEl && !emailEl.value.trim()) { showToast(t('toast_email_required')); return; }
  if (passEl  && !passEl.value.trim())  { showToast(t('toast_password_required')); return; }

  var btn = document.querySelector('.form-submit');
  if (btn) btn.disabled = true;

  fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailEl.value.trim(), password: passEl.value })
  })
  .then(function(res) { return res.json().then(function(d) { return { ok: res.ok, data: d }; }); })
  .then(function(r) {
    if (!r.ok) { showToast(r.data.error || 'Login failed'); if (btn) btn.disabled = false; return; }
    setAuth(r.data.token, r.data.user);
    navigate('dashboard.html', function() { showToast(t('toast_signed_in')); });
  })
  .catch(function() { showToast('Could not reach server'); if (btn) btn.disabled = false; });
}

function doRegister() {
  var nameEl  = document.getElementById('register-name');
  var emailEl = document.getElementById('register-email');
  var passEl  = document.getElementById('register-pass');
  if (nameEl  && !nameEl.value.trim())    { showToast(t('toast_name_required')); return; }
  if (emailEl && !emailEl.value.trim())   { showToast(t('toast_email_required')); return; }
  if (passEl  && passEl.value.length < 8) { showToast(t('toast_password_min')); return; }

  var btn = document.querySelector('.form-submit');
  if (btn) btn.disabled = true;

  fetch(API_BASE + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nameEl.value.trim(), email: emailEl.value.trim(), password: passEl.value })
  })
  .then(function(res) { return res.json().then(function(d) { return { ok: res.ok, data: d }; }); })
  .then(function(r) {
    if (!r.ok) { showToast(r.data.error || 'Registration failed'); if (btn) btn.disabled = false; return; }
    setAuth(r.data.token, r.data.user);
    navigate('dashboard.html', function() { showToast(t('toast_account_created')); });
  })
  .catch(function() { showToast('Could not reach server'); if (btn) btn.disabled = false; });
}

function logout() {
  clearAuth();
  navigate('index.html', function() { showToast(t('toast_signed_out')); });
}

// ── Page transitions ──────────────────────────────
function navigate(href, afterNavCallback) {
  if (afterNavCallback) sessionStorage.setItem('ph_toast', afterNavCallback.toString());
  document.body.classList.add('is-leaving');
  setTimeout(() => { window.location.href = href; }, 230);
}

function interceptLinks() {
  document.querySelectorAll('a[data-nav]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigate(link.getAttribute('href'));
    });
  });
  document.querySelectorAll('button[data-nav]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      navigate(btn.getAttribute('data-href'));
    });
  });
}

// ── Toast ─────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Scroll reveal ─────────────────────────────────
function initReveal() {
  var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');
  if (!els.length) return;
  if (!window.IntersectionObserver) {
    els.forEach(function(el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -28px 0px' });
  els.forEach(function(el) { io.observe(el); });
}

// ── Nav shadow on scroll ───────────────────────────
function initNavScroll() {
  var nav = document.querySelector('nav');
  if (!nav) return;
  window.addEventListener('scroll', function() {
    nav.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ── Back to top button ─────────────────────────────
function initBackToTop() {
  var btn = document.createElement('div');
  btn.id = 'back-to-top';
  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-label', 'Back to top');
  btn.setAttribute('tabindex', '0');
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 7l4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(btn);
  window.addEventListener('scroll', function() {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  btn.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

// ── Mobile hamburger nav ───────────────────────────
function initMobileNav() {
  var nav = document.querySelector('nav');
  if (!nav || document.getElementById('nav-hamburger')) return;

  var hamburger = document.createElement('button');
  hamburger.id = 'nav-hamburger';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(hamburger);

  var menu = document.createElement('div');
  menu.id = 'nav-mobile-menu';
  var pages = [
    { href: 'index.html', key: 'nav_product' },
    { href: 'docs.html',  key: 'nav_docs' },
    { href: 'pricing.html', key: 'nav_pricing' }
  ];
  var html = '';
  pages.forEach(function(p) {
    html += '<a class="nav-mobile-link" href="' + p.href + '" data-nav>' + t(p.key) + '</a>';
  });
  html += '<div class="nav-mobile-divider"></div>';
  if (isLoggedIn()) {
    html += '<a class="nav-mobile-cta" href="dashboard.html" data-nav>' + t('nav_dashboard') + '</a>';
    html += '<a class="nav-mobile-link" href="index.html" data-logout="1">' + t('nav_logout_title') + '</a>';
  } else {
    html += '<a class="nav-mobile-link" href="login.html" data-nav>' + t('nav_login') + '</a>';
    html += '<a class="nav-mobile-cta" href="register.html" data-nav>' + t('nav_get_started') + '</a>';
  }
  menu.innerHTML = html;
  nav.parentNode.insertBefore(menu, nav.nextSibling);

  function closeMenu() {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    setTimeout(function() { if (!menu.classList.contains('is-open')) menu.style.display = 'none'; }, 240);
  }

  hamburger.addEventListener('click', function() {
    var opening = !hamburger.classList.contains('is-open');
    if (opening) {
      hamburger.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      menu.style.display = 'flex';
      requestAnimationFrame(function() { requestAnimationFrame(function() { menu.classList.add('is-open'); }); });
    } else { closeMenu(); }
  });

  menu.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      if (a.getAttribute('data-logout') === '1') {
        closeMenu();
        setTimeout(function() { logout(); }, 150);
        return;
      }
      var href = a.getAttribute('href');
      closeMenu();
      setTimeout(function() { navigate(href); }, 150);
    });
  });

  document.addEventListener('click', function(e) {
    if (menu.classList.contains('is-open') && !nav.contains(e.target) && !menu.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });
}

// ── Terminal line-by-line animation ───────────────
function initTerminalAnimation() {
  var termWrap = document.querySelector('.terminal-wrap');
  if (!termWrap) return;
  var lines = termWrap.querySelectorAll('.t-line');
  if (!lines.length) return;

  if (!window.IntersectionObserver) {
    lines.forEach(function(l) { l.classList.add('is-typed'); });
    return;
  }

  var animated = false;
  var io = new IntersectionObserver(function(entries) {
    if (!entries[0].isIntersecting || animated) return;
    animated = true;
    io.disconnect();
    lines.forEach(function(line, i) {
      setTimeout(function() { line.classList.add('is-typed'); }, 680 + i * 190);
    });
  }, { threshold: 0.25 });
  io.observe(termWrap);
}

// ── Animated stat counters ─────────────────────────
function initCounters() {
  var els = document.querySelectorAll('[data-count-to]');
  if (!els.length) return;

  function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function fmt(n, dec) {
    if (dec > 0) return n.toFixed(dec);
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  if (!window.IntersectionObserver) {
    els.forEach(function(el) {
      el.textContent = (el.getAttribute('data-count-prefix') || '') +
        fmt(parseFloat(el.getAttribute('data-count-to')), parseInt(el.getAttribute('data-count-decimals') || '0', 10)) +
        (el.getAttribute('data-count-suffix') || '');
    });
    return;
  }

  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      var el       = entry.target;
      var target   = parseFloat(el.getAttribute('data-count-to'));
      var suffix   = el.getAttribute('data-count-suffix') || '';
      var prefix   = el.getAttribute('data-count-prefix') || '';
      var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
      var duration = 1700;
      var start    = performance.now();
      (function tick(now) {
        var p = Math.min((now - start) / duration, 1);
        el.textContent = prefix + fmt(target * easeOutExpo(p), decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }(start));
    });
  }, { threshold: 0.6 });
  els.forEach(function(el) { io.observe(el); });
}

// ── Init ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLanguageToggle();
  renderNav();
  interceptLinks();
  initReveal();
  initNavScroll();
  initBackToTop();
  initMobileNav();
  initTerminalAnimation();
  initCounters();

  // replay toast queued from previous page
  const queued = sessionStorage.getItem('ph_toast');
  if (queued) {
    sessionStorage.removeItem('ph_toast');
    const match = queued.match(/showToast\(['"](.+?)['"]\)/);
    if (match) setTimeout(() => showToast(match[1]), 200);
  }
});
