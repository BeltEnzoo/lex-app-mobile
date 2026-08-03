import { DrivePdfList } from '@/components/DrivePdfList';
import { MEDIA } from '@/data/content';

export default function ZonaCardioasistidaPdfScreen() {
  const pdf = MEDIA.queEsZonaCardioasistida.pdf;

  return (
    <DrivePdfList
      title={pdf.title}
      subtitle="Material para leer desde la app."
      pdfs={[{ id: 'zona-pdf', title: pdf.title, driveUrl: pdf.driveUrl }]}
    />
  );
}
