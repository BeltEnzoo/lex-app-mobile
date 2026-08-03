import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/constants/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

export function Screen({ children, scroll = true, contentStyle }: ScreenProps) {
  if (!scroll) {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl + 72,
  },
});
