// components/ui/HomeButton.tsx
// The house button on Profile and the screens it opens. Those screens are in
// the root stack, above the side menus, so the button goes back to the area
// the person came from and on to its first screen (lib/home-request.ts):
// Home for a member, My Flock for a priest who came from the dashboard, My
// Students for a servant. Back stays beside it for one step at a time.
//
// Hidden when nobody is signed in (Privacy can be read from the sign-in
// screen), since there is no Home to go to.
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';
import { CommonActions, StackActions } from '@react-navigation/native';
import { colors, lazyThemed } from '@/lib/theme';
import { useSession } from '@/lib/auth';
import { useDemoMode } from '@/lib/demo';
import { requestHome } from '@/lib/home-request';
import { HouseIcon } from '@/components/ui/TabIcons';
import * as H from '@/lib/haptics';
import { S } from '@/lib/i18n';

const AREAS = ['(tabs)', '(priest)', '(servant)'];

export function HomeButton({ disabled = false }: { disabled?: boolean }) {
  const navigation = useNavigation();
  const { session } = useSession();
  const { demoMode } = useDemoMode();
  if (!session && !demoMode) return null;

  function onPress() {
    H.tap();
    // Pop back to the nearest area under this screen; its layout then moves
    // to its first screen. With none (a deep link), start over from the
    // member's own Home, so the screens opened on the way are not left
    // underneath it.
    const routes = navigation.getState()?.routes ?? [];
    let i = routes.length - 1;
    while (i >= 0 && !AREAS.includes(routes[i].name)) i--;
    if (i >= 0) {
      requestHome();
      navigation.dispatch(StackActions.pop(routes.length - 1 - i));
    } else {
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: '(tabs)' }] }));
    }
  }

  return (
    <TouchableOpacity
      style={[styles.btn, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={S.shell.header.home}
    >
      <HouseIcon size={18} color={colors.gold} />
    </TouchableOpacity>
  );
}

// The same frame as DrawerMenuButton, without its trailing margin.
const styles = lazyThemed(() => StyleSheet.create({
  btn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1, borderColor: colors.border,
  },
  disabled: { opacity: 0.4 },
}));
