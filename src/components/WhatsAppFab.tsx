import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WHATSAPP_URL } from '@/data/content';
import { fonts, spacing } from '@/constants/theme';

export function WhatsAppFab() {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={() => Linking.openURL(WHATSAPP_URL)}
      style={({ pressed }) => [
        styles.fab,
        { bottom: Math.max(insets.bottom, 16) + 8 },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Contactar por WhatsApp"
    >
      <Ionicons name="logo-whatsapp" size={28} color="#fff" />
      <View style={styles.labelWrap}>
        <Text style={styles.label}>WhatsApp</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  labelWrap: {
    paddingRight: 4,
  },
  label: {
    color: '#fff',
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
});
