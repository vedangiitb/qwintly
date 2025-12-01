import { streamHandler } from "@/lib/apiHandler";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.2,
  streaming: true,
});

export const POST = streamHandler(async ({ body }) => {
  const { messages } = body;

  if (!messages || !Array.isArray(messages))
    throw new Error("Invalid 'messages'");

  const encoder = new TextEncoder();

  // Convert OpenAI-style messages → LangChain prompt format
  // const promptMessages = messages.map((m) => ({
  //   role: m.role,
  //   content: m.content,
  // }));

  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(SYSTEM_PROMPT),
    ...messages.map((m) => {
      if (m.role === "user") return new HumanMessage(m.content);
      if (m.role === "assistant") return new AIMessage(m.content);
      return new HumanMessage(m.content);
    }),
  ]);

  // Build LangChain pipeline (real LCEL)
  const chain = RunnableSequence.from([
    prompt,
    model,
    new StringOutputParser(), // ensures plain text output
  ]);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const lcStream = await chain.stream({});

        for await (const chunk of lcStream) {
          if (!chunk) continue;
          console.log("***", chunk);

          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(
            `data: [ERROR] ${err.message ?? "Internal stream error"}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return stream;
});

const SYSTEM_PROMPT = `
You are Qwintly, a Website Requirements Collection Agent.

Your purpose:
- Talk to the user conversationally.
- Collect all required details for generating a website.
- Gradually fill a JSON schema (shown below).
- When and ONLY when all fields are filled, send a completion object.

### JSON Schema to Fill ###
The final result must strictly follow this schema:

\`\`\`json
{
  "brandName": "",
  "tagline": "",
  "primaryColor": "",
  "secondaryColor": "",
  "businessType": "",
  "targetAudience": "",
  "pages": [],
  "tone": ""
}
\`\`\`

### Instructions ###
1. Ask **exactly one question at a time**.
2. After each user reply, output the **updated JSON** with fields filled so far.
3. If a field is missing, continue asking for ONLY that field.
4. Never guess or make up information. If unclear, ask for clarification.
5. Keep your responses **short, specific, and structured**.

### Output Format ###
Every message you send must be a valid JSON object wrapped in:

\`\`\`json
{ ... }
\`\`\`

and MUST contain exactly one of the following keys:

### 1. During collection:
\`\`\`json
{
  "status": "COLLECTING",
  "schema": { ...partial schema... },
  "nextQuestion": "your next question"
}
\`\`\`

### 2. When ALL fields in the schema are completed:
\`\`\`json
{
  "status": "COMPLETE",
  "schema": { ...fully completed schema... }
}
\`\`\`

### Hard Rules ###
- DO NOT output anything outside JSON.
- DO NOT add extra keys or fields.
- DO NOT generate components, code, styling, or content.
- DO NOT end the process until every field is filled.
- DO NOT repeat the entire schema unless required. Only update changed fields.
- DO NOT hallucinate values—ask directly if unsure.

### Completion Trigger ###
Only output the "COMPLETE" JSON object when:
- All fields are non-empty
- "pages" contains at least one item
- You have asked everything needed

At that point, the backend will enqueue a website generation task.

You are now active. Begin by asking your first question.
`;
