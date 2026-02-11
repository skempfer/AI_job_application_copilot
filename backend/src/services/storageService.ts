import { getStorageBucket } from "../config/firebase.js";
import fs from "fs";
import path from "path";

/**
 * Upload a resume file to Firebase Storage
 *
 * @param filePath - Local path of the file to upload
 * @param userId - User ID (used to organize files)
 * @returns Signed public URL for the file in Firebase Storage
 */
export async function uploadResumeToFirebase(
  filePath: string,
  userId: string
): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const bucket = getStorageBucket();

    const timestamp = Date.now();
    const fileExtension = path.extname(filePath);
    const destination = `resumes/${userId}/${timestamp}${fileExtension}`;

    await bucket.upload(filePath, {
      destination,
      metadata: {
        contentType: "application/pdf",
        metadata: {
          uploadedAt: new Date().toISOString(),
          userId,
        },
      },
    });

    const file = bucket.file(destination);

    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    return signedUrl;
  } catch (error) {
    console.error("❌ Error uploading to Firebase Storage:", error);
    throw error;
  }
}

/**
 * Remove a local file after a successful upload
 *
 * @param filePath - Path of the file to remove
 */
export async function cleanupLocalFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("⚠️  Error removing local file:", error);
  }
}
