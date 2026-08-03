import { useLocalSearchParams } from 'expo-router';

import { DrivePdfList } from '@/components/DrivePdfList';
import { MEDIA } from '@/data/content';

export default function ServiciosPdfScreen() {
  const params = useLocalSearchParams<{ plan?: string | string[] }>();
  const planId = Array.isArray(params.plan) ? params.plan[0] : params.plan;
  const plan = MEDIA.serviciosRedLex.plans.find((item) => item.id === planId);

  if (plan) {
    return (
      <DrivePdfList
        title={plan.title}
        subtitle={plan.subtitle}
        pdfs={[{ id: plan.id, title: plan.title, driveUrl: plan.driveUrl }]}
      />
    );
  }

  const media = MEDIA.serviciosRedLex.pdf;

  return (
    <DrivePdfList
      title={media.subtitle}
      subtitle="Documentación de la Red Lex."
      pdfs={[{ id: 'servicios-pdf', title: media.subtitle, driveUrl: media.driveUrl }]}
    />
  );
}
