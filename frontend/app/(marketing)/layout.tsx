export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-light text-slate-900 selection:bg-brand-orange selection:text-white font-sans">
      {children}
    </div>
  );
}
