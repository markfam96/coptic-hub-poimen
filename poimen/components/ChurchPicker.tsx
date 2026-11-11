// components/ChurchPicker.tsx
// The church picker, shared by sign-up and Profile: a collapsed field
// (ChurchField) and the bottom sheet it opens (ChurchPicker).
//
// Lifted out of app/profile.tsx so sign-up and Profile cannot drift. The
// sheet never blocks anything: "My church isn't listed" is reachable while
// the list is loading, after it failed, and when it loaded — so the
// directory is a convenience, not a dependency of creating an account.
//
// Location is asked for only when "Sort by nearest" is tapped, via
// lib/location.ts (the one place that imports expo-location), and is used
// here to order rows and show a distance. It goes nowhere else; that is
// what PRIVACY_COPY.churchLocation under the button promises.
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList,
  ActivityIndicator, Linking, Platform, KeyboardAvoidingView, type StyleProp, type ViewStyle,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Church } from '@/lib/db';
import { colors, fonts, lazyThemed, arabicFontSize } from '@/lib/theme';
import { PRIVACY_COPY } from '@/lib/privacy-copy';
import { rankByDistance, type LatLng } from '@/lib/geo';
import { getApproxLocation } from '@/lib/location';
import { type ChurchChoice, unlistedNameValid, CHURCH_NAME_MAX } from '@/lib/church-choice';
import {
  formatChurchAddress, formatChurchLocality, displayNickname, precisionLabel,
  formatDistance, distanceUnitFor, churchSearchKey, matchesQuery,
  CHURCH_DIRECTORY_URL, CHURCH_DIRECTORY_SUGGEST_URL,
  type DistanceUnit,
} from '@/lib/church-display';
import { S, fmt, GLYPH, isRTL } from '@/lib/i18n';

const T = S.church;

export type ChurchListStatus = 'idle' | 'loading' | 'ready' | 'failed';

// Remembered on the device, not the account: it is about the phone's owner
// reading distances, and there is no account yet at sign-up.
const UNIT_KEY = 'poimen.churches.unit';

const FIELD_LOADING = T.field.loading;
const FIELD_FAILED = T.field.failed;
const LIST_FAILED = T.picker.listFailed;
const DENIED = T.picker.locationDenied;
// react-native-web's Linking has no openSettings, and the remedy there is the
// browser's site permission, not a Settings app.
const DENIED_WEB = T.picker.locationDeniedWeb;
const UNAVAILABLE = T.picker.locationUnavailable;
const UNLISTED_HINT = T.picker.unlistedHint;
const UNLISTED_SUGGEST = T.picker.unlistedSuggest;

// Hermes may report a bare "en"; distanceUnitFor falls through to the
// nearest church's country in that case. Wrapped because Intl itself has
// been known to be missing pieces on older runtimes.
function deviceLocale(): string | undefined {
  try { return Intl.DateTimeFormat().resolvedOptions().locale; } catch { return undefined; }
}

function isApproximate(c: Church): boolean {
  return c.geo_precision === 'city' || c.geo_precision === 'state';
}

// ── Collapsed field ───────────────────────────────────────────

export function ChurchField(p: {
  value: ChurchChoice | null;
  status: ChurchListStatus;
  placeholder?: string;
  onPress: () => void;
  // sign-in passes its input style, Profile its churchPicker style.
  style?: StyleProp<ViewStyle>;
  // The two call sites size their field text differently (15 / 14).
  textSize?: number;
}) {
  const { value, status, placeholder = T.field.placeholder, onPress, style, textSize = 15 } = p;
  let line1: string;
  let line2: string | null = null;
  let placeholderLook = false;
  if (value?.kind === 'listed') {
    line1 = value.church.name;
    line2 = formatChurchLocality(value.church) || null;
  } else if (value?.kind === 'unlisted') {
    line1 = value.name;
    line2 = value.city.trim() ? fmt(T.field.notInDirectoryWithCity, { city: value.city.trim() }) : T.field.notInDirectory;
  } else {
    placeholderLook = true;
    line1 = status === 'loading' ? FIELD_LOADING : status === 'failed' ? FIELD_FAILED : placeholder;
  }
  return (
    <TouchableOpacity style={[styles.field, style]} onPress={onPress} activeOpacity={0.7} accessibilityRole="button">
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.fieldText, { fontSize: isRTL ? arabicFontSize(textSize) : textSize }, placeholderLook && styles.fieldPlaceholder]} numberOfLines={2}>
          {line1}
        </Text>
        {line2 ? <Text style={styles.fieldSub} numberOfLines={1}>{line2}</Text> : null}
      </View>
      <Text style={styles.fieldChevron} accessibilityElementsHidden importantForAccessibility="no">{GLYPH.forward}</Text>
    </TouchableOpacity>
  );
}

