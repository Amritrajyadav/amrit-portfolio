
const screenshots = [
    "img/projects/admin-dashboard.png",
    "img/projects/course-page.png",
    "img/projects/login-page.png",
    "img/projects/register-page.png",
    "img/projects/student-dashboard.png",
    "img/projects/teacher-dashboard.png"
];

let currentImage = 0;

function changeProjectImage(direction) {
    currentImage += direction;

    if (currentImage < 0) currentImage = screenshots.length - 1;
    if (currentImage >= screenshots.length) currentImage = 0;

    const img = document.getElementById("projectScreenshot");
    if (img) img.src = screenshots[currentImage];
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("open");
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
    const backToTop = document.getElementById("backToTop");

    window.addEventListener("scroll", () => {
        if (!backToTop) return;
        backToTop.style.display = window.scrollY > 400 ? "block" : "none";
    });

    document.querySelectorAll(".sidebar nav a").forEach(link => {
        link.addEventListener("click", () => {
            const sidebar = document.getElementById("sidebar");
            if (sidebar) sidebar.classList.remove("open");
        });
    });
});
