type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
};

/** Shared form field: label, input, hint/error text, wired for accessible association. */
export function FormField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  hint,
  error,
  required,
  value,
  onChange,
}: FormFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-vm-ink-2">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-10 rounded-md border bg-vm-surface px-3 text-sm text-vm-ink placeholder:text-vm-faint focus:ring-2 focus:ring-vm-accent focus:outline-none ${
          error ? "border-vm-err" : "border-vm-line-strong"
        }`}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-vm-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-vm-err">
          {error}
        </p>
      )}
    </div>
  );
}
