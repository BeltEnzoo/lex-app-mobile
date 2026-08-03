import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '@/constants/theme';
import {
  subscribeAppAlert,
  type AlertButton,
  type AppAlertPayload,
} from '@/utils/alert';

export function AppAlertHost() {
  const [payload, setPayload] = useState<AppAlertPayload | null>(null);

  useEffect(() => subscribeAppAlert(setPayload), []);

  if (!payload) return null;

  const close = () => setPayload(null);

  const onPressButton = (button: AlertButton) => {
    close();
    button.onPress?.();
  };

  const cancel = payload.buttons.find((b) => b.style === 'cancel');
  const actions = payload.buttons.filter((b) => b.style !== 'cancel');

  return (
    <Modal transparent visible animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{payload.title}</Text>
          {payload.message ? <Text style={styles.message}>{payload.message}</Text> : null}

          <View style={styles.actions}>
            {cancel ? (
              <Pressable
                onPress={() => onPressButton(cancel)}
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryText}>{cancel.text}</Text>
              </Pressable>
            ) : null}

            {actions.map((button) => (
              <Pressable
                key={button.text}
                onPress={() => onPressButton(button)}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  button.style === 'destructive' && styles.destructiveBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryText}>{button.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 58, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: spacing.lg,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  destructiveBtn: {
    backgroundColor: colors.danger,
  },
  primaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: '#fff',
  },
  secondaryBtn: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  secondaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.text,
  },
  pressed: {
    opacity: 0.88,
  },
});
