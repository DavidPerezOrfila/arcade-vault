import AuthForm from './AuthForm';

export const metadata = {
  title: 'Acceso · Arcade Vault',
  description: 'Inicia sesión o crea una cuenta en el Arcade Vault.',
};

interface AuthPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { redirect } = await searchParams;
  return <AuthForm redirect={typeof redirect === 'string' ? redirect : ''} />;
}
