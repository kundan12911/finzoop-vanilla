(function () {
'use strict';

/* ── Config ─────────────────────────────────────────── */
// window.cms is loaded from cms.js before this script

/* ── Detect subfolder depth ─────────────────────────── */
const IN_SUB = window.location.pathname
  .toLowerCase().includes('/calculators/');
const R = IN_SUB ? '../' : ''; // root prefix for links

/* ── Active page detection ──────────────────────────── */
function activePage() {
  const p = window.location.pathname.toLowerCase();
  if (p.endsWith('index.html') || p === '/' || p === '')
    return 'home';
  if (p.includes('loans'))          return 'loans';
  if (p.includes('credit-cards'))   return 'credit-cards';
  if (p.includes('insurance'))      return 'insurance';
  if (p.includes('mutual-funds'))   return 'mutual-funds';
  if (p.includes('nps'))            return 'nps';
  if (p.includes('investments'))    return 'investments';
  if (p.includes('calculators'))    return 'calculators';
  if (p.includes('blog'))           return 'blog';
  if (p.includes('about'))          return 'about';
  if (p.includes('contact'))        return 'contact';
  return '';
}

/* ── Default nav data (always works offline) ────────── */
const NAV = {
  logo:     'Fin<span>zoop</span>',
  ctaText:  'Check Eligibility',
  ctaUrl:   'loans.html',
  main: [
    { key:'home',   label:'Home',   url:'index.html' },
    { key:'products', label:'Products', url:'#',
      children: [
        { label:'Loans',         url:'loans.html',
          icon:'banknote',
          desc:'Quick disbursal, best rates' },
        { label:'Credit Cards',  url:'credit-cards.html',
          icon:'credit-card',
          desc:'Rewards, cashback & travel' },
        { label:'Insurance',     url:'insurance.html',
          icon:'shield-check',
          desc:'Life, health & motor cover' },
        { label:'Mutual Funds',  url:'mutual-funds.html',
          icon:'trending-up',
          desc:'SIP from ₹500/month' },
        { label:'NPS',           url:'nps.html',
          icon:'landmark',
          desc:'Build retirement corpus' },
        { label:'Investments',   url:'investments.html',
          icon:'piggy-bank',
          desc:'FDs, bonds & more' },
      ]
    },
    { key:'calculators', label:'Calculators',
      url:'calculators.html',
      children: [
        { label:'SIP Calculator',
          url:'calculators/sip.html' },
        { label:'Lumpsum Calculator',
          url:'calculators/lumpsum.html' },
        { label:'EMI Calculator',
          url:'calculators/emi.html' },
        { label:'FD Calculator',
          url:'calculators/fd.html' },
        { label:'PPF Calculator',
          url:'calculators/ppf.html' },
        { label:'Income Tax Calculator',
          url:'calculators/income-tax.html' },
        { label:'EPF Calculator',
          url:'calculators/epf.html' },
        { label:'RD Calculator',
          url:'calculators/rd.html' },
        { label:'SWP Calculator',
          url:'calculators/swp.html' },
        { label:'ELSS Calculator',
          url:'calculators/elss.html' },
        { label:'SSY Calculator',
          url:'calculators/sukanya-samriddhi-yojana.html' },
        { label:'MF Returns',
          url:'calculators/mutual-fund-returns.html' },
        { label:'GST Calculator',
          url:'calculators/gst.html' },
        { label:'XIRR Calculator',
          url:'calculators/xirr.html' },
        { label:'─────────────', url:'#', divider:true },
        { label:'View All 14 Tools →',
          url:'calculators.html' },
      ]
    },
    { key:'about',   label:'About',   url:'about.html'   },
    { key:'blog',    label:'Blog',    url:'blog.html'    },
    { key:'contact', label:'Contact', url:'contact.html' },
  ],
  footerTagline:
    'Your Financial Journey, Simplified.',
  footerDisclaimer:
    'Finzoop is a registered financial services '
    + 'distribution platform. Mutual fund investments '
    + 'are subject to market risks. Read all '
    + 'scheme-related documents carefully. Insurance '
    + 'is the subject matter of solicitation. '
    + 'Finzoop is a DSA (Direct Selling Agent). '
    + 'Loan approvals are at the sole discretion of '
    + 'lending partners.',
  quickLinks: [
    { label:'About Us',     url:'about.html' },
    { label:'Loans',        url:'loans.html' },
    { label:'Credit Cards', url:'credit-cards.html' },
    { label:'Insurance',    url:'insurance.html' },
    { label:'Mutual Funds', url:'mutual-funds.html' },
    { label:'NPS',          url:'nps.html' },
    { label:'Blog',         url:'blog.html' },
    { label:'Contact Us',   url:'contact.html' },
  ],
  calcLinks: [
    { label:'SIP Calculator',
      url:'calculators/sip.html' },
    { label:'EMI Calculator',
      url:'calculators/emi.html' },
    { label:'FD Calculator',
      url:'calculators/fd.html' },
    { label:'PPF Calculator',
      url:'calculators/ppf.html' },
    { label:'Income Tax',
      url:'calculators/income-tax.html' },
    { label:'ELSS Calculator',
      url:'calculators/elss.html' },
    { label:'Lumpsum',
      url:'calculators/lumpsum.html' },
    { label:'View All →',
      url:'calculators.html' },
  ],
  contact: {
    email:   'hello@finzoop.com',
    phone:   '+91 98765 43210',
    address: 'Mumbai, Maharashtra, India',
  },
  social: {
    linkedin:  '#',
    twitter:   '#',
    instagram: '#',
    youtube:   '#',
  },
};

/* ── Build header HTML ──────────────────────────────── */
function buildHeader(data, active) {
  const items = (data?.mainItems || NAV.main)
    .map(item => {
      const isActive = item.key === active;
      const ac = isActive ? ' active' : '';

      if (!item.children) {
        return `<a href="${R}${item.url}"
                   class="nav-link${ac}">${item.label}</a>`;
      }

      const dropItems = item.children.map(c => {
        if (c.divider)
          return `<hr style="border:none;
                             border-top:1px solid #E2E8F0;
                             margin:4px 0;">`;
        if (c.icon) {
          return `
            <a href="${R}${c.url}" class="dropdown-item">
              <span class="dd-icon">
                <i data-lucide="${c.icon}"></i>
              </span>
              <span>
                <strong>${c.label}</strong>
                ${c.desc
                  ? `<small>${c.desc}</small>` : ''}
              </span>
            </a>`;
        }
        return `<a href="${R}${c.url}"
                   class="dropdown-item">${c.label}</a>`;
      }).join('');

      return `
        <div class="dropdown">
          <a href="${R}${item.url}"
             class="nav-link${ac}">
            ${item.label}
            <i data-lucide="chevron-down"
               class="dd-chevron"></i>
          </a>
          <div class="dropdown-menu">
            ${dropItems}
          </div>
        </div>`;
    }).join('');

  return `
<header class="header" id="site-header">
  <div class="container nav-container">
    <a href="${R}index.html" class="logo">
      Fin<span>zoop</span>
    </a>
    <button class="hamburger" id="nav-toggle"
            aria-label="Open menu">
      <i data-lucide="menu"
         style="width:22px;height:22px;"></i>
    </button>
    <nav class="nav-links" id="nav-links">
      ${items}
    </nav>
    <a href="${R}${data?.ctaUrl || NAV.ctaUrl}"
       class="btn btn-primary nav-cta">
      ${data?.ctaText || NAV.ctaText}
    </a>
  </div>
</header>`;
}

/* ── Build footer HTML ──────────────────────────────── */
function buildFooter(data, settings) {
  const ql   = data?.quickLinks  || NAV.quickLinks;
  const cl   = data?.calcLinks   || NAV.calcLinks;
  const soc  = data?.social      || NAV.social;
  const con  = settings?.contact || NAV.contact;
  const tag  = data?.tagline     || NAV.footerTagline;
  const dis  = data?.disclaimer  || NAV.footerDisclaimer;

  const qlHtml = ql.map(l =>
    `<li><a href="${R}${l.url}">${l.label}</a></li>`
  ).join('');

  const clHtml = cl.map(l =>
    `<li><a href="${R}${l.url}">${l.label}</a></li>`
  ).join('');

  return `
<footer class="footer" id="site-footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <a href="${R}index.html" class="logo footer-logo">
        Fin<span>zoop</span>
      </a>
      <p class="footer-tagline">${tag}</p>
      <div class="footer-social">
        <a href="${soc.linkedin}" target="_blank"
           aria-label="LinkedIn" rel="noopener">
          <i data-lucide="linkedin"></i></a>
        <a href="${soc.twitter}" target="_blank"
           aria-label="Twitter" rel="noopener">
          <i data-lucide="twitter"></i></a>
        <a href="${soc.instagram}" target="_blank"
           aria-label="Instagram" rel="noopener">
          <i data-lucide="instagram"></i></a>
        <a href="${soc.youtube}" target="_blank"
           aria-label="YouTube" rel="noopener">
          <i data-lucide="youtube"></i></a>
      </div>
    </div>

    <div class="footer-col">
      <h4>Quick Links</h4>
      <ul>${qlHtml}</ul>
    </div>

    <div class="footer-col">
      <h4>Calculators</h4>
      <ul>${clHtml}</ul>
    </div>

    <div class="footer-col">
      <h4>Contact</h4>
      <ul class="footer-contact-list">
        <li>
          <i data-lucide="mail"></i>
          <span>${con.email}</span>
        </li>
        <li>
          <i data-lucide="phone"></i>
          <span>${con.phone}</span>
        </li>
        <li>
          <i data-lucide="map-pin"></i>
          <span>${con.address}</span>
        </li>
      </ul>
      <div class="reg-badges">
        <span>AMFI Registered</span>
        <span>IRDAI Agent</span>
        <span>PFRDA PoP</span>
      </div>
    </div>
  </div>

  <div class="footer-bottom">
    <div class="container footer-bottom-inner">
      <p class="footer-disclaimer">${dis}</p>
      <div class="footer-bottom-row">
        <span>
          © ${new Date().getFullYear()} Finzoop.
          All Rights Reserved.
        </span>
        <div class="footer-legal-links">
          <a href="${R}privacy-policy.html">
            Privacy Policy
          </a>
          <a href="${R}terms.html">
            Terms & Conditions
          </a>
        </div>
      </div>
    </div>
  </div>
</footer>`;
}

/* ── CMS Integration (via cms.js) ───────────────────── */
async function loadStrapiNav() {
  const data = await window.cms.fetchNavigation();
  if (!data) return null;
  return {
    ctaText:     data.ctaButtonLabel || NAV.ctaText,
    ctaUrl:      data.ctaButtonUrl   || NAV.ctaUrl,
    mainItems:   data.mainMenuItems  || null,
    quickLinks:  data.footerCol1Links || null,
    calcLinks:   data.footerCol2Links || null,
    tagline:     data.footerTagline  || null,
    disclaimer:  data.footerDisclaimer || null,
    social: {
      linkedin:  data.linkedinUrl  || '#',
      twitter:   data.twitterUrl   || '#',
      instagram: data.instagramUrl || '#',
      youtube:   data.youtubeUrl   || '#',
    },
  };
}

async function loadStrapiSettings() {
  const data = await window.cms.fetchGlobalSettings();
  if (!data) return null;
  return {
    contact: {
      email:   data.email   || NAV.contact.email,
      phone:   data.phone   || NAV.contact.phone,
      address: data.address || NAV.contact.address,
    },
    primaryColor:   data.primaryColor,
    secondaryColor: data.secondaryColor,
    accentColor:    data.accentColor,
  };
}

/* ── Attach hamburger toggle ────────────────────────── */
function attachHamburger() {
  const btn = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav-links');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    const ico  = btn.querySelector('[data-lucide]');
    if (ico) {
      ico.setAttribute('data-lucide', open ? 'x' : 'menu');
      if (window.lucide) lucide.createIcons();
    }
  });
}

