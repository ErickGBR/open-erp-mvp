import { Metadata } from 'next';

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [];
}

export default function Page() {
  return <div />;
}
