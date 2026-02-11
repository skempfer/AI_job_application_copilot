import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadResumeToFirebase, cleanupLocalFile } from "../services/storageService.js";

// Create uploads directory if it does not exist
const uploadDir = path.join(process.cwd(), "tmp", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for temporary local storage
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

// Filter to accept only PDFs
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

// Configure multer with a 5MB limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB em bytes
  },
});

export function createUploadRouter(): Router {
  const router = Router();

  router.post("/", upload.single("resume"), async (req: Request, res: Response) => {
    try {
      // Check if a file was uploaded
      if (!req.file) {
        res.status(400).json({ error: "No file was uploaded" });
        return;
      }

      // Additional validation by file extension
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      if (fileExtension !== ".pdf") {
        // Remove invalid file
        fs.unlinkSync(req.file.path);
        res.status(400).json({ error: "Only PDF files are allowed" });
        return;
      }

      // Check if Firebase Storage is enabled
      const useFirebaseStorage = process.env.USE_FIREBASE_STORAGE === "true";

      if (useFirebaseStorage) {
        // PHASE 2: Upload to Firebase Storage
        try {
          // Generate userId (can be obtained from auth later)
          const userId = req.body.userId || "anonymous";

          // Upload to Firebase
          const fileUrl = await uploadResumeToFirebase(req.file.path, userId);

          // Remove temporary local file
          await cleanupLocalFile(req.file.path);

          // Return Firebase URL
          res.json({
            success: true,
            fileUrl,
          });
        } catch (firebaseError) {
          // If Firebase fails, remove local file
          await cleanupLocalFile(req.file.path);
          throw firebaseError;
        }
      } else {
        // PHASE 1: Temporary local storage
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
