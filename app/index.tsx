import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OFFICIAL_WEBSITE_URL } from '@/data/content';
import { colors, fonts, spacing } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const HOME_ACTIONS: {
  label: string;
  description: string;
  route:
    | '/mapa'
    | '/zona-cardioasistida'
    | '/elegir-lugar-cardioasistido'
    | '/aprender-rcp'
    | '/servicios-red-lex';
  icon: IconName;
  accent: string;
  featured?: boolean;
}[] = [
  {
    label: 'Mapa de zonas cardioasistidas',
    description: 'Encontrá DEA cercanos y navegá el mapa',
    route: '/mapa',
    icon: 'map',
    accent: '#0047AB',
    featured: true,
  },
  {
    label: '¿Qué es una zona cardioasistida?',
    description: 'Video y PDF explicativos',
    route: '/zona-cardioasistida',
    icon: 'play-circle',
    accent: '#1A6BCC',
  },
  {
    label: '¿Por qué elegir un lugar cardioasistido?',
    description: 'Guía PDF y lugares de la Red LEX',
    route: '/elegir-lugar-cardioasistido',
    icon: 'document-text',
    accent: '#0E7490',
  },
  {
    label: 'Aprender RCP y uso de DEA',
    description: 'Videos y PDFs formativos',
    route: '/aprender-rcp',
    icon: 'fitness',
    accent: '#B45309',
  },
  {
    label: 'Servicios de Red Lex',
    description: 'Material, videos y planes de la red',
    route: '/servicios-red-lex',
    icon: 'people',
    accent: '#15803D',
  },
];

function HeartBoltMark({ size = 40 }: { size?: number }) {
  const heart = Math.round(size * 0.72);
  const bolt = Math.round(size * 0.34);
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Ionicons name="heart" size={heart} color="#fff" />
      <Ionicons name="flash" size={bolt} color={colors.primary} style={styles.markBolt} />
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const compact = height < 780;
  const featured = HOME_ACTIONS.find((a) => a.featured)!;
  const rest = HOME_ACTIONS.filter((a) => !a.featured);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#D6E6FA', '#EEF4FB', '#F7FAFD']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, styles.blobTop]} pointerEvents="none" />
      <View style={[styles.blob, styles.blobSide]} pointerEvents="none" />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + (compact ? 10 : spacing.md),
            paddingBottom: Math.max(insets.bottom, 8) + 64,
          },
        ]}
      >
        <View style={[styles.brandBlock, compact && styles.brandBlockCompact]}>
          <View style={styles.brandRow}>
            <HeartBoltMark size={compact ? 36 : 40} />
            <View>
              <Text style={[styles.brand, compact && styles.brandCompact]}>LEX</Text>
              <Text style={styles.tagline}>CardioSegura</Text>
            </View>
          </View>
          {!compact ? (
            <Text style={styles.intro} numberOfLines={2}>
              Encontrá zonas cardioasistidas, conocé la red Lex y aprendé qué hacer ante una
              emergencia.
            </Text>
          ) : null}
        </View>

        <View style={[styles.featuredStack, compact && styles.featuredStackCompact]}>
          <Pressable
            onPress={() => router.push(featured.route)}
            style={({ pressed }) => [styles.featuredWrap, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={['#0047AB', '#1A6BCC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.featured, compact && styles.featuredCompact]}
            >
              <View style={[styles.featuredIcon, compact && styles.featuredIconCompact]}>
                <Ionicons name={featured.icon} size={compact ? 22 : 24} color="#fff" />
              </View>
              <View style={styles.featuredText}>
                <Text style={styles.featuredLabel} numberOfLines={1}>
                  {featured.label}
                </Text>
                <Text style={styles.featuredDesc} numberOfLines={1}>
                  {featured.description}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => router.push('/incorporar-zona')}
            style={({ pressed }) => [styles.featuredWrap, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={['#B91C1C', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.featured, compact && styles.featuredCompact]}
            >
              <View style={[styles.featuredIcon, compact && styles.featuredIconCompact]}>
                <Ionicons name="heart" size={compact ? 22 : 24} color="#fff" />
              </View>
              <View style={styles.featuredText}>
                <Text style={styles.featuredLabel} numberOfLines={1}>
                  Incorporar zona
                </Text>
                <Text style={styles.featuredDesc} numberOfLines={1}>
                  Sumá tu espacio a la red Lex
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Más opciones</Text>

        <View style={[styles.actions, compact && styles.actionsCompact]}>
          {rest.map((action, index) => (
            <Pressable
              key={action.route}
              onPress={() => router.push(action.route)}
              style={({ pressed }) => [
                styles.menuRow,
                compact && styles.menuRowCompact,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.accentBar, { backgroundColor: action.accent }]} />
              <View style={[styles.iconWrap, { backgroundColor: `${action.accent}14` }]}>
                <Ionicons name={action.icon} size={20} color={action.accent} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle} numberOfLines={1}>
                  {action.label}
                </Text>
                <Text style={styles.menuDescription} numberOfLines={1}>
                  {action.description}
                </Text>
              </View>
              <Text style={styles.step}>{String(index + 1).padStart(2, '0')}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => Linking.openURL(OFFICIAL_WEBSITE_URL)}
          style={({ pressed }) => [styles.footerLink, pressed && styles.pressed]}
        >
          <Ionicons name="globe-outline" size={16} color={colors.primary} />
          <Text style={styles.footerText}>Más información en nuestra web oficial</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    width: '100%',
    maxWidth: '100%',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.35,
  },
  blobTop: {
    width: 180,
    height: 180,
    backgroundColor: '#9EC0EB',
    top: -50,
    right: -50,
  },
  blobSide: {
    width: 140,
    height: 140,
    backgroundColor: '#B8D4F2',
    bottom: 100,
    left: -60,
  },
  brandBlock: {
    marginBottom: spacing.sm,
  },
  brandBlockCompact: {
    marginBottom: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mark: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markBolt: {
    position: 'absolute',
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
    letterSpacing: 3,
    lineHeight: 40,
  },
  brandCompact: {
    fontSize: 30,
    lineHeight: 34,
  },
  tagline: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.primary,
    marginTop: 0,
  },
  intro: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  featuredStack: {
    gap: 10,
    marginBottom: spacing.md,
  },
  featuredStackCompact: {
    gap: 8,
    marginBottom: spacing.sm,
  },
  featuredWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    width: '100%',
  },
  featured: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  featuredCompact: {
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  featuredIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredIconCompact: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  featuredText: {
    flex: 1,
    minWidth: 0,
  },
  featuredLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#fff',
    lineHeight: 20,
  },
  featuredDesc: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    marginBottom: 6,
  },
  actions: {
    gap: 8,
    flexShrink: 1,
  },
  actionsCompact: {
    gap: 6,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingRight: 12,
    paddingLeft: 0,
    gap: 8,
    overflow: 'hidden',
    width: '100%',
  },
  menuRowCompact: {
    paddingVertical: 8,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  menuText: {
    flex: 1,
    minWidth: 0,
  },
  menuTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.text,
    lineHeight: 17,
  },
  menuDescription: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
    lineHeight: 15,
  },
  step: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: '#C5D2E3',
  },
  footerLink: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: spacing.sm,
  },
  footerText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primary,
  },
});
