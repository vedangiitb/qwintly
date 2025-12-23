import { supabase } from "@/lib/supabase-client";

export async function fetchUrl(id: string): Promise<string> {
  if (!id) throw new Error("Missing URL ID");
  const { data, error } = await supabase
    .from("project_site")
    .select("url")
    .eq("id", id)
    .single();

  if (error) throw error;
  if (!data?.url) throw new Error("URL not found");

  return data.url;
}
