import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as db from '@/lib/db';
import { colors, fonts, lazyThemed } from '@/lib/theme';
import { EyeIcon, EyeOffIcon } from '@/components/ui/TabIcons';
import { S } from '@/lib/i18n';
import { localizeAuthError } from '@/lib/auth';

const T = S.auth.resetPassword;

// Reached only via the poimen://auth-callback recovery link, which has
// already exchanged itself for a live session (see lib/auth.tsx) — this
// screen just collects the new password for that session.
export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    if (password.length < 6) { setError(T.errTooShort); return; }
    if (password !== confirm) { setError(T.errMismatch); return; }
    setLoading(true);
    const { error } = await db.updatePassword(password);
    setLoading(false);
    if (error) { setError(localizeAuthError(error)); return; }
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
        <View style={styles.brand}>
          <Text style={styles.brandCross}>✝︎</Text>
          <Text style={styles.brandTitle}>{T.title}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder={T.newPassword}
              placeholderTextColor={colors.faint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoFocus
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(s => !s)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword
                ? <EyeIcon size={18} color={colors.muted} />
                : <EyeOffIcon size={18} color={colors.muted} />}
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder={T.confirmPassword}
            placeholderTextColor={colors.faint}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.navy} />
              : <Text style={styles.submitBtnText}>{T.submit}</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = lazyThemed(() => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  content: { flex: 1, padding: 28, justifyContent: 'center' },

  brand: { alignItems: 'center', marginBottom: 40 },
  brandCross: { fontSize: 30, color: colors.gold, marginBottom: 20, opacity: 0.8 },
  brandTitle: { fontFamily: fonts.cormorantMedium, fontSize: 26, color: colors.cream, textAlign: 'center' },

  form: { gap: 12 },
  input: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.18)',
    borderRadius: 10,
    color: colors.cream,
    fontFamily: fonts.latoLight,
    fontSize: 15,
    padding: 15,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.18)',
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    color: colors.cream,
    fontFamily: fonts.latoLight,
    fontSize: 15,
    padding: 15,
  },
  passwordToggle: { paddingHorizontal: 14 },

  errorText: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.red, textAlign: 'center', lineHeight: 18 },

  submitBtn: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  submitBtnText: { fontFamily: fonts.latoBold, fontSize: 14, color: colors.navy, letterSpacing: 1 },
}));
