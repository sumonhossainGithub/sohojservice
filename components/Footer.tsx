export default function Footer() {
  return (
    <footer className="border-t-2 border-[var(--color-ink)] mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm flex flex-col md:flex-row justify-between gap-4">
        <p className="font-display font-bold">SohojService</p>
        <p className="text-[var(--color-ink)]/70">
          A free, hyperlocal service marketplace for Bangladesh. Built for Sirajganj, made to grow.
        </p>
      </div>
    </footer>
  );
}
