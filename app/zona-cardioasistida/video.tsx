import { DriveVideoList } from '@/components/DriveVideoList';
import { MEDIA } from '@/data/content';

export default function ZonaCardioasistidaVideoScreen() {
  const video = MEDIA.queEsZonaCardioasistida.video;

  return (
    <DriveVideoList
      title={video.title}
      subtitle="Video explicativo sobre zonas cardioasistidas."
      videos={[{ id: 'zona-video', title: video.title, driveUrl: video.driveUrl }]}
    />
  );
}
