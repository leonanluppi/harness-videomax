import type { InputHTMLAttributes } from "react";

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

/** Label + input + hint/error, matching the Signal design system's VMField. */
export function FormField({ id, label, hint, error, className, ...inputProps }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-vm-ink-2">
        {label}
      </label>
      <input
        id={id}
        className={`h-10 rounded-md border bg-vm-surface px-3 text-sm text-vm-ink placeholder:text-vm-faint outline-none transition-colors focus:border-vm-accent ${
          error ? "border-vm-err" : "border-vm-line-strong"
        } ${className ?? ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hintId}
        {...inputProps}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-vm-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-vm-err">
          {error}
        </p>
      )}
    </div>
  );
}
