import { Stack, useLocalSearchParams } from 'expo-router';

import { DeaMapScreen } from '@/components/DeaMapScreen';
import {
  getInstitutionCategoryLabel,
  resolveCategoryId,
} from '@/data/institutionCategories';

export default function MapaScreen() {
  const params = useLocalSearchParams<{
    categoria?: string | string[];
    ciudad?: string | string[];
  }>();
  const categoryId = resolveCategoryId(params.categoria);
  const ciudad = resolveCategoryId(params.ciudad);
  const label = getInstitutionCategoryLabel(categoryId);

  return (
    <>
      <Stack.Screen options={{ title: label ? label : 'Zonas cardioasistidas' }} />
      <DeaMapScreen categoria={categoryId} ciudad={ciudad} />
    </>
  );
}
