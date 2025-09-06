import Header from '@/components/header';

export default function FormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='w-full p-4 mx-auto max-w-[4000px]'>
      <Header />
      {children}
    </main>
  );
}
