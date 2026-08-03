import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '@/constants/theme';
import { googleDrivePreviewUrl } from '@/services/googleDrive';

interface DriveVideoPlayerProps {
  driveUrl: string;
  note?: string;
}

export function DriveVideoPlayer({ driveUrl, note }: DriveVideoPlayerProps) {
  const previewUrl = googleDrivePreviewUrl(driveUrl);

  return (
    <View style={styles.wrap}>
      {note ? <Text style={styles.note}>{note}</Text> : null}
      <View style={styles.player}>
        <iframe
          src={previewUrl}
          title="Video Lex"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            border: 0,
            margin: 0,
            padding: 0,
          }}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
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
    alignItems: 'center',
  },
  note: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.xs,
    lineHeight: 20,
    alignSelf: 'stretch',
  },
  player: {
    // Video vertical (celular) — evita franjas negras laterales
    width: '100%',
    maxWidth: 360,
    aspectRatio: 9 / 16,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
    alignSelf: 'center',
  },
});
