import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors, fonts, spacing } from '@/constants/theme';

interface YoutubePlayerProps {
  youtubeId: string;
  note?: string;
}

export function YoutubePlayer({ youtubeId, note }: YoutubePlayerProps) {
  return (
    <View style={styles.wrap}>
      {note ? <Text style={styles.note}>{note}</Text> : null}
      <View style={styles.player}>
        <WebView
          source={{
            uri: `https://www.youtube.com/embed/${youtubeId}?playsinline=1`,
          }}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  note: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.xs,
    lineHeight: 20,
  },
  player: {
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
});
