import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';

import { Button } from '@/components/ui';
import { DeaFilterBar } from '@/components/DeaFilterBar';
import { CARDIO_SAFE_ZONES, INITIAL_DEAS } from '@/data/mock';
import {
  describeFilterEmpty,
  filterDeasByCategory,
  filterDeasByCityAndType,
  getAllModalityOptions,
  getDeaInstitutionType,
  getDeaLocality,
  getDeaProvince,
  getInstitutionCategoryLabel,
  resolveCategoryId,
  uniqueSorted,
} from '@/data/institutionCategories';
import { colors, fonts, spacing } from '@/constants/theme';
import { distanceInMeters, findNearestDea, formatDistance, openExternalMaps } from '@/services/geo';
import { getActiveZones, getPublicDeas } from '@/services/storage';
import type { CardioSafeZone, DeaLocation } from '@/types';

const NEARBY_RADIUS_METERS = 3000;

type DeaMapScreenProps = {
  categoria?: string;
  ciudad?: string;
  provincia?: string;
};

export function DeaMapScreen({ categoria, ciudad, provincia }: DeaMapScreenProps) {
  const params = useLocalSearchParams<{
    categoria?: string | string[];
    ciudad?: string | string[];
    provincia?: string | string[];
  }>();
  const categoryId = categoria ?? resolveCategoryId(params.categoria);
  const initialCity = ciudad ?? resolveCategoryId(params.ciudad) ?? null;
  const initialProvince = provincia ?? resolveCategoryId(params.provincia) ?? null;
  const [allDeas, setAllDeas] = useState<DeaLocation[]>([]);
  const [zones, setZones] = useState<CardioSafeZone[]>(CARDIO_SAFE_ZONES);
  const [selectedDea, setSelectedDea] = useState<DeaLocation | null>(null);
  const [locationAsked, setLocationAsked] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyInfo, setNearbyInfo] = useState<string | null>(null);
  const [visibleDeas, setVisibleDeas] = useState<DeaLocation[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(initialProvince);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const effectiveCategoryId = categoryId ?? selectedType ?? undefined;
  const categoryLabel = getInstitutionCategoryLabel(categoryId);
  const selectedTypeLabel = getInstitutionCategoryLabel(selectedType) ?? categoryLabel;

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

  const deas = useMemo(() => {
    const byType = filterDeasByCategory(allDeas, effectiveCategoryId);
    return filterDeasByCityAndType(byType, {
      city: selectedCity,
      province: selectedProvince,
      institutionType: null,
    });
  }, [allDeas, effectiveCategoryId, selectedCity, selectedProvince]);

  const emptyMessage = describeFilterEmpty({
    city: selectedCity,
    province: selectedProvince,
    typeLabel: selectedTypeLabel,
  });

  const loadMapData = useCallback(async () => {
    const [publicDeas, activeZones] = await Promise.all([getPublicDeas(), getActiveZones()]);
    setAllDeas(publicDeas.length > 0 ? publicDeas : INITIAL_DEAS);
    setZones(activeZones.length > 0 ? activeZones : CARDIO_SAFE_ZONES);
  }, []);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  useEffect(() => {
    setSelectedDea(null);
    setNearbyInfo(null);
    setLocationAsked(false);
    setLocationEnabled(false);
    setSelectedCity(initialCity);
    setSelectedProvince(initialProvince);
    setSelectedType(null);
  }, [categoryId, initialCity, initialProvince]);

  useEffect(() => {
    if (!locationEnabled) {
      setVisibleDeas(deas);
    }
  }, [deas, locationEnabled]);

  useEffect(() => {
    if (!locationAsked && deas.length > 0) {
      Alert.alert(
        'Ubicación',
        '¿Querés activar tu ubicación para ver los DEA cercanos y los datos del lugar donde están?',
        [
          {
            text: 'No, explorar el mapa',
            style: 'cancel',
            onPress: () => {
              setLocationAsked(true);
              setLocationEnabled(false);
              setVisibleDeas(deas);
            },
          },
          {
            text: 'Sí, activar',
            onPress: () => {
              setLocationAsked(true);
              void enableLocation(deas);
            },
          },
        ],
      );
    }
  }, [locationAsked, deas]);

  const enableLocation = async (sourceDeas: DeaLocation[] = deas) => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Podés navegar el listado igual y ver todas las zonas y DEA.',
        );
        setLocationEnabled(false);
        setVisibleDeas(sourceDeas);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocationEnabled(true);

      const nearby = sourceDeas
        .map((dea) => ({
          dea,
          distance: distanceInMeters(coords, dea.coordinates),
        }))
        .filter((item) => item.distance <= NEARBY_RADIUS_METERS)
        .sort((a, b) => a.distance - b.distance);

      if (nearby.length > 0) {
        setVisibleDeas(nearby.map((item) => item.dea));
        setSelectedDea(nearby[0].dea);
        setNearbyInfo(
          `${nearby.length} DEA cercano${nearby.length > 1 ? 's' : ''} · más próximo: ${nearby[0].dea.name} (${formatDistance(nearby[0].distance)})`,
        );
      } else {
        const nearest = findNearestDea(coords, sourceDeas);
        setVisibleDeas(sourceDeas);
        if (nearest) {
          setSelectedDea(nearest.dea);
          setNearbyInfo(
            `No hay DEA a menos de 3 km. El más cercano es ${nearest.dea.name} (${formatDistance(nearest.distance)}).`,
          );
        }
      }
    } finally {
      setIsLocating(false);
    }
  };

  const openDirections = (dea: DeaLocation) => {
    Linking.openURL(openExternalMaps(dea.coordinates, dea.name));
  };

  const list = locationEnabled ? visibleDeas : deas;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ImageBackground
        source={require('../../assets/zona-cardioasistida-dea.png')}
        style={styles.hero}
        imageStyle={styles.heroImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,71,171,0.88)', 'rgba(26,107,204,0.82)', 'rgba(0,71,171,0.72)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroOverlay}
        >
          <View style={styles.heroIcon}>
            <Ionicons name="map" size={22} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>
            {categoryLabel ? categoryLabel : 'Mapa de zonas cardioasistidas'}
          </Text>
          <Text style={styles.heroText}>
            {categoryLabel
              ? `DEA de la modalidad “${categoryLabel}”. Activá la ubicación para ver los más cercanos.`
              : 'Activá tu ubicación para ver los DEA cercanos. En el celular también tenés el mapa interactivo.'}
          </Text>
        </LinearGradient>
      </ImageBackground>

      {categoryLabel ? (
        <View style={styles.filterChip}>
          <Ionicons name="funnel" size={16} color={colors.primary} />
          <Text style={styles.filterChipText}>Modalidad: {categoryLabel}</Text>
        </View>
      ) : null}

      <DeaFilterBar
        cities={cityOptions}
        provinces={provinceOptions}
        types={typeOptions}
        selectedCity={selectedCity}
        selectedProvince={selectedProvince}
        selectedType={selectedType}
        hideTypeFilter={Boolean(categoryId)}
        onCityChange={(city) => {
          setSelectedCity(city);
          setLocationEnabled(false);
          setNearbyInfo(null);
        }}
        onProvinceChange={(province) => {
          setSelectedProvince(province);
          setSelectedCity(null);
          setLocationEnabled(false);
          setNearbyInfo(null);
        }}
        onTypeChange={(type) => {
          setSelectedType(type);
          setLocationEnabled(false);
          setNearbyInfo(null);
        }}
        resultCount={deas.length}
        emptyMessage={emptyMessage}
      />

      {!locationEnabled && deas.length > 0 ? (
        <Pressable
          onPress={() => enableLocation()}
          disabled={isLocating}
          style={({ pressed }) => [
            styles.locationBtn,
            pressed && styles.pressed,
            isLocating && styles.locationBtnDisabled,
          ]}
        >
          <Ionicons name="locate" size={20} color="#fff" />
          <Text style={styles.locationBtnText}>
            {isLocating ? 'Ubicando...' : 'Activar ubicación'}
          </Text>
        </Pressable>
      ) : null}

      {nearbyInfo ? (
        <View style={styles.nearbyBox}>
          <Ionicons name="navigate" size={18} color={colors.primary} />
          <Text style={styles.nearbyInfo}>{nearbyInfo}</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>
        {locationEnabled ? 'DEA cercanos' : 'DEA disponibles'} ({list.length})
      </Text>

      {list.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : null}

      {list.map((dea) => {
        const selected = selectedDea?.id === dea.id;
        return (
          <Pressable
            key={dea.id}
            onPress={() => setSelectedDea(dea)}
            style={({ pressed }) => [
              styles.deaCard,
              selected && styles.deaCardSelected,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.deaIcon}>
              <Ionicons name="medkit" size={20} color={colors.primary} />
            </View>
            <View style={styles.deaText}>
              <Text style={styles.cardTitle}>{dea.name}</Text>
              <Text style={styles.cardMeta}>{dea.address}</Text>
              {(dea.locality || getDeaLocality(dea)) ? (
                <Text style={styles.cardMeta}>
                  Ciudad: {dea.locality || getDeaLocality(dea)}
                </Text>
              ) : null}
              {dea.institutionType || getDeaInstitutionType(dea) ? (
                <Text style={styles.cardMeta}>
                  Tipo: {dea.institutionType || getDeaInstitutionType(dea)}
                </Text>
              ) : null}
              {dea.accessHours ? (
                <Text style={styles.cardMeta}>Horario: {dea.accessHours}</Text>
              ) : null}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {dea.source === 'lex' ? 'DEA Lex' : 'DEA Comunitario'}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={selected ? colors.primary : '#A8B4C4'}
            />
          </Pressable>
        );
      })}

      {!categoryId ? (
        <>
          <Text style={styles.sectionTitle}>Zonas cardioasistidas</Text>
          {zones.map((zone) => (
            <View key={zone.id} style={styles.deaCard}>
              <View style={[styles.deaIcon, styles.zoneIcon]}>
                <Ionicons name="shield-checkmark" size={20} color="#0E7490" />
              </View>
              <View style={styles.deaText}>
                <Text style={styles.cardTitle}>{zone.name}</Text>
                <Text style={styles.cardMeta}>{zone.address}</Text>
                <Text style={styles.cardMeta}>Horario: {zone.accessHours}</Text>
              </View>
            </View>
          ))}
        </>
      ) : null}

      {selectedDea ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Seleccionado</Text>
          <Text style={styles.cardTitle}>{selectedDea.name}</Text>
          <Text style={styles.cardMeta}>{selectedDea.address}</Text>
          {selectedDea.institutionType ? (
            <Text style={styles.cardMeta}>Tipo: {selectedDea.institutionType}</Text>
          ) : null}
          {selectedDea.description ? (
            <Text style={styles.cardMeta}>{selectedDea.description}</Text>
          ) : null}
          <Text style={styles.cardMeta}>Contacto: {selectedDea.contactName}</Text>
          <Text style={styles.cardMeta}>{selectedDea.contactPhone}</Text>
          <Button label="Cómo llegar" onPress={() => openDirections(selectedDea)} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl + 72,
    gap: 10,
  },
  hero: {
    borderRadius: 24,
    overflow: 'hidden',
    minHeight: 168,
    marginBottom: 4,
  },
  heroImage: {
    borderRadius: 24,
  },
  heroOverlay: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 168,
    justifyContent: 'center',
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
  },
  heroText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.94)',
    lineHeight: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primaryDark,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  locationBtnDisabled: {
    opacity: 0.7,
  },
  locationBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#fff',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  nearbyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nearbyInfo: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  emptyBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  deaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  deaCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0F6FF',
  },
  deaIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0,71,171,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneIcon: {
    backgroundColor: 'rgba(14,116,144,0.12)',
  },
  deaText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: fonts.bodyBold,
    color: colors.text,
    marginBottom: 3,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
    lineHeight: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 6,
  },
  badgeText: {
    color: colors.primaryDark,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 4,
    marginTop: spacing.sm,
  },
  detailLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
});
