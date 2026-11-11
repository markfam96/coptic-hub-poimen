// lib/reload.ts
// A full JS reload. The palette and the language are both captured when screen
// modules first run, so changing either means starting the JS again.
//
// DevSettings.reload() only works with Metro or a dev client attached; it is a
// silent no-op in a TestFlight or App Store build. expo-updates' reloadAsync()
// is the one that works in a release build. Returns false when neither could
// reload, so the caller can ask the person to reopen the app.

import { Platform } from 'react-native';
import * as Updates from 'expo-updates';

export async function reloadApp(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.location.reload();
    return true;
  }
  if (Updates.isEnabled) {
    try { await Updates.reloadAsync(); return true; } catch {}
  }
  try {
    const { DevSettings } = require('react-native');
    DevSettings.reload();
    return true;
  } catch {
    return false;
  }
}
