const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

export function toDateField(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function toCycleDate(value: string, boundary: "start" | "end") {
  return value
    ? `${value}T${boundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z`
    : null;
}

export function formatCycleDate(value: string | null, fallback = "Not set") {
  return value ? dateFormatter.format(new Date(value)) : fallback;
}

export function formatCycleRange(start: string | null, end: string | null) {
  if (start && end) return `${formatCycleDate(start)} – ${formatCycleDate(end)}`;
  if (start) return `Starts ${formatCycleDate(start)}`;
  if (end) return `Ends ${formatCycleDate(end)}`;
  return "No dates set";
}

