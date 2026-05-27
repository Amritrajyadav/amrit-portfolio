require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./config/db");
const { v2: cloudinary } = require("cloudinary");

const app = express();

const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = path.join(__dirname, "uploads");
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//     contentSecurityPolicy: false,
//     frameguard: false,
//   })
// );

app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(UPLOAD_DIR));
app.use((req, res, next) => {
  console.log("REQUEST HIT:", req.method, req.url);
  next();
});

app.get("/debug", (req, res) => {
  res.json({
    success: true,
    message: "Correct server.js is running",
    time: new Date().toISOString()
  });
});

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      cb(null, Date.now() + "-" + safe);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

function makeId(text = "item") {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) +
    "-" +
    Date.now()
  );
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

async function getPortfolioData() {
  const [[profile]] = await db.query("SELECT * FROM profile WHERE id = 1");
  const [[about]] = await db.query("SELECT * FROM about WHERE id = 1");
  const [[resume]] = await db.query("SELECT * FROM resume WHERE id = 1");

  const [projects] = await db.query("SELECT * FROM projects ORDER BY title ASC");
  const [skills] = await db.query("SELECT * FROM skills ORDER BY title ASC");
  const [certificates] = await db.query(
    "SELECT * FROM certificates ORDER BY title ASC"
  );

  return {
    profile: profile || {},
    about: about?.content || "",
    projects,
    skills,
    certificates,
    resumeUrl: resume?.resumeUrl || "",
    resumeNote: resume?.resumeNote || "",
  };
}

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Portfolio API running with MySQL" });
});

app.get("/api/portfolio", async (_req, res) => {
  try {
    const data = await getPortfolioData();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return res.status(500).json({
        success: false,
        message: "Admin env not configured",
      });
    }

    const emailOk =
      String(email || "").toLowerCase() === String(adminEmail).toLowerCase();

    const passwordOk = adminPassword.startsWith("$2")
      ? await bcrypt.compare(password || "", adminPassword)
      : password === adminPassword;

    if (!emailOk || !passwordOk) {
      return res.status(401).json({
        success: false,
        message: "Wrong email or password",
      });
    }

    const token = jwt.sign(
      { role: "admin", email: adminEmail },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login error" });
  }
});

app.get("/api/admin/portfolio", auth, async (_req, res) => {
  try {
    const data = await getPortfolioData();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Admin portfolio error:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

app.put("/api/admin/profile", auth, async (req, res) => {
  try {
    const {
      name,
      title,
      email,
      phone,
      location,
      github,
      linkedin,
      image,
    } = req.body;

    await db.query(
      `INSERT INTO profile 
      (id, name, title, email, phone, location, github, linkedin, image)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      name=VALUES(name),
      title=VALUES(title),
      email=VALUES(email),
      phone=VALUES(phone),
      location=VALUES(location),
      github=VALUES(github),
      linkedin=VALUES(linkedin),
      image=VALUES(image)`,
      [name, title, email, phone, location, github, linkedin, image]
    );

    const data = await getPortfolioData();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: "Profile update error" });
  }
});

app.put("/api/admin/about", auth, async (req, res) => {
  try {
    await db.query(
      `INSERT INTO about (id, content)
       VALUES (1, ?)
       ON DUPLICATE KEY UPDATE content=VALUES(content)`,
      [req.body.about || ""]
    );

    const data = await getPortfolioData();
    res.json({ success: true, data });
  } catch (error) {
    console.error("About update error:", error);
    res.status(500).json({ success: false, message: "About update error" });
  }
});

app.post("/api/admin/projects", auth, async (req, res) => {
  try {
    const item = {
      id: makeId(req.body.title || "project"),
      title: req.body.title || "",
      description: req.body.description || "",
      image: req.body.image || "",
      liveUrl: req.body.liveUrl || "",
      githubUrl: req.body.githubUrl || "",
      stack: req.body.stack || "",
      features: req.body.features || "",
      category: req.body.category || "fullstack",
      level: req.body.level || "major",
      videoUrl: req.body.videoUrl || "",
    };

    await db.query(
      `INSERT INTO projects 
      (id, title, description, image, liveUrl, githubUrl, stack, features, category, level, videoUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.title,
        item.description,
        item.image,
        item.liveUrl,
        item.githubUrl,
        item.stack,
        item.features,
        item.category,
        item.level,
        item.videoUrl,
      ]
    );

    res.json({ success: true, item });
  } catch (error) {
    console.error("Project add error:", error);
    res.status(500).json({ success: false, message: "Project add error" });
  }
});

app.put("/api/admin/projects/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE projects SET
       title=?,
       description=?,
       image=?,
       liveUrl=?,
       githubUrl=?,
       stack=?,
       features=?,
       category=?,
       level=?,
       videoUrl=?
       WHERE id=?`,
      [
        req.body.title || "",
        req.body.description || "",
        req.body.image || "",
        req.body.liveUrl || "",
        req.body.githubUrl || "",
        req.body.stack || "",
        req.body.features || "",
        req.body.category || "fullstack",
        req.body.level || "major",
        req.body.videoUrl || "",
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Project update error:", error);
    res.status(500).json({ success: false, message: "Project update error" });
  }
});

app.delete("/api/admin/projects/:id", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM projects WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Project delete error:", error);
    res.status(500).json({ success: false, message: "Project delete error" });
  }
});

app.post("/api/admin/skills", auth, async (req, res) => {
  try {
    const item = {
      id: makeId(req.body.title || "skill"),
      title: req.body.title || "",
      description: req.body.description || "",
      category: req.body.category || "",
    };

    await db.query(
      `INSERT INTO skills (id, title, description, category)
       VALUES (?, ?, ?, ?)`,
      [item.id, item.title, item.description, item.category]
    );

    res.json({ success: true, item });
  } catch (error) {
    console.error("Skill add error:", error);
    res.status(500).json({ success: false, message: "Skill add error" });
  }
});

app.put("/api/admin/skills/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE skills SET title=?, description=?, category=? WHERE id=?`,
      [
        req.body.title || "",
        req.body.description || "",
        req.body.category || "",
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Skill update error:", error);
    res.status(500).json({ success: false, message: "Skill update error" });
  }
});

