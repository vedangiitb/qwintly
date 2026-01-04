import { supabaseServer } from "@/lib/supabase-server";

export const insertDataSupabase = async (
  data: any,
  tableName: string,
  token: string,
  schema?: string
) => {
  const supabase = supabaseServer(token);

  if (!schema) {
    schema = "public";
  }
  const { error } = await supabase.schema(schema).from(tableName).insert(data);

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(error.message || "Failed to insert data");
  }
};
