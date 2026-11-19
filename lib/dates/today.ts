import "server-only";
import { connection } from "next/server";
import { serverEnv } from "@/lib/env";
import { todayInTimeZone, type IsoDate } from "./date-only";

/** Today's date in APP_TIME_ZONE, evaluated per request (never prerendered). */
export async function appToday(): Promise<IsoDate> {
  await connection();
  return todayInTimeZone(serverEnv.appTimeZone);
}
