export let musicFiles = [];
export let currentIndex = 0;

export function initAudioPlayer() {
    const player       = document.getElementById('audio-player');
    const masterPlayBtn= document.getElementById('master-play-btn');
    const skipFwdBtn   = document.getElementById('skip-forward-btn');
    const skipBwdBtn   = document.getElementById('skip-backwards-btn');
    const skipPrevBtn  = document.getElementById('skip-previous-btn');
    const skipNextBtn  = document.getElementById('skip-next-btn');
    const progressBar  = document.getElementById('progress-bar');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeEl= document.getElementById('current-time');
    const totalTimeEl  = document.getElementById('total-duration');
    const closeBtn     = document.getElementById('close-audio-player');
    const volumeBtn    = document.getElementById('volume-btn');
    const volumeContainer = document.querySelector('.volume-slider-container');

    if (!player) return;

    // Volume toggle
    volumeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        volumeContainer?.classList.toggle('active');
    });
    volumeContainer?.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => volumeContainer?.classList.remove('active'));

    function formatTime(secs) {
        if (isNaN(secs)) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function playSong(index) {
        if (!musicFiles[index]) return;
        currentIndex = index;
        const url = URL.createObjectURL(musicFiles[index].blob ?? musicFiles[index]);
        player.src = url;
        player.play();
        masterPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }

    // Expose playSong so importer.js can call it
    window._playSong = playSong;
    window._getMusicFiles = () => musicFiles;
    window._setMusicFiles = (files) => { musicFiles.length = 0; musicFiles.push(...files); };

    skipFwdBtn?.addEventListener('click', () => {
        player.currentTime = Math.min(player.currentTime + 10, player.duration || 0);
    });

    skipBwdBtn?.addEventListener('click', () => {
        player.currentTime = Math.max(player.currentTime - 10, 0);
    });

    skipPrevBtn?.addEventListener('click', () => {
        if (currentIndex > 0) playSong(currentIndex - 1);
    });

    skipNextBtn?.addEventListener('click', () => {
        if (currentIndex < musicFiles.length - 1) playSong(currentIndex + 1);
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
        if (player.duration && progressBar) {
            progressBar.value = ((player.currentTime / player.duration) * 100).toString();
        }
        if (currentTimeEl) currentTimeEl.innerText = formatTime(player.currentTime);
    });

    progressBar?.addEventListener('input', () => {
        if (player.duration) {
            player.currentTime = player.duration * (parseFloat(progressBar.value) / 100);
        }
    });

    volumeSlider?.addEventListener('input', () => {
        player.volume = parseFloat(volumeSlider.value) / 100;
    });

    player.addEventListener('loadedmetadata', () => {
        if (totalTimeEl) totalTimeEl.innerText = formatTime(player.duration);
    });

    player.addEventListener('ended', () => {
        if (currentIndex < musicFiles.length - 1) playSong(currentIndex + 1);
    });

    closeBtn?.addEventListener('click', () => {
        const container = document.querySelector('.player-container');
        if (container) container.style.display = 'none';
        player.pause();
    });
}