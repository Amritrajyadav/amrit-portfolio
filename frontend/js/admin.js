const API_BASE = "https://amrit-portfolio-xhbh.onrender.com";
let portfolioData = null;

function token() {
  return localStorage.getItem("amrit_admin_token") || "";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token(),
  };
}

function showLogin(show) {
  document.getElementById("adminLoginOverlay")?.classList.toggle("hide", !show);
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>'"]/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[c]));
}

async function api(path, options = {}) {
  const url = API_BASE + path;
  console.log("API CALL:", url);

  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed: ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
}

async function loginAdmin() {
  const email = adminEmail.value.trim();
  const password = adminPassword.value;
  loginMsg.textContent = "";

  try {
    const result = await api("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("amrit_admin_token", result.token);
    showLogin(false);
    await loadAdminData();
  } catch (err) {
    loginMsg.textContent = err.message;
  }
}

function logoutAdmin() {
  localStorage.removeItem("amrit_admin_token");
  showLogin(true);
}

async function loadAdminData() {
  try {
    const result = await api("/api/admin/portfolio", {
      headers: authHeaders(),
    });

    portfolioData = result.data;
    fillForms();
    renderData();
    showLogin(false);
  } catch {
    showLogin(true);
  }
}

function fillForms() {
  const p = portfolioData.profile || {};

  profileName.value = p.name || "";
  profileRole.value = p.title || p.role || "";
  profileEmail.value = p.email || "";
  profilePhone.value = p.phone || "";
  profileLocation.value = p.location || "";
  profileGithub.value = p.github || "";
  profileLinkedin.value = p.linkedin || "";
  profileImage.value = p.image || "";

  aboutText.value = portfolioData.about || "";
  resumeNote.value = portfolioData.resumeNote || "";

  // ADD THIS
  const resumeStatus = document.getElementById("resumeStatus");

  resumeStatus.innerHTML = portfolioData.resumeUrl
  ? `<a href="${portfolioData.resumeUrl}" target="_blank">Current Resume</a>`
  : "No resume uploaded";
}

function renderData() {
  const data = portfolioData || {
    projects: [],
    skills: [],
    certificates: [],
  };

  projectCount.textContent = data.projects.length;
  skillCount.textContent = data.skills.length;
  certificateCount.textContent = data.certificates.length;

  let html = "";

  html += `<h2>Projects</h2>`;
  data.projects.forEach(item => {
    html += card("projects", item, `
      ${item.image ? `<img src="${escapeHtml(item.image)}" class="admin-preview-img">` : ""}
      <p>${escapeHtml(item.description)}</p>
      <p><strong>Tech:</strong> ${escapeHtml(item.stack)}</p>
      ${item.liveUrl ? `<p><a href="${escapeHtml(item.liveUrl)}" target="_blank">Live Demo</a></p>` : ""}
      ${item.githubUrl ? `<p><a href="${escapeHtml(item.githubUrl)}" target="_blank">GitHub</a></p>` : ""}
    `);
  });

  html += `<h2>Skills</h2>`;
  data.skills.forEach(item => {
    html += card("skills", item, `
      <p><strong>Category:</strong> ${escapeHtml(item.category)}</p>
      <p>${escapeHtml(item.description)}</p>
    `);
  });

  html += `<h2>Certificates</h2>`;
  data.certificates.forEach(item => {
    html += card("certificates", item, `
      ${item.image ? `<img src="${escapeHtml(item.image)}" class="admin-preview-img">` : ""}
      <p><strong>Issuer:</strong> ${escapeHtml(item.issuer)}</p>
      <p><strong>Date:</strong> ${escapeHtml(item.date)}</p>
      ${item.url ? `<p><a href="${escapeHtml(item.url)}" target="_blank">View Certificate</a></p>` : ""}
    `);
  });

  savedData.innerHTML = html || "<p>No saved data yet.</p>";
}

function card(type, item, body) {
  return `
    <div class="data-card">
      <h3>${escapeHtml(item.title)}</h3>
      ${body}
      <button onclick="editItem('${type}', '${item.id}')">Edit</button>
      <button class="danger" onclick="deleteItem('${type}', '${item.id}')">Delete</button>
    </div>
  `;
}

async function saveItem(type, id, body) {
  const method = id ? "PUT" : "POST";
  const path = id ? `/api/admin/${type}/${id}` : `/api/admin/${type}`;

  await api(path, {
    method,
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  await loadAdminData();
}

profileForm.addEventListener("submit", async e => {
  e.preventDefault();

  await api("/api/admin/profile", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      name: profileName.value,
      title: profileRole.value,
      email: profileEmail.value,
      phone: profilePhone.value,
      location: profileLocation.value,
      github: profileGithub.value,
      linkedin: profileLinkedin.value,
      image: profileImage.value,
    }),
  });

  await loadAdminData();
  alert("Profile saved");
});

aboutForm.addEventListener("submit", async e => {
  e.preventDefault();

  await api("/api/admin/about", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ about: aboutText.value }),
  });

  await loadAdminData();
  alert("About saved");
});

