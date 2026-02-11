import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadResumeToFirebase, cleanupLocalFile } from "../services/storageService.js";

// Criar diretório de uploads se não existir
const uploadDir = path.join(process.cwd(), "tmp", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para armazenamento local temporário
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

// Filtro para aceitar apenas PDFs
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Apenas arquivos PDF são permitidos"));
  }
};

// Configurar multer com limite de 5MB
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
      // Verificar se arquivo foi enviado
      if (!req.file) {
        res.status(400).json({ error: "Nenhum arquivo foi enviado" });
        return;
      }

      // Validação adicional de tipo de arquivo pela extensão
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      if (fileExtension !== ".pdf") {
        // Remover arquivo inválido
        fs.unlinkSync(req.file.path);
        res.status(400).json({ error: "Apenas arquivos PDF são permitidos" });
        return;
      }

      // Verificar se Firebase Storage está habilitado
      const useFirebaseStorage = process.env.USE_FIREBASE_STORAGE === "true";

      if (useFirebaseStorage) {
        // PHASE 2: Upload para Firebase Storage
        try {
          // Gerar userId (pode ser obtido de autenticação no futuro)
          const userId = req.body.userId || "anonymous";

          // Fazer upload para Firebase
          const fileUrl = await uploadResumeToFirebase(req.file.path, userId);

          // Remover arquivo local temporário
          await cleanupLocalFile(req.file.path);

          // Retornar URL do Firebase
          res.json({
            success: true,
            fileUrl,
          });
        } catch (firebaseError) {
          // Em caso de erro no Firebase, remover arquivo local
          await cleanupLocalFile(req.file.path);
          throw firebaseError;
        }
      } else {
        // PHASE 1: Armazenamento local temporário
        res.json({
          success: true,
          fileName: req.file.filename,
          size: req.file.size,
        });
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);

      if (error instanceof Error) {
        res.status(500).json({
          error: "Erro ao processar upload",
          details: error.message,
        });
      } else {
        res.status(500).json({ error: "Erro desconhecido ao processar upload" });
      }
    }
  });

  return router;
}
