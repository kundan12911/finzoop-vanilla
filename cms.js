/**
 * Finzoop CMS Client — Contentful Delivery API
 * -----------------------------------------------
 * Queries the Contentful Content Delivery API (read-only, CDN-backed).
 * All content is published before appearing here — no custom filtering needed.
 *
 * Config (set per-page in <head> before this script loads):
 *   window.CONTENTFUL_SPACE_ID    — Your Contentful Space ID
 *   window.CONTENTFUL_ACCESS_TOKEN — Content Delivery API access token (read-only)
 */

const SPACE_ID      = window.CONTENTFUL_SPACE_ID      || 'tabc1qgaltm6';
const CDN_TOKEN     = window.CONTENTFUL_ACCESS_TOKEN   || 'VCpSt0x-mm6pOncY1cYlkkuU5b9UsD_cs_mINwRgs6I';
const PREVIEW_TOKEN = window.CONTENTFUL_PREVIEW_TOKEN  || 'Y3V82ept2t018xmuDJfyAf2Da86iZSsntizHFKwHmhk';

// Auto-detect preview mode from URL (?preview=true)
const IS_PREVIEW = new URLSearchParams(window.location.search).get('preview') === 'true';
const ACTIVE_TOKEN = IS_PREVIEW ? PREVIEW_TOKEN : CDN_TOKEN;
const CDN_BASE = IS_PREVIEW
  ? `https://preview.contentful.com/spaces/${SPACE_ID}/environments/master`
  : `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master`;

// ─── Cache (5-minute session storage) ────────────────────────────────────────

function _cacheSet(key, data) {
  try {
    sessionStorage.setItem('ctfl_' + key, JSON.stringify({ ts: Date.now(), data }));
  } catch (_) {}
}

function _cacheGet(key) {
  try {
    const raw = sessionStorage.getItem('ctfl_' + key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts < 5 * 60 * 1000) return data;
  } catch (_) {}
  return null;
}

// ─── Core Fetch ──────────────────────────────────────────────────────────────

