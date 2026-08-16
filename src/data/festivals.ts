// Illustrative festival windows (month/day, inclusive) — flavor text only, not price data.
const FESTIVAL_WINDOWS: Array<{ label: string; from: [number, number]; to: [number, number] }> = [
  { label: "Raksha Bandhan season", from: [8, 20], to: [8, 30] },
  { label: "Diwali season", from: [10, 15], to: [11, 15] },
  { label: "Holi season", from: [3, 1], to: [3, 15] },
  { label: "Christmas & New Year", from: [12, 20], to: [1, 5] },
  { label: "Summer holidays", from: [5, 15], to: [6, 20] },
];

function inWindow(month: number, day: number, from: [number, number], to: [number, number]): boolean {
  const md = month * 100 + day;
  const fromMd = from[0] * 100 + from[1];
  const toMd = to[0] * 100 + to[1];
  if (fromMd <= toMd) return md >= fromMd && md <= toMd;
  return md >= fromMd || md <= toMd;
}

export function festivalFor(date: Date): string | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hit = FESTIVAL_WINDOWS.find((w) => inWindow(month, day, w.from, w.to));
  return hit ? hit.label : null;
}
