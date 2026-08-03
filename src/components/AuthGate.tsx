import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { colors, fonts, spacing } from '@/constants/theme';
import { Button, SectionTitle } from '@/components/ui';

interface AuthGateProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthGate({ title, description, children }: AuthGateProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loading}>Cargando sesión...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <SectionTitle title={title} subtitle={description} />
        <Button label="Iniciar sesión" onPress={() => router.push('/auth/login')} />
        <Button
          label="Crear cuenta"
          variant="secondary"
          onPress={() => router.push('/auth/register')}
        />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loading: {
    color: colors.textMuted,
    fontSize: 16,
    fontFamily: fonts.body,
  },
});
