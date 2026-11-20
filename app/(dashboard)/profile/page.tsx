import type { Metadata } from "next";
import { Suspense } from "react";
import { DatabaseBackup, Globe, LogOut, Palette, Repeat, ShieldCheck, Shapes, UserRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ProfileMenuItem, ProfileSection } from "@/components/profile/profile-menu-item";
import { logout } from "@/features/auth/actions";
import { getProfile } from "@/features/transactions/queries";

export const metadata: Metadata = { title: "Profile" };

/** Profile & settings (style guide §9.4, component spec §7.6). */
export default function ProfilePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title="Account Settings" className="md:hidden" />
      <Suspense fallback={<div className="h-36" />}>
        <ProfileHeader />
      </Suspense>

      <ProfileSection title="Account">
        <ProfileMenuItem href="/profile/security" icon={ShieldCheck} title="Security" description="Change your password" />
        <ProfileMenuItem href="/profile/edit" icon={UserRound} title="Edit Profile" description="Change your display name" />
      </ProfileSection>

      <ProfileSection title="Money">
        <ProfileMenuItem href="/profile/categories" icon={Shapes} title="Categories" description="Create, edit, archive and restore categories" />
        <ProfileMenuItem href="/profile/recurring" icon={Repeat} title="Recurring" description="View, edit or stop repeating transactions" />
        <ProfileMenuItem href="/profile/data" icon={DatabaseBackup} title="Data & Backup" description="Export, back up and restore your data" />
      </ProfileSection>

      <ProfileSection title="Preferences">
        <ProfileMenuItem href="/profile/appearance" icon={Palette} title="Appearance" description="Dark, light or follow your phone" />
        <ProfileMenuItem href="/profile/regional" icon={Globe} title="Regional" description="Currency, date and number format" />
      </ProfileSection>

      <form action={logout}>
        <Button type="submit" variant="destructive-solid" size="lg" block>
          <LogOut aria-hidden />
          Sign Out
        </Button>
      </form>
    </div>
  );
}

async function ProfileHeader() {
  const { displayName } = await getProfile();
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <span
        aria-hidden
        className="inline-flex size-22 items-center justify-center rounded-full bg-brand-soft text-h1 font-semibold text-brand-secondary light:text-brand"
      >
        {initials}
      </span>
      <div>
        <p className="text-h3 font-semibold text-fg">{displayName}</p>
        <p className="text-caption text-fg-muted">Pocket Watch administrator</p>
      </div>
    </div>
  );
}
