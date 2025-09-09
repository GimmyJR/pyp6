import Header from '@/components/header';

export default function FormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='p-4'>
      <Header />
      {children}
    </main>
  );
}
