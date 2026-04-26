import { PageWrapper } from "@/components/layout/PageWrapper";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PageWrapper>
      {children}
    </PageWrapper>
  );
}
