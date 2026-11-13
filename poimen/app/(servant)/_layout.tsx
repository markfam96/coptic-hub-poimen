// app/(servant)/_layout.tsx
// Servant (Sunday-school / youth servant) navigation — the same swipe-from-left
// drawer as the congregant view, replacing the old bottom tab bar. Pull from the
// left edge (or tap ☰ on the Students screen) to open it. Shared drawn-line icons.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { takeHomeRequest } from '@/lib/home-request';
import { HeaderArea } from '@/components/ui/HeaderActions';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, lazyThemed } from '@/lib/theme';
import { CongregationIcon } from '@/components/ui/TabIcons';
import { S, isRTL } from '@/lib/i18n';

const T = S.servant.drawer;

function DrawerHeader() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.brand, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.brandCross}>✝︎</Text>
      <Text style={styles.brandName}>{S.common.appName}</Text>
      <Text style={styles.brandSub}>{T.tagline}</Text>
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

export default function ServantLayout() {
  return (
    <HeaderArea.Provider value="servant">
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
        title: T.students,
        drawerIcon: ({ color }: IconProps) => <CongregationIcon size={20} color={color} />,
      }} />
      {/* One student's page, and assigning that student a canon — always
          opened from the student with their id. From the menu they showed
          whichever student was last open, or a canon form with no student
          to save it to. */}
      <Drawer.Screen name="student" options={{
        title: T.student,
        drawerItemStyle: { display: 'none' },
      }} />
      <Drawer.Screen name="assign-canon" options={{
        title: T.canon,
        drawerItemStyle: { display: 'none' },
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
