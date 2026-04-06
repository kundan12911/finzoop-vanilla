document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('preview') !== 'true') return;

  const style = document.createElement('style');
  style.innerHTML = `
    [data-cms] { position: relative; border: 2px dashed #3b82f6 !important; }
    .cms-edit-badge {
      position: absolute; top: 0; right: 0; background: #3b82f6; color: white;
      padding: 4px 8px; font-size: 12px; font-weight: bold; cursor: pointer;
      z-index: 1000; display: flex; align-items: center; gap: 4px;
      border-bottom-left-radius: 4px;
    }
    .cms-edit-badge:hover { background: #2563eb; }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('[data-cms]').forEach(el => {
    const cmsType = el.getAttribute('data-cms');
    const badge = document.createElement('span');
    badge.className = 'cms-edit-badge';
    badge.innerHTML = `<i data-lucide="edit-2" class="icon-sm"></i> Edit in CMS`;
    badge.title = `Edit ${cmsType} in CMS`;
    
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const adminUrl = window.CMS_URL ? `${window.CMS_URL}/admin` : 'http://localhost:1337/admin';
      window.open(adminUrl, '_blank');
    });
    
    el.appendChild(badge);
  });

  if (window.lucide) lucide.createIcons();
});
