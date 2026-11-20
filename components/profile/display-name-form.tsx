"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateDisplayName } from "@/features/preferences/actions";

/** FR-PRO-001: view and update the display name shown in the header. */
export function DisplayNameForm({ initial }: { initial: string }) {
  const [name, setName] = React.useState(initial);
  const [error, setError] = React.useState<string>();
  const [pending, startTransition] = React.useTransition();
  const unchanged = name.trim() === initial;

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await updateDisplayName(name);
          if (!r.ok) {
            setError(r.fieldErrors?.displayName ?? r.error);
            toast.error(r.error);
            return;
          }
          setError(undefined);
          toast.success("Name updated");
        });
      }}
    >
      <Field
        label="Display name"
        id="display-name"
        error={error}
        hint="Shown in the header and on your profile."
        aside={<span className="text-caption text-fg-muted" aria-hidden>{name.length}/50</span>}
      >
        <Input value={name} maxLength={50} onChange={(e) => setName(e.target.value)} autoComplete="nickname" />
      </Field>
      <Button type="submit" size="lg" loading={pending} disabled={unchanged} className="md:self-start">
        Save Changes
      </Button>
    </form>
  );
}
