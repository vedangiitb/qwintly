import { supabaseServer } from "@/lib/supabase-server";

export const getDataSupabase = async <T>(
  token: string,
  tableName: string,
  fields: string[],
  eqField: { col: string; value: any },
) => {
  const supabase = supabaseServer(token);

  const selectString = fields.length ? fields.join(",") : "*";

  const { data, error } = await supabase
    .from(tableName)
    .select(selectString)
    .eq(eqField.col, eqField.value);

  return { data: data as T[] | null, error };
};
