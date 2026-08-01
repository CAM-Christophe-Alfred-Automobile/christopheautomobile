"use client";

import { useFormStatus } from "react-dom";

/** Submit button that disables itself and shows pending text while the form action runs —
 * prevents the "nothing happened, click again" reflex from firing the action multiple times
 * (e.g. multiple duplicate transactions from repeated "Payé aujourd'hui" clicks). */
export default function SubmitOnceButton({
  children,
  pendingText,
  className,
  title,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-50`} title={title}>
      {pending ? pendingText : children}
    </button>
  );
}
