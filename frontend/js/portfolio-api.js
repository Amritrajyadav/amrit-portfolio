(function () {
  const API_BASE = window.API_BASE_URL || "https://amrit-portfolio-91v1.onrender.com";

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

  // external link
  if (url.startsWith("http")) {
    return url;
  }

  // uploads folder
  if (url.startsWith("/uploads")) {
    return API_BASE + url;
  }

  // uploads without slash
  if (url.startsWith("uploads")) {
    return API_BASE + "/" + url;
  }

  // local download folder
  if (url.startsWith("download/")) {
    return url;
  }

  return url;
}
  async function loadPortfolio() {
    try {
      const res = await fetch(API_BASE + "/api/portfolio");
      if (!res.ok) return;

      const json = await res.json();
      if (!json.success) return;

      const data = json.data || {};

      applyProfile(data.profile || {});
      applyAbout(data.about || "");
      applyResume(data.resumeUrl || "", data.resumeNote || "");
      renderSkills(data.skills || []);
      renderMainProject(data.projects || []);
      renderCertificates(data.certificates || []);
      renderDynamicUpdates(data);

    } catch (error) {
      console.error("Portfolio API load error:", error);
    }
  }

  function applyProfile(p) {
    const profileImage = document.getElementById("profileImageEl");
    if (profileImage && p.image) {
      profileImage.src = fullUrl(p.image);
    }

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
        a.textContent = "Email: " + p.email;
      }
    });

    const githubLink = document.querySelector('.contact-info a[href*="github"]');
    if (githubLink && p.github) {
      githubLink.href = p.github;
      githubLink.textContent = "GitHub: " + p.github;
    }
  }

  function applyAbout(text) {
    const aboutBox = document.querySelector(".about-text");
    if (aboutBox && text) {
      aboutBox.innerHTML = `<p>${esc(text)}</p>`;
    }
  }

 function applyResume(url, note) {

  if (url) {

    let resumeUrl = fullUrl(url);

    // Local iframe fix
    resumeUrl = resumeUrl.replace(
      "http://127.0.0.1:5000",
      "https://amrit-portfolio-91v1.onrender.com"
    );

    // Resume buttons
    const resumeDownloadBtn = document.getElementById("resumeDownloadBtn");
    const resumeViewBtn = document.getElementById("resumeViewBtn");

   if (resumeDownloadBtn) {
      resumeDownloadBtn.href = encodeURI(resumeUrl);
    }

    if (resumeViewBtn) {
      resumeViewBtn.href = encodeURI(resumeUrl);
    }

    // Old static resume links
    document
      .querySelectorAll(
        'a[href*="Amrit_Raj_Resume.pdf"], a[href*="Amrit_Raj (updated).pdf"]'
      )
      .forEach(a => {
        a.href = resumeUrl;
      });

    // Resume preview iframe
    const frame = document.querySelector(".resume-preview-box iframe");

    if (frame) {
      console.log("RESUME IFRAME URL:", resumeUrl);
      frame.src = encodeURI(resumeUrl);
    }
  }

  // Resume note
  const resumeCardText = document.querySelector(".resume-card p");

  if (resumeCardText && note) {
    resumeCardText.textContent = note;
  }
}

  function renderSkills(skills) {
    if (!skills.length) return;

    const grid = document.querySelector(".skill-grid");
    if (!grid) return;

    grid.innerHTML = skills.map(skill => `
      <div class="skill-card reveal active">
        <h3>${esc(skill.title)}</h3>
        <p>${esc(skill.description)}</p>
      </div>
    `).join("");
  }

  function renderMainProject(projects) {
    if (!projects.length) return;

    const project = projects[0];

    const img = document.getElementById("projectImage");
    if (img && project.image) {
      img.src = fullUrl(project.image);
    }

    const title = document.querySelector(".project-content h3");
    if (title && project.title) title.textContent = project.title;

    const desc = document.querySelector(".project-content p");
    if (desc && project.description) desc.textContent = project.description;

    const stack = document.querySelector(".stack p");
    if (stack && project.stack) stack.textContent = project.stack;

    const btnBox = document.querySelector(".project-buttons");
    if (btnBox) {
      btnBox.innerHTML = `
        ${project.liveUrl ? `<a href="${esc(project.liveUrl)}" target="_blank" class="btn primary">Live Demo</a>` : ""}
        ${project.githubUrl ? `<a href="${esc(project.githubUrl)}" target="_blank" class="btn secondary">GitHub</a>` : ""}
        <button class="btn ghost" onclick="openProjectModal()">Details</button>
      `;
    }
  }

  function renderCertificates(certificates) {
    if (!certificates.length) return;

    const grid = document.querySelector(".certificate-grid");
    if (!grid) return;

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

    let html = "";

    (data.projects || []).forEach(p => {
      html += `
        <div class="skill-card reveal active">
          ${p.image ? `<img src="${fullUrl(p.image)}" alt="${esc(p.title)}">` : ""}
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          <p><strong>Tech:</strong> ${esc(p.stack)}</p>
        </div>
      `;
    });

    (data.skills || []).forEach(s => {
      html += `
        <div class="skill-card reveal active">
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.description)}</p>
        </div>
      `;
    });

    (data.certificates || []).forEach(c => {
      html += `
        <div class="skill-card reveal active">
          <h3>${esc(c.title)}</h3>
          <p>${esc(c.issuer)}</p>
        </div>
      `;
    });

    if (data.resumeNote) {
      html += `
        <div class="skill-card reveal active">
          <h3>Resume Update</h3>
          <p>${esc(data.resumeNote)}</p>
        </div>
      `;
    }

    container.innerHTML = html || `
      <div class="skill-card reveal active">
        <h3>No updates yet</h3>
        <p>Use admin dashboard to add custom projects, certificates and skills.</p>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", loadPortfolio);
})();