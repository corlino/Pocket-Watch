import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FR-06 Form Field Label + helper + accessible error (style guide §7.6).
 * Pass the control as a child; Field wires id/aria attributes onto it.
 */
type FieldProps = {
  label: React.ReactNode;
  id: string;
  error?: string;
  hint?: React.ReactNode;
  /** Rendered at the right of the label row (e.g. a character counter). */
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactElement<{
    id?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }>;
};

export function Field({ label, id, error, hint, aside, className, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-caption font-medium text-fg-secondary">
          {label}
        </label>
        {aside}
      </div>
      {React.cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {hint && !error && (
        <p id={hintId} className="text-caption text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-caption font-medium text-expense">
          {error}
        </p>
      )}
    </div>
  );
}

/** Group label for non-input controls (segmented controls, grids). */
export function FieldGroup({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const id = React.useId();
  return (
    <div role="group" aria-labelledby={`${id}-label`} className={cn("flex flex-col gap-1.5", className)}>
      <span id={`${id}-label`} className="text-caption font-medium text-fg-secondary">
        {label}
      </span>
      {children}
      {error && (
        <p role="alert" className="text-caption font-medium text-expense">
          {error}
        </p>
      )}
    </div>
  );
}
