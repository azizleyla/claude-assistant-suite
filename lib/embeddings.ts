export function chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
  let chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

// Voyage AI-yə embedding sorğusu göndərir
export async function getEmbeddings(textArray: string[]): Promise<number[][]> {
  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: textArray,
      model: "voyage-3-large",
    }),
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(JSON.stringify(data.error));
  }

  return data.data.map((item: { embedding: number[] }) => item.embedding);
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
