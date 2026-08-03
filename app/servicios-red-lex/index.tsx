import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MEDIA } from '@/data/content';
import { colors, fonts, spacing } from '@/constants/theme';

export default function ServiciosRedLexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const media = MEDIA.serviciosRedLex;
  const photoHeight = Math.round(height * 0.46);

  return (
    <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 8) + 64 }]}>
      <View style={[styles.photoLayer, { height: photoHeight }]} pointerEvents="none">
        <Image
          source={require('../../assets/servicios-red-lex-fondo.png')}
          style={styles.photo}
          resizeMode="cover"
          accessibilityLabel="Servicios Red Lex"
        />
        <LinearGradient
          colors={['#FFFFFF', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0.2)', 'transparent']}
          locations={[0, 0.25, 0.5, 0.75]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{media.headline}</Text>
        <Ionicons name="pulse" size={26} color={colors.danger} style={styles.pulse} />

        <Text style={styles.subtitle}>
          Conocé todos los servicios que ofrecemos para que tu institución sea un{' '}
          <Text style={styles.bold}>lugar cardioasistido</Text>.
        </Text>
        <Text style={styles.cta}>Mirá los videos y descargá los materiales.</Text>

        <Pressable
          onPress={() => router.push('/servicios-red-lex/videos')}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={[styles.iconWrap, styles.iconPlay]}>
            <Ionicons name="play" size={14} color="#fff" style={{ marginLeft: 1 }} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{media.videos[0].title}</Text>
            <Text style={styles.cardSubtitle}>{media.videos[0].subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#A8B4C4" />
        </Pressable>

        <Pressable
          onPress={() => router.push('/servicios-red-lex/pdf')}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={[styles.iconWrap, styles.iconDoc]}>
            <Ionicons name="document-text" size={16} color={colors.primary} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{media.pdf.title}</Text>
            <Text style={styles.cardSubtitle}>{media.pdf.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#A8B4C4" />
        </Pressable>

        {media.plans.map((plan) => (
          <Pressable
            key={plan.id}
            onPress={() =>
              router.push({
                pathname: '/servicios-red-lex/pdf',
                params: { plan: plan.id },
              })
            }
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${plan.accent}22` }]}>
              <Ionicons name={plan.icon} size={16} color={plan.accent} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{plan.title}</Text>
              <Text style={styles.cardSubtitle}>{plan.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#A8B4C4" />
          </Pressable>
        ))}

        <Pressable
          onPress={() => router.push('/incorporar-zona')}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={[styles.iconWrap, styles.iconAdd]}>
            <Ionicons name="add-circle" size={18} color={colors.primary} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Incorporar zona</Text>
            <Text style={styles.cardSubtitle}>Sumá tu espacio a la red</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#A8B4C4" />
        </Pressable>

        <View style={styles.photoSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  photoLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  photo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -4,
    width: '100%',
    height: '230%',
  },
  body: {
    flex: 1,
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    overflow: 'hidden',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 29,
    color: colors.primary,
    maxWidth: 320,
  },
  pulse: {
    marginTop: 4,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.primaryDark,
    marginBottom: 4,
    maxWidth: 300,
  },
  bold: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },
  cta: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 17,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
    marginBottom: 6,
    maxWidth: 360,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlay: {
    backgroundColor: colors.primary,
  },
  iconDoc: {
    backgroundColor: colors.iconBg,
    borderRadius: 9,
  },
  iconAdd: {
    backgroundColor: colors.iconBg,
    borderRadius: 9,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.text,
  },
  cardSubtitle: {
    marginTop: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  photoSpacer: {
    flexGrow: 1,
    minHeight: 56,
  },
});
