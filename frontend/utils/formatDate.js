/**
 * Formats an ISO date string (e.g. "2026-04-29") into a short label (e.g. "Apr 29").
 */
export function formatDate(isoString) {
  const months = [
    "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const [, m, d] = isoString.split("-");
  return `${months[parseInt(m)]} ${parseInt(d)}`;
}
