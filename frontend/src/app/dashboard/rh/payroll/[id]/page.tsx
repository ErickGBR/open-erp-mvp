import ClientPage from './client-page';

export const dynamicParams = false;

export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <ClientPage />;
}
