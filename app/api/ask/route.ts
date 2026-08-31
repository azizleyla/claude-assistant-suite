import { getEmbeddings, cosineSimilarity } from "@/lib/embeddings";
import { getChunks } from "@/lib/store";

async function askClaude(messages: any[], systemPrompt: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: systemPrompt,
      messages: messages,
    }),
  });

  return response.json();
}
async function findRelevantChunks(question: string, topN = 3) {
  const allChunks = getChunks();
  if (allChunks.length === 0) {
    return [];
  }
  const [questionEmbedding] = await getEmbeddings([question]);

  const scoredChunks = allChunks.map((chunk) => ({
    text: chunk.text,
    score: cosineSimilarity(questionEmbedding, chunk.embedding),
  }));
  scoredChunks.sort((a, b) => b.score - a.score);

  return scoredChunks.slice(0, topN);
}

export async function POST(request: Request) {
  const { messages } = await request.json();

  const lastUserMessage = messages[messages.length - 1].content;
  const relevantChunks = await findRelevantChunks(lastUserMessage);

  const context = relevantChunks.map((c) => c.text).join("\n\n---\n\n");

  const systemPrompt = `Sən köməkçi bir AI assistentsən. İstifadəçinin sualına, aşağıda verilən sənəd hissələrinə ƏSASLANARAQ cavab ver. Əgər cavab bu hissələrdə yoxdursa, "Bu barədə sənəddə məlumat tapmadım" de.

SƏNƏD HİSSƏLƏRİ:
${context}`;
  const response = await askClaude(messages, systemPrompt);

  if (response.type === "error") {
    return Response.json({ error: response.error.message }, { status: 400 });
  }

  const textBlock = response.content.find((block: any) => block.type === "text");
  return Response.json({ reply: textBlock.text });
}
