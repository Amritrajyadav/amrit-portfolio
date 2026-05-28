
const projectSlides = [
    "img/projects/admin-dashboard.png",
    "img/projects/course-page.png",
    "img/projects/login-page.png",
    "img/projects/register-page.png",
    "img/projects/student-dashboard.png",
    "img/projects/teacher-dashboard.png"
];

let slideIndex = 0;

function changeProjectSlide(direction) {
    slideIndex += direction;
    if (slideIndex < 0) slideIndex = projectSlides.length - 1;
    if (slideIndex >= projectSlides.length) slideIndex = 0;

    const image = document.getElementById("projectImage");
    if (image) image.src = projectSlides[slideIndex];
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("open");
}

function openProjectModal() {
    const modal = document.getElementById("projectModal");
    if (modal) modal.classList.add("show");
}

function closeProjectModal() {
    const modal = document.getElementById("projectModal");
    if (modal) modal.classList.remove("show");
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function sendMessage(event) {
    event.preventDefault();
    const msg = document.getElementById("formMessage");
    if (msg) {
        msg.textContent = "Thanks! Contact form UI is ready. Connect EmailJS/Formspree for real messages.";
        msg.style.color = "#86efac";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const backToTop = document.getElementById("backToTop");
    const cursor = document.getElementById("cursorDot");
    const reveals = document.querySelectorAll(".reveal");
    const navLinks = document.querySelectorAll(".side-nav a");

    function revealOnScroll() {
        reveals.forEach(el => {
            const top = el.getBoundingClientRect().top;
            if (top < window.innerHeight - 80) {
                el.classList.add("active");
            }
        });

        if (backToTop) {
            backToTop.style.display = window.scrollY > 450 ? "block" : "none";
        }
    }

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();

    document.addEventListener("mousemove", (e) => {
        if (!cursor) return;
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
    });

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            document.getElementById("sidebar").classList.remove("open");
        });
    });

    const modal = document.getElementById("projectModal");
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeProjectModal();
        });
    }
});

/* ===== Advanced selected features JS ===== */

// Loader
window.addEventListener("load", () => {
    setTimeout(() => {
        const loader = document.getElementById("portfolioLoader");
        if (loader) loader.style.display = "none";
    }, 900);
});

setTimeout(() => {
    const loader = document.getElementById("portfolioLoader");
    if (loader) loader.style.display = "none";
}, 2500);

// Sound effects
let soundEnabled = true;
const soundToggle = document.getElementById("soundToggle");

function playClickSound() {
    if (!soundEnabled) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        oscillator.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.frequency.value = 420;
        gain.gain.value = 0.025;
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
}

document.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("a")) playClickSound();
});

if (soundToggle) {
    soundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = soundEnabled ? "🔊" : "🔇";
    });
}

// Hindi / English toggle
let hindiMode = false;
const langToggle = document.getElementById("langToggle");

if (langToggle) {
    langToggle.addEventListener("click", () => {
        hindiMode = !hindiMode;
        langToggle.textContent = hindiMode ? "EN" : "हिंदी";

        const heroTitle = document.querySelector(".hero-text h2");
        const heroPara = document.querySelector(".hero-text p");

        if (heroTitle && heroPara) {
            if (hindiMode) {
                heroTitle.textContent = "फुल स्टैक वेब डेवलपर";
                heroPara.textContent = "मैं HTML, CSS, JavaScript, Node.js, Express.js और MySQL का उपयोग करके practical web applications बनाता हूं। मेरा मुख्य project EduPlatform LMS है।";
            } else {
                heroTitle.textContent = "Full Stack Developer | Data Analyst";
                heroPara.textContent = "I build clean, practical and responsive web applications using HTML, CSS, JavaScript, Node.js, Express.js and MySQL. My strongest project is EduPlatform, a full stack LMS.";
            }
        }
    });
}

