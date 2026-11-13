import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeButton } from '@/components/ui/HomeButton';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSession } from '@/lib/auth';
import * as db from '@/lib/db';
import { colors, fonts , lazyThemed } from '@/lib/theme';
import { S, fmt, GLYPH } from '@/lib/i18n';

const T = S.account.link;

type LinkType = 'foc' | 'servant';

export default function LinkToFocScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: LinkType }>();
  const { user, refreshProfile } = useSession();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [found, setFound] = useState<{ id: string; full_name: string | null; church_name: string | null } | null>(null);
  const [linked, setLinked] = useState(false);

  const isFOC = type !== 'servant';
  const title = isFOC ? T.titleFoc : T.titleServant;
  const expectedRole = isFOC ? ['priest', 'admin'] : ['servant', 'admin'];

  async function handleLookup() {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setFound(null);
    const { profile, error: lookupError } = await db.lookupInviteCode(code);
    if (lookupError) {
      setError(lookupError);
    } else if (!profile) {
      setError(T.errNotFound);
    } else if (!expectedRole.includes(profile.role)) {
      // profile.role is the stored value; only the word shown for it is translated.
      const role = (T.roleNouns as Record<string, string>)[profile.role] ?? profile.role;
      setError(fmt(isFOC ? T.errWrongRoleFoc : T.errWrongRoleServant, { role }));
    } else {
      setFound(profile);
    }
    setLoading(false);
  }

  async function handleConfirm() {
    if (!found || !user) return;
    setLoading(true);
    // The server checks the code again and sets the link (and, for a Father of
    // Confession, the consent time) itself.
    const { joined, error: linkError } = await db.joinByInviteCode(code, isFOC ? 'foc' : 'servant');
    if (linkError) {
      setError(linkError);
    } else if (!joined) {
      setError(T.errNoLongerMatches);
    } else {
      await refreshProfile();
      setLinked(true);
    }
    setLoading(false);
  }

  if (linked) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Text style={styles.successCross}>✝︎</Text>
          <Text style={styles.successTitle}>{T.successTitle}</Text>
          <Text style={styles.successBody}>
            {found?.full_name != null
              ? fmt(T.successBody, { name: found.full_name })
              : isFOC ? T.successBodyNoNameFoc : T.successBodyNoNameServant}
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/profile')}>
            <Text style={styles.doneBtnText}>{T.done}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <View style={styles.topRow}>
            <TouchableOpacity style={[styles.backRow, styles.backRowInBar]} onPress={() => router.back()}>
              <Text style={styles.backArrow}>{GLYPH.back}</Text>
              <Text style={styles.backText}>{S.account.backToProfile}</Text>
            </TouchableOpacity>
            <HomeButton />
          </View>

          <Text style={styles.pageTitle}>{title}</Text>
          <Text style={styles.pageSub}>
            {isFOC ? T.introFoc : T.introServant}
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={t => { setCode(t.toUpperCase()); setError(''); setFound(null); }}
              placeholder={T.codePlaceholder}
              placeholderTextColor={colors.faint}
              autoCapitalize="characters"
              maxLength={6}
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.lookupBtn, (!code.trim() || loading) && styles.btnDisabled]}
              onPress={handleLookup}
              disabled={!code.trim() || loading}
            >
              {loading
                ? <ActivityIndicator color={colors.navy} />
                : <Text style={styles.lookupBtnText}>{T.find}</Text>
              }
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {found && (
            <View style={styles.foundCard}>
              <Text style={styles.foundCross}>✝︎</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.foundName}>{found.full_name ?? T.unknownName}</Text>
                {found.church_name ? <Text style={styles.foundChurch}>{found.church_name}</Text> : null}
              </View>
              <TouchableOpacity
                style={[styles.confirmBtn, loading && styles.btnDisabled]}
                onPress={handleConfirm}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={colors.navy} />
                  : <Text style={styles.confirmBtnText}>{T.link}</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {found && isFOC && (
            <View style={styles.consentNote}>
              <Text style={styles.consentNoteText}>
                {found.full_name != null ? fmt(T.consent, { name: found.full_name }) : T.consentNoName}
              </Text>
            </View>
          )}

          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              {isFOC ? T.hintFoc : T.hintServant}
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = lazyThemed(() => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  content: { padding: 24, paddingBottom: 48 },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  // Back on one side, the house button on the other.
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backRowInBar: { marginBottom: 0, flexShrink: 1 },
  backArrow: { fontFamily: fonts.cormorant, fontSize: 22, color: colors.gold },
  backText: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted },

  pageTitle: { fontFamily: fonts.cormorantMedium, fontSize: 28, color: colors.cream, marginBottom: 8 },
  pageSub: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted, lineHeight: 20, marginBottom: 28 },

  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  codeInput: {
    flex: 1,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    color: colors.cream,
    fontFamily: fonts.latoBold,
    fontSize: 22,
    padding: 14,
    letterSpacing: 6,
    textAlign: 'center',
  },
  lookupBtn: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lookupBtnText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.navy, letterSpacing: 1 },
  btnDisabled: { opacity: 0.4 },

  errorText: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.red, marginBottom: 12 },

  foundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  foundCross: { fontSize: 22, color: colors.gold },
  foundName: { fontFamily: fonts.cormorantMedium, fontSize: 18, color: colors.cream },
  foundChurch: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginTop: 2 },
  confirmBtn: {
    backgroundColor: colors.gold,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  confirmBtnText: { fontFamily: fonts.latoBold, fontSize: 11, color: colors.navy, letterSpacing: 1 },

  consentNote: {
    backgroundColor: 'rgba(201,168,76,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.18)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  consentNoteText: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, lineHeight: 17 },

  hintBox: {
    backgroundColor: colors.creamDim,
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  hintText: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, lineHeight: 18 },

  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successCross: { fontSize: 40, color: colors.gold, marginBottom: 16 },
  successTitle: { fontFamily: fonts.cormorantMedium, fontSize: 28, color: colors.cream, marginBottom: 8 },
  successBody: { fontFamily: fonts.latoLight, fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  doneBtn: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 40 },
  doneBtnText: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.navy, letterSpacing: 1.2 },
}));
