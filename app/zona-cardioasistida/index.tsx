import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/constants/theme';

const PILLARS = [
  { label: 'EQUIPAMIENTO', icon: 'flash' as const },
  { label: 'CAPACITACIÓN', icon: 'people' as const },
  { label: 'SEÑALIZACIÓN', icon: 'flag' as const },
  { label: 'PLAN DE RESPUESTA', icon: 'clipboard' as const },
];

export default function ZonaCardioasistidaMenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={require('../../assets/zona-cardioasistida-dea.png')}
        style={styles.background}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Veladura solo arriba a la izquierda para leer el texto */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.92)',
            'rgba(255,255,255,0.78)',
            'rgba(255,255,255,0.35)',
            'rgba(255,255,255,0)',
          ]}
          locations={[0, 0.22, 0.45, 0.7]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View
          style={[
            styles.overlay,
            {
              paddingTop: spacing.md,
              paddingBottom: Math.max(insets.bottom, 10) + 72,
            },
          ]}
        >
          <View style={styles.topBlock}>
            <Text style={styles.title}>¿Qué es una zona{'\n'}cardioasistida?</Text>

            <Ionicons name="pulse" size={30} color={colors.danger} style={styles.pulse} />

            <Text style={styles.body}>
              No alcanza con tener un <Text style={styles.bold}>DEA</Text>. Una verdadera{' '}
              <Text style={styles.bold}>Zona Cardioasistida</Text> integra equipamiento,
              capacitación, señalización y un plan de respuesta para actuar cuando cada
              minuto cuenta.
            </Text>

            <Text style={styles.cta}>
              Elegí el video o descargá la guía y descubrí cómo funciona.
            </Text>

            <Pressable
              onPress={() => router.push('/zona-cardioasistida/video')}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.playIcon}>
                <Ionicons name="play" size={18} color="#fff" style={{ marginLeft: 2 }} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Video</Text>
                <Text style={styles.cardSubtitle}>Video explicativo</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#A8B4C4" />
            </Pressable>

            <Pressable
              onPress={() => router.push('/zona-cardioasistida/pdf')}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.docIcon}>
                <Ionicons name="document-text" size={18} color="#fff" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>PDF</Text>
                <Text style={styles.cardSubtitle}>Guía N° 1 – LEX</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#A8B4C4" />
            </Pressable>
          </View>

          <View style={styles.pillarsBar}>
            {PILLARS.map((pillar, index) => (
              <View key={pillar.label} style={styles.pillarItem}>
                {index > 0 ? <View style={styles.pillarDivider} /> : null}
                <View style={styles.pillar}>
                  <View style={styles.pillarIconWrap}>
                    <Ionicons name={pillar.icon} size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.pillarLabel} numberOfLines={2}>
                    {pillar.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#E8EDF3',
  },
  background: {
    flex: 1,
    width: '100%',
  },
  backgroundImage: {
    // Estación DEA centrada/visible como en el mockup
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    width: '100%',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  topBlock: {
    maxWidth: 360,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.primary,
  },
  pulse: {
    marginTop: 6,
    marginBottom: spacing.sm,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  bold: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },
  cta: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 10,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.92,
  },
  playIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  cardSubtitle: {
    marginTop: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  pillarsBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(213,224,238,0.95)',
    paddingVertical: 12,
    paddingHorizontal: 6,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pillarItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  pillarDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  pillar: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
    minWidth: 0,
  },
  pillarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.2,
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 10,
  },
});