// Terminal
function runTerminalCommand() {
    const input = document.getElementById("terminalInput");
    const body = document.getElementById("terminalBody");
    if (!input || !body) return;

    const command = input.value.trim().toLowerCase();
    let response = "Command not found. Try: skills, project, contact, resume";

    if (command.includes("skill")) {
        response = "Skills: HTML, CSS, JavaScript, Node.js, Express.js, MySQL, Git, GitHub";
    } else if (command.includes("project")) {
        response = "Main Project: EduPlatform - Full Stack LMS with dashboards, mock tests and certificates.";
    } else if (command.includes("contact")) {
        response = "Email: amritrajyadav7@gmail.com";
    } else if (command.includes("resume")) {
        response = "Resume is available in the Resume section. Click View Resume or Download Resume.";
    }

    body.innerHTML += `<p><b>$ ${command}</b></p><p>${response}</p>`;
    input.value = "";
    body.scrollTop = body.scrollHeight;
}

// Chatbot
function toggleChatbot() {
    const bot = document.getElementById("chatbotWidget");
    if (bot) bot.classList.toggle("show");
}

function sendChatbotMessage() {
    const input = document.getElementById("chatbotInput");
    const messages = document.getElementById("chatbotMessages");
    if (!input || !messages) return;

    const text = input.value.trim();
    if (!text) return;

    messages.innerHTML += `<p class="user-msg">${text}</p>`;

    const lower = text.toLowerCase();
    let reply = "You can ask about Amrit's skills, LMS project, resume or contact.";

    if (lower.includes("skill")) {
        reply = "Amrit works with HTML, CSS, JavaScript, Node.js, Express.js, MySQL, Git and GitHub.";
    } else if (lower.includes("project") || lower.includes("lms")) {
        reply = "His main project is EduPlatform, a full stack LMS with student, teacher and admin dashboards.";
    } else if (lower.includes("resume")) {
        reply = "You can view or download Amrit's resume from the Resume section.";
    } else if (lower.includes("contact") || lower.includes("email")) {
        reply = "You can contact Amrit at amritrajyadav7@gmail.com.";
    } else if (lower.includes("hello") || lower.includes("hi")) {
        reply = "Hello! I am Amrit's portfolio assistant.";
    }

    setTimeout(() => {
        messages.innerHTML += `<p class="bot-msg">${reply}</p>`;
        messages.scrollTop = messages.scrollHeight;
    }, 250);

    input.value = "";
}

// Contact form mail flow enhancement
function sendMessage(event) {
    event.preventDefault();

    const form = event.target;
    const name = form.querySelector('input[type="text"]')?.value || "";
    const email = form.querySelector('input[type="email"]')?.value || "";
    const message = form.querySelector("textarea")?.value || "";

    const subject = encodeURIComponent("Portfolio Contact from " + name);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

    window.location.href = `mailto:amritrajyadav7@gmail.com?subject=${subject}&body=${body}`;

    const msg = document.getElementById("formMessage");
    if (msg) {
        msg.textContent = "Opening email app...";
        msg.style.color = "#86efac";
    }
}

// Visitor counter
(function updateVisitorCounter(){
    const countEl = document.getElementById("visitorCount");
    const lastEl = document.getElementById("lastVisit");
    if (!countEl || !lastEl) return;

    let count = Number(localStorage.getItem("amrit_visitor_count") || 0);
    count += 1;
    localStorage.setItem("amrit_visitor_count", count);

    const now = new Date();
    localStorage.setItem("amrit_last_visit", now.toLocaleString());

    countEl.textContent = count;
    lastEl.textContent = now.toLocaleDateString();
})();

// 3D canvas animated background
(function canvasBackground(){
    const canvas = document.getElementById("spaceCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];

    function resize(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = Array.from({length: 70}, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            z: Math.random() * 2 + 0.4,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35
        }));
    }

    function animate(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p => {
            p.x += p.vx * p.z;
            p.y += p.vy * p.z;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x,p.y,p.z * 1.2,0,Math.PI*2);
            ctx.fillStyle = "rgba(96,165,250,.55)";
            ctx.fill();
        });

        for(let i=0;i<particles.length;i++){
            for(let j=i+1;j<particles.length;j++){
                const a = particles[i];
                const b = particles[j];
                const dx = a.x-b.x;
                const dy = a.y-b.y;
                const dist = Math.sqrt(dx*dx+dy*dy);
                if(dist < 120){
                    ctx.beginPath();
                    ctx.moveTo(a.x,a.y);
                    ctx.lineTo(b.x,b.y);
                    ctx.strokeStyle = `rgba(96,165,250,${0.14 - dist/900})`;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);
    resize();
    animate();
})();

