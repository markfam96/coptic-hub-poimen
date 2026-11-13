// components/ui/HeaderActions.tsx
// The buttons at the trailing end of every main screen's top bar: the switch
// between a priest's or servant's dashboard and their own view, and the
// profile picture that opens Profile. They used to be on Home only, so
// reaching Profile (settings, language, Face ID, sign out) from anywhere else
// meant going back to Home first.
//
// Which switch shows depends on where the screen lives (HeaderArea, provided
// by the (priest) and (servant) layouts; it is NOT read from the current
// route, because a screen left mounted underneath another would then change
// its chip while the next screen slides in or a back swipe uncovers it):
//   · in (priest) or (servant): MY VIEW → the member's own Home
//   · in the member's own view: FOC (priests) / CLASS (servants) → dashboard
//   · a congregant gets no switch, only the picture.
// A screen can add its own buttons as children; they sit between the switch
// and the picture (Home's ⊞ customize).
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, lazyThemed } from '@/lib/theme';
import { Avatar } from '@/components/ui/Avatar';
import { useSession } from '@/lib/auth';
import { useDemoMode } from '@/lib/demo';
import { firstGivenName } from '@/lib/names';
import * as H from '@/lib/haptics';
import { S, isRTL } from '@/lib/i18n';

export type HeaderAreaName = 'member' | 'priest' | 'servant';
export const HeaderArea = React.createContext<HeaderAreaName>('member');

// For a page title that shares its row with these buttons. English titles
// are often one long word ('Appointments'); with a switch chip beside them
// on a small phone they would break mid-word, so on a phone they stay on one
// line and shrink a little instead. The web cannot shrink text to fit, so
// there a title wraps onto a second line at most. Arabic titles are several
// short words and wrap between them, so they are left to wrap.
export const fitTitle = isRTL ? {}
  : Platform.OS === 'web' ? { numberOfLines: 2 } as const
  : { numberOfLines: 1, adjustsFontSizeToFit: true, minimumFontScale: 0.75 } as const;

export function HeaderActions({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const area = React.useContext(HeaderArea);
  const { profile } = useSession();
  const { demoMode, demoRole } = useDemoMode();
  const role = demoMode ? demoRole : profile?.role;
  const initial = (firstGivenName(profile?.full_name) || S.home.friend).charAt(0).toUpperCase();

  let switchTo: { label: string; href: '/(tabs)' | '/(priest)' | '/(servant)' } | null = null;
  if (area === 'priest') switchTo = { label: S.priest.flock.myView, href: '/(tabs)' };
  else if (area === 'servant') switchTo = { label: S.servant.list.myView, href: '/(tabs)' };
  else if (role === 'priest') switchTo = { label: S.home.header.focChip, href: '/(priest)' };
  else if (role === 'servant') switchTo = { label: S.home.header.classChip, href: '/(servant)' };

  // A two-word label (MY FLOCK, MY STUDENTS, MY VIEW) goes on two short
  // lines. On one line the chip took so much of the row that the title or
  // the Home greeting beside it broke in the middle of a word on small phones.
  const stacked = !!switchTo && switchTo.label.includes(' ');
  const chipText = switchTo ? switchTo.label.replace(' ', '\n') : '';

  return (
    <View style={styles.row}>
      {switchTo && (
        <TouchableOpacity
          style={[styles.chipBtn, stacked && styles.chipStacked]}
          onPress={() => { H.tap(); router.push(switchTo!.href); }}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={switchTo.label}
        >
          <Text style={[styles.chipBtnText, stacked && styles.chipTextStacked]}>{chipText}</Text>
        </TouchableOpacity>
      )}
      {children}
      <TouchableOpacity
        onPress={() => { H.tap(); router.push('/profile'); }}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={S.shell.header.profile}
      >
        <Avatar url={profile?.avatar_url} initials={initial} size={34} style={styles.avatarBtn} textStyle={styles.avatarBtnText} />
      </TouchableOpacity>
    </View>
  );
}

// Home's styles, so Home looks as it did (two-word chips stack, above).
const styles = lazyThemed(() => StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', flexShrink: 0 },
  chipBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  chipBtnText: { fontFamily: fonts.latoBold, fontSize: 10, color: colors.muted, letterSpacing: 1 },
  chipStacked: { paddingVertical: 4 },
  chipTextStacked: { lineHeight: 12, textAlign: 'center' },
  avatarBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.goldDim, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarBtnText: { fontFamily: fonts.cormorantMedium, fontSize: 16, color: colors.goldLight },
}));
