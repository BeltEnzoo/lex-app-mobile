import { Alert, Platform } from 'react-native';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'cancel' | 'default' | 'destructive';
};

export type AppAlertPayload = {
  title: string;
  message: string;
  buttons: AlertButton[];
};

type Listener = (payload: AppAlertPayload | null) => void;

let listener: Listener | null = null;

export function subscribeAppAlert(next: Listener) {
  listener = next;
  return () => {
    if (listener === next) listener = null;
  };
}

export function showAlert(title: string, message: string, buttons?: AlertButton[]) {
  const resolvedButtons: AlertButton[] =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: 'Entendido', style: 'default' }];

  if (Platform.OS === 'web') {
    listener?.({
      title,
      message,
      buttons: resolvedButtons,
    });
    return;
  }

  Alert.alert(title, message, resolvedButtons);
}
