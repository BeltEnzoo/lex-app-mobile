import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Card, SectionTitle } from '@/components/ui';
import {
  CONTROL_REMINDERS,
  RED_LEX_BENEFITS,
  RED_LEX_VIDEOS,
} from '@/data/mock';
import { colors, fonts, spacing } from '@/constants/theme';

export function RedLexContent() {
  const [activeVideoId, setActiveVideoId] = useState(RED_LEX_VIDEOS[0]?.youtubeId ?? '');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionTitle
        title="Red Lex CardioSegura"
        subtitle="Videos, beneficios y controles para mantener tu red siempre operativa."
      />

      <Card>
        <Text style={styles.videoTitle}>
          {RED_LEX_VIDEOS.find((video) => video.youtubeId === activeVideoId)?.title}
        </Text>
        <View style={styles.player}>
          <WebView
            source={{
              uri: `https://www.youtube.com/embed/${activeVideoId}?playsinline=1`,
            }}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
          />
        </View>
      </Card>

      <Text style={styles.sectionLabel}>Videos formativos</Text>
      {RED_LEX_VIDEOS.map((video) => (
        <Card key={video.id}>
          <Text style={styles.itemTitle}>{video.title}</Text>
          <Text style={styles.itemDescription}>{video.description}</Text>
          <Text
            style={styles.link}
            onPress={() => setActiveVideoId(video.youtubeId)}
          >
            Ver en la app
          </Text>
          <Text
            style={styles.linkMuted}
            onPress={() =>
              Linking.openURL(`https://www.youtube.com/watch?v=${video.youtubeId}`)
            }
          >
            Abrir en YouTube
          </Text>
        </Card>
      ))}

      <Text style={styles.sectionLabel}>Beneficios Red Lex</Text>
      {RED_LEX_BENEFITS.map((benefit) => (
        <Card key={benefit.id}>
          <Text style={styles.itemTitle}>{benefit.title}</Text>
          <Text style={styles.itemDescription}>{benefit.description}</Text>
        </Card>
      ))}

      <Text style={styles.sectionLabel}>Controles recomendados</Text>
      {CONTROL_REMINDERS.map((control) => (
        <Card key={control.id}>
          <Text style={styles.itemTitle}>{control.title}</Text>
          <Text style={styles.itemDescription}>{control.description}</Text>
          <Text style={styles.frequency}>Frecuencia: {control.frequency}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  videoTitle: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  player: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  sectionLabel: {
    fontSize: 15,
    fontFamily: fonts.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  itemTitle: {
    fontSize: 15,
    fontFamily: fonts.bodyBold,
    color: colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  link: {
    marginTop: spacing.sm,
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  linkMuted: {
    marginTop: 4,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  frequency: {
    marginTop: spacing.sm,
    color: colors.primaryDark,
    fontFamily: fonts.bodyBold,
  },
});
