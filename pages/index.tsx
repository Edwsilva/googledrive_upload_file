// import { useSession, signIn, signOut } from "next-auth/react";
// import { useState } from "react";

// export default function Home() {
  
//   const [tr, setTr] = useState("");
//   const [modelo, setModelo] = useState("");
//   const { data: session } = useSession();
//   const [file, setFile] = useState<File | null>(null);
//   const [fileUrlTr, setFileUrlTR] = useState<string | null>(null); // URL para download/visualização
//   const [viewUrlTr, setViewUrlTR] = useState<string | null>(null); // URL para visualização
//   const [fileUrlPRocesso, setFileUrlProcesso]= useState<string | null>(null);
//   const [ViewUrlPRocesso, setViewUrlProcesso]= useState<string | null>(null);

//   const handleUpload = async () => {
//     if (!file) {
//       console.error("Nenhum arquivo selecionado para upload.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("tr", tr);
//     formData.append("modelo", modelo);
//     formData.append("filename", file.name);
//     formData.append("file", file);
//     formData.append("mimeType", file.type);

//     console.log("Formdata ", formData);
//     // Inspecionar o conteúdo do FormData
//     for (const [key, value] of formData.entries()) {
//       console.log(`CHAVE ${key}:`, value);
//     }
//     try {
//       const response = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("Erro no upload:", errorText);
//         return;
//       }

//       const data = await response.json();
//       console.log("Arquivo enviado:", data);

//          // Captura as URLs do arquivo TR
//     const downloadLinkTR = data.trFile.webContentLink;
//     const viewLinkTR = data.trFile.webViewLink;

//     // Captura as URLs do arquivo PROCESSO
//     const downloadLinkProcesso = data.processoFile.webContentLink;
//     const viewLinkProcesso = data.processoFile.webViewLink;

//     // Armazenar as URLs no estado
//     setFileUrlTR(downloadLinkTR); // URL do TR
//     setViewUrlTR(viewLinkTR); // Visualização do TR

//     setFileUrlProcesso(downloadLinkProcesso); // URL do PROCESSO
//     setViewUrlProcesso(viewLinkProcesso); // Visualização do PROCESSO

//       // Aqui você pode usar a URL (por exemplo, exibir no frontend)
//      // alert(`Arquivo enviado com sucesso! URL: ${fileUrl}`);
//       alert(`Arquivo enviado com sucesso!`);
//     } catch (error) {
//       console.error("Erro ao enviar o arquivo:", error);
//     }
//   };

//   const handleFileTrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files && event.target.files.length > 0) {
//       const file = event.target.files[0];
//       console.log("Selected file:", file); // Verifique se o arquivo é válido aqui
//       setFile(file);
//     }
//   };

//   const handleFileProcessoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files && event.target.files.length > 0) {
//       const file = event.target.files[0];
//       console.log("Selected file:", file); // Verifique se o arquivo é válido aqui
//       setFile(file);
//     }
//   };
//   return (
//     <div>
//       {session ? (
//         <>
//           <p>Bem-vindo, {session.user?.name}</p>
//           <button onClick={() => signOut()}>Sair</button>
//           <label htmlFor="processo">TR</label>
//           <input
//             type="text"
//             id="tr"
//             placeholder="Digite o número do TR"
//             value={tr}
//             onChange={(e) => setTr(e.target.value)}
//             // className={style.input}
//           />
//           <input type="file" onChange={handleFileTrChange} />
//           <label htmlFor="processo">Modelo</label>
//           <input
//             type="text"
//             id="modelo"
//             placeholder="Digite o número do PROCESSO"
//             value={modelo}
//             onChange={(e) => setModelo(e.target.value)}
//             // className={style.input}
//           />
//           <input type="file" onChange={handleFileProcessoChange} />

