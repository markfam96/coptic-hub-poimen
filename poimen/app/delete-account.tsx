// Delete my account. Immediate and final (decided 2026-10-14): the member's
// own data goes; a priest keeps his encounter records and notes about them,
// detached from any account. The copy below says exactly that.
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeButton } from '@/components/ui/HomeButton';
import { useRouter } from 'expo-router';
import { useSession } from '@/lib/auth';
import { colors, fonts, lazyThemed } from '@/lib/theme';
import { S, fmt, GLYPH } from '@/lib/i18n';

const T = S.account.deleteAccount;

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { profile, deleteAccount } = useSession();
  const [typed, setTyped] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const isShepherd = profile?.role === 'priest' || profile?.role === 'servant' || profile?.role === 'admin';
  // The word to type is shown in the app's language; the English one is
  // accepted in every language.
  const typedWord = typed.trim().toUpperCase();
  const ready = typedWord === 'DELETE' || typedWord === T.confirmWord.toUpperCase();

  async function handleDelete() {
    if (!ready || working) return;
    setWorking(true);
    setError('');
    const { error: err } = await deleteAccount();
    if (err) {
      setError(err);
      setWorking(false);
      return;
    }
    router.replace('/sign-in');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.topRow}>
            <TouchableOpacity style={[styles.backRow, styles.backRowInBar]} onPress={() => router.back()} disabled={working}>
              <Text style={styles.backArrow}>{GLYPH.back}</Text>
              <Text style={styles.backText}>{S.account.backToProfile}</Text>
            </TouchableOpacity>
            <HomeButton disabled={working} />
          </View>

          <Text style={styles.pageTitle}>{T.title}</Text>
          <Text style={styles.body}>
            {T.intro}
          </Text>

          <Text style={styles.heading}>{T.deletedHeading}</Text>
          <Text style={styles.body}>
            {T.deletedBody}
          </Text>

          <Text style={styles.heading}>{T.keptHeading}</Text>
          <Text style={styles.body}>
            {T.keptBody}
          </Text>
          {isShepherd && (
            <Text style={styles.body}>
              {profile?.role === 'servant' ? T.shepherdServant : T.shepherdPriest}
            </Text>
          )}

          <Text style={styles.heading}>{T.confirmHeading}</Text>
          <Text style={styles.body}>{fmt(T.typeToConfirm, { word: T.confirmWord })}</Text>
          <TextInput
            style={styles.input}
            value={typed}
            onChangeText={t => { setTyped(t); setError(''); }}
            placeholder={T.confirmWord}
            placeholderTextColor={colors.faint}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!working}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.deleteBtn, (!ready || working) && { opacity: 0.4 }]}
            onPress={handleDelete}
            disabled={!ready || working}
          >
            {working
              ? <ActivityIndicator color={colors.cream} />
              : <Text style={styles.deleteText}>{T.submit}</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = lazyThemed(() => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  content: { padding: 24, paddingBottom: 60, gap: 10 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  // Back on one side, the house button on the other.
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backRowInBar: { marginBottom: 0, flexShrink: 1 },
  backArrow: { fontSize: 24, color: colors.gold, lineHeight: 26 },
  backText: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.gold },
  pageTitle: { fontFamily: fonts.cormorantMedium, fontSize: 28, color: colors.cream, marginBottom: 4 },
  heading: { fontFamily: fonts.latoBold, fontSize: 11, letterSpacing: 1.5, color: colors.gold, marginTop: 12, textTransform: 'uppercase' },
  body: { fontFamily: fonts.latoLight, fontSize: 14, color: colors.muted, lineHeight: 21 },
  input: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 10, color: colors.cream, fontFamily: fonts.latoBold, fontSize: 16, padding: 14, letterSpacing: 2 },
  error: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.red },
  deleteBtn: { backgroundColor: colors.red, borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  deleteText: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream, letterSpacing: 1 },
}));
