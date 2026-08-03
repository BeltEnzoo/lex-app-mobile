import { StyleSheet, Text, View } from 'react-native';

import { DriveVideoPlayer } from '@/components/DriveVideoPlayer';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';

interface DriveVideoItem {
  id: string;
  title: string;
  driveUrl: string;
}

interface DriveVideoListProps {
  title: string;
  subtitle?: string;
  videos: DriveVideoItem[];
}

export function DriveVideoList({ title, subtitle, videos }: DriveVideoListProps) {
  const showItemTitles = videos.length > 1;

  return (
    <Screen>
      <SectionTitle title={title} subtitle={subtitle} />
      {videos.map((video) => (
        <View key={video.id} style={styles.block}>
          {showItemTitles ? <Text style={styles.itemTitle}>{video.title}</Text> : null}
          <DriveVideoPlayer driveUrl={video.driveUrl} />
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: spacing.lg,
  },
  itemTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.text,
    marginBottom: spacing.sm,
  },
});
