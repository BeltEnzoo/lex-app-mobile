import { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Input } from '@/components/ui';
import {
  INSTITUTION_TYPE_OPTIONS,
  LEX_ZONE_REQUEST_SUCCESS,
} from '@/data/content';
import { colors, fonts, spacing } from '@/constants/theme';
import { submitZoneIncorporation } from '@/services/storage';
import type { ZoneSubmissionInput } from '@/types';
import { showAlert } from '@/utils/alert';

interface ZoneRegistrationFormProps {
  onSubmitted?: () => void;
}

const STEPS = [
  { key: 'lugar', title: 'El lugar', subtitle: 'Datos del espacio a incorporar' },
  { key: 'contacto', title: 'Contacto', subtitle: '¿Con quién hablamos desde Lex?' },
  { key: 'dea', title: 'El DEA', subtitle: 'Datos del desfibrilador' },
  { key: 'ubicacion', title: 'Ubicación', subtitle: 'GPS opcional y envío de la solicitud' },
] as const;

export function ZoneRegistrationForm({ onSubmitted }: ZoneRegistrationFormProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pagerRef = useRef<ScrollView>(null);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [province, setProvince] = useState('');
  const [institutionType, setInstitutionType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [installedAt, setInstalledAt] = useState('');
  const [deaPlacement, setDeaPlacement] = useState('');
  const [alreadyInstalled, setAlreadyInstalled] = useState(true);
  const [coordinates, setCoordinates] = useState<ZoneSubmissionInput['coordinates'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const goToStep = (next: number) => {
    setStep(next);
    pagerRef.current?.scrollTo({ x: next * width, animated: true });
  };

  const validateStep = (index: number): boolean => {
    if (index === 1) {
      if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
        showAlert('Datos incompletos', 'Completá nombre, teléfono y correo de contacto.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) {
      goToStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      goToStep(step - 1);
    }
  };

  const captureLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert(
          'Permiso denegado',
          Platform.OS === 'web'
            ? 'Permití la ubicación en el navegador si querés cargar el GPS (es opcional).'
            : 'Sin permiso de ubicación. Podés enviar la solicitud igual; el GPS es opcional.',
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      showAlert(
        'No se pudo obtener la ubicación',
        error instanceof Error ? error.message : 'Intentá de nuevo.',
      );
    } finally {
      setLocating(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setLocality('');
    setProvince('');
    setInstitutionType(null);
    setDescription('');
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setBrand('');
    setModel('');
    setSerialNumber('');
    setInstalledAt('');
    setDeaPlacement('');
    setAlreadyInstalled(true);
    setCoordinates(null);
    goToStep(0);
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      goToStep(1);
      return;
    }

    setLoading(true);
    try {
      await submitZoneIncorporation({
        name: name || undefined,
        address: address || undefined,
        locality: locality || undefined,
        province: province || undefined,
        institutionType: institutionType || undefined,
        description: description || undefined,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        brand: brand || undefined,
        model: model || undefined,
        serialNumber: serialNumber || undefined,
        installedAt: installedAt || undefined,
        deaPlacement: deaPlacement || undefined,
        alreadyInstalled,
        coordinates: coordinates ?? undefined,
      });

      resetForm();
      showAlert('Solicitud enviada', LEX_ZONE_REQUEST_SUCCESS, [
        {
          text: 'Entendido',
          onPress: () => {
            onSubmitted?.();
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          },
        },
      ]);
    } catch (error) {
      showAlert(
        'No se pudo enviar',
        error instanceof Error
          ? `${error.message}\n\nVerificá que la API esté corriendo (npm run api).`
          : 'No se pudo enviar la solicitud a Neon.',
      );
    } finally {
      setLoading(false);
    }
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, 12) + 64 }]}>
      <View style={styles.header}>
        <Text style={styles.stepCounter}>
          Paso {step + 1} de {STEPS.length}
        </Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.subtitle}</Text>

        <View style={styles.progressRow}>
          {STEPS.map((item, index) => (
            <View
              key={item.key}
              style={[
                styles.progressDot,
                index <= step && styles.progressDotActive,
                index === step && styles.progressDotCurrent,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.pager}
        keyboardShouldPersistTaps="handled"
      >
        {/* Paso 1 — Lugar */}
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Input placeholder="Nombre del espacio / institución" value={name} onChangeText={setName} />
          <Input placeholder="Dirección" value={address} onChangeText={setAddress} />
          <Input placeholder="Localidad / ciudad" value={locality} onChangeText={setLocality} />
          <Input placeholder="Provincia" value={province} onChangeText={setProvince} />

          <Text style={styles.fieldLabel}>Tipo de institución</Text>
          <View style={styles.chips}>
            {INSTITUTION_TYPE_OPTIONS.map((option) => {
              const active = institutionType === option;
              return (
                <Pressable
                  key={option}
                  onPress={() =>
                    setInstitutionType((current) => (current === option ? null : option))
                  }
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            placeholder="Descripción de la zona"
            value={description}
            onChangeText={setDescription}
          />
        </ScrollView>

        {/* Paso 2 — Contacto */}
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Input
            placeholder="Nombre de contacto *"
            value={contactName}
            onChangeText={setContactName}
          />
          <Input
            placeholder="Teléfono de contacto *"
            value={contactPhone}
            onChangeText={setContactPhone}
            keyboardType="phone-pad"
          />
          <Input
            placeholder="Correo de contacto *"
            value={contactEmail}
            onChangeText={setContactEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Card>
            <Text style={styles.hint}>
              Lex va a usar estos datos para contactarte y validar la incorporación.
            </Text>
          </Card>
        </ScrollView>

        {/* Paso 3 — DEA */}
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.fieldLabel}>¿El DEA ya está instalado?</Text>
          <View style={styles.chips}>
            <Pressable
              onPress={() => setAlreadyInstalled(true)}
              style={[styles.chip, alreadyInstalled && styles.chipActive]}
            >
              <Text style={[styles.chipText, alreadyInstalled && styles.chipTextActive]}>Sí</Text>
            </Pressable>
            <Pressable
              onPress={() => setAlreadyInstalled(false)}
              style={[styles.chip, !alreadyInstalled && styles.chipActive]}
            >
              <Text style={[styles.chipText, !alreadyInstalled && styles.chipTextActive]}>
                A instalar
              </Text>
            </Pressable>
          </View>

          <Input placeholder="Marca" value={brand} onChangeText={setBrand} />
          <Input placeholder="Modelo" value={model} onChangeText={setModel} />
          <Input placeholder="Nº de serie" value={serialNumber} onChangeText={setSerialNumber} />
          <Input
            placeholder="Fecha de instalación (DD/MM/AAAA)"
            value={installedAt}
            onChangeText={setInstalledAt}
          />
          <Input
            placeholder="Ubicación del DEA en el lugar (ej. hall)"
            value={deaPlacement}
            onChangeText={setDeaPlacement}
          />
        </ScrollView>

        {/* Paso 4 — GPS + envío */}
        <ScrollView
          style={{ width }}
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <Text style={styles.locationTitle}>Ubicación GPS de la zona</Text>
            {coordinates ? (
              <Text style={styles.locationValue}>
                Lat: {coordinates.latitude.toFixed(5)} · Lon: {coordinates.longitude.toFixed(5)}
              </Text>
            ) : (
              <Text style={styles.locationValue}>Opcional — aún no capturada</Text>
            )}
            <Button
              label={locating ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
              variant="secondary"
              onPress={captureLocation}
              loading={locating}
            />
          </Card>

          <Card>
            <Text style={styles.summaryTitle}>Resumen</Text>
            <Text style={styles.summaryLine}>{name || 'Sin nombre de lugar'}</Text>
            <Text style={styles.summaryMeta}>
              {[locality, province, institutionType].filter(Boolean).join(' · ') ||
                'Lugar sin completar'}
            </Text>
            <Text style={styles.summaryMeta}>
              {[brand, model].filter(Boolean).join(' ') || 'DEA sin datos'}
              {serialNumber ? ` · Serie ${serialNumber}` : ''}
            </Text>
            <Text style={styles.summaryMeta}>Contacto: {contactName}</Text>
          </Card>

          <Card>
            <Text style={styles.hint}>{LEX_ZONE_REQUEST_SUCCESS}</Text>
          </Card>
        </ScrollView>
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 ? (
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>Atrás</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}

        {isLast ? (
          <View style={styles.nextWrap}>
            <Button label="Enviar solicitud" onPress={handleSubmit} loading={loading} />
          </View>
        ) : (
          <Pressable onPress={handleNext} style={styles.nextBtn}>
            <Text style={styles.nextText}>Siguiente</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  stepCounter: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.primary,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primaryLight,
  },
  progressDotCurrent: {
    backgroundColor: colors.primary,
  },
  pager: {
    flex: 1,
  },
  page: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  fieldLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.text,
  },
  chipTextActive: {
    color: '#fff',
  },
  locationTitle: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    marginBottom: 6,
  },
  locationValue: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    marginBottom: 6,
  },
  summaryLine: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  summaryMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },
  hint: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn: {
    minWidth: 72,
    paddingVertical: 14,
  },
  backText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textMuted,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  nextText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#fff',
  },
  nextWrap: {
    flex: 1,
  },
});
