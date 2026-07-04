"use client";
import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

/** Mockup-styled auth input (`.auth-field`), compatible with react-hook-form register(). */
export const AuthField = forwardRef<HTMLInputElement, Props>(function AuthField(
  { label, error, hint, ...rest },
  ref,
) {
  return (
    <div className="auth-field">
      <label>{label}</label>
      <input ref={ref} {...rest} />
      {hint && !error && (
        <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 5 }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontSize: 11, color: "#ff9ab0", marginTop: 5, fontWeight: 600 }}>{error}</div>
      )}
    </div>
  );
});

/** Inline error banner shared by auth forms. */
export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: "12px 16px",
        marginBottom: 14,
        fontSize: 13,
        fontWeight: 600,
        color: "#ffb59a",
        background: "rgba(255,138,82,.14)",
        border: "1.5px solid rgba(255,138,82,.4)",
        textAlign: "left",
      }}
    >
      {children}
    </div>
  );
}
