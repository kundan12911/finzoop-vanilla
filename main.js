document.addEventListener('DOMContentLoaded', () => {

  // 1. Sticky Header
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Mobile dropdown toggle
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dd => {
    dd.addEventListener('click', (e) => {
      if (window.innerWidth <= 991) {
        dd.classList.toggle('active');
      }
    });
  });

  // 3. Number Formatting Utility (Indian System)
  window.formatINR = function(num) {
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Convert string like "5,000" or "₹ 5000" back to number
  window.parseINR = function(str) {
    const parsed = parseInt(str.replace(/[^0-9.-]+/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Highlighted readable text (Lakhs/Crores)
  window.formatReadableINR = function(num) {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} Lakh`;
    }
    return window.formatINR(num);
  };

  // 4. Calculator Two-Way Sync Elements
  // Any input with class `sync-input` and corresponding range with `sync-range`
  // grouped by a `data-sync` attribute will stay perfectly in sync.
  const syncGroups = {};
  
  document.querySelectorAll('input[type="range"].sync-range').forEach(range => {
    const id = range.getAttribute('data-sync');
    if (!syncGroups[id]) syncGroups[id] = {};
    syncGroups[id].range = range;
    
    // Set initial background progress
    updateRangeBg(range);
    
    range.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (syncGroups[id].input) {
        syncGroups[id].input.value = window.formatINR(val).replace('₹', '');
      }
      updateRangeBg(e.target);
      triggerCalcUpdate();
    });
  });

  document.querySelectorAll('input[type="text"].sync-input').forEach(input => {
    const id = input.getAttribute('data-sync');
    if (!syncGroups[id]) syncGroups[id] = {};
    syncGroups[id].input = input;

    // Format Initial value
    if(input.value) {
      input.value = window.formatINR(parseINR(input.value)).replace('₹', '');
    }

    input.addEventListener('blur', (e) => {
      let val = parseINR(e.target.value);
      const range = syncGroups[id].range;
      if (range) {
        const min = parseInt(range.min);
        const max = parseInt(range.max);
        if (val < min) val = min;
        if (val > max) val = max;
        range.value = val;
        e.target.value = window.formatINR(val).replace('₹', '');
        updateRangeBg(range);
        triggerCalcUpdate();
      }
    });

    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      }
    });
  });

  function updateRangeBg(el) {
    const min = parseFloat(el.min) || 0;
    const max = parseFloat(el.max) || 100;
    const val = parseFloat(el.value) || 0;
    const percent = ((val - min) / (max - min)) * 100;
    el.style.setProperty('--progress', `${percent}%`);
  }

  // 5. Global callback array for page-specific calculator logic
  window.calcUpdateCallbacks = [];
  function triggerCalcUpdate() {
    window.calcUpdateCallbacks.forEach(cb => cb());
  }

  // 6. FAQ Accordions
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-q');
    if(question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all
        faqItems.forEach(f => f.classList.remove('active'));
        // Open clicked if it wasn't active
        if (!isActive) item.classList.add('active');
      });
    }
  });

  // 7. Toggle Button Groups (e.g., Lumpsum vs SIP)
  document.querySelectorAll('.toggle-group').forEach(group => {
    const buttons = group.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Expose a custom event or handler for specific logic
        const event = new CustomEvent('toggleChanged', { detail: { value: btn.dataset.value, group: group.id } });
        document.dispatchEvent(event);
      });
    });
  });

  // Share functionality generic handler
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = '<i data-lucide="check" class="icon-sm"></i> Copied!';
        if (window.lucide) lucide.createIcons();
        setTimeout(() => shareBtn.innerHTML = originalText, 2000);
      });
    });
  }

});
