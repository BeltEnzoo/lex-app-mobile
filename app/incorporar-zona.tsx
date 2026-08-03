import { useRouter } from 'expo-router';

import { ZoneRegistrationForm } from '@/components/ZoneRegistrationForm';

export default function IncorporarZonaScreen() {
  const router = useRouter();

  return <ZoneRegistrationForm onSubmitted={() => router.back()} />;
}