// ── Sheet ─────────────────────────────────────────────────────

export function ChurchPicker(p: {
  visible: boolean;
  onClose: () => void;
  value: ChurchChoice | null;
  // The picker closes itself (calls onClose) after this.
  onChange: (next: ChurchChoice) => void;
  churches: Church[] | null;
  status: ChurchListStatus;
  // Kept for the caller's own messaging; the sheet shows one fixed sentence
  // because a raw PostgREST message helps nobody mid-sign-up.
  loadError: string | null;
  onRetry: () => void;
  allowUnlisted?: boolean;
  // The Home nudge's "Find it" prefills the name the member once typed.
  initialQuery?: string;
  title?: string;
}) {
  const {
    visible, onClose, value, onChange, churches, status, loadError, onRetry,
    allowUnlisted = true, initialQuery, title = T.picker.title,
  } = p;

  const [query, setQuery] = useState('');
  // "Sort by nearest" is optional and only reorders: declining location
  // leaves the usual alphabetical list, with nothing lost.
  const [here, setHere] = useState<LatLng | null>(null);
  const [nearStatus, setNearStatus] = useState<'idle' | 'locating' | 'denied' | 'unavailable'>('idle');
  // null until the member has flipped it (or did so on an earlier open);
  // then it beats the locale guess.
  const [chosenUnit, setChosenUnit] = useState<DistanceUnit | null>(null);
  const [unlistedOpen, setUnlistedOpen] = useState(false);
  const [unlistedName, setUnlistedName] = useState('');
  const [unlistedCity, setUnlistedCity] = useState('');

  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(UNIT_KEY)
      .then(v => { if (live && (v === 'mi' || v === 'km')) setChosenUnit(v); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  // Each open starts clean except for what the caller asked for: the nudge's
  // query, and the unlisted form already open when the list failed — so a
  // member whose connection is down sees where to type at once.
  useEffect(() => {
    if (!visible) return;
    setQuery(initialQuery ?? '');
    setUnlistedOpen(status === 'failed');
    if (value?.kind === 'unlisted') {
      setUnlistedName(value.name);
      setUnlistedCity(value.city);
    }
  }, [visible]);

  // The search key is built once per list, not once per keystroke.
  const indexed = useMemo(
    () => (churches ?? []).map(c => ({ c, key: churchSearchKey(c) })),
    [churches],
  );
  const filtered = useMemo(() => {
    const q = query.trim();
    return q ? indexed.filter(x => matchesQuery(x.key, q)).map(x => x.c) : indexed.map(x => x.c);
  }, [indexed, query]);
  const rows = useMemo(
    () => (here ? rankByDistance(filtered, here) : filtered.map(c => ({ item: c, km: null as number | null }))),
    [filtered, here],
  );
  const hasCoords = useMemo(() => (churches ?? []).some(c => c.latitude != null), [churches]);

  // The nearest placed church's country is the fallback when the locale has
  // no region: a member in Cairo with a bare "en" locale still gets km.
  const nearestCountry = here ? (rows.find(r => r.km != null)?.item.country ?? null) : null;
  const unit: DistanceUnit = chosenUnit ?? distanceUnitFor(deviceLocale(), nearestCountry);

  async function sortByNearest() {
    if (here) { setHere(null); setNearStatus('idle'); return; }
    setNearStatus('locating');
    const result = await getApproxLocation();
    if (result.status === 'ok') {
      setHere(result.coords);
      setNearStatus('idle');
    } else {
      setNearStatus(result.status);
    }
  }

  function flipUnit() {
    const next: DistanceUnit = unit === 'mi' ? 'km' : 'mi';
    setChosenUnit(next);
    AsyncStorage.setItem(UNIT_KEY, next).catch(() => {});
  }

  function pick(c: Church) {
    onChange({ kind: 'listed', church: { id: c.id, name: c.name, nickname: c.nickname, city: c.city, state: c.state, country: c.country } });
    onClose();
  }

  function submitTypedName() {
    if (!unlistedNameValid(unlistedName)) return;
    onChange({ kind: 'unlisted', name: unlistedName.trim(), city: unlistedCity.trim() });
    onClose();
  }

  const selectedId = value?.kind === 'listed' ? value.church.id : null;
  const q = query.trim();
  const showList = churches != null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* A Modal sits outside the screen's KeyboardAvoidingView, and the
          typed-church inputs are at the foot of the sheet. */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>{title}</Text>
          <TextInput
            style={styles.pickerSearch}
            value={query}
            onChangeText={setQuery}
            placeholder={T.picker.searchPlaceholder}
            placeholderTextColor={colors.faint}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />

          {hasCoords && (
            <View style={styles.nearBlock}>
              <View style={styles.nearRow}>
                <TouchableOpacity onPress={sortByNearest} disabled={nearStatus === 'locating'} activeOpacity={0.7} hitSlop={8} accessibilityRole="button">
                  <Text style={styles.nearBtn}>
                    {nearStatus === 'locating' ? T.picker.locating
                      : here ? T.picker.sortedByNearest
                      : T.picker.sortByNearest}
                  </Text>
                </TouchableOpacity>
                {here && (
                  <TouchableOpacity onPress={flipUnit} hitSlop={8} accessibilityLabel={T.picker.switchUnit}>
                    <Text style={styles.unitLabel}>{T.distance[unit]}</Text>
                  </TouchableOpacity>
                )}
              </View>
              {nearStatus === 'denied' && Platform.OS === 'web' ? (
                <Text style={styles.nearNote}>{DENIED_WEB}</Text>
              ) : nearStatus === 'denied' ? (
                <TouchableOpacity onPress={() => Linking.openSettings()} hitSlop={8} accessibilityRole="link">
                  <Text style={[styles.nearNote, styles.nearLink]}>{DENIED}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.nearNote}>
                  {nearStatus === 'unavailable' ? UNAVAILABLE : PRIVACY_COPY.churchLocation}
                </Text>
              )}
            </View>
          )}

          {showList ? (
            <FlatList
              style={styles.list}
              data={rows}
              keyExtractor={r => r.item.id}
              initialNumToRender={16}
              maxToRenderPerBatch={24}
              windowSize={7}
              removeClippedSubviews
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: r }) => {
                const c = r.item;
                const selected = selectedId === c.id;
                const nick = displayNickname(c);
                const address = formatChurchAddress(c);
                const approx = isApproximate(c);
                const label = approx ? precisionLabel(c, T.precision) : null;
                return (
                  <TouchableOpacity style={styles.pickerRow} onPress={() => pick(c)} accessibilityRole="button" accessibilityState={{ selected }}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.pickerRowName, selected && styles.pickerRowNameActive]}>
                        {c.name}{nick ? ` · ${nick}` : ''}
                      </Text>
                      {address ? <Text style={styles.pickerRowAddress}>{address}</Text> : null}
                    </View>
                    {here && r.km != null && (
                      <View style={styles.distanceCol}>
                        <Text style={styles.distance}>{formatDistance(r.km, unit, approx, T.distance)}</Text>
                        {label ? <Text style={styles.precision}>{label}</Text> : null}
                      </View>
                    )}
                    {selected && <Text style={styles.pickerCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.pickerDivider} />}
              ListEmptyComponent={
                <Text style={styles.pickerEmpty}>
                  {q
                    ? fmt(T.picker.noMatch, { query: q })
                    : T.picker.empty}
                </Text>
              }
            />
          ) : status === 'failed' ? (
            <View style={styles.stateBlock}>
              <Text style={styles.pickerEmpty}>{LIST_FAILED}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
                <Text style={styles.retryText}>{S.common.retry}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.stateBlock}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.pickerEmpty}>{FIELD_LOADING}</Text>
            </View>
          )}

          {/* The exit that never depends on the list. */}
          {allowUnlisted && (
            <View style={styles.unlistedBlock}>
              <TouchableOpacity onPress={() => setUnlistedOpen(o => !o)} activeOpacity={0.7} hitSlop={8} accessibilityRole="button" accessibilityState={{ expanded: unlistedOpen }}>
                <Text style={styles.unlistedToggle}>{T.picker.notListed}</Text>
              </TouchableOpacity>
              {unlistedOpen && (
                <View style={styles.unlistedForm}>
                  <TextInput
                    style={styles.unlistedInput}
                    value={unlistedName}
                    onChangeText={setUnlistedName}
                    placeholder={T.picker.unlistedName}
                    placeholderTextColor={colors.faint}
                    autoCapitalize="words"
                    maxLength={CHURCH_NAME_MAX}
                  />
                  <TextInput
                    style={styles.unlistedInput}
                    value={unlistedCity}
                    onChangeText={setUnlistedCity}
                    placeholder={T.picker.unlistedCity}
                    placeholderTextColor={colors.faint}
                    autoCapitalize="words"
                    maxLength={CHURCH_NAME_MAX}
                  />
                  <Text style={styles.unlistedHint}>{UNLISTED_HINT}</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(CHURCH_DIRECTORY_SUGGEST_URL)} hitSlop={8} accessibilityRole="link">
                    <Text style={[styles.unlistedHint, styles.nearLink]}>{UNLISTED_SUGGEST}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.useNameBtn, !unlistedNameValid(unlistedName) && styles.useNameBtnDisabled]}
                    onPress={submitTypedName}
                    disabled={!unlistedNameValid(unlistedName)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !unlistedNameValid(unlistedName) }}
                  >
                    <Text style={styles.useNameText}>{T.picker.useThisName}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity onPress={() => Linking.openURL(CHURCH_DIRECTORY_URL)} hitSlop={8} accessibilityRole="link">
            <Text style={styles.credit}>{T.picker.directoryCredit}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pickerCancel} onPress={onClose} accessibilityRole="button">
            <Text style={styles.pickerCancelText}>{S.common.cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = lazyThemed(() => StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center' },
  fieldText: { fontFamily: fonts.latoLight, color: colors.cream },
  fieldPlaceholder: { color: colors.faint },
  fieldSub: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginTop: 2 },
  fieldChevron: { fontFamily: fonts.cormorant, fontSize: 20, color: colors.muted, marginLeft: 8 },

  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  pickerCard: {
    backgroundColor: colors.navyMid, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    // Taller than Profile's old 70% sheet: the unlisted form and the credit
    // line sit under the list, and three visible rows is too few to scan.
    borderWidth: 1, borderColor: colors.border, padding: 24, paddingBottom: 40, maxHeight: '82%' as any,
  },
  pickerTitle: { fontFamily: fonts.cormorantMedium, fontSize: 22, color: colors.cream, marginBottom: 16 },
  pickerSearch: { fontFamily: fonts.lato, fontSize: 14, color: colors.cream, borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },

  nearBlock: { marginBottom: 10 },
  nearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nearBtn: { fontFamily: fonts.latoBold, fontSize: 12, letterSpacing: 0.4, color: colors.gold, paddingVertical: 4 },
  unitLabel: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.gold, paddingVertical: 4, paddingHorizontal: 6, textDecorationLine: 'underline' },
  nearNote: { fontFamily: fonts.latoLight, fontSize: 11, lineHeight: 15, color: colors.muted, marginTop: 2 },
  nearLink: { color: colors.gold },

  list: { flexShrink: 1 },
  pickerRow: { paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  // textAlign: church names are in Latin script; without it they align as
  // left-to-right paragraphs on the Arabic web layout.
  pickerRowName: { fontFamily: fonts.latoBold, fontSize: 13, color: colors.cream, textAlign: 'left' },
  pickerRowNameActive: { color: colors.goldLight },
  pickerRowAddress: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, marginTop: 2, textAlign: 'left' },
  distanceCol: { alignItems: 'flex-end' },
  distance: { fontFamily: fonts.lato, fontSize: 12, color: colors.muted },
  // Muted, not faint: this label is what stops "~0.3 mi" to a city centroid
  // being read as the building, so it has to be legible.
  precision: { fontFamily: fonts.latoLight, fontSize: 10, color: colors.muted, marginTop: 1 },
  pickerCheck: { fontFamily: fonts.latoBold, fontSize: 14, color: colors.gold },
  pickerDivider: { height: 1, backgroundColor: colors.border },
  pickerEmpty: { fontFamily: fonts.latoLight, fontSize: 13, color: colors.muted, textAlign: 'center', paddingVertical: 24, lineHeight: 19 },
  stateBlock: { alignItems: 'center', paddingVertical: 8 },
  retryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 22 },
  retryText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.gold, letterSpacing: 0.5 },

  unlistedBlock: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 10, paddingTop: 12 },
  unlistedToggle: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.gold, letterSpacing: 0.3, paddingVertical: 4 },
  unlistedForm: { gap: 8, marginTop: 8 },
  unlistedInput: {
    backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    color: colors.cream, fontFamily: fonts.latoLight, fontSize: 14, padding: 12,
  },
  unlistedHint: { fontFamily: fonts.latoLight, fontSize: 11, lineHeight: 15, color: colors.muted },
  useNameBtn: { backgroundColor: colors.gold, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  useNameBtnDisabled: { opacity: 0.4 },
  useNameText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.navy, letterSpacing: 0.8 },

  credit: { fontFamily: fonts.latoLight, fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 14, paddingVertical: 4, textDecorationLine: 'underline' },

  pickerCancel: { marginTop: 10, alignItems: 'center', paddingVertical: 12 },
  pickerCancelText: { fontFamily: fonts.latoBold, fontSize: 12, color: colors.muted, letterSpacing: 0.5 },
}));
