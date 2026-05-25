(function () {
  const API_BASE = window.API_BASE_URL || "https://amrit-portfolio-xhbh.onrender.com";

  const esc = (s = "") =>
    String(s).replace(/[&<>'"]/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[c]));

  function fullUrl(url) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads")) return API_BASE + url;
    if (url.startsWith("uploads")) return API_BASE + "/" + url;
    return url;
  }

  async function loadPortfolio() {
    try {
      const res = await fetch(API_BASE + "/api/portfolio");
      const json = await res.json();

      if (!json.success) return;

      const data = json.data || {};

      applyProfile(data.profile || {});
      applyAbout(data.about || "");
      applyResume(data.resumeUrl || "", data.resumeNote || "");
      renderSkills(data.skills || []);
      renderProjects(data.projects || []);
      renderCertificates(data.certificates || []);
      renderDynamicUpdates(data);
    } catch (error) {
      console.error("Portfolio API load error:", error);
    }
  }

  function applyProfile(p) {
    const img = document.getElementById("profileImageEl");
    if (img && p.image) img.src = fullUrl(p.image);

    document.querySelectorAll(".profile-box h2").forEach(el => {
      if (p.name) el.textContent = p.name;
    });

    document.querySelectorAll(".profile-box p").forEach(el => {
      if (p.title) el.textContent = p.title;
    });

    const heroName = document.querySelector(".hero-text h1 span");
    if (heroName && p.name) heroName.textContent = p.name;

    const heroRole = document.querySelector(".hero-text h2");
    if (heroRole && p.title) heroRole.textContent = p.title;

    const aboutInfo = document.querySelector(".about-info");
    if (aboutInfo) {
      aboutInfo.innerHTML = `
        <div><strong>Name:</strong> ${esc(p.name || "Amrit Raj")}</div>
        <div><strong>Role:</strong> ${esc(p.title || "Full Stack Web Developer")}</div>
        <div><strong>Email:</strong> ${esc(p.email || "amritrajyadav7@gmail.com")}</div>
        <div><strong>Phone:</strong> ${esc(p.phone || "")}</div>
        <div><strong>Location:</strong> ${esc(p.location || "India")}</div>
      `;
    }

    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      if (p.email) {
        a.href = "mailto:" + p.email;
        a.textContent = a.closest(".socials") ? "✉" : "Email: " + p.email;
      }
    });

    document.querySelectorAll(".socials a").forEach(a => {
      const txt = a.textContent.trim().toLowerCase();

      if (txt === "gh" && p.github) {
        a.href = p.github;
      }

      if (txt === "in" && p.linkedin) {
        a.href = p.linkedin;
      }
    });

    const contactGithub = document.querySelector('.contact-info a[href*="github"]');
    if (contactGithub && p.github) {
      contactGithub.href = p.github;
      contactGithub.textContent = "GitHub: " + p.github;
    }

    const contactLinkedin = Array.from(document.querySelectorAll(".contact-info a"))
      .find(a => a.textContent.toLowerCase().includes("linkedin"));

    if (contactLinkedin && p.linkedin) {
      contactLinkedin.href = p.linkedin;
      contactLinkedin.textContent = "LinkedIn: " + p.linkedin;
      contactLinkedin.target = "_blank";
    }
  }

  function applyAbout(text) {
    const box = document.querySelector(".about-text");
    if (box && text) box.innerHTML = `<p>${esc(text)}</p>`;
  }

  function applyResume(url, note) {
    const resumeUrl = fullUrl(url);

    if (resumeUrl) {
      const downloadBtn = document.getElementById("resumeDownloadBtn");
      const viewBtn = document.getElementById("resumeViewBtn");
      const frame = document.getElementById("resumeFrame");

      if (downloadBtn) downloadBtn.href = encodeURI(resumeUrl);
      if (viewBtn) viewBtn.href = encodeURI(resumeUrl);
      if (frame) frame.src = encodeURI(resumeUrl);
    }

    const resumeText = document.querySelector(".resume-card p");
    if (resumeText && note) resumeText.textContent = note;
  }

  function renderSkills(skills) {
    const grid = document.querySelector(".skill-grid");
    if (!grid || !skills.length) return;

    grid.innerHTML = skills.map(skill => `
      <div class="skill-card reveal active">
        <h3>${esc(skill.title)}</h3>
        <p>${esc(skill.description)}</p>
      </div>
    `).join("");
  }

  function renderProjects(projects) {
    if (!projects.length) return;

    const first = projects[0];

    const img = document.getElementById("projectImage");
    if (img && first.image) img.src = fullUrl(first.image);

    const title = document.querySelector(".project-content h3");
    if (title) title.textContent = first.title || "Project";

    const desc = document.querySelector(".project-content p");
    if (desc) desc.textContent = first.description || "";

    const stack = document.querySelector(".stack p");
    if (stack) stack.textContent = first.stack || "";

    const btnBox = document.querySelector(".project-buttons");
    if (btnBox) {
      btnBox.innerHTML = `
        ${first.liveUrl ? `<a href="${esc(first.liveUrl)}" target="_blank" class="btn primary">Live Demo</a>` : ""}
        ${first.githubUrl ? `<a href="${esc(first.githubUrl)}" target="_blank" class="btn secondary">GitHub</a>` : ""}
        <button class="btn ghost" onclick="openProjectModal()">Details</button>
      `;
    }
  }

  function renderCertificates(certificates) {
    const grid = document.querySelector(".certificate-grid");
    if (!grid || !certificates.length) return;

    grid.innerHTML = certificates.map(cert => `
      <div class="certificate-card reveal active">
        ${cert.image ? `<img src="${fullUrl(cert.image)}" alt="${esc(cert.title)}">` : ""}
        <h3>${esc(cert.title)}</h3>
        <p>${esc(cert.issuer)}</p>
        ${cert.date ? `<p>${esc(cert.date)}</p>` : ""}
        ${cert.url ? `<a href="${esc(cert.url)}" target="_blank" class="btn secondary">View Certificate</a>` : ""}
      </div>
    `).join("");
  }

  function renderDynamicUpdates(data) {
    const container = document.getElementById("adminDynamicGrid");
    if (!container) return;

    const items = [];

    (data.projects || []).forEach(p => {
      items.push(`
        <div class="skill-card reveal active">
          ${p.image ? `<img src="${fullUrl(p.image)}" alt="${esc(p.title)}">` : ""}
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          <p><strong>Tech:</strong> ${esc(p.stack)}</p>
          ${p.liveUrl ? `<a href="${esc(p.liveUrl)}" target="_blank" class="btn primary">Live Demo</a>` : ""}
          ${p.githubUrl ? `<a href="${esc(p.githubUrl)}" target="_blank" class="btn secondary">GitHub</a>` : ""}
        </div>
      `);
    });

    (data.skills || []).forEach(s => {
      items.push(`
        <div class="skill-card reveal active">
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.description)}</p>
        </div>
      `);
    });

    (data.certificates || []).forEach(c => {
      items.push(`
        <div class="skill-card reveal active">
          <h3>${esc(c.title)}</h3>
          <p>${esc(c.issuer)}</p>
        </div>
      `);
    });

    container.innerHTML = items.join("") || `
      <div class="skill-card reveal active">
        <h3>No updates yet</h3>
        <p>Use admin dashboard to add custom projects, certificates and skills.</p>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", loadPortfolio);
})();