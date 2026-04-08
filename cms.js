/**
 * Finzoop CMS Client — Strapi v4
 * -----------------------------------------------
 * Queries the Strapi API for content and handles form submissions.
 * 
 * Config (set per-page in <head> before this script loads):
 *   window.STRAPI_URL — Your Strapi URL (e.g., https://your-app.onrender.com)
 */

const API_BASE = window.STRAPI_URL || 'http://localhost:1337/api';

// ─── Cache (5-minute session storage) ────────────────────────────────────────

function _cacheSet(key, data) {
  try {
    sessionStorage.setItem('strapi_' + key, JSON.stringify({ ts: Date.now(), data }));
  } catch (_) {}
}

function _cacheGet(key) {
  try {
    const raw = sessionStorage.getItem('strapi_' + key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts < 5 * 60 * 1000) return data;
  } catch (_) {}
  return null;
}

// ─── Core Fetch ──────────────────────────────────────────────────────────────

async function _fetchStrapi(endpoint, params = {}, cacheKey = null) {
  if (cacheKey) {
    const hit = _cacheGet(cacheKey);
    if (hit) return hit;
  }

  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Strapi ${res.status}: ${res.statusText}`);
    const json = await res.json();
    if (cacheKey) _cacheSet(cacheKey, json);
    return json;
  } catch (err) {
    console.warn('[CMS] Strapi fetch failed.', err.message);
    return null;
  }
}

// ─── Form Submission ─────────────────────────────────────────────────────────

/** Submit Lead */
async function submitLead(data) {
  try {
    const res = await fetch(`${API_BASE}/lead-submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return await res.json();
  } catch (err) {
    console.error('[CMS] Lead submission failed:', err);
    return { error: err.message };
  }
}

/** Submit Contact */
async function submitContact(data) {
  try {
    const res = await fetch(`${API_BASE}/contact-submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return await res.json();
  } catch (err) {
    console.error('[CMS] Contact submission failed:', err);
    return { error: err.message };
  }
}

// ─── Content Helpers ─────────────────────────────────────────────────────────

/** Global site settings */
async function fetchGlobalSettings() {
  const data = await _fetchStrapi('global-setting', { populate: '*' }, 'global-settings');
  const attr = data?.data?.attributes;
  if (!attr) return;

  // Apply basic branding
  if (attr.primaryColor) document.documentElement.style.setProperty('--primary', attr.primaryColor);
  if (attr.secondaryColor) document.documentElement.style.setProperty('--secondary', attr.secondaryColor);
  if (attr.accentColor) document.documentElement.style.setProperty('--accent', attr.accentColor);
  
  if (attr.footerDisclaimer) {
    document.querySelectorAll('.footer-disclaimer').forEach(el => {
      el.innerHTML = attr.footerDisclaimer;
    });
  }
  return attr;
}

/** Page SEO */
async function fetchPageSeo(slug) {
  const data = await _fetchStrapi('page-seos', {
    'filters[pageIdentifier][$eq]': slug,
    populate: '*',
  }, `seo-${slug}`);
  return data?.data?.[0]?.attributes || null;
}

/** Hero Banner */
async function fetchHeroBanner(identifier) {
  const data = await _fetchStrapi('hero-banners', {
    'filters[identifier][$eq]': identifier,
    populate: '*',
  }, `hero-${identifier}`);
  return data?.data?.[0]?.attributes || null;
}

/** Navigation */
async function fetchNavigation() {
  const data = await _fetchStrapi('navigation', { populate: '*' }, 'navigation');
  return data?.data?.attributes || null;
}

/** Blog Posts */
async function fetchBlogPosts(options = {}) {
  const params = {
    populate: '*',
    sort: 'publishedAt:desc',
    pagination: { limit: options.limit || 10 },
  };
  if (options.category) params['filters[category][slug][$eq]'] = options.category;

  const data = await _fetchStrapi('blog-posts', params, `blog-${options.category || 'all'}`);
  return data?.data || [];
}

/** Single Blog Post */
async function fetchBlogPostBySlug(slug) {
  const data = await _fetchStrapi('blog-posts', {
    'filters[slug][$eq]': slug,
    populate: '*',
  }, `post-${slug}`);
  return data?.data?.[0]?.attributes || null;
}

/** Testimonials */
async function fetchTestimonials() {
  const data = await _fetchStrapi('testimonials', { populate: '*' }, 'testimonials');
  return data?.data || [];
}

/** Partner logos */
async function fetchPartners() {
  const data = await _fetchStrapi('partners', { populate: '*' }, 'partners');
  return data?.data || [];
}

/** FAQs */
async function fetchFaqs(category) {
  const params = { populate: '*' };
  if (category) params['filters[category][$eq]'] = category;
  const data = await _fetchStrapi('faqs', params, `faqs-${category || 'all'}`);
  return data?.data || [];
}

/** Product Categories */
async function fetchProductCategories(pageType) {
  const params = {
    'filters[pageType][$eq]': pageType,
    'filters[isPublished][$eq]': 'true',
    sort: 'sortOrder:asc',
    populate: '*'
  };
  const data = await _fetchStrapi('product-categories', params, `cats-${pageType}`);
  return data?.data || [];
}

/** Product Items */
async function fetchProductItems(pageType, catId = null) {
  const params = {
    'filters[pageType][$eq]': pageType,
    'filters[isPublished][$eq]': 'true',
    sort: 'sortOrder:asc',
    populate: '*',
    pagination: { limit: 100 }
  };
  if (catId) {
    params['filters[category][id][$eq]'] = catId;
  }
  const data = await _fetchStrapi('product-items', params, `prods-${pageType}-${catId || 'all'}`);
  return data?.data || [];
}

/** Calculator Meta */
async function fetchCalculatorMeta(slug) {
  const data = await _fetchStrapi('calculator-metas', {
    'filters[slug][$eq]': slug,
    populate: ['faqs', 'product_sections'],
  }, `calc-${slug}`);
  return data?.data?.[0]?.attributes || null;
}

// ─── SEO Injection ────────────────────────────────────────────────────────────

function injectSEO(seo) {
  if (!seo) return;
  if (seo.metaTitle) document.title = seo.metaTitle;

  const setMeta = (nameOrProp, content) => {
    if (!content) return;
    const isProp = nameOrProp.startsWith('og:');
    const attr = isProp ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, nameOrProp);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('description', seo.metaDescription);
  setMeta('keywords', seo.metaKeywords);
  setMeta('og:title', seo.ogTitle || seo.metaTitle);
  setMeta('og:description', seo.ogDescription || seo.metaDescription);
  
  if (seo.ogImage?.data?.attributes?.url) {
    setMeta('og:image', seo.ogImage.data.attributes.url);
  }
}

// ─── Lucide Icons ─────────────────────────────────────────────────────────────

function renderLucideIcons() {
  if (window.lucide) lucide.createIcons();
}

// ─── Exports ──────────────────────────────────────────────────────────────────

window.cms = {
  submitLead,
  submitContact,
  fetchGlobalSettings,
  fetchPageSeo,
  fetchHeroBanner,
  fetchNavigation,
  fetchBlogPosts,
  fetchBlogPostBySlug,
  fetchTestimonials,
  fetchPartners,
  fetchFaqs,
  fetchProductCategories,
  fetchProductItems,
  fetchCalculatorMeta,
  injectSEO,
  renderLucideIcons
};

// Auto-run basic initializations
document.addEventListener('DOMContentLoaded', async () => {
    window.cms.fetchGlobalSettings();
    window.cms.renderLucideIcons();
});
