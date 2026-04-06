const CMS_URL = window.CMS_URL || 'http://localhost:1337';
const API_TOKEN = window.CMS_TOKEN || '';

const getHeaders = () => {
  return API_TOKEN ? { 'Authorization': `Bearer ${API_TOKEN}` } : {};
};

const cacheResponse = (key, data) => {
  sessionStorage.setItem(key, JSON.stringify({
    timestamp: Date.now(),
    data
  }));
};

const getCachedResponse = (key) => {
  const cached = sessionStorage.getItem(key);
  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return data;
    }
  }
  return null;
};

async function fetchCMS(endpoint, cacheKey = null) {
  if (cacheKey) {
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;
  }
  try {
    const res = await fetch(`${CMS_URL}/api/${endpoint}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`CMS API error: ${res.status}`);
    const data = await res.json();
    if (cacheKey) cacheResponse(cacheKey, data);
    return data;
  } catch (error) {
    console.warn('Falling back to static content:', error);
    return null;
  }
}

async function fetchGlobalSettings() {
  const data = await fetchCMS('global-setting?populate=*', 'cms-global-settings');
  if (data?.data?.attributes) {
    const attrs = data.data.attributes;
    document.documentElement.style.setProperty('--primary', attrs.primaryColor || '#1B4FD8');
    document.documentElement.style.setProperty('--secondary', attrs.secondaryColor || '#00C896');
    document.documentElement.style.setProperty('--accent', attrs.accentColor || '#FF6B35');
    
    document.querySelectorAll('.footer-disclaimer').forEach(el => {
      if (attrs.footerDisclaimer) el.innerHTML = attrs.footerDisclaimer;
    });
    // Add logic to update logos etc.
  }
}

async function fetchNavigation() {
  const data = await fetchCMS('navigation?populate=*', 'cms-navigation');
  if (data?.data?.attributes) {
    // Render logic for nav
  }
}

async function fetchHeroBanner(identifier) {
  const data = await fetchCMS(`hero-banners?filters[identifier][$eq]=${identifier}&populate=*`, `cms-hero-${identifier}`);
  return data?.data?.[0]?.attributes || null;
}

async function fetchProductPage(slug) {
  const data = await fetchCMS(`product-pages?filters[slug][$eq]=${slug}&populate=*`);
  return data?.data?.[0]?.attributes || null;
}

async function fetchCalculatorMeta(slug) {
  const data = await fetchCMS(`calculator-metas?filters[slug][$eq]=${slug}&populate=*`);
  return data?.data?.[0]?.attributes || null;
}

async function fetchBlogPosts(options = {}) {
  let query = 'blog-posts?populate=*&filters[isPublished][$eq]=true';
  const data = await fetchCMS(query);
  return data?.data || [];
}

async function fetchTestimonials() {
  const data = await fetchCMS('testimonials?filters[isPublished][$eq]=true&populate=*');
  return data?.data || [];
}

async function fetchPartners() {
  const data = await fetchCMS('partners?filters[isPublished][$eq]=true&populate=*');
  return data?.data || [];
}

async function fetchFaqs(category) {
  const data = await fetchCMS(`faqs?filters[category][$eq]=${category}&filters[isPublished][$eq]=true`);
  return data?.data || [];
}

function injectSEO(pageSeoData) {
  if (!pageSeoData) return;
  if (pageSeoData.metaTitle) document.title = pageSeoData.metaTitle;
  
  const setMeta = (name, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      name.startsWith('og:') ? el.setAttribute('property', name) : el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };
  
  setMeta('description', pageSeoData.metaDescription);
  setMeta('keywords', pageSeoData.metaKeywords);
  setMeta('og:title', pageSeoData.ogTitle);
  setMeta('og:description', pageSeoData.ogDescription);
  
  if (pageSeoData.canonicalUrl) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', pageSeoData.canonicalUrl);
  }
}

function renderLucideIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await fetchGlobalSettings();
  renderLucideIcons();
});

window.fetchGlobalSettings = fetchGlobalSettings;
window.fetchNavigation = fetchNavigation;
window.fetchHeroBanner = fetchHeroBanner;
window.fetchProductPage = fetchProductPage;
window.fetchCalculatorMeta = fetchCalculatorMeta;
window.fetchBlogPosts = fetchBlogPosts;
window.fetchTestimonials = fetchTestimonials;
window.fetchPartners = fetchPartners;
window.fetchFaqs = fetchFaqs;
window.injectSEO = injectSEO;
window.renderLucideIcons = renderLucideIcons;
