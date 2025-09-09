import Header from '@/components/header';
import MainProvider from './_components/main-providers';

export default function FormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='w-full p-4 mx-auto max-w-[4000px]'>
      <Header />
      <MainProvider />
      {children}
    </main>
  );
}
