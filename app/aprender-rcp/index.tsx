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

export default function AprenderRcpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const media = MEDIA.aprenderRcp;
  const photoHeight = Math.round(height * 0.42);

  return (
    <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 8) + 64 }]}>
      {/* Personas RCP visibles abajo */}
      <View style={[styles.photoLayer, { height: photoHeight }]} pointerEvents="none">
        <Image
          source={require('../../assets/aprender-rcp-fondo.png')}
          style={styles.photo}
          resizeMode="cover"
          accessibilityLabel="Capacitación RCP Lex"
        />
        <LinearGradient
          colors={['#FFFFFF', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.2)', 'transparent']}
          locations={[0, 0.22, 0.45, 0.7]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{media.headline}</Text>
        <Ionicons name="pulse" size={24} color={colors.danger} style={styles.pulse} />

        <Text style={styles.subtitle}>
          Capacitarte te permite actuar rápido y con confianza ante una emergencia.
        </Text>
        <Text style={styles.cta}>
          Mirá los videos y descargá las guías para aprender paso a paso.
        </Text>

        <Text style={styles.section}>VIDEOS</Text>
        {media.videos.map((video) => (
          <Pressable
            key={video.id}
            onPress={() =>
              router.push({
                pathname: '/aprender-rcp/video',
                params: { id: video.id },
              })
            }
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.playIcon}>
              <Ionicons name="play" size={13} color={colors.primary} style={{ marginLeft: 1 }} />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {video.title}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </Pressable>
        ))}

        <Text style={[styles.section, styles.sectionPdf]}>PDF</Text>
        {media.pdfs.map((pdf) => (
          <Pressable
            key={pdf.id}
            onPress={() =>
              router.push({
                pathname: '/aprender-rcp/pdf',
                params: { id: pdf.id },
              })
            }
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.docIcon}>
              <Ionicons name="document-text" size={15} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {pdf.title}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </Pressable>
        ))}

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
    bottom: -8,
    width: '100%',
    // Recorta al tramo inferior del PNG (personas + DEA)
    height: '250%',
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
    lineHeight: 28,
    color: colors.primary,
  },
  pulse: {
    marginTop: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    marginBottom: 4,
  },
  cta: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 17,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  section: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.7,
    color: colors.primary,
    marginBottom: 6,
  },
  sectionPdf: {
    marginTop: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 10,
    gap: 8,
    marginBottom: 6,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pressed: {
    opacity: 0.92,
  },
  playIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    lineHeight: 15,
    color: colors.text,
  },
  photoSpacer: {
    flexGrow: 1,
    minHeight: 72,
  },
});
