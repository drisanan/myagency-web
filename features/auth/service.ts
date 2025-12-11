import { getAgencyByEmail } from '@/services/agencies';
import { loginWithGHL } from '@/services/authGHL';
export type Session = {
  role: 'parent' | 'agency';
  agencyId?: string;
  email: string;
  agencyLogo?: string;
  impersonatedBy?: { email: string; role: 'parent' };
  contactId?: string;
};

export async function login(input: { email: string; phone: string; accessCode: string }): Promise<Session> {
  const result = await loginWithGHL(input.email.trim(), input.phone.trim(), input.accessCode.trim());
  if (!result.ok) {
    throw new Error(result.error);
  }
  const agency = await getAgencyByEmail(result.contact.email);
  return {
    role: 'agency',
    email: result.contact.email,
    agencyId: agency?.id,
    contactId: result.contact.id,
  };
}


