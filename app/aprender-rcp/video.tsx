import { useLocalSearchParams } from 'expo-router';

import { DriveVideoList } from '@/components/DriveVideoList';
import { MEDIA } from '@/data/content';

export default function AprenderRcpVideoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const video =
    MEDIA.aprenderRcp.videos.find((item) => item.id === id) ?? MEDIA.aprenderRcp.videos[0];

  return (
    <DriveVideoList
      title={video.title}
      subtitle="Video formativo RCP / DEA."
      videos={[video]}
    />
  );
}
