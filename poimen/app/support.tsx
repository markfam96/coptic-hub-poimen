// Support page — the App Store Support URL points here (Guideline 1.5).
// Public like /privacy: it must render without a session.
import React from 'react';
import { ScrollView, View, Text, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts , lazyThemed } from '@/lib/theme';
import { APP_NAME, APP_NAME_UPPER } from '@/lib/brand';
import { S, fmt } from '@/lib/i18n';

const T = S.support;

const CONTACT_EMAIL = 'bsaleeb@gmail.com';

export default function SupportScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <Text style={styles.eyebrow}>{fmt(T.eyebrow, { app: APP_NAME_UPPER })}</Text>
        <Text style={styles.title}>{T.title}</Text>
        <Text style={styles.meta}>{fmt(T.intro, { app: APP_NAME })}</Text>

        <Section title={T.contactTitle}>
          <Body>{T.contactBody}</Body>
          <Text
            style={[styles.body, styles.contact]}
            onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${APP_NAME} support`)}`)}
          >
            {CONTACT_EMAIL}
          </Text>
        </Section>

        <Section title={T.passwordTitle}>
          <Body>{T.passwordBody}</Body>
        </Section>

        <Section title={T.pinTitle}>
          <Body>{T.pinBody}</Body>
        </Section>

        <Section title={T.linkTitle}>
          <Body>{T.linkBody}</Body>
        </Section>

        <Section title={T.deleteTitle}>
          <Body>{T.deleteBody}</Body>
          <Body>{T.deleteNoSignIn}</Body>
        </Section>

        <Section title={T.privacyTitle}>
          <Body>
            {T.privacyLinkBefore}
            <Text style={styles.link} onPress={() => router.push('/privacy')}>{T.privacyLinkText}</Text>
            {T.privacyLinkAfter}
          </Body>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{APP_NAME} · Coptic Hub</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

const styles = lazyThemed(() => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  scroll: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 80,
    maxWidth: 680 as any,
    width: '100%' as any,
    alignSelf: 'center' as any,
  },

  eyebrow: {
    fontFamily: fonts.latoBold,
    fontSize: 9,
    letterSpacing: 2.5,
    color: colors.gold,
    marginBottom: 8,
    textTransform: 'uppercase' as any,
  },
  title: {
    fontFamily: fonts.cormorantMedium,
    fontSize: 38,
    color: colors.cream,
    marginBottom: 4,
  },
  meta: {
    fontFamily: fonts.latoLight,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 36,
  },

  section: {
    marginBottom: 28,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.latoBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.gold,
    textTransform: 'uppercase' as any,
    marginBottom: 12,
  },
  body: {
    fontFamily: fonts.lato,
    fontSize: 14,
    color: colors.cream,
    lineHeight: 22,
    marginBottom: 10,
  },
  contact: {
    fontFamily: fonts.latoBold,
    color: colors.gold,
  },
  link: {
    color: colors.gold,
    textDecorationLine: 'underline',
  },

  footer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center' as any,
  },
  footerText: {
    fontFamily: fonts.latoBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: 'uppercase' as any,
  },
}));