//           <button onClick={handleUpload}>Enviar para o Google Drive</button>
//           {fileUrlTr && (
//             <div>
//               <button onClick={() => window.open(fileUrlTr, "_blank")}>
//                 Baixar Arquivo
//               </button>
//               {viewUrlTr && (
//                 <button onClick={() => window.open(viewUrlTr, "_blank")}>
//                   Visualizar Arquivo
//                 </button>
//               )}
//             </div>
//           )}
//         </>
//       ) : (
//         <>
//           <p>Faça login para enviar arquivos</p>
//           <button onClick={() => signIn("google")}>Login com Google</button>
//         </>
//       )}
//     </div>
//   );
// }

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const [tr, setTr] = useState("");
  const [modelo, setModelo] = useState("");
  const { data: session } = useSession();
  
  // Estados para os arquivos TR e Processo
  const [fileTr, setFileTr] = useState<File | null>(null);
  const [fileProcesso, setFileProcesso] = useState<File | null>(null);
  
  // Estados para as URLs dos arquivos TR e Processo
  const [fileUrlTr, setFileUrlTr] = useState<string | null>(null); // URL para download/visualização do TR
  const [viewUrlTr, setViewUrlTr] = useState<string | null>(null); // URL para visualização do TR

  const [fileUrlProcesso, setFileUrlProcesso] = useState<string | null>(null); // URL para download/visualização do PROCESSO
  const [viewUrlProcesso, setViewUrlProcesso] = useState<string | null>(null); // URL para visualização do PROCESSO

  const handleUpload = async () => {
    if (!fileTr || !fileProcesso) {
      console.error("Nenhum arquivo selecionado para upload.");
      return;
    }

    const formData = new FormData();
    formData.append("tr", tr);
    formData.append("modelo", modelo);
    formData.append("trFile", fileTr);
    formData.append("processoFile", fileProcesso);
    formData.append("mimeTypeTr", fileTr.type);
    formData.append("mimeTypeProcesso", fileProcesso.type);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro no upload:", errorText);
        return;
      }

      const data = await response.json();
      console.log("Arquivos enviados:", data);

      // Captura as URLs do arquivo TR
      const downloadLinkTR = data.trFile.webContentLink;
      const viewLinkTR = data.trFile.webViewLink;

      // Captura as URLs do arquivo PROCESSO
      const downloadLinkProcesso = data.processoFile.webContentLink;
      const viewLinkProcesso = data.processoFile.webViewLink;

      // Armazenar as URLs no estado
      setFileUrlTr(downloadLinkTR); // URL do TR
      setViewUrlTr(viewLinkTR); // Visualização do TR

      setFileUrlProcesso(downloadLinkProcesso); // URL do PROCESSO
      setViewUrlProcesso(viewLinkProcesso); // Visualização do PROCESSO

      alert(`Arquivos enviados com sucesso!`);
    } catch (error) {
      console.error("Erro ao enviar os arquivos:", error);
    }
  };

  const handleFileTrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log("Arquivo TR selecionado:", file);
      setFileTr(file);
    }
  };

  const handleFileProcessoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log("Arquivo Processo selecionado:", file);
      setFileProcesso(file);
    }
  };

  return (
    <div>
      {session ? (
        <>
          <p>Bem-vindo, {session.user?.name}</p>
          <button onClick={() => signOut()}>Sair</button>

          <label htmlFor="tr">TR</label>
          <input
            type="text"
            id="tr"
            placeholder="Digite o número do TR"
            value={tr}
            onChange={(e) => setTr(e.target.value)}
          />
          <input type="file" onChange={handleFileTrChange} />
          
          <label htmlFor="processo">Modelo</label>
          <input
            type="text"
            id="modelo"
            placeholder="Digite o número do PROCESSO"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          />
          <input type="file" onChange={handleFileProcessoChange} />

          <button onClick={handleUpload}>Enviar para o Google Drive</button>

          {fileUrlTr && (
            <div>
              <button onClick={() => window.open(fileUrlTr, "_blank")}>
                Baixar Arquivo TR
              </button>
              {viewUrlTr && (
                <button onClick={() => window.open(viewUrlTr, "_blank")}>
                  Visualizar Arquivo TR
                </button>
              )}
            </div>
          )}

          {fileUrlProcesso && (
            <div>
              <button onClick={() => window.open(fileUrlProcesso, "_blank")}>
                Baixar Arquivo Processo
              </button>
              {viewUrlProcesso && (
                <button onClick={() => window.open(viewUrlProcesso, "_blank")}>
                  Visualizar Arquivo Processo
                </button>
              )}
            </div>
          )}

        </>
      ) : (
        <>
          <p>Faça login para enviar arquivos</p>
          <button onClick={() => signIn("google")}>Login com Google</button>
        </>
      )}
    </div>
  );
}
