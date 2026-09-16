import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

const PORT = 3000;
const IMAGES_FILE = path.join(process.cwd(), "custom_handover_images.json");
const PROJECTS_FILE = path.join(process.cwd(), "custom_projects.json");

// Read configuration from firebase-applet-config.json to secure standard DB integration
let db: any = null;
try {
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    const firebaseApp = initializeApp(config);
    db = getFirestore(firebaseApp, config.firestoreDatabaseId);
    console.log("Firebase initialized successfully on the express server.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase on server, falling back to JSON files:", error);
}

// Utility to load custom images from Firestore / JSON
async function loadImages(): Promise<Record<string, string>> {
  // 1. Prefer local JSON first for maximum speed, consistency, and quota avoidance
  try {
    if (fs.existsSync(IMAGES_FILE)) {
      const data = fs.readFileSync(IMAGES_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error reading custom images from local file:", error);
  }

  // 2. Fallback to Firestore if local file does not exist or is corrupt
  const images: Record<string, string> = {};
  if (db) {
    try {
      const colRef = collection(db, "custom_images");
      const snapshot = await getDocs(colRef);
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.base64) {
          images[doc.id] = data.base64;
        }
      });
      
      // Save local cache so we don't have to hit Firestore next time
      if (Object.keys(images).length > 0) {
        fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2), "utf-8");
      }
    } catch (error) {
      console.error("Error loading images from Firestore:", error);
    }
  }
  return images;
}

// Utility to save custom images to Firestore / JSON
async function saveImages(images: Record<string, string>) {
  if (db) {
    try {
      // Set/update each image key in Firestore
      const writePromises = Object.entries(images).map(([key, val]) => {
        return setDoc(doc(db, "custom_images", key), { base64: val });
      });
      await Promise.all(writePromises);
      
      // Also identify deletions in custom_images
      const colRef = collection(db, "custom_images");
      const snapshot = await getDocs(colRef);
      const deletePromises: Promise<void>[] = [];
      snapshot.forEach(document => {
        if (!Object.prototype.hasOwnProperty.call(images, document.id)) {
          deletePromises.push(deleteDoc(doc(db, "custom_images", document.id)));
        }
      });
      await Promise.all(deletePromises);
    } catch (error) {
      console.warn("Non-blocking warning: Error saving images to Firestore. Saving to local workspace backup file instead:", error);
    }
  }

  // File system cache backup
  try {
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2), "utf-8");
    if (images && images.company_logo) {
      try {
        const base64Data = images.company_logo.replace(/^data:image\/\w+;base64,/, "");
        fs.writeFileSync(path.join(process.cwd(), "public", "favicon.png"), Buffer.from(base64Data, "base64"));
        console.log("Successfully updated public/favicon.png sync with master logo configuration!");
      } catch (err) {
        console.error("Failed to write physical favicon.png mapping:", err);
      }
    }
  } catch (error) {
    console.error("Error writing custom images file:", error);
  }
}

// Utility to load custom projects from Firestore / JSON
async function loadProjects(): Promise<any[] | null> {
  // 1. Try local JSON first for maximum speed, consistency, and quota avoidance
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        let dirty = false;
        parsed.forEach((proj: any) => {
          if (proj.title && (proj.title.includes("شقة") || proj.title.includes("داخلي")) && proj.category === "commercial") {
            proj.category = "interior";
            proj.categoryLabel = "المشاريع الداخليه (عينة تصاميم)";
            dirty = true;
          }
        });
        if (dirty) {
          try {
            fs.writeFileSync(PROJECTS_FILE, JSON.stringify(parsed, null, 2), "utf-8");
            console.log("Migrated apartment projects to interior category in custom_projects.json");
          } catch (err) {
            console.error("Failed to save auto-migrated projects:", err);
          }
        }
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error reading custom projects from local file:", error);
  }

  // 2. Fallback to Firestore if local file does not exist or is corrupt
  if (db) {
    try {
      const colRef = collection(db, "projects");
      const snapshot = await getDocs(colRef);
      const projects: any[] = [];
      snapshot.forEach((doc) => {
        projects.push(doc.data());
      });

      if (projects.length > 0) {
        // Sort by 'order' field to keep the display sequence intact
        const sortedProjects = projects.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        // Fetch all large images to reconstruct references
        try {
          const imgColRef = collection(db, "project_large_images");
          const imgSnapshot = await getDocs(imgColRef);
          const largeImagesMap = new Map<string, string>();
          imgSnapshot.forEach((imgDoc) => {
            const data = imgDoc.data();
            if (data && data.base64) {
              largeImagesMap.set(imgDoc.id, data.base64);
            }
          });

          // Reconstruct base64 strings
          for (const proj of sortedProjects) {
            if (proj.image && proj.image.startsWith("ref:")) {
              const refId = proj.image.substring(4);
              if (largeImagesMap.has(refId)) {
                proj.image = largeImagesMap.get(refId);
              }
            }
            if (Array.isArray(proj.images)) {
              proj.images = proj.images.map((img: string) => {
                if (img && img.startsWith("ref:")) {
                  const refId = img.substring(4);
                  if (largeImagesMap.has(refId)) {
                    return largeImagesMap.get(refId) || img;
                  }
                }
                return img;
              });
            }
          }
        } catch (imgError) {
          console.error("Error loading large images from Firestore:", imgError);
        }

        // Cache locally for extremely fast, quota-safe subsequent loads
        try {
          fs.writeFileSync(PROJECTS_FILE, JSON.stringify(sortedProjects, null, 2), "utf-8");
        } catch (writeErr) {
          console.error("Error writing cached custom projects file:", writeErr);
        }

        return sortedProjects;
      }
    } catch (error) {
      console.error("Error loading projects from Firestore:", error);
    }
  }

  return null;
}

