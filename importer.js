import { addSong, getAllSongs } from "./db.js";

function getPlaylistName(file) {
    const parts = file.webkitRelativePath.split("/");

    if (parts.length <= 2) {
        return null; // file is in root folder
    }

    return parts[1]; // first subfolder
}

export function initImporter() {
    const importBtn = document.getElementById("importBtn");
    if (!importBtn) return;

    getAllSongs().then(songs => {
        if (songs.length === 0) return;
        songs.sort((a, b) => a.name.localeCompare(b.name));
        window._setMusicFiles(songs);
        renderSongList(songs);
        console.log(songs)
    });

    importBtn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = "audio/*";
        input.webkitdirectory = true;

        input.addEventListener("change", async () => {
            const files = [...input.files].filter(f =>
                /\.(mp3|wav|ogg|flac|m4a)$/i.test(f.name)
            );

            console.log("Files found:", files.length);

           for (const file of files) {
                const playlistName = getPlaylistName(file);

                console.log(
                    file.webkitRelativePath,
                    "-> playlist:",
                    playlistName
                );

                await addSong(file);
            }

            const allSongs = await getAllSongs();
            allSongs.sort((a, b) => a.name.localeCompare(b.name));

            window._setMusicFiles(allSongs);
            renderSongList(allSongs);

            if (allSongs.length > 0) {
                window._playSong(0);
            }
        });

        input.click();
    });
}

function renderSongList(songs) {
    const list = document.getElementById("song-list");
    if (!list) return;

    list.innerHTML = "";

    songs.forEach((song, index) => {
        const item = document.createElement("div");
        item.className = "song-item";
        item.dataset.index = index;

        const thumb = document.createElement("div");
        thumb.className = "song-thumb";
        if (song.thumbnail) {
            const img = document.createElement("img");
            img.src = song.thumbnail;
            thumb.appendChild(img);
        } else {
            thumb.innerHTML = '<i class="fas fa-music"></i>';
        }

        const info = document.createElement("div");
        info.className = "song-info";
        info.innerHTML = `<span class="song-name">${song.name}</span>`;

        item.appendChild(thumb);
        item.appendChild(info);

        item.addEventListener("click", () => {
            document.querySelectorAll(".song-item").forEach(el => el.classList.remove("active"));
            item.classList.add("active");
            window._playSong(index);
        });

        list.appendChild(item);
    });
}