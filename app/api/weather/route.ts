const weatherCodeMap: Record<number, string> = {
  0: "açıq səma",
  1: "əsasən açıq",
  2: "qismən buludlu",
  3: "buludlu",
  45: "duman",
  48: "dumanlı, şaxtalı",
  51: "yüngül çiskin",
  53: "orta çiskin",
  55: "sıx çiskin",
  61: "yüngül yağış",
  63: "orta yağış",
  65: "güclü yağış",
  71: "yüngül qar",
  73: "orta qar",
  75: "güclü qar",
  80: "yüngül leysan",
  81: "orta leysan",
  82: "güclü leysan",
  95: "tufan",
};

const describeWeather = (code: number) => {
  return weatherCodeMap[code];
};

//tools
const tools = [
  {
    name: "get_weather",
    description:
      "Verilən coğrafi koordinat üçün hazırkı hava məlumatını qaytarır. Şəhərin adına görə, onun latitude və longitude dəyərlərini özün hesabla və göndər.",
    input_schema: {
      type: "object",
      properties: {
        latitude: {
          type: "number",
          description:
            "Şəhərin enlik koordinatı (latitude), məsələn Bakı üçün 40.4093",
        },
        longitude: {
          type: "number",
          description:
            "Şəhərin uzunluq koordinatı (longitude), məsələn Bakı üçün 49.8671",
        },
      },
      required: ["latitude", "longitude"],
    },
  },
];
async function askClaude(messages: any[]) {
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
      tools: tools,
      system:
        "Sən köməkçi bir AI assistentsən. Qısa, sadə mətn şəklində cavab ver, cədvəl və ya mürəkkəb formatlaşdırma istifadə etmə.",
      messages: messages,
    }),
  });

  const data = await response.json();
  return data;
}

const getWeather = async (latitude: number, longitude: number) => {
  const result = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`,
  );
  const data = await result.json();
  const weather = describeWeather(data?.current?.weather_code);
  const temp = data?.current?.temperature_2m;
  return `Temperatur: ${temp}. Hava:${weather}`;
};

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY təyin olunmayıb (server konfiqurasiyası)." },
      { status: 500 },
    );
  }
  try {
    const { messages } = await request.json();
    let response = await askClaude(messages);
    if (response.type === "error") {
      return Response.json({ error: response.error?.message ?? "Claude API xətası" }, { status: 502 });
    }
    //stop_reason
    if (response.stop_reason === "tool_use") {
      const toolUseBlock = response.content.find(
        (block: any) => block.type === "tool_use",
      );
      let toolResult;
      if (toolUseBlock.name === "get_weather") {
        toolResult = await getWeather(
          toolUseBlock.input.latitude,
          toolUseBlock.input.longitude,
        );
      }
      const messagesWithToolUse = [
        ...messages,
        { role: "assistant", content: response.content },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUseBlock.id,
              content: toolResult,
            },
          ],
        },
      ];
      response = await askClaude(messagesWithToolUse);
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
