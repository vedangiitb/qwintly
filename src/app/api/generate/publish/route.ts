import { publishWebsiteGeneration } from "@/lib/mq/websiteGeneration";

// TODO: update thsi with postHandler
export async function POST(req: Request) {
  const body = await req.json();

  const result = await publishWebsiteGeneration(
    body.chatId,
    body.tasks,
    body.newInfo,
  );

  return Response.json(result);
}
