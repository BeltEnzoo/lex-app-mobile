import { DriveVideoList } from '@/components/DriveVideoList';
import { MEDIA } from '@/data/content';

export default function ServiciosVideosScreen() {
  return (
    <DriveVideoList
      title="Videos Red Lex"
      subtitle="Contenido audiovisual de la red."
      videos={MEDIA.serviciosRedLex.videos}
    />
  );
}
