import { isIP } from "node:net";

function isPrivateOrLocalIp(ip) {
  if (!ip || !isIP(ip)) return true;

  // IPv4 private, loopback, link-local and unspecified ranges.
  if (isIP(ip) === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;

    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }

  const normalized = ip.toLowerCase();

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.")
  );
}

export async function getLoginLocation(ipAddress) {
  if (isPrivateOrLocalIp(ipAddress)) {
    return null;
  }

  try {
    const response = await fetch(
      `https://ipapi.co/${encodeURIComponent(ipAddress)}/json/`,
      { signal: AbortSignal.timeout(2000) },
    );

    if (!response.ok) return null;

    const result = await response.json();

    if (result.error) return null;

    return {
      country: result.country_name || null,
      region: result.region || null,
      city: result.city || null,
      latitude: Number.isFinite(result.latitude) ? result.latitude : null,
      longitude: Number.isFinite(result.longitude) ? result.longitude : null,
      source: "ip",
    };
  } catch {
    // Location lookup failure must not block login.
    return null;
  }
}
