import ClientPage from './client-page';

export const dynamicParams = true;
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <ClientPage />;
}
