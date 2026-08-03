import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { colors, fonts, spacing } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        (disabled || loading || pressed) && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'secondary' && styles.secondaryText,
            variant === 'ghost' && styles.ghostText,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function Input({ style, ...props }: TextInputProps) {
  return (
    <TextInput placeholderTextColor={colors.textMuted} style={[styles.input, style]} {...props} />
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  secondaryText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bodyBold,
    color: colors.text,
    lineHeight: 24,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textMuted,
    lineHeight: 19,
  },
});
