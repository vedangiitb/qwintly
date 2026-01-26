import { supabaseServer } from "@/lib/supabase-server";

export const updateFieldSupabase = async (
  id: string,
  colName: string,
  value: any,
  tableName: string,
  token: string,
  eqField?: string,
  schema?: string,
) => {
  const supabase = supabaseServer(token);

  if (!schema) {
    schema = "public";
  }

  if (!eqField) {
    eqField = "id";
  }

  const { error } = await supabase
    .schema(schema)
    .from(tableName)
    .update({ [colName]: value })
    .eq(eqField, id);

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(error.message || "Failed to insert data");
  }
};
