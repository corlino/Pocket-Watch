import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { logout } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Profile" };

/**
 * Profile. Phase 1 continues here with category management, password change
 * and data backup; this first cut provides sign-out.
 */
export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Account Settings" />
      <Card>
        <p className="text-body text-fg-secondary">
          Categories, security and data backup are being added next.
        </p>
      </Card>
      <form action={logout}>
        <Button type="submit" variant="destructive-solid" size="lg" block className="md:w-auto">
          <LogOut aria-hidden />
          Sign Out
        </Button>
      </form>
    </div>
  );
}
