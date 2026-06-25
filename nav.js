export function initNav() {
    const pages = {
        'nav-main':         document.getElementById('page-main'),
        'nav-about':        document.getElementById('page-about'),
        'nav-portfolio':    document.getElementById('page-portfolio'),
        'nav-audio-player': document.getElementById('page-audio-player'),
        'nav-settings':     document.getElementById('page-settings'),
        'nav-weather':      document.getElementById('page-weather'),
        'nav-spaceinvaders':document.getElementById('page-spaceinvaders'),
    };

    function showPage(pageId) {
        Object.values(pages).forEach(page => {
            if (page) page.style.display = 'none';
        });
        if (pages[pageId]) pages[pageId].style.display = 'block';
    }

    function bindNav(id, pageId, extra) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('click', () => {
            showPage(pageId);
            if (extra) extra();
        });
    }

    function toggleAudioPlayer() {
        const container = document.querySelector('.player-container');
        if (!container) return;
        container.style.display = container.style.display === 'block' ? 'none' : 'block';
    }

    bindNav('nav-main',         'nav-main');
    bindNav('nav-about',        'nav-about');
    bindNav('nav-portfolio',    'nav-portfolio');
    bindNav('nav-audio-player', 'nav-audio-player', toggleAudioPlayer);
    bindNav('nav-weather',      'nav-weather');
    bindNav('nav-spaceinvaders','nav-spaceinvaders');
    bindNav('nav-settings',     'nav-settings');

    showPage('nav-main');

    // Mobile dropdowns
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        if (!link) return;
        link.addEventListener('click', (e) => {
            if (window.innerWidth > 768) return;
            e.preventDefault();
            dropdowns.forEach(other => {
                if (other !== dropdown) other.classList.remove('active');
            });
            dropdown.classList.toggle('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sidebar') && window.innerWidth <= 768) {
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });

    // Language switching
    const latvianToggle = document.getElementById('toggle-latvian');
    const englishToggle = document.getElementById('toggle-english');

    function switchLanguage(lang) {
        const show = (id) => { const el = document.getElementById(id); if (el) el.style.display = 'block'; };
        const hide = (id) => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };

        if (lang === 'lv') {
            hide('english-aboutme'); hide('english-main');
            show('latvian-aboutme'); show('latvian-main');
        } else {
            hide('latvian-aboutme'); hide('latvian-main');
            show('english-aboutme'); show('english-main');
        }
    }

    latvianToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        switchLanguage('lv');
        if (window.innerWidth <= 768) latvianToggle.closest('.dropdown')?.classList.remove('active');
    });

    englishToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        switchLanguage('en');
        if (window.innerWidth <= 768) englishToggle.closest('.dropdown')?.classList.remove('active');
    });

    // Reveal text observer
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 200);
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, threshold: 0.3 });

    document.querySelectorAll('.reveal-text').forEach(el => observer.observe(el));
}