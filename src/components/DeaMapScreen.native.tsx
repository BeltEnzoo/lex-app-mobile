import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';

import { DeaMarkerPin } from '@/components/DeaMarkerPin';
import { DeaFilterBar } from '@/components/DeaFilterBar';
import { Button, Card } from '@/components/ui';
import { CARDIO_SAFE_ZONES, DEFAULT_MAP_REGION, INITIAL_DEAS } from '@/data/mock';
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
  const mapRef = useRef<MapView>(null);
  const [allDeas, setAllDeas] = useState<DeaLocation[]>([]);
  const [zones, setZones] = useState<CardioSafeZone[]>(CARDIO_SAFE_ZONES);
  const [selectedDea, setSelectedDea] = useState<DeaLocation | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationAsked, setLocationAsked] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyInfo, setNearbyInfo] = useState<string | null>(null);
  const [visibleDeas, setVisibleDeas] = useState<DeaLocation[]>([]);
  const [tracksMarkers, setTracksMarkers] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(initialProvince);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(Boolean(initialCity || initialProvince));

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


  useEffect(() => {
    const t = setTimeout(() => setTracksMarkers(false), 800);
    return () => clearTimeout(t);
  }, [visibleDeas, selectedDea]);

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
    setFiltersOpen(Boolean(initialCity || initialProvince));
  }, [categoryId, initialCity, initialProvince]);

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
              void enableLocation();
            },
          },
        ],
      );
    }
  }, [locationAsked, deas]);

  useEffect(() => {
    if (!locationEnabled) {
      setVisibleDeas(deas);
    }
  }, [deas, locationEnabled]);

  const initialRegion: Region = {
    ...DEFAULT_MAP_REGION,
  };

  const enableLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Podés navegar el mapa igual y ver todas las zonas y DEA.',
        );
        setLocationEnabled(false);
        setVisibleDeas(deas);
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

      mapRef.current?.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        600,
      );

      const nearby = deas
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
        const nearest = findNearestDea(coords, deas);
        setVisibleDeas(deas);
        if (nearest) {
          setSelectedDea(nearest.dea);
          setNearbyInfo(
            `No hay DEA a menos de 3 km. El más cercano es ${nearest.dea.name} (${formatDistance(nearest.distance)}).`,
          );
        } else {
          setNearbyInfo(
            deas.length === 0
              ? 'No hay DEA en esta modalidad todavía.'
              : 'No hay DEA disponibles en este momento.',
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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={locationEnabled}
        showsMyLocationButton={locationEnabled}
      >
        {!categoryId
          ? zones.map((zone) => (
              <Circle
                key={`${zone.id}-circle`}
                center={zone.center}
                radius={zone.radiusMeters}
                strokeColor={`${colors.zone}AA`}
                fillColor={`${colors.zone}33`}
              />
            ))
          : null}

        {visibleDeas.map((dea) => (
          <Marker
            key={dea.id}
            coordinate={dea.coordinates}
            title={dea.name}
            description={dea.address}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={tracksMarkers || selectedDea?.id === dea.id}
            onPress={() => setSelectedDea(dea)}
          >
            <DeaMarkerPin source={dea.source} selected={selectedDea?.id === dea.id} />
          </Marker>
        ))}
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.topFilters}>
          {categoryLabel ? (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>
                {categoryLabel} · {deas.length} DEA
              </Text>
            </View>
          ) : (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{deas.length} DEA</Text>
            </View>
          )}
          <Button
            label={filtersOpen ? 'Ocultar filtros' : 'Filtrar provincia / localidad / tipo'}
            variant="secondary"
            onPress={() => setFiltersOpen((open) => !open)}
          />
          {filtersOpen ? (
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
          ) : null}
        </View>

        {deas.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        ) : null}

        {!locationEnabled && deas.length > 0 ? (
          <Button
            label={isLocating ? 'Ubicando...' : 'Activar ubicación'}
            onPress={enableLocation}
            loading={isLocating}
          />
        ) : null}

        {nearbyInfo ? <Text style={styles.nearbyInfo}>{nearbyInfo}</Text> : null}

        {selectedDea ? (
          <ScrollView style={styles.cardScroll} nestedScrollEnabled>
            <Card>
              <Text style={styles.cardTitle}>{selectedDea.name}</Text>
              <Text style={styles.badge}>
                {selectedDea.source === 'lex' ? 'DEA Lex' : 'DEA Comunitario'}
              </Text>
              {(selectedDea.locality || getDeaLocality(selectedDea)) ? (
                <Text style={styles.cardMeta}>
                  Ciudad: {selectedDea.locality || getDeaLocality(selectedDea)}
                </Text>
              ) : null}
              {selectedDea.institutionType || getDeaInstitutionType(selectedDea) ? (
                <Text style={styles.cardMeta}>
                  Tipo: {selectedDea.institutionType || getDeaInstitutionType(selectedDea)}
                </Text>
              ) : null}
              <Text style={styles.cardMeta}>{selectedDea.address}</Text>
              {selectedDea.accessHours ? (
                <Text style={styles.cardMeta}>Horario: {selectedDea.accessHours}</Text>
              ) : null}
              {selectedDea.description ? (
                <Text style={styles.cardDescription}>{selectedDea.description}</Text>
              ) : null}
              <Text style={styles.cardMeta}>Contacto: {selectedDea.contactName}</Text>
              <Text style={styles.cardMeta}>{selectedDea.contactPhone}</Text>
              <Button label="Cómo llegar" onPress={() => openDirections(selectedDea)} />
            </Card>
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md + 64,
    maxHeight: '62%',
  },
  topFilters: {
    gap: 8,
    marginBottom: spacing.sm,
  },
  filterChip: {
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
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  cardScroll: {
    maxHeight: 260,
  },
  nearbyInfo: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    color: colors.text,
    fontFamily: fonts.bodySemiBold,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    color: colors.text,
    marginBottom: 4,
  },
  cardMeta: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: 4,
  },
  cardDescription: {
    fontFamily: fonts.body,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    color: colors.primaryDark,
    fontFamily: fonts.bodyBold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
});