projectForm.addEventListener("submit", async e => {
  e.preventDefault();

  await saveItem("projects", projectId.value, {
    title: projectTitle.value,
    description: projectDescription.value,
    image: projectImage.value,
    liveUrl: projectLive.value,
    githubUrl: projectGithub.value,
    stack: projectTech.value,
    features: projectFeatures.value,
  });

  resetProjectForm();
  alert("Project saved");
});

skillForm.addEventListener("submit", async e => {
  e.preventDefault();

  await saveItem("skills", skillId.value, {
    title: skillTitle.value,
    description: skillDescription.value,
    category: skillCategory.value,
  });

  resetSkillForm();
  alert("Skill saved");
});

certificateForm.addEventListener("submit", async e => {
  e.preventDefault();

  await saveItem("certificates", certificateId.value, {
    title: certificateTitle.value,
    issuer: certificateIssuer.value,
    date: certificateDate.value,
    image: certificateImage.value,
    url: certificateUrl.value,
  });

  resetCertificateForm();
  alert("Certificate saved");
});

resumeForm.addEventListener("submit", async e => {
  e.preventDefault();

  await api("/api/admin/resume-note", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ resumeNote: resumeNote.value }),
  });

  const file = resumeFile.files[0];

  if (file) {
    const fd = new FormData();
    fd.append("resume", file);

    const res = await fetch(API_BASE + "/api/admin/upload-resume", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token(),
      },
      body: fd,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Resume upload failed");
    }
  }

  await loadAdminData();
  alert("Resume saved");
});

async function deleteResume() {
  if (!confirm("Delete uploaded resume?")) return;

  await api("/api/admin/resume", {
    method: "DELETE",
    headers: authHeaders(),
  });

  await loadAdminData();
  alert("Resume deleted");
}

function editItem(type, id) {
  const item = portfolioData[type].find(x => x.id === id);
  if (!item) return;

  if (type === "projects") {
    projectId.value = id;
    projectTitle.value = item.title || "";
    projectTech.value = item.stack || "";
    projectImage.value = item.image || "";
    projectLive.value = item.liveUrl || "";
    projectGithub.value = item.githubUrl || "";
    projectDescription.value = item.description || "";
    projectFeatures.value = item.features || "";
    location.hash = "projectBox";
  }

  if (type === "skills") {
    skillId.value = id;
    skillTitle.value = item.title || "";
    skillCategory.value = item.category || "";
    skillDescription.value = item.description || "";
    location.hash = "skillBox";
  }

  if (type === "certificates") {
    certificateId.value = id;
    certificateTitle.value = item.title || "";
    certificateIssuer.value = item.issuer || "";
    certificateDate.value = item.date || "";
    certificateImage.value = item.image || "";
    certificateUrl.value = item.url || "";
    location.hash = "certificateBox";
  }
}

async function deleteItem(type, id) {
  if (!confirm("Delete this item?")) return;

  await api(`/api/admin/${type}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  await loadAdminData();
}

function resetProjectForm() {
  projectId.value = "";
  projectForm.reset();
}

function resetSkillForm() {
  skillId.value = "";
  skillForm.reset();
}

function resetCertificateForm() {
  certificateId.value = "";
  certificateForm.reset();
}
["profileImage", "projectImage", "certificateImage"].forEach(id => {

  const input = document.getElementById(id);

  if (input) {
    input.addEventListener("input", () => updatePreview(id));
  }

});
document.addEventListener("DOMContentLoaded", loadAdminData);
async function uploadImage(fileInputId, targetInputId) {
  const fileInput = document.getElementById(fileInputId);
  const targetInput = document.getElementById(targetInputId);
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select image first");
    return;
  }

  const fd = new FormData();
  fd.append("image", file);

  try {
    const res = await fetch(API_BASE + "/api/admin/upload-image", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token(),
      },
      body: fd,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Image upload failed");
    }

    // relative path save karo: /uploads/filename.jpg
    targetInput.value = data.imageUrl;

    updatePreview(targetInputId);

    // Profile image upload hote hi profile auto-save
    if (targetInputId === "profileImage") {
      await api("/api/admin/profile", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          name: profileName.value,
          title: profileRole.value,
          email: profileEmail.value,
          phone: profilePhone.value,
          location: profileLocation.value,
          github: profileGithub.value,
          linkedin: profileLinkedin.value,
          image: profileImage.value,
        }),
      });

      await loadAdminData();
      alert("Profile image uploaded and saved successfully");
      return;
    }

    alert("Image uploaded successfully. Now click Save.");

  } catch (err) {
    alert(err.message);
  }
}

function updatePreview(inputId) {
  const API_BASE = "https://amrit-portfolio-xhbh.onrender.com";
  const input = document.getElementById(inputId);

  let previewId = "";

  if (inputId === "profileImage") previewId = "profileImagePreview";
  if (inputId === "projectImage") previewId = "projectImagePreview";
  if (inputId === "certificateImage") previewId = "certificateImagePreview";

  const preview = document.getElementById(previewId);
  if (!preview || !input) return;

  let url = input.value;

  if (url && !url.startsWith("http")) {
    url = API_BASE + url;
  }

  preview.src = url || "";
}