/* ===== Final Premium 1-15 JS ===== */
document.addEventListener("DOMContentLoaded", () => {
    const heroTitle = document.querySelector(".hero-text h2");
    const heroPara = document.querySelector(".hero-text p");
    const langToggle = document.getElementById("langToggle");
    if (heroTitle) heroTitle.textContent = "Full Stack Developer | Data Analyst";
    if (heroPara) heroPara.textContent = "I build clean, practical and responsive web applications using HTML, CSS, JavaScript, Node.js, Express.js and MySQL. My strongest project is EduPlatform, a full stack LMS.";
    if (langToggle) langToggle.textContent = "हिंदी";
});
document.addEventListener("DOMContentLoaded", () => {
    const switcher = document.getElementById("themeSwitcher");

    function applyTheme(theme) {
        document.documentElement.classList.remove("theme-dark", "theme-light", "theme-blue", "theme-purple");
        document.body.classList.remove("theme-dark", "theme-light", "theme-blue", "theme-purple");

        document.documentElement.classList.add("theme-" + theme);
        document.body.classList.add("theme-" + theme);

        document.body.style.transition = "all 0.4s ease";

        localStorage.setItem("amrit_theme", theme);

        if (switcher) {
            switcher.value = theme;
        }
    }

    const savedTheme = localStorage.getItem("amrit_theme") || "dark";
    applyTheme(savedTheme);

    if (switcher) {
        switcher.addEventListener("change", () => {
            applyTheme(switcher.value);
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section[id]");
    const links = document.querySelectorAll(".side-nav a[href^='#']");
    function activateLink(){
        let current = "";
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if(window.scrollY >= top) current = section.id;
        });
        links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#" + current));
    }
    window.addEventListener("scroll", activateLink);
    activateLink();
});
function openCertificateModal(title, text){
    const modal = document.getElementById("certificateModal");
    const titleEl = document.getElementById("certModalTitle");
    const textEl = document.getElementById("certModalText");
    if(titleEl) titleEl.textContent = title || "Certificate Preview";
    if(textEl) textEl.textContent = text || "Certificate details.";
    if(modal) modal.classList.add("show");
}
function closeCertificateModal(){
    const modal = document.getElementById("certificateModal");
    if(modal) modal.classList.remove("show");
}
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".certificate-card").forEach(card => {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
            const title = card.querySelector("h3")?.textContent || "Certificate";
            const text = card.querySelector("p")?.textContent || "Certificate details";
            openCertificateModal(title, text);
        });
    });
});


function toggleLmsMute() {
  const video = document.getElementById("lmsDemoVideo");
  if (!video) return;
  video.muted = !video.muted;
}

function openLmsFullscreen() {
  const video = document.getElementById("lmsDemoVideo");
  if (!video) return;
  video.requestFullscreen?.();
}

function toggleDynamicMute(button) {
  const card = button.closest(".project-video-card");
  const video = card?.querySelector("video");
  if (!video) return;
  video.muted = !video.muted;
}

function openDynamicFullscreen(button) {
  const card = button.closest(".project-video-card");
  const video = card?.querySelector("video");
  if (!video) return;
  video.requestFullscreen?.();
}

.project-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(320px,1fr));
  gap:28px;
}

.project-card{
  background:rgba(15,23,42,.82);
  border:1px solid rgba(148,163,184,.18);
  border-radius:28px;
  overflow:hidden;
  max-width:520px;
  box-shadow:0 25px 80px rgba(0,0,0,.28);
}

.project-card img{
  width:100%;
  height:260px;
  object-fit:cover;
  display:block;
}

.project-card-content{
  padding:26px;
}

.project-card-content h3{
  font-size:28px;
  margin-bottom:14px;
}

.project-card-content p{
  color:#cbd5e1;
  line-height:1.7;
  font-size:16px;
}

.project-card-content .project-buttons{
  margin-top:22px;
  display:flex;
  gap:14px;
  flex-wrap:wrap;
}