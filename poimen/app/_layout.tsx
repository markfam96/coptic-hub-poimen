import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { Redirect, Stack, useSegments, SplashScreen } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  useFonts as useCormorant,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Lato_300Light,
  Lato_400Regular,
  Lato_700Bold,
  useFonts as useLato,
} from '@expo-google-fonts/lato';
import { useFonts as useArabicFonts } from 'expo-font';
import { Amiri_400Regular } from '@expo-google-fonts/amiri/400Regular';
import { Amiri_700Bold } from '@expo-google-fonts/amiri/700Bold';
import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic/400Regular';
import { IBMPlexSansArabic_500Medium } from '@expo-google-fonts/ibm-plex-sans-arabic/500Medium';
import { IBMPlexSansArabic_700Bold } from '@expo-google-fonts/ibm-plex-sans-arabic/700Bold';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { S, plural, isRTL, rootDirectionStyle, settleLayoutDirection, willReloadForDirection } from '@/lib/i18n';
import { AuthProvider, useSession } from '@/lib/auth';
import { DemoProvider, useDemoMode } from '@/lib/demo';
import { setStorageScope } from '@/lib/storage';
import * as db from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { TutorialProvider } from '@/lib/tutorial-context';
import RouteMemory from '@/components/RouteMemory';
import ReminderSync from '@/components/ReminderSync';
import { Modal, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { MIN_PIN_LENGTH } from '@/lib/crypto';
import { colors, fonts, applyTheme, loadThemeMode, lazyThemed, ThemeMode } from '@/lib/theme';
import { isBiometricAvailable, loadFaceIdLockEnabled, authenticateWithBiometrics, onFaceIdLockChange } from '@/lib/biometrics';
import type { AuthSession } from '@/lib/db';

SplashScreen.preventAutoHideAsync();

const ARABIC_FACES = {
  Amiri_400Regular,
  Amiri_700Bold,
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_700Bold,
};
const NO_FACES = {};

// react-native-web resolves marginStart / paddingEnd / start / end from its own
// direction context, not from <html dir>: without this an inline
// `marginEnd: 12` stays on the right in Arabic. A `dir` prop on a View sets
// that context for everything below it, modal portals included. Native needs
// nothing here.
const WEB_DIRECTION = Platform.OS === 'web' ? ({ dir: isRTL ? 'rtl' : 'ltr' } as object) : null;

// Gates the already-persisted Supabase session behind Face ID — the session
// itself survives app restarts (see lib/supabase.ts persistSession), so
// without this anyone with the unlocked phone could open straight into
// confession/pastoral data. Locks on every foreground resume, not just cold
// start.
function useFaceIdLock(session: AuthSession | null, demoMode: boolean) {
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([isBiometricAvailable(), loadFaceIdLockEnabled()]).then(([avail, pref]) => {
      if (cancelled) return;
      setAvailable(avail);
      setEnabled(pref);
      setReady(true);
    });
    // Track the Profile toggle live — this hook outlives that screen, so
    // without the subscription a change only lands on the next app launch
    // (worst case: Face ID turned OFF but the lock keeps prompting).
    const unsub = onFaceIdLockChange(setEnabled);
    return () => { cancelled = true; unsub(); };
  }, []);

  // On the launch that is about to reload itself to switch layout direction
  // (lib/i18n settleLayoutDirection), asking here would only be asked again.
  const protect = ready && available && enabled && !!session && !demoMode && !willReloadForDirection();

  useEffect(() => {
    if (protect) setLocked(true);
    else setLocked(false);
  }, [protect]);

  useEffect(() => {
    if (!protect) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') setLocked(true);
    });
    return () => sub.remove();
  }, [protect]);

  const promptBusy = useRef(false);
  async function unlock(): Promise<boolean> {
    if (promptBusy.current) return false;
    promptBusy.current = true;
    try {
      const ok = await authenticateWithBiometrics();
      if (ok) setLocked(false);
      return ok;
    } finally {
      promptBusy.current = false;
    }
  }

  // Auto-prompt only while the app is foregrounded. Locking happens as the
  // app backgrounds, and a Face ID sheet launched at that moment dies with
  // the transition — so prompt on the return to 'active' instead, and once
  // on the initial lock (cold start / toggle-on, where the app is active).
  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  useEffect(() => {
    if (!protect) return;
    if (locked && AppState.currentState === 'active') unlock();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && lockedRef.current) unlock();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protect, locked]);

  return { locked: protect && locked, unlock };
}

function FaceIdLockScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={lockStyles.overlay}>
      <Text style={lockStyles.cross}>✝︎</Text>
      <Text style={lockStyles.title}>{S.auth.lock.title}</Text>
      <Text style={lockStyles.body}>{S.auth.lock.body}</Text>
      <TouchableOpacity style={lockStyles.btn} onPress={onRetry}>
        <Text style={lockStyles.btnText}>{S.auth.lock.unlock}</Text>
      </TouchableOpacity>
    </View>
  );
}

const lockStyles = lazyThemed(() => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.navy, justifyContent: 'center', alignItems: 'center', padding: 28, gap: 10 },
  cross: { fontSize: 30, color: colors.gold, opacity: 0.8, marginBottom: 8 },
  title: { fontFamily: fonts.cormorantMedium, fontSize: 26, color: colors.cream },
  body: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted, marginBottom: 16 },
  btn: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32 },
  btnText: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.navy, letterSpacing: 1 },
}));

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = '[role="button"],button,a{cursor:pointer!important}';
  document.head.appendChild(s);
}

// ── PIN Modal ─────────────────────────────────────────────────
const PIN = S.auth.pin;

function PINModal() {
  const { pinAction, completePINSetup, completePINRecovery, startFreshKeypair, skipPINSetup } = useSession();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [wroteItDown, setWroteItDown] = useState(false);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  // 'upgrade' sets a new PIN exactly like 'setup'; only the wording differs.
  const isNew = pinAction === 'setup' || pinAction === 'upgrade';

  function reset() {
    setPin(''); setConfirmPin(''); setWroteItDown(false); setError(''); setWorking(false);
  }

  async function handleSubmit() {
    setError('');
    if (isNew) {
      if (pin.length < MIN_PIN_LENGTH) { setError(plural(PIN.errTooShort, MIN_PIN_LENGTH)); return; }
      if (pin !== confirmPin) { setError(PIN.errMismatch); return; }
      if (!wroteItDown) { setError(PIN.errWriteDown); return; }
    } else if (!pin) {
      setError(PIN.errEmpty); return;
    }
    // Sealing and unsealing are deliberately slow (a few seconds).
    setWorking(true);
    try {
      if (isNew) {
        await completePINSetup(pin);
      } else {
        const ok = await completePINRecovery(pin);
        if (!ok) { setError(PIN.errIncorrect); setWorking(false); return; }
      }
      reset();
    } catch {
      setError(PIN.errSave);
      setWorking(false);
    }
  }

  async function handleForgotPIN() {
    setWorking(true);
    await startFreshKeypair();
    reset();
  }

  return (
    <Modal visible={pinAction !== null} transparent animationType="fade">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={pinStyles.overlay}>
        <View style={pinStyles.card}>
          <Text style={pinStyles.cross}>✝︎</Text>
          <Text style={pinStyles.title}>
            {pinAction === 'setup' ? PIN.titleSetup
              : pinAction === 'upgrade' ? PIN.titleUpgrade
              : PIN.titleRecover}
          </Text>
          <Text style={pinStyles.body}>
            {pinAction === 'setup'
              ? PIN.bodySetup
              : pinAction === 'upgrade'
              ? PIN.bodyUpgrade
              : PIN.bodyRecover}
          </Text>
          {isNew && (
            <Text style={pinStyles.warning}>
              {PIN.warning}
            </Text>
          )}
          <TextInput
            style={pinStyles.input}
            placeholder={isNew ? plural(PIN.placeholderNew, MIN_PIN_LENGTH) : PIN.placeholder}
            placeholderTextColor={colors.faint}
            value={pin}
            onChangeText={t => { setPin(t); setError(''); }}
            secureTextEntry
            keyboardType="default"
            autoFocus
            editable={!working}
          />
          {isNew && (
            <TextInput
              style={pinStyles.input}
              placeholder={PIN.confirmPlaceholder}
              placeholderTextColor={colors.faint}
              value={confirmPin}
              onChangeText={t => { setConfirmPin(t); setError(''); }}
              secureTextEntry
              keyboardType="default"
              editable={!working}
            />
          )}
          {isNew && (
            <TouchableOpacity
              style={pinStyles.check}
              onPress={() => { setWroteItDown(v => !v); setError(''); }}
              disabled={working}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: wroteItDown }}
            >
              <Text style={pinStyles.checkBox}>{wroteItDown ? '☑' : '☐'}</Text>
              <Text style={pinStyles.checkText}>{PIN.wroteItDown}</Text>
            </TouchableOpacity>
          )}
          {error ? <Text style={pinStyles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[pinStyles.btn, working && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={working}
          >
            {working
              ? <View style={pinStyles.workingRow}><ActivityIndicator color={colors.navy} /><Text style={pinStyles.btnText}>{isNew ? PIN.securing : PIN.unlocking}</Text></View>
              : <Text style={pinStyles.btnText}>{isNew ? PIN.save : PIN.restore}</Text>}
          </TouchableOpacity>
          {isNew && (
            <TouchableOpacity onPress={skipPINSetup} style={pinStyles.skip} disabled={working}>
              <Text style={pinStyles.skipText}>{pinAction === 'upgrade' ? PIN.remindLater : PIN.skipForNow}</Text>
            </TouchableOpacity>
          )}
          {!isNew && (
            <TouchableOpacity onPress={handleForgotPIN} style={pinStyles.skip} disabled={working}>
              <Text style={pinStyles.skipText}>{PIN.forgot}</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const pinStyles = lazyThemed(() => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 28, width: '100%', maxWidth: 400, alignItems: 'center', gap: 12 },
  cross: { fontSize: 24, color: colors.gold, opacity: 0.8 },
  title: { fontFamily: fonts.cormorantMedium, fontSize: 22, color: colors.cream, textAlign: 'center' },
  body: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
  input: { width: '100%', backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 10, color: colors.cream, fontFamily: fonts.latoLight, fontSize: 15, padding: 14 },
  error: { fontFamily: fonts.latoLight, fontSize: 12, color: colors.red, textAlign: 'center' },
  warning: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.cream, textAlign: 'center', lineHeight: 18 },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, width: '100%' },
  checkBox: { fontSize: 18, color: colors.gold, lineHeight: 20 },
  checkText: { flex: 1, fontFamily: fonts.latoLight, fontSize: 12, color: colors.cream, lineHeight: 18 },
  workingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 14, width: '100%', alignItems: 'center' },
  btnText: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.navy, letterSpacing: 1 },
  skip: { marginTop: 4 },
  skipText: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, textAlign: 'center', lineHeight: 16 },
}));

