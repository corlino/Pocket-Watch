import { getDisplayPrefs, listCategories } from "@/features/transactions/queries";
import { appToday } from "@/lib/dates/today";
import { TransactionComposer } from "./transaction-composer";

/** Loads categories and preferences for the composer sheet (streams in after the shell). */
export async function TransactionComposerHost() {
  const [categories, prefs] = await Promise.all([listCategories(), getDisplayPrefs()]);
  return <TransactionComposer categories={categories} prefs={prefs} today={await appToday()} />;
}
