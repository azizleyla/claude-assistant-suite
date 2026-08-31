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
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY təyin olunmayıb (server konfiqurasiyası)." },
      { status: 500 },
    );
  }
  try {
    const { messages } = await request.json();

    const lastUserMessage = messages[messages.length - 1].content;
    const relevantChunks = await findRelevantChunks(lastUserMessage);

    if (relevantChunks.length === 0) {
      return Response.json({
        reply: "Əvvəlcə bir PDF sənəd yüklə — hazırda yaddaşda sənəd yoxdur.",
      });
    }

    const context = relevantChunks.map((c) => c.text).join("\n\n---\n\n");

    const systemPrompt = `Sən köməkçi bir AI assistentsən. İstifadəçinin sualına, aşağıda verilən sənəd hissələrinə ƏSASLANARAQ cavab ver. Əgər cavab bu hissələrdə yoxdursa, "Bu barədə sənəddə məlumat tapmadım" de.

SƏNƏD HİSSƏLƏRİ:
${context}`;
    const response = await askClaude(messages, systemPrompt);

    if (response.type === "error") {
      return Response.json({ error: response.error?.message ?? "Claude API xətası" }, { status: 502 });
    }

    const textBlock = response.content?.find((block: any) => block.type === "text");
    return Response.json({ reply: textBlock?.text ?? "(cavab yoxdur)" });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Naməlum server xətası" },
      { status: 500 },
    );
  }
}
