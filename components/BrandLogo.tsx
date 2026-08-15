type Props = { compact?: boolean };

export default function BrandLogo({ compact = false }: Props) {
  return <span className="inline-flex items-center gap-2.5" aria-label="SohojService home">
    <svg className="h-9 w-9 shrink-0" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#1F4FA3" />
      <path d="M9.5 19.4 20 10l10.5 9.4v10.1a2 2 0 0 1-2 2h-17a2 2 0 0 1-2-2V19.4Z" fill="white" />
      <path d="m15.3 22 3.1 3.1 6.5-6.7" stroke="#1F4FA3" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30.5" cy="9.5" r="5.2" fill="#F3B645" stroke="white" strokeWidth="2" />
    </svg>
    {!compact && <span className="leading-none"><span className="block font-display text-[1.08rem] font-extrabold tracking-[-0.04em] text-[var(--color-ink)]">Sohoj<span className="text-[var(--color-teal)]">Service</span></span><span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--color-ink)]/50">Trusted local help</span></span>}
  </span>;
}
