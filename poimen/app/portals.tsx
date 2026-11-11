import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { goBack } from '@/lib/nav';
import { colors, fonts , lazyThemed } from '@/lib/theme';
import { APP_NAME_UPPER } from '@/lib/brand';
import { useSession } from '@/lib/auth';
import { S, GLYPH } from '@/lib/i18n';

const T = S.shell.portals;

const PORTALS = lazyThemed(() => [
  {
    key: 'congregant',
    icon: '◉',
    title: S.common.roleCongregant,
    subtitle: T.congregantSubtitle,
    desc: T.congregantDesc,
    route: '/(tabs)',
    accentColor: colors.gold,
    accentBg: colors.goldDim,
  },
  {
    key: 'priest',
    icon: '✝︎',
    title: S.common.rolePriest,
    subtitle: T.priestSubtitle,
    desc: T.priestDesc,
    route: '/(priest)',
    accentColor: colors.blue,
    accentBg: colors.blueBg,
  },
  {
    key: 'servant',
    icon: '◇',
    title: S.common.roleServant,
    subtitle: T.servantSubtitle,
    desc: T.servantDesc,
    route: '/(servant)',
    accentColor: colors.green,
    accentBg: colors.greenBg,
  },
] as const);

export default function PortalsScreen() {
  const router = useRouter();
  const { profile } = useSession();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <TouchableOpacity style={styles.backBtn} onPress={() => goBack('/(tabs)')}>
          <Text style={styles.backText}>{GLYPH.arrowBack} {S.common.back}</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>{APP_NAME_UPPER}</Text>
        <Text style={styles.title}>{T.title}</Text>
        <Text style={styles.subtitle}>{T.subtitle}</Text>

        <View style={styles.divider} />

        {PORTALS.map((portal) => {
          const isYours =
            (portal.key === 'congregant' && (!profile?.role || profile.role === 'congregant')) ||
            (portal.key === 'priest' && (profile?.role === 'priest' || profile?.role === 'admin')) ||
            (portal.key === 'servant' && profile?.role === 'servant');

          return (
            <TouchableOpacity
              key={portal.key}
              style={styles.card}
              onPress={() => router.push(portal.route as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBadge, { backgroundColor: portal.accentBg }]}>
                <Text style={[styles.iconText, { color: portal.accentColor }]}>{portal.icon}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{portal.title}</Text>
                  {isYours && (
                    <View style={[styles.yoursBadge, { backgroundColor: portal.accentBg, borderColor: portal.accentColor }]}>
                      <Text style={[styles.yoursText, { color: portal.accentColor }]}>{T.yourRole}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardSub}>{portal.subtitle}</Text>
                <Text style={styles.cardDesc}>{portal.desc}</Text>
              </View>
              <Text style={[styles.chevron, { color: portal.accentColor }]}>{GLYPH.forward}</Text>
            </TouchableOpacity>
          );
        })}

        {(profile?.role === 'priest' || profile?.role === 'admin') && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity
              style={[styles.card, styles.adminCard]}
              onPress={() => router.push('/admin' as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(192,57,43,0.12)' }]}>
                <Text style={[styles.iconText, { color: colors.red }]}>⊕</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{T.adminTitle}</Text>
                <Text style={styles.cardSub}>{T.adminSubtitle}</Text>
                <Text style={styles.cardDesc}>{T.adminDesc}</Text>
              </View>
              <Text style={[styles.chevron, { color: colors.red }]}>{GLYPH.forward}</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = lazyThemed(() => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },

  backBtn: { marginBottom: 20 },
  backText: { fontFamily: fonts.lato, fontSize: 13, color: colors.gold },

  eyebrow: { fontFamily: fonts.latoBold, fontSize: 9, letterSpacing: 2.5, color: colors.gold, marginBottom: 6 },
  title: { fontFamily: fonts.cormorantMedium, fontSize: 34, color: colors.cream, marginBottom: 6 },
  subtitle: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted, lineHeight: 19, marginBottom: 4 },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },

  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  adminCard: { borderColor: 'rgba(192,57,43,0.25)' },
  iconBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconText: { fontSize: 20 },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  cardTitle: { fontFamily: fonts.cormorantMedium, fontSize: 20, color: colors.cream },
  cardSub: { fontFamily: fonts.latoBold, fontSize: 10, letterSpacing: 1, color: colors.muted, textTransform: 'uppercase', marginBottom: 6 },
  cardDesc: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, lineHeight: 17 },
  chevron: { fontFamily: fonts.cormorant, fontSize: 28, marginTop: 4, flexShrink: 0 },

  yoursBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  yoursText: { fontFamily: fonts.latoBold, fontSize: 8, letterSpacing: 1 },
}));
