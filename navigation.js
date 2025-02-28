// navigation.js
document.addEventListener('DOMContentLoaded', function () {
  // Get the current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Find all nav links
  const navLinks = document.querySelectorAll('.nav-link');

  // Add active class to current page link
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage ||
      (href === 'index.html' && currentPage === '') ||
      (href === 'index.html' && currentPage === 'performance-dashboard/')) {
      link.classList.add('active');
    }
  });
});