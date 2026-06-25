// db.js — IndexedDB wrapper for the audio player

const DB_NAME = "AudioPlayerDB";
const DB_VERSION = 2;

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
            const db = e.target.result;

            // Songs store — stores file blob + metadata
            if (!db.objectStoreNames.contains("songs")) {
                const songs = db.createObjectStore("songs", { keyPath: "id", autoIncrement: true });
                songs.createIndex("name", "name", { unique: true });
            }

            // Playlists store
            if (!db.objectStoreNames.contains("playlists")) {
                const playlists = db.createObjectStore("playlists", { keyPath: "id", autoIncrement: true });
                playlists.createIndex("name", "name", { unique: true });
            }

            // playlist_songs — join table (playlistId, songId, order)
            if (!db.objectStoreNames.contains("playlist_songs")) {
                const ps = db.createObjectStore("playlist_songs", { keyPath: "id", autoIncrement: true });
                ps.createIndex("playlistId", "playlistId", { unique: false });
                ps.createIndex("songId", "songId", { unique: false });
            }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// ── Songs ──────────────────────────────────────────────

export async function addSong(file) {
    const db = await openDB();

    // Extract metadata from the filename as a baseline
    const name = file.name.replace(/\.[^.]+$/, ""); // strip extension
    const thumbnail = await extractThumbnail(file);  // null if none found

    const song = {
        name,
        filename: file.name,
        blob: file,                    // store the actual file blob
        thumbnail,                     // ArrayBuffer or null
        duration: null,                // filled in later after audio loads
        artist: null,
        album: null,
        addedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction("songs", "readwrite");
        const req = tx.objectStore("songs").add(song);
        req.onsuccess = () => resolve(req.result); // returns new id
        req.onerror = () => {
            if (req.error.name === "ConstraintError") {
                resolve(null); // already exists
            } else {
                reject(req.error);
            }
        };
    });
}

export async function getAllSongs() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("songs", "readonly");
        const req = tx.objectStore("songs").getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function getSong(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("songs", "readonly");
        const req = tx.objectStore("songs").get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function deleteSong(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("songs", "readwrite");
        const req = tx.objectStore("songs").delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

export async function updateSongMeta(id, updates) {
    const db = await openDB();
    return new Promise(async (resolve, reject) => {
        const tx = db.transaction("songs", "readwrite");
        const store = tx.objectStore("songs");
        const getReq = store.get(id);
        getReq.onsuccess = () => {
            const song = { ...getReq.result, ...updates };
            const putReq = store.put(song);
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
    });
}

// ── Playlists ──────────────────────────────────────────

export async function createPlaylist(name) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("playlists", "readwrite");
        const req = tx.objectStore("playlists").add({ name, createdAt: Date.now() });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function getAllPlaylists() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("playlists", "readonly");
        const req = tx.objectStore("playlists").getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function deletePlaylist(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(["playlists", "playlist_songs"], "readwrite");
        tx.objectStore("playlists").delete(id);

        // also remove all songs linked to this playlist
        const psStore = tx.objectStore("playlist_songs");
        const index = psStore.index("playlistId");
        const req = index.openCursor(IDBKeyRange.only(id));
        req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) { cursor.delete(); cursor.continue(); }
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function addSongToPlaylist(playlistId, songId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("playlist_songs", "readwrite");
        const req = tx.objectStore("playlist_songs").add({ playlistId, songId, addedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

export async function getSongsInPlaylist(playlistId) {
    const db = await openDB();
    return new Promise(async (resolve, reject) => {
        const tx = db.transaction(["playlist_songs", "songs"], "readonly");
        const psIndex = tx.objectStore("playlist_songs").index("playlistId");
        const req = psIndex.getAll(IDBKeyRange.only(playlistId));

        req.onsuccess = async () => {
            const entries = req.result;
            const songStore = tx.objectStore("songs");
            const songs = await Promise.all(
                entries.map(e => new Promise((res, rej) => {
                    const r = songStore.get(e.songId);
                    r.onsuccess = () => res(r.result);
                    r.onerror = () => rej(r.error);
                }))
            );
            resolve(songs.filter(Boolean));
        };
        req.onerror = () => reject(req.error);
    });
}

// ── Thumbnail extraction ───────────────────────────────
// Tries to pull embedded art from ID3 tags (MP3 only, basic implementation)
// Returns a Blob URL string or null

async function extractThumbnail(file) {
    if (!file.name.endsWith(".mp3")) return null;

    try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        // Look for ID3v2 header
        if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return null;

        const id3Size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) |
                        ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);

        let offset = 10;
        while (offset < id3Size + 10) {
            const frameId = String.fromCharCode(bytes[offset], bytes[offset+1], bytes[offset+2], bytes[offset+3]);
            const frameSize = (bytes[offset+4] << 24) | (bytes[offset+5] << 16) |
                              (bytes[offset+6] << 8) | bytes[offset+7];

            if (frameId === "APIC") {
                // Skip text encoding byte + mime type + null + picture type + description + null
                let dataOffset = offset + 10;
                while (bytes[dataOffset] !== 0) dataOffset++; // skip mime
                dataOffset++; // skip null
                dataOffset++; // skip picture type
                while (bytes[dataOffset] !== 0) dataOffset++; // skip description
                dataOffset++; // skip null

                const imgData = bytes.slice(dataOffset, offset + 10 + frameSize);
                const blob = new Blob([imgData], { type: "image/jpeg" });
                return URL.createObjectURL(blob);
            }

            offset += 10 + frameSize;
            if (frameSize === 0) break;
        }
    } catch (e) {
        console.warn("Thumbnail extraction failed:", e);
    }

    return null;
}

