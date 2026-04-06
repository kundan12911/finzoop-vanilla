async function renderBlogListing(options = {}) {
  const container = document.querySelector('[data-cms="blog-list"]');
  if (!container) return;

  container.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>';

  try {
    const { items: posts, includes } = await window.fetchBlogPosts(options);
    
    if (!posts || posts.length === 0) {
      container.innerHTML = '<p style="text-align:center; grid-column:span 3; padding:40px;">No blog posts available yet. Connect to Contentful to see your stories here!</p>';
      return;
    }

    let html = '';
    posts.forEach(post => {
      const fields = post.fields;
      const coverUrl = fields.coverImage?.sys?.id 
        ? window._resolveAssetUrl(fields.coverImage.sys.id, includes) 
        : null;

      html += `
        <div class="card blog-card" style="padding: 0; overflow: hidden;">
          ${coverUrl ? `<img src="${coverUrl}" alt="${fields.title}" style="width:100%; height:200px; object-fit:cover;" />` : ''}
          <div style="padding: 24px;">
            <div style="font-size: 14px; color: var(--primary); margin-bottom: 8px; font-weight: 600;">
              <i data-lucide="tag" class="icon-sm"></i> ${fields.category || 'Financial Insight'}
            </div>
            <h3 style="margin-bottom: 12px; line-height: 1.4;"><a href="blog-post.html?slug=${fields.slug}">${fields.title}</a></h3>
            <p style="color: var(--text-secondary); font-size: 14px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              ${fields.summary || fields.excerpt || ''}
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px; font-size:12px; color:var(--text-secondary); border-top:1px solid var(--border); padding-top:16px;">
              <span><i data-lucide="calendar" class="icon-sm"></i> ${new Date(fields.publishedAt || Date.now()).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</span>
              <a href="blog-post.html?slug=${fields.slug}" style="font-weight: 600; display:flex; align-items:center; gap:4px;">Read More <i data-lucide="arrow-right" class="icon-sm"></i></a>
            </div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = `<div class="grid-3">${html}</div>`;
    if (window.renderLucideIcons) window.renderLucideIcons();
  } catch (err) {
    console.error('[CMS] Failed to render blog listing:', err);
    container.innerHTML = '<div class="card" style="grid-column: span 3; text-align: center; color: var(--accent);">Failed to load posts. Check console for details.</div>';
  }
}

async function renderBlogPost(slug) {
  if (!slug) return;
  const container = document.querySelector('[data-cms="blog-post"]');
  if (!container) return;
  
  container.innerHTML = '<div class="skeleton-heading"></div><div class="skeleton-text"></div><div class="skeleton-text"></div>';
  
  try {
    // Note: Detail pages can use the same delivery API with filters
    const data = await window.fetchBlogPosts({ limit: 1 }); // Simplification for demo
    // Real implementation would use fetchPageBySlug()
    container.innerHTML = `<h2>Viewing ${slug}</h2><p>Individual blog post rendering logic will be finalized based on rich text styling.</p>`;
  } catch (err) {
    container.innerHTML = '<p>Post not found.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  if (slug) {
    renderBlogPost(slug);
  } else {
    renderBlogListing();
  }
});
