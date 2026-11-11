import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts , lazyThemed } from '@/lib/theme';
import { APP_NAME, APP_NAME_UPPER } from '@/lib/brand';
import { S, fmt, fmtDate } from '@/lib/i18n';

const T = S.privacy.policy;

// 16 October 2026, written out in the reader's language.
const LAST_UPDATED = fmtDate(new Date(2026, 9, 16), { year: 'numeric', month: 'long', day: 'numeric' });
const CONTACT_EMAIL = 'bsaleeb@gmail.com';
const BUNDLE_ID = 'com.coptic.poimen';

// The policy's text is in the dictionary (lib/i18n/en/privacy.ts, `policy`);
// {app} is the only placeholder it uses.
const t = (text: string) => fmt(text, { app: APP_NAME });

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <Text style={styles.eyebrow}>{APP_NAME_UPPER} · {BUNDLE_ID}</Text>
        <Text style={styles.title}>{T.title}</Text>
        <Text style={styles.meta}>{fmt(T.lastUpdated, { date: LAST_UPDATED })}</Text>

        <Section title={T.overview.title}>
          <Paragraphs of={T.overview.body} />
        </Section>

        <Section title={T.collect.title}>
          <Body>{T.collect.intro}</Body>
          <Bullets of={T.collect.items} />
        </Section>

        <Section title={T.notCollected.title}>
          <Bullets of={T.notCollected.items} />
        </Section>

        <Section title={T.encryption.title}>
          <Paragraphs of={T.encryption.body} />
        </Section>

        <Section title={T.use.title}>
          <Bullets of={T.use.items} />
        </Section>

        <Section title={T.sharing.title}>
          <Body>{T.sharing.intro}</Body>
          <Bullets of={T.sharing.items} />
        </Section>

        <Section title={T.rights.title}>
          <Bullets of={T.rights.items} />
        </Section>

        <Section title={T.retention.title}>
          <Paragraphs of={T.retention.body} />
        </Section>

        <Section title={T.children.title}>
          <Paragraphs of={T.children.body} />
        </Section>

        <Section title={T.changes.title}>
          <Paragraphs of={T.changes.body} />
        </Section>

        <Section title={T.contact.title}>
          <Paragraphs of={T.contact.body} />
          <Body style={styles.contact}>{CONTACT_EMAIL}</Body>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{APP_NAME} · Coptic Hub</Text>
          <Text style={styles.footerSub}>{BUNDLE_ID}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// One <Body> per paragraph, one <Bullet> per point, in the dictionary's order.
function Paragraphs({ of }: { of: readonly string[] }) {
  return <>{of.map((text, i) => <Body key={i}>{t(text)}</Body>)}</>;
}

function Bullets({ of }: { of: readonly string[] }) {
  return <>{of.map((text, i) => <Bullet key={i}>{t(text)}</Bullet>)}</>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Body({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>·</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
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

  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
    paddingLeft: 4,
  },
  bulletDot: {
    fontFamily: fonts.latoBold,
    fontSize: 16,
    color: colors.gold,
    lineHeight: 22,
    marginTop: -1,
  },
  bulletText: {
    fontFamily: fonts.lato,
    fontSize: 14,
    color: colors.cream,
    lineHeight: 22,
    flex: 1,
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
  footerSub: {
    fontFamily: fonts.latoLight,
    fontSize: 11,
    color: colors.faint,
    marginTop: 4,
  },
}));
