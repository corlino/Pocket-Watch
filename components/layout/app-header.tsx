import Link from "next/link";
import { getAutoAddedTransactions, getDisplayPrefs, getProfile } from "@/features/transactions/queries";
import { appToday } from "@/lib/dates/today";
import { NotificationBell } from "./notification-bell";
import { UserAvatar } from "@/components/shared/user-avatar";

/** G-02 Application Header: avatar, greeting, display name, bell. */
export async function AppHeader() {
  const [{ displayName, avatarUrl }, notifications, prefs] = await Promise.all([getProfile(), getAutoAddedTransactions(), getDisplayPrefs()]);
  return (
    <div className="flex h-14 items-center justify-between gap-3">
      <Link
        href="/profile"
        className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <UserAvatar name={displayName} src={avatarUrl} className="size-10 text-body" />
        <span className="min-w-0">
          <span className="block text-caption text-fg-muted">Welcome back,</span>
          <span className="block truncate text-body font-semibold text-fg">{displayName}</span>
        </span>
      </Link>
      <NotificationBell
        transactions={notifications.rows}
        unread={notifications.unread}
        prefs={prefs}
        today={await appToday()}
      />
    </div>
  );
}

export function AppHeaderSkeleton() {
  return (
    <div className="flex h-14 items-center justify-between" aria-hidden>
      <div className="flex items-center gap-3">
        <div className="size-10 animate-pulse rounded-full bg-surface" />
        <div className="space-y-1.5">
          <div className="h-3 w-20 animate-pulse rounded bg-surface" />
          <div className="h-3.5 w-24 animate-pulse rounded bg-surface" />
        </div>
      </div>
      <div className="size-10 animate-pulse rounded-md bg-surface" />
    </div>
  );
}
