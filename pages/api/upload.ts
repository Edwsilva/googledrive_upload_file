// import { google } from "googleapis";
// import { getToken } from "next-auth/jwt";
// import multer from "multer";
// import fs from "fs";

// export const config = {
//   api: {
//     bodyParser: false, // Desabilita o body parser padrão do Next.js
//   },
// };

// // Configuração do multer
// const upload = multer({ dest: "./tmp/" });

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Método não permitido" });
//   }

//   try {
//     // Obtém o token usando o middleware JWT do NextAuth
//     const token = await getToken({ req, secret: process.env.SECRET });
//     console.log("Token recebido:", token);

//     if (!token?.accessToken) {
//       return res.status(401).json({ message: "Não autenticado. Access token não encontrado." });
//     }

//     // Configurando o cliente OAuth2 do Google
//     const oauth2Client = new google.auth.OAuth2();
//     oauth2Client.setCredentials({
//       access_token: token.accessToken,
//     });

//     const drive = google.drive({
//       version: "v3",
//       auth: oauth2Client,
//     });

   

//     // Middleware do multer para lidar com upload de arquivos
//     upload.single("file")(req, res, async (err) => {
//       if (err) {
//         console.error("Erro no processamento do arquivo:", err);
//         return res.status(500).json({ message: "Erro ao processar o upload" });
//       }

//       console.log("Arquivo recebido pelo Multer:", req.file);

//       if (!req.file) {
//         return res.status(400).json({ message: "Nenhum arquivo enviado" });
//       }

//       try {
//         const file = req.file;
//         const tr = `TR-${req.body.tr}`;
//         const modelo = `MODELO-${req.body.tr}`;

//         console.log("TR ", tr)
//         console.log("MODELO ", modelo)
//         const fileMetadata = {
//           name: tr, // Nome do arquivo
//           //parents: ["1FnEd5EdtiGLru1sHNDVfLJzEpAle0scV"], // Pasta de destino no Google Drive
//           parents: ["1zXdnL3cN3k9PCWslS0znuS9PtxuAI3bN"], // Pasta de destino no Google Drive
//         };

//         const media = {
//           mimeType: file.mimetype, // Tipo MIME do arquivo
//           body: fs.createReadStream(file.path), // Stream do arquivo
//         };

//         console.log("Enviando arquivo para o Google Drive:", fileMetadata);

//         // Upload do arquivo para o Google Drive
//         const uploadedFile = await drive.files.create({
//           requestBody: fileMetadata,
//           media,
//           fields: "id, webViewLink, webContentLink",
//         });

//         console.log("Arquivo enviado com sucesso:", uploadedFile.data);

//         // Tornar o arquivo público
//         await drive.permissions.create({
//           fileId: uploadedFile.data.id,
//           requestBody: {
//             role: "reader", // Permissões de leitura
//             type: "anyone", // Disponível para qualquer pessoa
//           },
//         });

//         // Remover o arquivo temporário após o upload
//         fs.unlinkSync(file.path);

//         res.status(200).json({
//           fileId: uploadedFile.data.id,
//           webViewLink: uploadedFile.data.webViewLink,
//           webContentLink: uploadedFile.data.webContentLink,
//         });
//       } catch (error) {
//         console.error("Erro ao fazer upload para o Google Drive:", error.message);
//         res.status(500).json({ error: error.message });
//       }
//     });
//   } catch (error) {
//     console.error("Erro na autenticação ou no processo de upload:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// }

import { google } from "googleapis";
import { getToken } from "next-auth/jwt";
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    // Obtém o token usando o middleware JWT do NextAuth
    const token = await getToken({ req, secret: process.env.SECRET });
    if (!token?.accessToken) {
      return res.status(401).json({ message: "Não autenticado. Access token não encontrado." });
    }

    // Configurando o cliente OAuth2 do Google
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: token.accessToken,
    });

    const drive = google.drive({
      version: "v3",
      auth: oauth2Client,
    });

    // Middleware do multer para lidar com upload de arquivos
    upload(req, res, async (err) => {
      if (err) {
        console.error("Erro no processamento dos arquivos:", err);
        return res.status(500).json({ message: "Erro ao processar os uploads" });
      }

      // Verifica se os arquivos foram enviados
      const trFile = req.files["trFile"]?.[0];
      const processoFile = req.files["processoFile"]?.[0];

      if (!trFile || !processoFile) {
        return res.status(400).json({ message: "Arquivos TR ou PROCESSO não enviados." });
      }

      try {
        // Para o arquivo TR
        const trMetadata = {
          name: `TR-${req.body.tr}`,
          parents: ["1zXdnL3cN3k9PCWslS0znuS9PtxuAI3bN"], // Pasta no Google Drive
        };
        const trMedia = {
          mimeType: trFile.mimetype,
          body: fs.createReadStream(trFile.path),
        };

        const trUploaded = await drive.files.create({
          requestBody: trMetadata,
          media: trMedia,
          fields: "id, webViewLink, webContentLink",
        });

        // Para o arquivo de Processo
        const processoMetadata = {
          name: `PROCESSO-${req.body.modelo}`,
          parents: ["1TJeVu2Vq0s5zBiYD5YJY5K2P0nTqSAeB"], // Pasta no Google Drive
        };
        const processoMedia = {
          mimeType: processoFile.mimetype,
          body: fs.createReadStream(processoFile.path),
        };

        const processoUploaded = await drive.files.create({
          requestBody: processoMetadata,
          media: processoMedia,
          fields: "id, webViewLink, webContentLink",
        });

        // Tornar ambos os arquivos públicos
        await drive.permissions.create({
          fileId: trUploaded.data.id,
          requestBody: { role: "reader", type: "anyone" },
        });

        await drive.permissions.create({
          fileId: processoUploaded.data.id,
          requestBody: { role: "reader", type: "anyone" },
        });

        // Remover arquivos temporários após o upload
        fs.unlinkSync(trFile.path);
        fs.unlinkSync(processoFile.path);

        res.status(200).json({
          trFile: {
            id: trUploaded.data.id,
            webViewLink: trUploaded.data.webViewLink,
            webContentLink: trUploaded.data.webContentLink,
          },
          processoFile: {
            id: processoUploaded.data.id,
            webViewLink: processoUploaded.data.webViewLink,
            webContentLink: processoUploaded.data.webContentLink,
          },
        });
      } catch (error) {
        console.error("Erro no upload para o Google Drive:", error.message);
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error("Erro na autenticação ou no processo de upload:", error.message);
    res.status(500).json({ error: error.message });
  }
}
