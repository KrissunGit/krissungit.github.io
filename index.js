document.addEventListener("DOMContentLoaded", () => {

  const navMain = document.getElementById('nav-main');
  const navAbout = document.getElementById('nav-about');
  const navPortfolio = document.getElementById('nav-portfolio');
  const navAudioPlayer = document.getElementById('nav-audio-player');
  const navChess = document.getElementById('nav-chess');
  const navSettings = document.getElementById('nav-settings');

  const pages = {
    'nav-main': document.getElementById('page-main'),
    'nav-about': document.getElementById('page-about'),
    'nav-portfolio': document.getElementById('page-portfolio'),
    'nav-audio-player': document.getElementById('page-audio-player'),
    'nav-chess': document.getElementById('page-chess'),
    'nav-settings': document.getElementById('page-settings')
  };

  function showPage(pageId) {
    Object.values(pages).forEach(page => {
      if (page) page.style.display = 'none';
    });
    if (pages[pageId]) {
      pages[pageId].style.display = 'block';
    }
  }

  if (navMain) navMain.addEventListener('click', () => showPage('nav-main'));
  if (navAbout) navAbout.addEventListener('click', () => showPage('nav-about'));
  if (navPortfolio) navPortfolio.addEventListener('click', () => showPage('nav-portfolio'));
  if (navAudioPlayer) navAudioPlayer.addEventListener('click', () => showPage('nav-audio-player'));
  if (navChess) navChess.addEventListener('click', () => showPage('nav-chess'));
  if (navSettings) navSettings.addEventListener('click', () => showPage('nav-settings'));

  showPage('nav-main'); 

  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    if (link) {
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
    }
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
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 200); 
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const textElements = document.querySelectorAll('.reveal-text');
  textElements.forEach(el => observer.observe(el));

  // Audio Player Controls
  window.currentPlaylist = ['sample.mp3'];
  window.currentIndex = 0;

  const player = document.getElementById('audio-player');
  const masterPlayBtn = document.getElementById('master-play-btn');
  const skipForwardBtn = document.getElementById('skip-forward-btn');
  const skipBackwardsBtn = document.getElementById('skip-backwards-btn');
  const skipPreviousBtn = document.getElementById('skip-previous-btn');
  const skipNextBtn = document.getElementById('skip-next-btn');
  const progressBar = document.getElementById('progress-bar');
  const volumeSlider = document.getElementById('volume-slider');
  const currentTimeText = document.getElementById('current-time');
  const totalTimeText = document.getElementById('total-duration');
  const closeAudioPlayer = document.getElementById('close-audio-player');
  const volumeBtn = document.getElementById('volume-btn');
  const volumeContainer = document.querySelector('.volume-slider-container');

  if (volumeBtn && volumeContainer) {
      volumeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          volumeContainer.classList.toggle('active');
      });

      volumeContainer.addEventListener('click', (e) => {
          e.stopPropagation();
      });

      document.addEventListener('click', () => {
          volumeContainer.classList.remove('active');
      });
  }

  function formatTime(secs) {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  if (player) {
    skipForwardBtn?.addEventListener('click', () => {
        if (player.src) {
            player.currentTime = Math.min(player.currentTime + 10, player.duration);
        }
    });

    skipBackwardsBtn?.addEventListener('click', () => {
        if (player.src) {
            player.currentTime = Math.max(player.currentTime - 10, 0);
        }
    });

    skipPreviousBtn?.addEventListener('click', () => {
        const win = window;
        const playlist = win.currentPlaylist || [];
        if (!playlist || playlist.length === 0) return;

        let idx = typeof win.currentIndex === 'number' ? win.currentIndex : -1;

        if (idx === -1) {
            try {
                const src = decodeURI(player.src || '').replace('local-file://', '');
                idx = playlist.findIndex(p => src.includes(p));
            } catch (e) {
                idx = -1;
            }
        }

        if (idx > 0) {
            const prevIdx = idx - 1;
            win.currentIndex = prevIdx;
            const prev = playlist[prevIdx];
            player.src = `local-file://${prev.replace(/\\/g, '/')}`;
            player.play().catch((err) => console.error('Playback failed:', err));
        } else {
            win.currentIndex = -1;
        }
    });

    skipNextBtn?.addEventListener('click', () => {
        const win = window;
        const playlist = win.currentPlaylist || [];
        if (!playlist || playlist.length === 0) return;

        let idx = typeof win.currentIndex === 'number' ? win.currentIndex : -1;

        if (idx === -1) {
            try {
                const src = decodeURI(player.src || '').replace('local-file://', '');
                idx = playlist.findIndex(p => src.includes(p));
            } catch (e) {
                idx = -1;
            }
        }

        if (idx >= 0 && idx < playlist.length - 1) {
            const nextIdx = idx + 1;
            win.currentIndex = nextIdx;
            const next = playlist[nextIdx];
            player.src = `local-file://${next.replace(/\\/g, '/')}`;
            player.play().catch((err) => console.error('Playback failed:', err));
        } else {
            win.currentIndex = -1;
        }
    });

    masterPlayBtn?.addEventListener('click', () => {
        if (player.paused) {
            player.play();
            masterPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            player.pause();
            masterPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    player.addEventListener('timeupdate', () => {
        if (player.duration) {
            const percent = (player.currentTime / player.duration) * 100;
            if (progressBar) progressBar.value = percent.toString();
        }
        if (currentTimeText) currentTimeText.innerText = formatTime(player.currentTime);
    });

    progressBar?.addEventListener('input', () => {
        if (player.duration) {
            const seekTo = player.duration * (parseFloat(progressBar.value) / 100);
            player.currentTime = seekTo;
        }
    });

    volumeSlider?.addEventListener('input', () => {
        player.volume = parseFloat(volumeSlider.value) / 100;
    });

    player.addEventListener('loadedmetadata', () => {
        if (totalTimeText) totalTimeText.innerText = formatTime(player.duration);
    });

    player.addEventListener('ended', () => {
        const win = window;
        const playlist = win.currentPlaylist || [];
        if (!playlist || playlist.length === 0) return;

        let idx = typeof win.currentIndex === 'number' ? win.currentIndex : -1;

        if (idx === -1) {
            try {
                const src = decodeURI(player.src || '').replace('local-file://', '');
                idx = playlist.findIndex(p => src.includes(p));
            } catch (e) {
                idx = -1;
            }
        }

        if (idx >= 0 && idx < playlist.length - 1) {
            const nextIdx = idx + 1;
            win.currentIndex = nextIdx;
            const next = playlist[nextIdx];
            player.src = `local-file://${next.replace(/\\/g, '/')}`;
            player.play().catch((err) => console.error('Playback failed:', err));
        } else {
            win.currentIndex = -1;
        }
    });
  }

  closeAudioPlayer?.addEventListener('click', () => {
      const container = document.querySelector('.player-container');
      if (container) container.style.display = 'none';
      if (player) player.pause();
  });

  function switchLanguage(lang) {
      const englishSection = document.getElementById('english-aboutme');
      const latvianSection = document.getElementById('latvian-aboutme');
      const englishSectionMain = document.getElementById('english-main');
      const latvianSectionMain = document.getElementById('latvian-main');

      if (!englishSection || !latvianSection || !latvianSectionMain || !englishSectionMain) return;

      if (lang === 'lv') {
          englishSection.style.display = 'none';
          englishSectionMain.style.display = 'none';
          latvianSection.style.display = 'block';
          latvianSectionMain.style.display = 'block';
      } else {
          latvianSection.style.display = 'none';
          latvianSectionMain.style.display = 'none';
          englishSection.style.display = 'block';
          englishSectionMain.style.display = 'block';
      }
  }
});