app.delete("/api/admin/skills/:id", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM skills WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Skill delete error:", error);
    res.status(500).json({ success: false, message: "Skill delete error" });
  }
});

app.post("/api/admin/certificates", auth, async (req, res) => {
  try {
    const item = {
      id: makeId(req.body.title || "certificate"),
      title: req.body.title || "",
      issuer: req.body.issuer || "",
      date: req.body.date || "",
      image: req.body.image || "",
      url: req.body.url || "",
    };

    await db.query(
      `INSERT INTO certificates (id, title, issuer, date, image, url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.id, item.title, item.issuer, item.date, item.image, item.url]
    );

    res.json({ success: true, item });
  } catch (error) {
    console.error("Certificate add error:", error);
    res.status(500).json({ success: false, message: "Certificate add error" });
  }
});

app.put("/api/admin/certificates/:id", auth, async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE certificates SET
       title=?,
       issuer=?,
       date=?,
       image=?,
       url=?
       WHERE id=?`,
      [
        req.body.title || "",
        req.body.issuer || "",
        req.body.date || "",
        req.body.image || "",
        req.body.url || "",
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Certificate update error:", error);
    res.status(500).json({
      success: false,
      message: "Certificate update error",
    });
  }
});

app.delete("/api/admin/certificates/:id", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM certificates WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Certificate delete error:", error);
    res.status(500).json({
      success: false,
      message: "Certificate delete error",
    });
  }
});

app.put("/api/admin/resume-note", auth, async (req, res) => {
  try {
    await db.query(
      `INSERT INTO resume (id, resumeNote)
       VALUES (1, ?)
       ON DUPLICATE KEY UPDATE resumeNote=VALUES(resumeNote)`,
      [req.body.resumeNote || ""]
    );

    const data = await getPortfolioData();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Resume note error:", error);
    res.status(500).json({ success: false, message: "Resume note error" });
  }
});

app.post("/api/admin/upload-image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "amrit-portfolio",
      resource_type: "image",
    });

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Cloudinary image upload error:", error);
    res.status(500).json({ success: false, message: "Image upload error" });
  }
});

app.post("/api/admin/upload-video", auth, upload.single("video"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video file required"
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "amrit-portfolio/videos",
      resource_type: "video",
    });

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      videoUrl: result.secure_url,
    });

  } catch (error) {

    console.error("Cloudinary video upload error:", error);

    res.status(500).json({
      success: false,
      message: "Video upload error",
    });
  }
});

app.post("/api/admin/upload-resume", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file required",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "amrit-portfolio/resume",
      resource_type: "raw",
    });

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const resumeUrl = result.secure_url;

    await db.query(
      `INSERT INTO resume (id, resumeUrl)
       VALUES (1, ?)
       ON DUPLICATE KEY UPDATE resumeUrl=VALUES(resumeUrl)`,
      [resumeUrl]
    );

    res.json({
      success: true,
      resumeUrl,
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    res.status(500).json({
      success: false,
      message: "Resume upload error",
    });
  }
});
app.delete("/api/admin/resume", auth, async (req, res) => {
  try {
    const [[oldResume]] = await db.query(
      "SELECT resumeUrl FROM resume WHERE id = 1"
    );

    if (oldResume?.resumeUrl) {
      const filePath = path.join(__dirname, oldResume.resumeUrl);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.query(
      `INSERT INTO resume (id, resumeUrl, resumeNote)
       VALUES (1, '', '')
       ON DUPLICATE KEY UPDATE resumeUrl='', resumeNote=''`
    );

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Resume delete error:", error);
    res.status(500).json({
      success: false,
      message: "Resume delete error",
    });
  }
});
app.get("/debug", (req, res) => {
  res.json({
    success: true,
    message: "Debug route working"
  });
});

app.listen(PORT, () => {
  console.log(`Portfolio API running with MySQL on port ${PORT}`);
});