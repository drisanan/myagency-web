import UpdateFormPageClient from './page.client';

export default async function UpdateFormPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <UpdateFormPageClient token={token} />;
}
