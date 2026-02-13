import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadResumeToFirebase, cleanupLocalFile } from "../services/storageService.js";

const uploadDir = path.join(process.cwd(), "tmp", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}-${sanitizedName}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});

export function createUploadRouter(): Router {
  const router = Router();

  router.post("/", upload.single("resume"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file was uploaded" });
        return;
      }

      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      if (fileExtension !== ".pdf") {
        fs.unlinkSync(req.file.path);
        res.status(400).json({ error: "Only PDF files are allowed" });
        return;
      }

      const useFirebaseStorage = process.env.USE_FIREBASE_STORAGE === "true";

      if (useFirebaseStorage) {
        try {
          const userId = req.body.userId || "anonymous";

          const fileUrl = await uploadResumeToFirebase(req.file.path, userId);

          await cleanupLocalFile(req.file.path);

          res.json({
            success: true,
            fileUrl,
          });
        } catch (firebaseError) {
          await cleanupLocalFile(req.file.path);
          throw firebaseError;
        }
      } else {
        res.json({
          success: true,
          fileName: req.file.filename,
          size: req.file.size,
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);

      if (error instanceof Error) {
        res.status(500).json({
          error: "Error processing upload",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Unknown error while processing upload" });
      }
    }
  });

  return router;
}
