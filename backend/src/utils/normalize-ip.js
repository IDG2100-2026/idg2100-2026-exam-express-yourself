// Normalize IPv4-mapped IPv6 addresses so comparisons are consistent.
// Express on localhost can return ::1 or ::ffff:127.0.0.1 interchangeably.
export function normalizeIp(ip) {
  if (!ip) return "unknown";
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  if (ip === "::1") return "127.0.0.1";
  return ip;
}
