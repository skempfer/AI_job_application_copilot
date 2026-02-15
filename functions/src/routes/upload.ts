import { Router, Request, Response } from "express";
import Busboy from "busboy";
import path from "path";
import fs from "fs";
import { uploadResumeToFirebase, cleanupLocalFile } from "../services/storageService.js";

const uploadDir = "/tmp/uploads";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Ensure upload directory exists (created lazily on first use)
function ensureUploadDir() {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

type RequestWithRawBody = Request & { rawBody?: Buffer };
type BusboyFileInfo = { filename: string; encoding: string; mimeType: string };

export function createUploadRouter(): Router {
  const router = Router();

  router.post("/", async (req: RequestWithRawBody, res: Response) => {
    try {
      if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
        res.status(415).json({ error: "Expected multipart/form-data" });
        return;
      }

      ensureUploadDir();

      const rawBodyLength = req.rawBody?.length ?? 0;
      if (!req.rawBody || rawBodyLength === 0) {
        res.status(400).json({ error: "Missing request body" });
        return;
      }

      const busboy = Busboy({ headers: req.headers });
      const fields: Record<string, string> = {};
      let filePath: string | null = null;
      let originalName: string | null = null;
      let fileSize = 0;

      const parsePromise = new Promise<void>((resolve, reject) => {
        busboy.on("field", (name: string, value: string) => {
          fields[name] = value;
        });

        busboy.on("file", (name: string, file: NodeJS.ReadableStream, info: BusboyFileInfo) => {
          if (name !== "resume") {
            file.resume();
            return;
          }

          const sanitizedName = info.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
          originalName = info.filename;
          filePath = path.join(uploadDir, `${Date.now()}-${sanitizedName}`);
          const writeStream = fs.createWriteStream(filePath);

          file.on("data", (chunk: Buffer) => {
            fileSize += chunk.length;
            if (fileSize > MAX_FILE_SIZE) {
              file.unpipe(writeStream);
              writeStream.destroy();
              reject(new Error("File size exceeds 5MB limit"));
            }
          });

          writeStream.on("error", (err) => reject(err));
          writeStream.on("finish", () => resolve());

          file.pipe(writeStream);
        });

        busboy.on("error", (err: Error) => reject(err));

        busboy.on("finish", () => {
          if (!filePath || !originalName) {
            reject(new Error("No file was uploaded"));
          }
        });
      });

      busboy.end(req.rawBody);

      await parsePromise;

      if (!filePath || !originalName) {
        res.status(400).json({ error: "No file was uploaded" });
        return;
      }

      const fileExtension = path.extname(originalName).toLowerCase();
      if (fileExtension !== ".pdf") {
        fs.unlinkSync(filePath);
        res.status(400).json({ error: "Only PDF files are allowed" });
        return;
      }

      const useFirebaseStorage = process.env.USE_FIREBASE_STORAGE !== "false";

      if (useFirebaseStorage) {
        try {
          const userId = fields.userId || "anonymous";

          const fileUrl = await uploadResumeToFirebase(filePath, userId);
          await cleanupLocalFile(filePath);

          res.json({
            success: true,
            fileUrl,
          });
        } catch (firebaseError) {
          console.error("❌ Firebase Storage upload failed:", firebaseError);
          await cleanupLocalFile(filePath);
          throw firebaseError;
        }
      } else {
        res.json({
          success: true,
          fileName: path.basename(filePath),
          size: fileSize,
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);

      if (error instanceof Error && error.message.includes("File size")) {
        res.status(413).json({ error: error.message });
        return;
      }

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
