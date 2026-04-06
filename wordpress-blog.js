async function renderBlogListing(options = {}) {
  const container = document.querySelector('[data-cms="blog-list"]');
  if (!container) return;

  container.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>';

  try {
    const res = await fetch('https://blog.finzoop.com/wp-json/wp/v2/posts?_embed&per_page=9');
    if (!res.ok) throw new Error('WP API error');
    const rawPosts = await res.json();
    const posts = window.filterPublished ? window.filterPublished(rawPosts) : rawPosts;
    
    if (posts.length === 0) {
      container.innerHTML = '<p>No posts available.</p>';
      return;
    }

    let html = '';
    posts.forEach(post => {
      const coverUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
      const categoryName = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Blog';
      const readTime = Math.max(1, Math.ceil((post.content?.rendered?.length || 0) / 1000));
      
      html += `
        <div class="card blog-card" style="padding: 0;">
          ${coverUrl ? `<img src="${coverUrl}" alt="" style="width:100%; height:200px; object-fit:cover; border-radius: 8px 8px 0 0;" />` : ''}
          <div style="padding: 24px;">
            <div style="font-size: 14px; color: var(--primary); margin-bottom: 8px;">
              <i data-lucide="tag" class="icon-sm"></i> ${categoryName}
            </div>
            <h3 style="margin-bottom: 12px;"><a href="${post.link}" target="_blank">${post.title.rendered}</a></h3>
            <p style="color: #64748b; font-size: 14px;">${post.excerpt.rendered.replace(/(<([^>]+)>)/gi, "").substring(0, 100)}...</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; font-size:12px; color:#94a3b8;">
              <span><i data-lucide="clock" class="icon-sm"></i> ${readTime} min read</span>
              <span><i data-lucide="eye" class="icon-sm"></i> -</span>
            </div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = `<div class="grid-3">${html}</div>`;
    if (window.renderLucideIcons) window.renderLucideIcons();
  } catch (err) {
    console.error('Failed to render WordPress blog listing', err);
    container.innerHTML = '<p>Unable to load posts.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderBlogListing();
});
