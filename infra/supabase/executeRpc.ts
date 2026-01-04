import { supabaseServer } from "@/lib/supabase-server";

export const executeRpcSupabase = async (
  token: string,
  rpcName: string,
  contents: any
) => {
  const supabase = supabaseServer(token);

  const { data, error } = await supabase.rpc(rpcName, contents);

  if (error) {
    console.error("Supabase RPC error:", error.message);
    throw new Error("Failed to fetch organizations");
  }

  return data ?? [];
};
