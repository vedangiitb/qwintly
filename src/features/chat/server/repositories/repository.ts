import { supabaseServer } from "@/lib/supabase-server";

export class DBRepository {
  protected readonly token: string;

  constructor(token: string) {
    if (!token) throw new Error("Auth token is required");
    this.token = token;
  }

  protected get client() {
    return supabaseServer(this.token);
  }
}
