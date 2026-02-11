import { getStorageBucket } from "../config/firebase.js";
import fs from "fs";
import path from "path";

/**
 * Faz upload de um arquivo de currículo para o Firebase Storage
 * 
 * @param filePath - Caminho local do arquivo a ser enviado
 * @param userId - ID do usuário (usado para organizar os arquivos)
 * @returns URL pública assinada do arquivo no Firebase Storage
 */
export async function uploadResumeToFirebase(
  filePath: string,
  userId: string
): Promise<string> {
  try {
    // Validar se arquivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`);
    }

    // Obter bucket do Firebase Storage
    const bucket = getStorageBucket();

    // Gerar nome único para o arquivo no Storage
    const timestamp = Date.now();
    const fileExtension = path.extname(filePath);
    const destination = `resumes/${userId}/${timestamp}${fileExtension}`;

    // Fazer upload do arquivo
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

    // Obter referência ao arquivo
    const file = bucket.file(destination);

    // Gerar URL assinada (válida por 1 hora)
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // 1 hora
    });

    console.log(`✅ Arquivo enviado para Firebase Storage: ${destination}`);

    return signedUrl;
  } catch (error) {
    console.error("❌ Erro ao fazer upload para Firebase Storage:", error);
    throw error;
  }
}

/**
 * Remove um arquivo local após upload bem-sucedido
 * 
 * @param filePath - Caminho do arquivo a ser removido
 */
export async function cleanupLocalFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Arquivo local removido: ${filePath}`);
    }
  } catch (error) {
    console.error("⚠️  Erro ao remover arquivo local:", error);
    // Não propagar erro - limpeza é não-crítica
  }
}
