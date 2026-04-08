/** Blog Listing — Strapi Migration */

async function renderBlogListing(options = {}) {
  const container = document.querySelector('[data-cms="blog-list"]');
  if (!container) return;

  // Show skeleton
  container.innerHTML = `
    <div class="grid-3">
      ${[1, 2, 3].map(() =>
        `<div class="card skeleton-card" style="height:340px;"></div>`
      ).join('')}
    </div>`;

  try {
    const posts = await window.cms.fetchBlogPosts({
      limit: 12,
      category: options.category
    });

    if (!posts || !posts.length) {
      container.innerHTML = `
        <div style="grid-column:span 3;text-align:center; padding:80px 20px;">
          <i data-lucide="file-text" style="width:56px;height:56px; color:#94A3B8;margin-bottom:20px; display:block;margin-left:auto; margin-right:auto;"></i>
          <h3 style="color:#64748B;">No posts yet</h3>
          <p style="color:#94A3B8;font-size:14px;">Stay tuned for financial insights!</p>
        </div>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const cards = posts.map(post => {
      const f = post.attributes;
      const coverUrl = f.coverImage?.data?.attributes?.url || null;
      
      const catName = f.category?.data?.attributes?.name || 'Finance';
      const catColor = f.category?.data?.attributes?.color || 'var(--primary)';

      const date = new Date(f.publishedAt || post.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });

      const slug = f.slug;
      const mins = f.readTimeMinutes || 5;

      return `
        <article class="card" style="padding:0;overflow:hidden; display:flex;flex-direction:column;">
          <a href="blog-post.html?slug=${slug}" style="display:block;text-decoration:none;">
            ${coverUrl
              ? `<img src="${coverUrl}" alt="${f.title}" loading="lazy" style="width:100%;height:200px; object-fit:cover;display:block;">`
              : `<div style="width:100%;height:200px; background:var(--light-bg); display:flex;align-items:center; justify-content:center;">
                   <i data-lucide="image" style="width:40px;height:40px; color:#94A3B8;"></i>
                 </div>`}
          </a>
          <div style="padding:20px;display:flex; flex-direction:column;flex:1;">
            <span style="display:inline-flex; align-items:center;gap:5px; background:${catColor}15; color:${catColor}; font-size:11px;font-weight:700; padding:3px 10px;border-radius:20px; margin-bottom:10px;width:fit-content;">
              <i data-lucide="tag" style="width:11px;height:11px;"></i>
              ${catName}
            </span>
            <h3 style="font-size:16px;margin:0 0 10px; line-height:1.45;">
              <a href="blog-post.html?slug=${slug}" style="color:var(--text);text-decoration:none;transition:color 0.2s;">
                ${f.title}
              </a>
            </h3>
            <p style="font-size:13px;color:var(--text-secondary); margin:0 0 16px;flex:1; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
              ${f.excerpt || f.summary || ''}
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; padding-top:14px; border-top:1px solid var(--border); font-size:12px;color:var(--text-secondary);">
              <span style="display:flex;align-items:center; gap:5px;">
                <i data-lucide="calendar" style="width:13px;height:13px;"></i>
                ${date}
              </span>
              <span style="display:flex;align-items:center; gap:5px;">
                <i data-lucide="clock" style="width:13px;height:13px;"></i>
                ${mins} min
              </span>
              <a href="blog-post.html?slug=${slug}" style="display:flex;align-items:center; gap:4px;color:var(--primary); font-weight:600;font-size:12px; text-decoration:none;">
                Read <i data-lucide="arrow-right" style="width:13px;height:13px;"></i>
              </a>
            </div>
          </div>
        </article>`;
    }).join('');

    container.innerHTML = `<div class="grid-3">${cards}</div>`;
    if (window.lucide) lucide.createIcons();

  } catch (err) {
    console.error('[Blog] Error:', err);
    container.innerHTML = `
      <div style="grid-column:span 3;text-align:center; padding:60px 20px;">
        <i data-lucide="alert-circle" style="width:40px;height:40px; color:var(--accent);margin-bottom:16px; display:block;margin-left:auto; margin-right:auto;"></i>
        <h3>Could not load posts</h3>
        <p>${err.message}</p>
      </div>`;
  }
}

async function renderBlogPost() {
  const container = document.querySelector('[data-cms="blog-post"]');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) {
    container.innerHTML = '<h2>Post not found</h2>';
    return;
  }

  try {
    const post = await window.cms.fetchBlogPostBySlug(slug);
    if (!post) {
      container.innerHTML = '<h2>Post not found</h2>';
      return;
    }

    const f = post;
    const coverUrl = f.coverImage?.data?.attributes?.url || null;
    const date = new Date(f.publishedAt || post.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const catName = f.category?.data?.attributes?.name || 'Finance';
    const catColor = f.category?.data?.attributes?.color || 'var(--primary)';

    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <nav class="breadcrumb" style="margin-bottom: 30px;">
          <a href="index.html">Home</a><span class="separator">›</span>
          <a href="blog.html">Blog</a><span class="separator">›</span>
          <span aria-current="page">${f.title}</span>
        </nav>

        <header style="margin-bottom: 40px;">
          <span style="display:inline-flex; align-items:center;gap:5px; background:${catColor}15; color:${catColor}; font-size:12px;font-weight:700; padding:4px 12px;border-radius:20px; margin-bottom:20px;">
            ${catName}
          </span>
          <h1 style="font-size: 2.5rem; line-height: 1.2; margin-bottom: 20px;">${f.title}</h1>
          <div style="display:flex; align-items:center; gap:20px; color:var(--text-secondary); font-size:14px;">
            <span style="display:flex; align-items:center; gap:6px;"><i data-lucide="calendar" style="width:16px;height:16px;"></i> ${date}</span>
            <span style="display:flex; align-items:center; gap:6px;"><i data-lucide="clock" style="width:16px;height:16px;"></i> ${f.readTimeMinutes || 5} min read</span>
          </div>
        </header>

        ${coverUrl ? `<img src="${coverUrl}" alt="${f.title}" style="width:100%; border-radius:20px; margin-bottom:40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">` : ''}

        <div class="rich-text" style="font-size: 1.1rem; line-height: 1.8; color: var(--text);">
          ${f.content || ''}
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    if (window.cms) window.cms.injectSEO({
      metaTitle: f.title + ' | Finzoop Blog',
      metaDescription: f.excerpt || f.summary
    });

  } catch (err) {
    console.error('[Blog Post] Error:', err);
    container.innerHTML = '<h2>Error loading post</h2>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.getAttribute('data-cms-page') === 'blog') {
    renderBlogListing();
  } else if (document.body.getAttribute('data-cms-page') === 'blog-post') {
    renderBlogPost();
  }
});
