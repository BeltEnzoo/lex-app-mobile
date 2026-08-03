import { useLocalSearchParams } from 'expo-router';

import { DrivePdfList } from '@/components/DrivePdfList';
import { MEDIA } from '@/data/content';

export default function AprenderRcpPdfScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const pdf = MEDIA.aprenderRcp.pdfs.find((item) => item.id === id) ?? MEDIA.aprenderRcp.pdfs[0];

  return (
    <DrivePdfList
      title={pdf.title}
      subtitle="Material para leer desde la app o descargar."
      pdfs={[pdf]}
    />
  );
}
