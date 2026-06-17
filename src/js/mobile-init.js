// Auto-collapse the journal on mobile screens so it doesn't cover the layout on load
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 768 && typeof toggleJournal === 'function' && !journalCollapsed) {
    toggleJournal();
  }
});
