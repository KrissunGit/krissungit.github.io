document.addEventListener("DOMContentLoaded", () => {
  const observerOptions = {
    root: null, 
    threshold: 0.3
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const textElements = document.querySelectorAll('.reveal-text');
  textElements.forEach(el => observer.observe(el));
});

function switchLanguage(lang) {
    const englishSection = document.getElementById('english-aboutme');
    const latvianSection = document.getElementById('latvian-aboutme');

    if (!englishSection || !latvianSection) return;

    if (lang === 'lv') {
        englishSection.style.display = 'none';
        latvianSection.style.display = 'block';
    } else {
        latvianSection.style.display = 'none';
        englishSection.style.display = 'block';
    }
}