export const DEV_TOKEN = "12345";

export function withToken(path: string): string {
  return path.includes("?") ? `${path}&token=${DEV_TOKEN}` : `${path}?token=${DEV_TOKEN}`;
}
