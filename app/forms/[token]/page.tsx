import IntakeFormPageClient from './page.client';

export default async function IntakeFormPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <IntakeFormPageClient token={token} />;
}

