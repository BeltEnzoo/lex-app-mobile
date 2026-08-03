import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts, spacing } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface MenuItem {
  label: string;
  description?: string;
  icon?: IconName;
  onPress: () => void;
}

interface MenuScreenProps {
  title: string;
  subtitle?: string;
  items: MenuItem[];
}

export function MenuScreen({ title, subtitle, items }: MenuScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon ?? 'ellipse'} size={22} color={colors.primary} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.itemTitle}>{item.label}</Text>
              {item.description ? (
                <Text style={styles.itemDescription}>{item.description}</Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
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
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: spacing.md,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  list: {
    gap: 12,
    marginTop: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  pressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  itemDescription: {
    marginTop: 3,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
});