async function _fetchContentful(endpoint, params = {}, cacheKey = null) {
  if (cacheKey) {
    const hit = _cacheGet(cacheKey);
    if (hit) return hit;
  }

  const url = new URL(`${CDN_BASE}/${endpoint}`);
  url.searchParams.set('access_token', ACTIVE_TOKEN);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Contentful ${res.status}: ${res.statusText}`);
    const json = await res.json();
    if (cacheKey) _cacheSet(cacheKey, json);
    return json;
  } catch (err) {
    console.warn('[CMS] Contentful fetch failed, using static fallback.', err.message);
    return null;
  }
}

// Helper: resolve linked assets/entries from an API response includes block
function _resolveAssetUrl(assetId, includes) {
  if (!includes?.Asset) return null;
  const asset = includes.Asset.find(a => a.sys.id === assetId);
  return asset?.fields?.file?.url ? 'https:' + asset.fields.file.url : null;
}

// ─── Content Helpers ─────────────────────────────────────────────────────────

/** Global site settings (colours, footer text, logo) */
async function fetchGlobalSettings() {
  const data = await _fetchContentful('entries', {
    content_type: 'globalSetting',
    limit: 1,
  }, 'global-settings');

  const fields = data?.items?.[0]?.fields;
  if (!fields) return;

  if (fields.primaryColor)
    document.documentElement.style.setProperty('--primary', fields.primaryColor);
  if (fields.secondaryColor)
    document.documentElement.style.setProperty('--secondary', fields.secondaryColor);
  if (fields.accentColor)
    document.documentElement.style.setProperty('--accent', fields.accentColor);
  if (fields.footerDisclaimer) {
    document.querySelectorAll('.footer-disclaimer').forEach(el => {
      el.innerHTML = fields.footerDisclaimer;
    });
  }
}

/** Per-page SEO metadata */
async function fetchPageSeo(slug) {
  const data = await _fetchContentful('entries', {
    content_type: 'pageSeo',
    'fields.slug': slug,
    limit: 1,
  }, `page-seo-${slug}`);

  return data?.items?.[0]?.fields || null;
}

/** Hero banner for a given identifier string */
async function fetchHeroBanner(identifier) {
  const data = await _fetchContentful('entries', {
    content_type: 'heroBanner',
    'fields.identifier': identifier,
    limit: 1,
  }, `hero-${identifier}`);

  return data?.items?.[0]?.fields || null;
}

/** Product page content by slug */
async function fetchProductPage(slug) {
  const data = await _fetchContentful('entries', {
    content_type: 'productPage',
    'fields.slug': slug,
    limit: 1,
  }, `product-${slug}`);

  return data?.items?.[0]?.fields || null;
}

/** Calculator meta (title, description, FAQs) by slug */
async function fetchCalculatorMeta(slug) {
  const data = await _fetchContentful('entries', {
    content_type: 'calculatorMeta',
    'fields.slug': slug,
    limit: 1,
    include: 2,
  }, `calc-${slug}`);

  return data?.items?.[0]?.fields || null;
}

/** Navigation (Menus & Footer) */
async function fetchNavigation(identifier = 'main-nav') {
  const data = await _fetchContentful('entries', {
    content_type: 'navigation',
    'fields.identifier': identifier,
    limit: 1,
  }, `nav-${identifier}`);

  const fields = data?.items?.[0]?.fields;
  if (!fields) return null;

  // Render Top Menu
  if (fields.items) {
    const navContainer = document.querySelector('.nav-links');
    if (navContainer) {
      let navHtml = '';
      fields.items.forEach(item => {
        if (item.dropdown) {
           navHtml += `
             <div class="dropdown">
               <a href="${item.url || '#'}" class="nav-link">${item.label} ▾</a>
               <div class="dropdown-menu">
                 ${item.dropdown.map(d => `<a href="${d.url}" class="dropdown-item">${d.label}</a>`).join('')}
               </div>
             </div>
           `;
        } else {
           navHtml += `<a href="${item.url}" class="nav-link">${item.label}</a>`;
        }
      });
      navContainer.innerHTML = navHtml;
    }
  }
  return fields;
}

/** Page Content (Logical container for Sections) */
async function fetchPageContent(slug) {
  const data = await _fetchContentful('entries', {
    content_type: 'pageContent',
    'fields.slug': slug,
    limit: 1,
    include: 3
  }, `page-${slug}`);

  return data?.items?.[0]?.fields || null;
}

/** Published blog posts — newest first */
async function fetchBlogPosts(options = {}) {
  const params = {
    content_type: 'blogPost',
    order: '-fields.publishedAt',
    limit: options.limit || 10,
    include: 1, // Get linked assets (coverImage)
  };
  if (options.category) params['fields.category'] = options.category;

  const data = await _fetchContentful('entries', params, `blog-posts-${options.category || 'all'}`);
  return {
    items: data?.items || [],
    includes: data?.includes || {}
  };
}

/** Testimonials */
async function fetchTestimonials() {
  const data = await _fetchContentful('entries', {
    content_type: 'testimonial',
    limit: 20,
  }, 'testimonials');

  return data?.items?.map(i => i.fields) || [];
}

/** Partner logos */
async function fetchPartners() {
  const data = await _fetchContentful('entries', {
    content_type: 'partner',
    limit: 20,
    include: 1,
  }, 'partners');

  const includes = data?.includes;
  return (data?.items || []).map(item => ({
    ...item.fields,
    logoUrl: item.fields.logo?.sys?.id
      ? _resolveAssetUrl(item.fields.logo.sys.id, includes)
      : null,
  }));
}

/** FAQs by category */
async function fetchFaqs(category) {
  const params = { content_type: 'faq', limit: 50 };
  if (category) params['fields.category'] = category;

  const data = await _fetchContentful('entries', params, `faqs-${category || 'all'}`);
  return data?.items?.map(i => i.fields) || [];
}

// ─── SEO Injection ────────────────────────────────────────────────────────────

function injectSEO(seo) {
  if (!seo) return;

  if (seo.metaTitle) document.title = seo.metaTitle;

  const setMeta = (nameOrProp, content) => {
    if (!content) return;
    const isProp = nameOrProp.startsWith('og:');
    const attr   = isProp ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, nameOrProp);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('description',    seo.metaDescription);
  setMeta('keywords',       seo.metaKeywords);
  setMeta('og:title',       seo.ogTitle || seo.metaTitle);
  setMeta('og:description', seo.ogDescription || seo.metaDescription);

  if (seo.canonicalUrl) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', seo.canonicalUrl);
  }
}

// ─── Lucide Icons ─────────────────────────────────────────────────────────────

function renderLucideIcons() {
  if (window.lucide) lucide.createIcons();
}

// ─── Auto-init on page load ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Auto-inject SEO and Page Content if page declares a slug
  const pageEl = document.querySelector('[data-cms-page]');
  const slug = pageEl?.getAttribute('data-cms-page');
  
  if (slug) {
    const pageData = await fetchPageContent(slug);
    if (pageData) {
      if (pageData.seo) injectSEO(pageData.seo);
      if (pageData.hero) {
         // Custom logic to update hero section text...
      }
    }
  }

  // Fallback for independent SEO tags
  const seoEl = document.querySelector('[data-cms="page-seo"][data-cms-slug]');
  if (seoEl && !slug) {
    const s = seoEl.getAttribute('data-cms-slug');
    const seo = await fetchPageSeo(s);
    if (seo) injectSEO(seo);
  }

  // Auto-inject calculator meta if page declares it
  const calcEl = document.querySelector('[data-cms="calculator-meta"][data-cms-slug]');
  if (calcEl) {
    const s = calcEl.getAttribute('data-cms-slug');
    await fetchCalculatorMeta(s);
  }

  await fetchNavigation();
  await fetchGlobalSettings();
  renderLucideIcons();
});

// ─── Exports ──────────────────────────────────────────────────────────────────

window.fetchGlobalSettings  = fetchGlobalSettings;
window.fetchPageSeo         = fetchPageSeo;
window.fetchHeroBanner      = fetchHeroBanner;
window.fetchProductPage     = fetchProductPage;
window.fetchCalculatorMeta  = fetchCalculatorMeta;
window.fetchBlogPosts       = fetchBlogPosts;
window.fetchTestimonials    = fetchTestimonials;
window.fetchPartners        = fetchPartners;
window.fetchFaqs            = fetchFaqs;
window.injectSEO            = injectSEO;
window.renderLucideIcons    = renderLucideIcons;
