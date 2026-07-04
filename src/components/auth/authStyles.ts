import type { CSSProperties } from "react";

/** Inline styles for auth form errors, matching the mockup's night/rose palette. */
export const authErr: CSSProperties = {
  color: "#ff9ab0",
  fontSize: 12,
  fontWeight: 600,
  marginTop: 6,
};

export const authFormError: CSSProperties = {
  background: "rgba(255,90,120,.14)",
  border: "1.5px solid rgba(255,90,120,.4)",
  color: "#ffb3c4",
  borderRadius: 14,
  padding: "12px 16px",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
  textAlign: "center",
};
