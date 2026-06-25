import { initNav } from "./nav.js";
import { initAudioPlayer } from "./audio.js";
import { initImporter } from "./importer.js";

document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initAudioPlayer();
    initImporter();
});