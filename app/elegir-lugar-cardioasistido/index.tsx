import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeaFilterBar } from '@/components/DeaFilterBar';
import { MEDIA } from '@/data/content';
import {
  describeFilterEmpty,
  filterDeasByCategory,
  filterDeasByCityAndType,
  getAllModalityOptions,
  getDeaLocality,
  getDeaProvince,
  getInstitutionCategoryLabel,
  uniqueSorted,
} from '@/data/institutionCategories';
import { getPublicDeas } from '@/services/storage';
import { colors, fonts, spacing } from '@/constants/theme';
import type { DeaLocation } from '@/types';

export default function ElegirLugarCardioasistidoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const media = MEDIA.porqueElegirLugarCardioasistido;

  const [allDeas, setAllDeas] = useState<DeaLocation[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const loadDeas = useCallback(async () => {
    try {
      const deas = await getPublicDeas();
      setAllDeas(deas);
    } catch {
      setAllDeas([]);
    }
  }, []);

  useEffect(() => {
    void loadDeas();
  }, [loadDeas]);

  const provinceOptions = useMemo(
    () => uniqueSorted(allDeas.map((dea) => getDeaProvince(dea))),
    [allDeas],
  );

  const cityOptions = useMemo(() => {
    const scoped = selectedProvince
      ? filterDeasByCityAndType(allDeas, { province: selectedProvince })
      : allDeas;
    return uniqueSorted(scoped.map((dea) => getDeaLocality(dea)));
  }, [allDeas, selectedProvince]);

  const typeOptions = useMemo(() => {
    const base = filterDeasByCityAndType(allDeas, {
      city: selectedCity,
      province: selectedProvince,
    });
    return getAllModalityOptions(base);
  }, [allDeas, selectedCity, selectedProvince]);

  const filteredDeas = useMemo(() => {
    const byType = filterDeasByCategory(allDeas, selectedType);
    return filterDeasByCityAndType(byType, {
      city: selectedCity,
      province: selectedProvince,
      institutionType: null,
    });
  }, [allDeas, selectedCity, selectedProvince, selectedType]);

  const typeLabel = getInstitutionCategoryLabel(selectedType);
  const emptyMessage = describeFilterEmpty({
    city: selectedCity,
    province: selectedProvince,
    typeLabel,
  });

  const lugaresVisibles = useMemo(() => {
    const hasFilters = Boolean(selectedCity || selectedProvince || selectedType);
    return media.lugares.filter((lugar) => {
      if (selectedType && lugar.id !== selectedType) return false;
      const inCategory = filterDeasByCategory(filteredDeas, lugar.id);
      if (hasFilters) return inCategory.length > 0;
      return true;
    });
  }, [media.lugares, filteredDeas, selectedCity, selectedProvince, selectedType]);

  const openMap = (categoria?: string) => {
    const params: Record<string, string> = {};
    const tipo = categoria ?? selectedType ?? undefined;
    if (tipo) params.categoria = tipo;
    if (selectedCity) params.ciudad = selectedCity;
    if (selectedProvince) params.provincia = selectedProvince;
    router.push({ pathname: '/mapa', params });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 12) + 88 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <Text style={styles.headline}>{media.headline}</Text>
            <Text style={styles.body}>{media.body}</Text>
            <Pressable onPress={() => router.push('/elegir-lugar-cardioasistido/pdf')}>
              <Text style={styles.link}>{media.cta}</Text>
            </Pressable>
          </View>
          <Image
            source={require('../../assets/elegir-lugar-dea.png')}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel="Cabina DEA Lex — Zona cardioasistida"
          />
        </View>

        <Pressable
          onPress={() => router.push('/elegir-lugar-cardioasistido/pdf')}
          style={({ pressed }) => [styles.pdfCard, pressed && styles.pressed]}
        >
          <View style={styles.pdfIcon}>
            <Ionicons name="document-text" size={20} color={colors.primary} />
          </View>
          <View style={styles.pdfText}>
            <Text style={styles.pdfTitle}>{media.pdf.title}</Text>
            <Text style={styles.pdfSubtitle}>{media.pdf.subtitle}</Text>
          </View>
          <View style={styles.pdfBadge}>
            <Text style={styles.pdfBadgeLabel}>PDF</Text>
            <Ionicons name="download-outline" size={14} color={colors.primary} />
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>

        <View style={styles.lugaresHeader}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <View style={styles.lugaresHeaderText}>
            <Text style={styles.lugaresTitle}>Red LEX de Lugares Cardioasistidos</Text>
            <Text style={styles.lugaresSubtitle}>
              Filtrá por provincia, localidad y tipo, o explorá las instituciones de la Red LEX.
            </Text>
          </View>
        </View>

        <View style={styles.filters}>
          <DeaFilterBar
            cities={cityOptions}
            provinces={provinceOptions}
            types={typeOptions}
            selectedCity={selectedCity}
            selectedProvince={selectedProvince}
            selectedType={selectedType}
            onCityChange={setSelectedCity}
            onProvinceChange={(province) => {
              setSelectedProvince(province);
              setSelectedCity(null);
            }}
            onTypeChange={setSelectedType}
            resultCount={filteredDeas.length}
            emptyMessage={emptyMessage}
          />
        </View>

        {filteredDeas.length > 0 ? (
          <Pressable
            onPress={() => openMap()}
            style={({ pressed }) => [styles.conocerBtn, pressed && styles.pressed]}
          >
            <Text style={styles.conocerBtnText}>CONOZCA LOS LUGARES CARDIOASISTIDOS</Text>
            <Ionicons name="map" size={18} color="#fff" />
          </Pressable>
        ) : null}

        {lugaresVisibles.map((lugar) => {
          const count = filterDeasByCategory(filteredDeas, lugar.id).length;
          return (
            <Pressable
              key={lugar.id}
              onPress={() => openMap(lugar.id)}
              style={({ pressed }) => [styles.lugarCard, pressed && styles.pressed]}
            >
              <View style={[styles.lugarIcon, { backgroundColor: lugar.accent }]}>
                <Ionicons name={lugar.icon} size={18} color="#fff" />
              </View>
              <View style={styles.lugarText}>
                <Text style={styles.lugarTitle}>{lugar.title}</Text>
                <Text style={styles.lugarDescription}>
                  {count > 0 ? `${count} DEA · ${lugar.description}` : lugar.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </Pressable>
          );
        })}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  heroText: {
    flex: 1.15,
    minWidth: 0,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 28,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  link: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.primary,
  },
  heroImage: {
    width: 118,
    height: 160,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  pdfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: spacing.lg,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pdfIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfText: {
    flex: 1,
    minWidth: 0,
  },
  pdfTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.text,
  },
  pdfSubtitle: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  pdfBadge: {
    alignItems: 'center',
    gap: 2,
  },
  pdfBadgeLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.primary,
  },
  lugaresHeader: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  lugaresHeaderText: {
    flex: 1,
  },
  lugaresTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.primary,
  },
  lugaresSubtitle: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  filters: {
    marginBottom: spacing.md,
  },
  conocerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: spacing.md,
  },
  conocerBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.3,
    color: '#fff',
    textAlign: 'center',
  },
  lugarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lugarIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lugarText: {
    flex: 1,
    minWidth: 0,
  },
  lugarTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  lugarDescription: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  pressed: {
    opacity: 0.92,
  },
});
