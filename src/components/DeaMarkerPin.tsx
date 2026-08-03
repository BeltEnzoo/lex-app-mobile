import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/theme';

type DeaMarkerPinProps = {
  source?: 'lex' | 'community' | string;
  selected?: boolean;
};

/** Corazón con rayito: marcador visual de DEA en el mapa. */
export function DeaMarkerPin({ source = 'lex', selected = false }: DeaMarkerPinProps) {
  const fill = source === 'lex' ? colors.lex : colors.community;
  const heart = selected ? 42 : 36;
  const bolt = selected ? 16 : 14;

  return (
    <View style={[styles.wrap, selected && styles.wrapSelected]}>
      <Ionicons name="heart" size={heart} color={fill} />
      <Ionicons name="flash" size={bolt} color="#fff" style={styles.bolt} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  wrapSelected: {
    width: 50,
    height: 50,
  },
  bolt: {
    position: 'absolute',
  },
});
