import { supabaseServer } from "@/lib/supabase-server";

export const getDataSupabase = async (
  token: string,
  tableName: string,
  fields: string[],
  eqField: Record<string, string>,
) => {
  const supabase = supabaseServer(token);
  let selectString = "";
  if (fields.length > 0) {
    selectString = fields.join(",");
  } else {
    selectString = "*";
  }
  const { data, error } = await supabase
    .from(tableName)
    .select(selectString)
    .eq(eqField.col, eqField.value);
  return { data, error };
};
