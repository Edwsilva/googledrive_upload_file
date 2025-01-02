import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  console.log("process.env.NEXTAUTH_SECRET", process.env.GOOGLE_CLIENT_ID)
  const [tr, setTr] = useState("");
  const [modelo, setModelo] = useState("");
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null); // URL para download/visualização
  const [viewUrl, setViewUrl] = useState<string | null>(null); // URL para visualização

  const handleUpload = async () => {
    if (!file) {
      console.error("Nenhum arquivo selecionado para upload.");
      return;
    }

    const formData = new FormData();
    formData.append("tr", tr);
    formData.append("filename", file.name);
    formData.append("file", file);
    formData.append("mimeType", file.type);

    formData.append("modelo", modelo);

    console.log("Formdata ", formData);
    // Inspecionar o conteúdo do FormData
    for (const [key, value] of formData.entries()) {
      console.log(`CHAVE ${key}:`, value);
    }
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
      console.log("Arquivo enviado:", data);

      // Captura a URL do arquivo
      //const fileUrl = data.webViewLink || data.webContentLink;
      //console.log("URL do arquivo no Google Drive:", fileUrl);
      // Captura as URLs do arquivo
      const downloadLink = data.webContentLink;
      const viewLink = data.webViewLink;

      // Armazena as URLs no estado
      setFileUrl(downloadLink);
      setViewUrl(viewLink);
      // Aqui você pode usar a URL (por exemplo, exibir no frontend)
      alert(`Arquivo enviado com sucesso! URL: ${fileUrl}`);
    } catch (error) {
      console.error("Erro ao enviar o arquivo:", error);
    }
  };

  const handleFileTrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log("Selected file:", file); // Verifique se o arquivo é válido aqui
      setFile(file);
    }
  };

  const handleFileProcessoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log("Selected file:", file); // Verifique se o arquivo é válido aqui
      setFile(file);
    }
  };
  return (
    <div>
      {session ? (
        <>
          <p>Bem-vindo, {session.user?.name}</p>
          <button onClick={() => signOut()}>Sair</button>
          <label htmlFor="processo">TR</label>
          <input
            type="text"
            id="tr"
            placeholder="Digite o número do TR"
            value={tr}
            onChange={(e) => setTr(e.target.value)}
            // className={style.input}
          />
          <input type="file" onChange={handleFileTrChange} />
          <label htmlFor="processo">Modelo</label>
          <input
            type="text"
            id="modelo"
            placeholder="Digite o número do PROCESSO"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            // className={style.input}
          />
          <input type="file" onChange={handleFileProcessoChange} />

          <button onClick={handleUpload}>Enviar para o Google Drive</button>
          {fileUrl && (
            <div>
              <button onClick={() => window.open(fileUrl, "_blank")}>
                Baixar Arquivo
              </button>
              {viewUrl && (
                <button onClick={() => window.open(viewUrl, "_blank")}>
                  Visualizar Arquivo
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

