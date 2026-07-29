// Lightweight relative-time formatter -- avoids pulling in date-fns/dayjs
// for one function.
export function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const steps = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [label, secs] of steps) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value}${label[0]}`;
  }
  return "now";
}
