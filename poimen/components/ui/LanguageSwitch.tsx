// components/ui/LanguageSwitch.tsx
// Two buttons, each in its own language and script, so the switch can be
// found by someone who cannot read the language the app is currently in.
// Choosing the other one saves it and reloads the app (see lib/i18n).

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { colors, lazyThemed } from '@/lib/theme';
import { lang, setLanguage, directionStyle, LANGUAGE_NAMES, S, type Lang } from '@/lib/i18n';

const ORDER: Lang[] = ['en', 'ar'];

// Each name is drawn in the face of its own script whatever the app language
// is. (The Arabic face is only loaded in Arabic; on the English screen
// "العربية" is drawn by the system's Arabic font, which is fine for one word.)
const FACE: Record<Lang, string> = { en: 'Lato_700Bold', ar: 'IBMPlexSansArabic_700Bold' };

export function LanguageSwitch({ compact, style }: { compact?: boolean; style?: StyleProp<ViewStyle> }) {
  const [busy, setBusy] = useState(false);

  async function choose(next: Lang) {
    if (next === lang || busy) return;
    setBusy(true);
    const result = await setLanguage(next);
    if (result === true) return;
    setBusy(false);
    // Said in both languages: the person may not read the current one.
    const [title, body] = result === 'failed'
      ? ['Language not saved · لم تُحفظ اللغة', 'Please try again.\nحاول مرة أخرى.']
      : ['Language saved · تم حفظ اللغة', 'Close and reopen the app to apply it.\nأغلق التطبيق وافتحه من جديد لتطبيق اللغة.'];
    // Alert.alert does nothing on react-native-web.
    if (Platform.OS === 'web') { if (typeof window !== 'undefined') window.alert(`${title}\n\n${body}`); }
    else Alert.alert(title, body);
  }

  return (
    <View style={[styles.row, style]} accessibilityRole="radiogroup" accessibilityLabel={S.auth.signIn.languageSwitch}>
      {ORDER.map(code => {
        const active = code === lang;
        return (
          <TouchableOpacity
            key={code}
            onPress={() => choose(code)}
            disabled={busy}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected: active, disabled: busy }}
            accessibilityLabel={LANGUAGE_NAMES[code]}
            hitSlop={{ top: 8, bottom: 8 }}
            style={[styles.btn, compact && styles.btnCompact, active && styles.btnActive]}
          >
            <Text style={[styles.label, compact && styles.labelCompact, { fontFamily: FACE[code] }, active && styles.labelActive]}>
              {LANGUAGE_NAMES[code]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = lazyThemed(() => StyleSheet.create({
  // Fixed order (English, then Arabic) in both directions, so the control does
  // not appear to jump when the app mirrors.
  row: { flexDirection: 'row', gap: 8, ...directionStyle('ltr') },
  btn: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  btnCompact: { flex: 0, flexGrow: 0, flexShrink: 0, flexBasis: 'auto', paddingVertical: 7, paddingHorizontal: 16, borderRadius: 999 },
  btnActive: { borderColor: colors.gold, backgroundColor: colors.goldDim },
  label: { fontSize: 13, color: colors.muted },
  labelCompact: { fontSize: 12 },
  labelActive: { color: colors.goldLight },
}));