// Utility to save custom projects to Firestore / JSON
async function saveProjects(projects: any[]) {
  if (db) {
    try {
      const colRef = collection(db, "projects");
      const existingSnapshot = await getDocs(colRef);
      const existingIds = existingSnapshot.docs.map(doc => doc.id);
      
      const updatedIds = projects.map(p => p.id);
      const idsToDelete = existingIds.filter(id => !updatedIds.includes(id));

      const largeImgPromises: Promise<void>[] = [];
      const savedLargeImageKeys = new Set<string>();

      const processedProjects = projects.map((proj, idx) => {
        const order = idx;
        const processedProj = { 
          ...proj, 
          order,
          images: proj.images || []
        };

        // Process main image
        if (processedProj.image && processedProj.image.startsWith("data:image/")) {
          const refId = `${proj.id}_main`;
          savedLargeImageKeys.add(refId);
          largeImgPromises.push(
            setDoc(doc(db, "project_large_images", refId), { base64: processedProj.image })
          );
          processedProj.image = `ref:${refId}`;
        } else if (processedProj.image && processedProj.image.startsWith("ref:")) {
          savedLargeImageKeys.add(processedProj.image.substring(4));
        }

        // Process gallery images
        if (Array.isArray(processedProj.images)) {
          processedProj.images = processedProj.images.map((img: string, galleryIdx: number) => {
            if (img && img.startsWith("data:image/")) {
              const refId = `${proj.id}_gallery_${galleryIdx}`;
              savedLargeImageKeys.add(refId);
              largeImgPromises.push(
                setDoc(doc(db, "project_large_images", refId), { base64: img })
              );
              return `ref:${refId}`;
            } else if (img && img.startsWith("ref:")) {
              savedLargeImageKeys.add(img.substring(4));
              return img;
            }
            return img;
          });
        }

        return processedProj;
      });

      // Execute writing processed large images first
      await Promise.all(largeImgPromises);

      // Write projects to Firestore
      const writePromises = processedProjects.map((proj) => {
        return setDoc(doc(db, "projects", proj.id), proj);
      });

      const deletePromises = idsToDelete.map(id => {
        return deleteDoc(doc(db, "projects", id));
      });

      await Promise.all([...writePromises, ...deletePromises]);

      // Handle orphans deletion in project_large_images
      try {
        const imgColRef = collection(db, "project_large_images");
        const imgSnapshot = await getDocs(imgColRef);
        const imgDeletePromises: Promise<void>[] = [];
        imgSnapshot.forEach((imgDoc) => {
          if (!savedLargeImageKeys.has(imgDoc.id)) {
            imgDeletePromises.push(deleteDoc(imgDoc.ref));
          }
        });
        await Promise.all(imgDeletePromises);
      } catch (imgDelErr) {
        console.error("Error cleaning up orphaned large images:", imgDelErr);
      }

    } catch (error) {
      console.warn("Non-blocking warning: Error saving projects to Firestore. Saving to local workspace backup file instead:", error);
    }
  }

  // File system cache backup
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing custom projects file:", error);
  }
}

async function startServer() {
  const app = express();

  // Increase payload size limit to accommodate base64 documents and project images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API 1: Get all custom images
  app.get("/api/custom-images", async (req, res) => {
    try {
      const images = await loadImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to load custom images" });
    }
  });

  // API 2: Save custom images
  app.post("/api/custom-images", async (req, res) => {
    try {
      const { images } = req.body;
      if (!images || typeof images !== "object") {
        return res.status(400).json({ error: "Invalid payload. 'images' must be an object." });
      }
      
      await saveImages(images);
      res.json({ success: true, count: Object.keys(images).length });
    } catch (error) {
      console.error("Error saving custom images:", error);
      res.status(500).json({ error: "Failed to save custom images" });
    }
  });

  // API 2.5: Get custom projects list
  app.get("/api/custom-projects", async (req, res) => {
    try {
      const projects = await loadProjects();
      res.json({ projects });
    } catch (error) {
      res.status(500).json({ error: "Failed to load custom projects" });
    }
  });

  // API 2.6: Save custom projects list
  app.post("/api/custom-projects", async (req, res) => {
    try {
      const { projects } = req.body;
      if (!Array.isArray(projects)) {
        return res.status(400).json({ error: "Invalid payload. 'projects' must be an array." });
      }
      await saveProjects(projects);
      res.json({ success: true, count: projects.length });
    } catch (error) {
      console.error("Error saving custom projects:", error);
      res.status(500).json({ error: "Failed to save custom projects" });
    }
  });

  // API 3: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware setup based on environment
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
