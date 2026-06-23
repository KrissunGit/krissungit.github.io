document.addEventListener("DOMContentLoaded", () => {
    const aboutmeBtn = document.getElementById('aboutme');
    const mainBtn = document.getElementById('main');
    const audioPlayerBtn = document.getElementById('audioplayer');
    const chessBtn = document.getElementById('chess');
    const portfolioBtn = document.getElementById('portfolio');

    if (aboutmeBtn) aboutmeBtn.addEventListener('click', () => window.location.href = 'aboutme.html');
    if (mainBtn) mainBtn.addEventListener('click', () => window.location.href = 'index.html');
    if (audioPlayerBtn) audioPlayerBtn.addEventListener('click', () => window.location.href = 'audio_player.html');
    if (chessBtn) chessBtn.addEventListener('click', () => window.location.href = 'chess.html');
    if (portfolioBtn) portfolioBtn.addEventListener('click', () => window.location.href = 'portfolio.html');

      
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

    if (lang === 'lv') {
        englishSection.style.display = 'none';
        latvianSection.style.display = 'block';
    } else {
        latvianSection.style.display = 'none';
        englishSection.style.display = 'block';
    }
}

switchLanguage('en'); 