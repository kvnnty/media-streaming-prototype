export function buildMediaUrl(filePath: string) {
  const base = process.env.SERVER_HOST || "http://localhost:8080";
  return `${base}/${filePath.replace(/\\/g, "/")}`;
}
