type MapPreviewProps = { latitude?: number | null; longitude?: number | null; title: string; compact?: boolean };

export default function MapPreview({ latitude, longitude, title, compact = false }: MapPreviewProps) {
  if (latitude == null || longitude == null) return null;
  const point = `${latitude},${longitude}`;
  return <div className={compact ? "mt-2" : "mt-4"}>
    <iframe title={`${title} location map`} src={`https://www.google.com/maps?q=${encodeURIComponent(point)}&z=14&output=embed`} className={`w-full rounded-xl border border-[var(--color-line)] ${compact ? "h-36" : "h-56"}`} loading="lazy" />
    <a className="mt-1 inline-block text-xs font-semibold text-[var(--color-teal)] underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point)}`}>Open {title} in Maps</a>
  </div>;
}
