import { getStorageBucket } from "../config/firebase.js";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

    const downloadToken = uuidv4();

    await bucket.upload(filePath, {
      destination,
      metadata: {
        contentType: "application/pdf",
        metadata: {
          uploadedAt: new Date().toISOString(),
          userId,
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`;

    return publicUrl;
  } catch (error) {
    console.error("❌ Error uploading to Firebase Storage:", error);
    throw error;
  }
}

export async function cleanupLocalFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("⚠️  Error removing local file:", error);
  }
}
