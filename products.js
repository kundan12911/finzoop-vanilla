/* ── products.js
   Dynamic categories + product cards for all product pages.
   Reads from Contentful productCategory + productItem.     ── */

const PROD = {
  // window.cms is loaded from cms.js before this script

  // Detect current page type from <body> data attribute
  // or URL path
  getPageType() {
    const attr = document.body.getAttribute('data-product-page');
    if (attr) return attr;
    const path = window.location.pathname;
    if (path.includes('loans'))        return 'loans';
    if (path.includes('credit-cards')) return 'credit-cards';
    if (path.includes('insurance'))    return 'insurance';
    if (path.includes('mutual-funds')) return 'mutual-funds';
    if (path.includes('nps'))          return 'nps';
    if (path.includes('investments'))  return 'investments';
    return null;
  },

  // Fetch categories for current page
  async fetchCategories(pageType) {
    return await window.cms.fetchProductCategories(pageType);
  },

  // Fetch products for current page, optionally by category
  async fetchProducts(pageType, categoryId = null) {
    return await window.cms.fetchProductItems(pageType, categoryId);
  },

  // Resolve linked asset URL (Not needed with Strapi, urls are absolute)
  resolveAsset(item) {
    return item?.attributes?.url || null;
  },

  // Render category tabs
  renderTabs(categories, activeId, onTabClick) {
    const container = document.querySelector(
      '[data-cms="product-categories"]');
    if (!container) return;

    container.innerHTML = categories.map(cat => {
      const f = cat.attributes;
      const isActive = cat.id === activeId;
      return `
        <button
          class="product-tab${isActive ? ' active' : ''}"
          data-cat-id="${cat.id}"
          data-cat-slug="${f.slug}"
          style="${isActive
            ? `border-color:${f.color || 'var(--primary)'};
               color:${f.color || 'var(--primary)'};
               background:${f.color || 'var(--primary)'}15;`
            : ''}">
          ${f.icon
            ? `<i data-lucide="${f.icon}"
                  style="width:16px;height:16px;"></i>`
            : ''}
          ${f.name}
        </button>`;
    }).join('');

    // Attach click handlers
    container.querySelectorAll('.product-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.product-tab')
          .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onTabClick(btn.dataset.catId, btn.dataset.catSlug);
      });
    });

    if (window.lucide) lucide.createIcons();
  },

  // Render product grid
  renderProducts(items, pageType) {
    const container = document.querySelector(
      '[data-cms="product-grid"]');
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `
        <div style="grid-column:span 3;text-align:center;
                    padding:60px 20px;">
          <i data-lucide="inbox"
             style="width:48px;height:48px;
                    color:var(--text-secondary);
                    margin-bottom:16px;"></i>
          <h3 style="color:var(--text-secondary);">
            No products in this category yet
          </h3>
          <p style="color:var(--text-secondary);font-size:14px;">
            Add products in Contentful to see them here.
          </p>
        </div>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    // Show loading state
    container.style.opacity = '0.5';
    container.style.transition = 'opacity 0.2s';

    const cards = items.map(item => {
      const f = item.attributes;
      const logoUrl = f.logo?.data?.attributes?.url || null;

      const highlightsHtml = (f.highlights || [])
        .map(h => `
          <li style="display:flex;align-items:flex-start;
                     gap:8px;font-size:14px;
                     margin-bottom:8px;">
            <i data-lucide="check-circle"
               style="width:16px;height:16px;
                      color:var(--secondary);
                      flex-shrink:0;margin-top:1px;"></i>
            ${h}
          </li>`).join('');

      return `
        <div class="card product-card"
             style="position:relative;overflow:hidden;">
          ${f.badge ? `
            <div class="product-badge"
                 style="background:${f.badgeColor||'var(--primary)'}20;
                        color:${f.badgeColor||'var(--primary)'};
                        position:absolute;top:16px;right:16px;
                        font-size:11px;font-weight:700;
                        padding:4px 10px;border-radius:20px;">
              ${f.badge}
            </div>` : ''}

          <div style="display:flex;align-items:center;
                      gap:16px;margin-bottom:20px;">
            ${logoUrl
              ? `<img src="${logoUrl}" alt="${f.name}"
                      style="height:44px;width:auto;
                             object-fit:contain;">`
              : `<div style="width:44px;height:44px;
                              background:var(--light-bg);
                              border-radius:10px;
                              display:flex;align-items:center;
                              justify-content:center;">
                   <i data-lucide="building-2"
                      style="width:22px;height:22px;
                             color:var(--primary);"></i>
                 </div>`}
            <div>
              <h3 style="font-size:17px;margin:0 0 4px;
                         padding-right:80px;">
                ${f.name}
              </h3>
              ${f.tagline ? `
                <p style="font-size:13px;
                           color:var(--text-secondary);
                           margin:0;">
                  ${f.tagline}
                </p>` : ''}
            </div>
          </div>

          ${f.rate ? `
            <div style="background:var(--light-bg);
                        border-radius:10px;padding:12px 16px;
                        margin-bottom:16px;
                        display:flex;justify-content:space-between;
                        align-items:center;">
              <div>
                <div style="font-size:11px;
                             color:var(--text-secondary);
                             margin-bottom:2px;">
                  ${f.rateLabel || 'Rate'}
                </div>
                <div style="font-size:20px;font-weight:700;
                             color:var(--primary);">
                  ${f.rate}
                </div>
              </div>
              ${f.tenure ? `
                <div style="text-align:right;">
                  <div style="font-size:11px;
                               color:var(--text-secondary);
                               margin-bottom:2px;">
                    Tenure
                  </div>
                  <div style="font-size:14px;font-weight:600;">
                    ${f.tenure}
                  </div>
                </div>` : ''}
            </div>` : ''}

          ${highlightsHtml ? `
            <ul style="list-style:none;padding:0;margin:0 0 20px;">
              ${highlightsHtml}
            </ul>` : ''}

          <div style="display:flex;gap:10px;margin-top:auto;">
            <a href="${f.applyUrl || '#'}"
               class="btn btn-primary"
               style="flex:1;text-align:center;">
              ${f.applyLabel || 'Apply Now'}
              <i data-lucide="arrow-right"
                 style="width:14px;height:14px;"></i>
            </a>
            <button class="btn btn-outline"
                    style="padding:12px 16px;"
                    onclick="window.scrollTo(0,0)">
              <i data-lucide="info"
                 style="width:16px;height:16px;"></i>
            </button>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="grid-3" style="align-items:start;">
        ${cards}
      </div>`;
    container.style.opacity = '1';

    if (window.lucide) lucide.createIcons();
  },

  // ── Main init ───────────────────────────────────────────
  async init() {
    const pageType = this.getPageType();
    if (!pageType) return;

    // Show skeleton
    const grid = document.querySelector('[data-cms="product-grid"]');
    if (grid) {
      grid.innerHTML = `
        <div class="grid-3">
          ${[1,2,3].map(() =>
            `<div class="card skeleton-card"
                  style="height:360px;"></div>`
          ).join('')}
        </div>`;
    }

    try {
      const categories = await this.fetchCategories(pageType);

      // Find default category
      const defaultCat = categories.find(c => c.attributes.isDefault)
                      || categories[0];
      const defaultCatId = defaultCat?.id || null;

      // Fetch initial products
      const prodsData = await this.fetchProducts(
        pageType, defaultCatId);

      // Render tabs
      this.renderTabs(categories, defaultCatId,
        async (catId) => {
          // On tab click: fetch + render that category
          if (grid) {
            grid.innerHTML = `
              <div class="grid-3">
                ${[1,2,3].map(() =>
                  `<div class="card skeleton-card"
                        style="height:360px;"></div>`
                ).join('')}
              </div>`;
          }
          const newProds = await this.fetchProducts(
            pageType, catId);
          this.renderProducts(
            newProds, pageType);
        }
      );

      // Render initial products
      this.renderProducts(
        prodsData, pageType);

    } catch (err) {
      console.error('[Products] Init error:', err);
      if (grid) {
        grid.innerHTML = `
          <div class="card" style="grid-column:span 3;
               text-align:center;padding:60px 20px;">
            <i data-lucide="alert-circle"
               style="width:40px;height:40px;
                      color:var(--accent);
                      margin-bottom:16px;"></i>
            <h3>Could not load products</h3>
            <p style="color:var(--text-secondary);">
              ${err.message}
            </p>
          </div>`;
        if (window.lucide) lucide.createIcons();
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => PROD.init());
