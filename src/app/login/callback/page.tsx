import { supabaseAdmin } from "@/lib/supabase-server";

export default async function AuthCallback() {
  const supabase = supabaseAdmin();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Authentication failed.</div>;

  await supabase.from("users").upsert({
    id: user.id,
    name: user.user_metadata.full_name || "",
    email: user.email,
    plan: "free",
    usage_count: 0,
    created_at: new Date().toISOString(),
  });

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.location.href = "/dashboard"`,
      }}
    />
  );
}
