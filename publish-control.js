window.checkMaintenanceMode = function(globalSettings) {
  if (globalSettings?.maintenanceMode) {
    document.body.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; text-align:center; background:#f8fafc; font-family:sans-serif;">
        <h1 style="color:#1e293b; margin-bottom:16px;">We'll be back shortly</h1>
        <p style="color:#64748b; font-size:18px;">${globalSettings.maintenanceBanner || 'Finzoop is currently undergoing scheduled maintenance.'}</p>
      </div>
    `;
    throw new Error('Maintenance Mode Active');
  }
};

window.filterPublished = function(items) {
  if (!Array.isArray(items)) return [];
  const now = new Date();
  return items.filter(item => {
    const attrs = item.attributes || item;
    // Strapi logic
    if (attrs.isPublished === false) return false;
    if (attrs.publishedAt) {
      const pubDate = new Date(attrs.publishedAt);
      if (pubDate > now) return false;
    }
    // WordPress logic
    if (attrs.status === 'draft' || attrs.status === 'pending' || attrs.status === 'future') return false;
    if (attrs.date) {
      const wpDate = new Date(attrs.date);
      if (wpDate > now) return false;
    }
    return true;
  });
};
