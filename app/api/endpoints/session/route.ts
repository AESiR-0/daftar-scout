import { auth } from "@/app/auth";
import { NextApiRequest } from "next";

export const GET = async (req: NextApiRequest) => {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  return new Response(JSON.stringify(session), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
