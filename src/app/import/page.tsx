import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth-actions';
import { ImportForm } from '@/components/ImportForm';

async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export default async function ImportPage() {
  await requireAuth();

  return <ImportForm />;
}
