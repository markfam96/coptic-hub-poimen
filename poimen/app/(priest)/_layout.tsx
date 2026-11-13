// app/(priest)/_layout.tsx
// Priest (Father of Confession) navigation — the same swipe-from-left drawer as
// the congregant view, replacing the old bottom tab bar. Pull from the left edge
// (or tap ☰ on the Flock screen) to open it. Icons are the shared drawn-line set.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { takeHomeRequest } from '@/lib/home-request';
import { HeaderArea } from '@/components/ui/HeaderActions';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, lazyThemed } from '@/lib/theme';
import { S, isRTL } from '@/lib/i18n';
import { CongregationIcon, CandleIcon, CrossIcon, CalendarIcon } from '@/components/ui/TabIcons';

const T = S.priest.nav;

function DrawerHeader() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.brand, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.brandCross}>✝︎</Text>
      <Text style={styles.brandName}>{S.common.appName}</Text>
      <Text style={styles.brandSub}>{S.common.fatherOfConfession}</Text>
    </View>
  );
}

function CustomDrawerContent(props: any) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.navy }}>
      <DrawerHeader />
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 8 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </View>
  );
}

type IconProps = { color: string };

export default function PriestLayout() {
  return (
    <HeaderArea.Provider value="priest">
    <Drawer
      drawerContent={CustomDrawerContent}
      // Profile and the screens it opens have a house button that returns
      // here and asks for this area's first screen
      // (components/ui/HomeButton.tsx).
      screenListeners={({ navigation, route }) => ({
        focus: () => { if (takeHomeRequest() && route.name !== 'index') navigation.navigate('index'); },
      })}
      screenOptions={{
        headerShown: false,
        swipeEnabled: true,
        swipeEdgeWidth: 60,
        // The drawer opens from the side reading starts on. Set explicitly:
        // on web React Navigation cannot see the page's direction.
        drawerPosition: isRTL ? 'right' : 'left',
        drawerActiveTintColor: colors.gold,
        drawerInactiveTintColor: colors.muted,
        drawerActiveBackgroundColor: colors.goldDim,
        drawerStyle: { backgroundColor: colors.navy },
        drawerLabelStyle: { fontFamily: fonts.lato, fontSize: 15 },
      }}
    >
      <Drawer.Screen name="index" options={{
        title: T.flock,
        drawerIcon: ({ color }: IconProps) => <CongregationIcon size={20} color={color} />,
      }} />
      <Drawer.Screen name="schedule" options={{
        title: T.schedule,
        drawerIcon: ({ color }: IconProps) => <CalendarIcon size={20} color={color} />,
      }} />
      {/* One member's page — always opened from their row in My Flock with
          their id. From the menu it showed whichever member was last open. */}
      <Drawer.Screen name="member" options={{
        title: T.member,
        drawerItemStyle: { display: 'none' },
      }} />
      <Drawer.Screen name="canon-templates" options={{
        title: T.canon,
        drawerIcon: ({ color }: IconProps) => <CandleIcon size={20} color={color} />,
      }} />
      {/* One member's canon — always opened from their screen with a memberId,
          never from the drawer. Listing it here would give it a second entrance
          that carries whatever member was edited last. */}
      <Drawer.Screen name="assign-canon" options={{
        drawerItemStyle: { display: 'none' },
      }} />
      <Drawer.Screen name="log-encounter" options={{
        title: T.encounter,
        drawerIcon: ({ color }: IconProps) => <CrossIcon size={20} color={color} />,
      }} />
    </Drawer>
    </HeaderArea.Provider>
  );
}

const styles = lazyThemed(() => StyleSheet.create({
  brand: { alignItems: 'center', paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  brandCross: { fontSize: 30, color: colors.gold, marginBottom: 24 },
  brandName: { fontFamily: fonts.cormorantMedium, fontSize: 24, color: colors.cream, letterSpacing: 2 },
  brandSub: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, fontStyle: 'italic', marginTop: 2 },
}));
