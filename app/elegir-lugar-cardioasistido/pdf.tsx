import { DrivePdfList } from '@/components/DrivePdfList';
import { MEDIA } from '@/data/content';

export default function ElegirLugarPdfScreen() {
  const media = MEDIA.porqueElegirLugarCardioasistido.pdf;

  return (
    <DrivePdfList
      title={media.title}
      subtitle={media.subtitle}
      pdfs={[{ id: 'elegir-lugar-pdf', title: media.title, driveUrl: media.driveUrl }]}
    />
  );
}
