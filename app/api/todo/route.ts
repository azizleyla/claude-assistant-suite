type Todo = { id: number; task: string; completed: boolean };

let todos: Todo[] = [];
let nextId = 1;

function addTodoTask(task: string) {
  const newTodo = { id: nextId, task, completed: false };
  todos.push(newTodo);
  nextId++;
  return `"${task}" siyahıya əlavə olundu (ID: ${newTodo.id})`;
}
function listTodos() {
  if (todos.length === 0) return "Siyahı boşdur.";
  return todos
    .map((t) => `[${t.id}] ${t.completed ? "✅" : "⬜"} ${t.task}`)
    .join("\n");
}

function deleteTodo(id: number) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return `ID ${id} tapılmadı.`;
  const removed = todos.splice(index, 1)[0];
  return `"${removed.task}" silindi.`;
}

const tools = [
  {
    name: "add_todo",
    description: "Yeni bir tapşırığı todo siyahısına əlavə edir.",
    input_schema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "Əlavə ediləcək tapşırığın mətni",
        },
      },
      required: ["task"],
    },
  },
  {
    name: "list_todos",
    description:
      "Hazırkı todo siyahısını göstərir, bütün tapşırıqları ID-ləri ilə birlikdə qaytarır.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "delete_todo",
    description: "Verilən ID-yə uyğun tapşırığı siyahıdan silir.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Silinəcək tapşırığın ID-si" },
      },
      required: ["id"],
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
        "Sən köməkçi bir AI assistentsən. Qısa, sadə mətn şəklində cavab ver.",
      messages: messages,
    }),
  });

  const data = await response.json();
  console.log("askClaude status:", response.status);
  console.log("askClaude response:", JSON.stringify(data, null, 2));
  return data;
}
// ADDIM 3: alət adına görə DÜZGÜN funksiyanı çağıran "router"
function executeTool(name: string, input: any) {
  switch (name) {
    case "add_todo":
      return addTodoTask(input.task);
    case "delete_todo":
      return deleteTodo(input.id);
    case "list_todos":
      return listTodos();
    default:
      return "namelum alet";
  }
}
export async function POST(request: Request) {
  const { messages } = await request.json();
  let response = await askClaude(messages); //
  if (response.stop_reason === "tool_use") {
    const toolUseBlock = response.content.find(
      (block: any) => block.type === "tool_use",
    );
    const toolsResult = executeTool(toolUseBlock.name, toolUseBlock.input);
    const messageWithTools = [
      ...messages,
      { role: "assistant", content: response.content },
      {
        role: "user",
        content: [
          {
            tool_use_id: toolUseBlock.id,
            type: "tool_result",
            content: toolsResult,
          },
        ],
      },
    ];
    response = await askClaude(messageWithTools);
  }
  const textBlock = response.content.find((block: any) => block.type === "text");
  return Response.json({ reply: textBlock.text });
}
