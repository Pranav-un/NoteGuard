// NUCLEAR BUTTON VISIBILITY ENFORCER
// This script runs after page load to ensure all buttons are visible

export function enforceButtonVisibility() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceButtonVisibility);
  } else {
    forceButtonVisibility();
  }

  // Also run on route changes
  const observer = new MutationObserver(() => {
    forceButtonVisibility();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function forceButtonVisibility() {
  // Target all possible button selectors
  const selectors = [
    'button',
    '[role="button"]',
    '.action-btn',
    '.share-btn',
    '.edit-btn',
    '.delete-btn',
    '.note-action-btn',
    '#mega-ultra-share-override-999888777',
    '#mega-ultra-edit-override-666555444',
    '#mega-ultra-delete-override-333222111',
    '#mega-ultra-dashboard-view-override-111222333',
    '#mega-ultra-dashboard-edit-override-444555666',
    '#mega-ultra-dashboard-share-override-555666777',
    '#mega-ultra-dashboard-delete-override-777888999'
  ];

  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      // Force visibility with highest priority
      htmlElement.style.setProperty('display', 'inline-flex', 'important');
      htmlElement.style.setProperty('visibility', 'visible', 'important');
      htmlElement.style.setProperty('opacity', '1', 'important');
      htmlElement.style.setProperty('z-index', '999999', 'important');
      htmlElement.style.setProperty('position', 'relative', 'important');
      
      // Remove any classes that might hide the button
      htmlElement.classList.remove('hidden', 'invisible');
      
      // Remove any inline styles that hide the button
      if (htmlElement.style.display === 'none') {
        htmlElement.style.setProperty('display', 'inline-flex', 'important');
      }
      if (htmlElement.style.visibility === 'hidden') {
        htmlElement.style.setProperty('visibility', 'visible', 'important');
      }
      if (htmlElement.style.opacity === '0') {
        htmlElement.style.setProperty('opacity', '1', 'important');
      }
    });
  });

  console.log('Button visibility enforced for', 
    document.querySelectorAll('button, [role="button"]').length, 
    'buttons');
}

// Run immediately
enforceButtonVisibility();
