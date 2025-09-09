export function buildMediaUrl(filePath: string) {
  const base = process.env.SERVER_HOST || "http://localhost:5000";
  return `${base}/${filePath.replace(/\\/g, "/")}`;
}
