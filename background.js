const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let resizeTimeout;

const particles = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;
}

window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        createParticles(Math.floor(width / height * 200));
    }, 300);
});

resize();

function createParticles(count) {
    particles.length = 0;
    console.log("Creating particles:", count);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 1.5, 
            vy: (Math.random() - 0.5) * 1.5
        });
    }
}

createParticles(Math.floor(width/height * 200));

function update() {
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
    }
}

function clear() {
    ctx.clearRect(0, 0, width, height);
}

function drawParticles() {
    ctx.fillStyle = "white";

    for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawLines() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];

            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = dx * dx + dy * dy;

            if (dist < 120 * 120) {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.29)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    clear();
    update();
    drawLines();
    drawParticles();

    requestAnimationFrame(animate);

}

animate();