async function renderBlogListing(options = {}) {
  const container = document.querySelector('[data-cms="blog-list"]');
  if (!container) return;

  container.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>';

  try {
    const posts = await window.fetchBlogPosts(options);
    const publishedPosts = window.filterPublished(posts);
    
    if (publishedPosts.length === 0) {
      container.innerHTML = '<p>No posts available.</p>';
      return;
    }

    let html = '';
    publishedPosts.forEach(post => {
      const attrs = post.attributes;
      html += `
        <div class="card blog-card" style="padding: 0;">
          ${attrs.coverImage?.data ? `<img src="${window.CMS_URL}${attrs.coverImage.data.attributes.url}" alt="${attrs.coverImageAlt}" style="width:100%; height:200px; object-fit:cover; border-radius: 8px 8px 0 0;" />` : ''}
          <div style="padding: 24px;">
            <div style="font-size: 14px; color: ${attrs.category?.data?.attributes?.color || '--primary'}; margin-bottom: 8px;">
              <i data-lucide="${attrs.category?.data?.attributes?.icon || 'tag'}" class="icon-sm"></i> ${attrs.category?.data?.attributes?.name || 'Blog'}
            </div>
            <h3 style="margin-bottom: 12px;"><a href="blog-post.html?slug=${attrs.slug}">${attrs.title}</a></h3>
            <p style="color: #64748b; font-size: 14px;">${attrs.excerpt || ''}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; font-size:12px; color:#94a3b8;">
              <span><i data-lucide="clock" class="icon-sm"></i> ${attrs.readTimeMinutes || 5} min read</span>
              <span><i data-lucide="eye" class="icon-sm"></i> ${attrs.viewCount || 0}</span>
            </div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = `<div class="grid-3">${html}</div>`;
    if (window.renderLucideIcons) window.renderLucideIcons();
  } catch (err) {
    console.error('Failed to render blog listing', err);
    container.innerHTML = '<p>Unable to load posts.</p>';
  }
}

async function renderBlogPost(slug) {
  if (!slug) return;
  const container = document.querySelector('[data-cms="blog-post"]');
  if (!container) return;
  
  // Implementation for single post...
  container.innerHTML = '<h2>Loading post...</h2>';
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
