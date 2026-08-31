import { PDFParse } from "pdf-parse";
import { chunkText, getEmbeddings } from "@/lib/embeddings";
import { setChunks } from "@/lib/store";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "Fayl tapılmadı" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const pdfData = new PDFParse({ data });
  const rawText = await pdfData.getText();

  const chunks = chunkText(rawText.text, 500, 100);
  const embeddings = await getEmbeddings(chunks);

  const documentChunks = chunks.map((text, i) => ({
    text,
    embedding: embeddings[i],
  }));

  setChunks(documentChunks);

  return Response.json({
    success: true,
    chunksCount: documentChunks.length,
  });
}
