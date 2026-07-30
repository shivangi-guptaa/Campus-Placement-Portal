import fs from "fs";
import path from "path";
import cloudinary from "./cloudinary.js";
import getDataUri from "./dataURI.js";

const UPLOADS_DIR = path.join(process.cwd(), "backend", "public", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const uploadFile = async (file, folder = "general") => {
  if (!file) return null;

  // Attempt Cloudinary upload if keys exist
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    try {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: `campus_portal/${folder}`,
      });
      return {
        url: cloudResponse.secure_url,
        originalName: file.originalname,
      };
    } catch (err) {
      console.warn("Cloudinary upload failed/unconfigured. Falling back to local file uploader:", err.message);
    }
  }

  // Local Storage Fallback
  const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1e9)}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = path.join(UPLOADS_DIR, uniqueName);
  
  fs.writeFileSync(filePath, file.buffer);
  const publicUrl = `/uploads/${uniqueName}`;

  return {
    url: publicUrl,
    originalName: file.originalname,
  };
};