/* ── Scroll effect on header ────────────────────────── */
function attachScroll() {
  const h = document.getElementById('site-header');
  if (!h) return;
  window.addEventListener('scroll', () => {
    h.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* ── Apply Contentful brand colours ─────────────────── */
function applyColors(s) {
  if (!s) return;
  const r = document.documentElement;
  if (s.primaryColor)
    r.style.setProperty('--primary',   s.primaryColor);
  if (s.secondaryColor)
    r.style.setProperty('--secondary', s.secondaryColor);
  if (s.accentColor)
    r.style.setProperty('--accent',    s.accentColor);
}

/* ── Main ───────────────────────────────────────────── */
async function init() {
  const active = activePage();

  /* Step 1: inject defaults immediately — zero layout shift */
  const headerHtml = buildHeader(null, active);
  const footerHtml = buildFooter(null, null);

  const headerWrap = document.createElement('div');
  headerWrap.innerHTML = headerHtml;
  document.body.insertBefore(
    headerWrap.firstElementChild,
    document.body.firstChild
  );

  const footerWrap = document.createElement('div');
  footerWrap.innerHTML = footerHtml;
  document.body.appendChild(footerWrap.firstElementChild);

  attachHamburger();
  attachScroll();
  if (window.lucide) lucide.createIcons();

  /* Step 2: fetch CMS data and upgrade silently */
  const [cmsNav, cmsSettings] = await Promise.all([
    loadStrapiNav(),
    loadStrapiSettings(),
  ]);

  if (cmsNav || cmsSettings) {
    applyColors(cmsSettings);

    const existH = document.getElementById('site-header');
    if (existH && cmsNav) {
      const nw = document.createElement('div');
      nw.innerHTML = buildHeader(cmsNav, active);
      existH.replaceWith(nw.firstElementChild);
      attachHamburger();
      attachScroll();
    }

    const existF = document.getElementById('site-footer');
    if (existF) {
      const fw = document.createElement('div');
      fw.innerHTML = buildFooter(cmsNav, cmsSettings);
      existF.replaceWith(fw.firstElementChild);
    }

    if (window.lucide) lucide.createIcons();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

}()); // end IIFE
