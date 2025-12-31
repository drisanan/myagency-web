import { Metadata } from 'next';
import { AthleteProfileClient } from './page.client';

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} | Athlete Profile`,
    description: `View the athletic profile of @${username}`,
  };
}

export default async function AthleteProfilePage({ params }: Props) {
  const { username } = await params;
  return <AthleteProfileClient username={username} />;
}

