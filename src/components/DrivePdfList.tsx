import { StyleSheet, Text, View } from 'react-native';

import { PdfViewer } from '@/components/PdfViewer';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';

interface DrivePdfItem {
  id: string;
  title: string;
  driveUrl: string;
}

interface DrivePdfListProps {
  title: string;
  subtitle?: string;
  pdfs: DrivePdfItem[];
}

export function DrivePdfList({ title, subtitle, pdfs }: DrivePdfListProps) {
  const showItemTitles = pdfs.length > 1;

  return (
    <Screen>
      <SectionTitle title={title} subtitle={subtitle} />
      {pdfs.map((pdf) => (
        <View key={pdf.id} style={styles.block}>
          {showItemTitles ? <Text style={styles.itemTitle}>{pdf.title}</Text> : null}
          <PdfViewer
            pdfUrl={pdf.driveUrl}
            note="Leé el material acá o abrilo / descargalo en otra app."
            downloadLabel="Abrir / descargar PDF"
          />
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
