document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = document.querySelectorAll('.dropdown');

  
  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdowns.forEach(other => {
          if (other !== dropdown) {
            other.classList.remove('active');
          }
        });
        dropdown.classList.toggle('active');
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".sidebar") && window.innerWidth <= 768) {
        dropdowns.forEach(d => d.classList.remove("active"));
    }
  });

  
  const latvianToggle = document.getElementById('toggle-latvian');
  const englishToggle = document.getElementById('toggle-english');

  if (latvianToggle) {
    latvianToggle.addEventListener('click', (e) => {
      e.preventDefault(); 
      switchLanguage('lv');
      
      
      if (window.innerWidth <= 768) {
        latvianToggle.closest('.dropdown').classList.remove('active');
      }
    });
  }

  if (englishToggle) {
    englishToggle.addEventListener('click', (e) => {
      e.preventDefault(); 
      switchLanguage('en');
      
      
      if (window.innerWidth <= 768) {
        englishToggle.closest('.dropdown').classList.remove('active');
      }
    });
  }

  
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