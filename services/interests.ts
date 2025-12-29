import { apiFetch } from './lists'; // reuse fetch helper

export async function fetchClientInterests(clientId: string) {
  const data = await apiFetch(`/clients/${clientId}/interests`);
  return data?.lists || [];
}

