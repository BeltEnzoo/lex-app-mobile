import { StyleSheet, Text, View } from 'react-native';

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
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?playsinline=1`}
          title="YouTube Lex"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            border: 0,
            margin: 0,
            padding: 0,
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
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
    width: '100%',
    alignSelf: 'stretch',
  },
  note: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.xs,
    lineHeight: 20,
  },
  player: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
    alignSelf: 'stretch',
  },
});