function RootLayoutNav() {
  const { session, loading, profile } = useSession();
  const { demoMode, setDemoMode } = useDemoMode();
  const segments = useSegments();
  const { locked, unlock } = useFaceIdLock(session, demoMode);

  // Point the on-device stores at THIS account's namespace before any screen
  // reads them — synchronously during render so a child's mount effect never
  // sees the previous user's data. Signed-in id wins over the demo flag (the
  // sticky-demo effect below clears demoMode on a real session anyway).
  setStorageScope(session?.user?.id ?? (demoMode ? 'demo' : null));

  // A real session always wins over a lingering demo flag. The sign-in
  // screen's demo cards persist the flag and nothing ever cleared it, so one
  // demo visit left every later authenticated session silently running on
  // demo data and fake saves (e.g. priest encounters that never hit the DB).
  useEffect(() => {
    if (session && demoMode) setDemoMode(false);
  }, [session, demoMode]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (session?.user?.id && !demoMode) {
      db.touchLastSeen(session.user.id).catch(() => {});
    }
  }, [session?.user?.id]);

  if (loading && !demoMode) return <View style={{ flex: 1, backgroundColor: colors.navy }} />;

  if (!demoMode && !loading) {
    const onSignIn = segments[0] === 'sign-in';
    // auth-callback must render session-less: it's the deep-link landing spot
    // while lib/auth.tsx exchanges the URL tokens for a session.
    const onAuthCallback = segments[0] === 'auth-callback';
    // privacy must render session-less: it's a public legal document — the
    // App Store Connect "Privacy Policy URL" and prospective users reading it
    // before signing up must be able to reach it while signed out.
    const onPrivacy = segments[0] === 'privacy';
    // support likewise: it is the App Store "Support URL" (Guideline 1.5).
    const onSupport = segments[0] === 'support';
    if (!session && !onSignIn && !onAuthCallback && !onPrivacy && !onSupport) return <Redirect href="/sign-in" />;
    if (session && onSignIn) return <Redirect href="/(tabs)" />;
  }

  if (locked) return <FaceIdLockScreen onRetry={unlock} />;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(priest)" />
        <Stack.Screen name="(servant)" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="portals" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="auth-callback" />
        <Stack.Screen name="link-to-foc" />
        <Stack.Screen name="delete-account" />
        <Stack.Screen name="reminders" />
      </Stack>
      {/* Land back where you left off after the app is reclaimed in the
          background — only once signed in (or exploring a demo), so it can
          never take over the sign-in redirect above. */}
      <RouteMemory enabled={!!session || demoMode} />
      {/* Rebuilds the fortnight of scheduled reminders on every foreground, and
          opens the tab a tapped reminder is about. */}
      <ReminderSync
        enabled={!!session || demoMode}
        userId={session?.user?.id ?? null}
        demoMode={demoMode}
        focId={profile?.foc_id ?? null}
      />
      {!demoMode && session && <PINModal />}
    </>
  );
}

