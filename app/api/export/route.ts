import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCsv, type CsvRow } from "@/features/backup/csv";
import { serverEnv } from "@/lib/env";
import { isIsoDate, todayInTimeZone } from "@/lib/dates/date-only";

/**
 * Download transactions as CSV (FR-PRO-007). Authenticated administrator
 * only. Optional ?from=YYYY-MM-DD&to=YYYY-MM-DD limits the date range.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  try {
    const rows: CsvRow[] = [];
    const PAGE = 1000;
    for (let offset = 0; ; offset += PAGE) {
      let q = supabase
        .from("transactions")
        .select(
          "transaction_date, transaction_type, amount:amount::text, description, notes, recurring_schedule_id, category:categories!transactions_category_id_transaction_type_fkey ( name ), schedule:recurring_schedules ( is_subscription )",
        )
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE - 1);
      if (from && isIsoDate(from)) q = q.gte("transaction_date", from);
      if (to && isIsoDate(to)) q = q.lte("transaction_date", to);
      const { data, error } = await q;
      if (error) throw error;
      type Row = {
        transaction_date: string;
        transaction_type: "income" | "expense";
        amount: string;
        description: string | null;
        notes: string | null;
        recurring_schedule_id: string | null;
        category: { name: string } | null;
        schedule: { is_subscription: boolean } | null;
      };
      for (const r of (data ?? []) as unknown as Row[]) {
        rows.push({
          date: r.transaction_date,
          type: r.transaction_type,
          category: r.category?.name ?? "",
          description: r.description,
          notes: r.notes,
          amount: r.amount,
          recurring: Boolean(r.recurring_schedule_id),
          subscription: Boolean(r.schedule?.is_subscription),
        });
      }
      if (!data || data.length < PAGE) break;
    }
    const filename = `pocket-watch-transactions-${todayInTimeZone(serverEnv.appTimeZone)}.csv`;
    return new NextResponse(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[export]", error);
    return NextResponse.json({ error: "Export failed. Please try again." }, { status: 500 });
  }
}
