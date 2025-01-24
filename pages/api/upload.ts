import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
// import { getToken } from "next-auth/jwt";
import multer from "multer";
import fs from "fs";

// Configuração do multer para múltiplos arquivos
const upload = multer({ dest: "./tmp/" }).fields([
  { name: "trFile", maxCount: 1 }, // Campo para o arquivo TR
  { name: "processoFile", maxCount: 1 }, // Campo para o arquivo PROCESSO
]);

export const config = {
  api: {
    bodyParser: false, // Desabilita o body parser padrão do Next.js
  },
};

// async function uploadFile(accessToken, file, fileName, parentFolderId) {
async function uploadFile(
  file: Express.Multer.File,
  fileName: string,
  folderId: string
) {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!fs.existsSync(keyPath)) {
    console.error("O arquivo de chave do serviço não foi encontrado:", keyPath);
    process.exit(1); // Sai do processo com erro
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = {
      name: fileName,
      parents: [folderId], // Pasta no Google Drive
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
    });

    // Tornar o arquivo público
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: "reader", type: "anyone" },
    });

    return response.data;
  } catch (error: any) {
    console.error("Erro ao fazer upload do arquivo:", error.message);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  console.log("keyPath ", keyPath);
  if (!keyPath || !fs.existsSync(keyPath)) {
    console.error("O arquivo de chave do serviço não foi encontrado:", keyPath);
    return res
      .status(500)
      .json({ message: "Erro interno: chave de serviço ausente" });
  }

  try {
    const credentials = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    console.log("credentials ", credentials);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });
    console.log("DRIVE ", drive);

    // const token = await getToken({ req, secret: process.env.SECRET });
    // if (!token?.accessToken) {
    //   return res
    //     .status(401)
    //     .json({ message: "Não autenticado. Access token não encontrado." });
    // }

    const files = await drive.files.list({
      pageSize: 5,
      fields: "files(id, name)",
    });

    console.log("Arquivos encontrados:", files.data.files);
    // return res.status(200).json({ files: files.data.files });

    upload(req, res, async (err) => {
      if (err) {
        console.error("Erro no processamento dos arquivos:", err);
        return res
          .status(500)
          .json({ message: "Erro ao processar os uploads" });
      }

      const trFile = req.files["trFile"]?.[0];
      const processoFile = req.files["processoFile"]?.[0];

      if (!trFile || !processoFile) {
        return res
          .status(400)
          .json({ message: "Arquivos TR ou PROCESSO não enviados." });
      }

      try {
        // const trUploaded = await uploadFile(
        //   token.accessToken,
        //   trFile,
        //   `TR-${req.body.tr}`,
        //   "1zXdnL3cN3k9PCWslS0znuS9PtxuAI3bN"
        // );
        const trUploaded = await uploadFile(
          // token.accessToken,
          trFile,
          `TR-${req.body.tr}`,
          "1zfmJWfmMqe90oxalZXvfYE-LKxOqmYJy"
        );

        // const processoUploaded = await uploadFile(
        //   token.accessToken,
        //   processoFile,
        //   `PROCESSO-${req.body.modelo}`,
        //   "1TJeVu2Vq0s5zBiYD5YJY5K2P0nTqSAeB" compras_ai
        // );

        const processoUploaded = await uploadFile(
          // token.accessToken,
          processoFile,
          `PROCESSO-${req.body.modelo}`,
          "1byEVmLN7xRi_cSIqNIoaoJyzHmTWZbL1"
        );
        // Remover arquivos temporários após o upload
        fs.unlinkSync(trFile.path);
        fs.unlinkSync(processoFile.path);

        res.status(200).json({
          trFile: {
            id: trUploaded.id,
            webViewLink: trUploaded.webViewLink,
            webContentLink: trUploaded.webContentLink,
          },
          processoFile: {
            id: processoUploaded.id,
            webViewLink: processoUploaded.webViewLink,
            webContentLink: processoUploaded.webContentLink,
          },
        });
      } catch (error) {
        console.error("Erro no upload para o Google Drive:", error.message);
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error(
      "Erro na autenticação ou no processo de upload:",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
}
