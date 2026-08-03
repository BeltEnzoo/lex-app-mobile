import { Linking, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import {
  googleDriveOpenUrl,
  googleDrivePreviewUrl,
  isGoogleDriveUrl,
} from '@/services/googleDrive';

interface PdfViewerProps {
  pdfUrl: string;
  note?: string;
  downloadLabel?: string;
}

export function PdfViewer({
  pdfUrl,
  note,
  downloadLabel = 'Descargar / abrir PDF',
}: PdfViewerProps) {
  const fromDrive = isGoogleDriveUrl(pdfUrl);
  const viewerUrl = fromDrive
    ? googleDrivePreviewUrl(pdfUrl)
    : `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
  const openUrl = fromDrive ? googleDriveOpenUrl(pdfUrl) : pdfUrl;

  return (
    <View style={styles.container}>
      {note ? <Text style={styles.note}>{note}</Text> : null}
      <View style={styles.viewer}>
        <iframe
          src={viewerUrl}
          title="PDF Lex"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            border: 0,
            margin: 0,
            padding: 0,
          }}
        />
      </View>
      <Button label={downloadLabel} variant="secondary" onPress={() => Linking.openURL(openUrl)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  viewer: {
    width: '100%',
    height: 420,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primarySoft,
    alignSelf: 'stretch',
  },
});
