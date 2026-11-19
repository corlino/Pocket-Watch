import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
for (const t of ["profiles","preferences","categories","recurring_schedules","transactions","budgets","recurring_processing_runs"]) {
  const a = await admin.from(t).select("*", { count: "exact", head: true });
  const p = await anon.from(t).select("*").limit(1);
  console.log(t.padEnd(26), "secret:", a.error ? a.error.message : `ok (${a.count} rows)`, "| anon:", p.error ? `blocked (${p.error.code})` : `rows=${p.data?.length}`);
}
const rpcAnon = await anon.rpc("process_recurring_schedules", { p_today: "2026-11-19" });
console.log("anon rpc process_recurring_schedules:", rpcAnon.error ? `blocked (${rpcAnon.error.code})` : "ALLOWED");
const users = await admin.auth.admin.listUsers();
console.log("auth users:", users.error ? users.error.message : users.data.users.length);