export default function RootLayout() {
  // The theme must be applied BEFORE any route module loads: screen
  // StyleSheets capture color values when their module first executes, and
  // route modules execute lazily on first render — so gating render here is
  // what makes the palette swap stick app-wide.
  const [themeMode, setThemeMode] = useState<ThemeMode | null>(null);
  useEffect(() => {
    loadThemeMode().then(m => { applyTheme(m); setThemeMode(m); });
  }, []);

  const [cormorantLoaded] = useCormorant({
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
  });

  const [latoLoaded] = useLato({
    Lato_300Light,
    Lato_400Regular,
    Lato_700Bold,
  });

  // The Arabic faces are imported one weight at a time (the package index
  // would bundle all eleven files) and loaded only when the app is in Arabic.
  const [arabicLoaded] = useArabicFonts(isRTL ? ARABIC_FACES : NO_FACES);

  // Right-to-left on native only lands on the next start of the JS; this
  // reloads once if the saved language and the native direction disagree.
  useEffect(() => { settleLayoutDirection(); }, []);

  // On web, don't block render waiting for fonts — system fonts are fine as fallback
  const fontsLoaded = Platform.OS === 'web' || (cormorantLoaded && latoLoaded && (!isRTL || arabicLoaded));

  useEffect(() => {
    if (fontsLoaded && themeMode !== null && Platform.OS !== 'web') SplashScreen.hideAsync();
  }, [fontsLoaded, themeMode]);

  if (!fontsLoaded || themeMode === null) return null;

  return (
    <GestureHandlerRootView style={rootDirectionStyle}>
      <View style={{ flex: 1 }} {...WEB_DIRECTION}>
      <DemoProvider>
        <AuthProvider>
          <TutorialProvider>
            <RootLayoutNav />
            <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
          </TutorialProvider>
        </AuthProvider>
      </DemoProvider>
      </View>
    </GestureHandlerRootView>
  );
}
